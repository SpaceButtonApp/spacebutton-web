'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { LivenessCameraHandle, FaceFrameData } from './LivenessCamera'
import { ChallengeEngine } from './ChallengeEngine'
import { SpoofHeuristic } from './SpoofHeuristic'
import { pickRandomChallenges, type ChallengeDef } from '@/lib/liveness/challenges'
import { verificationApi, type GuidedLivenessMetadata } from '@/lib/api/users'

// Camera/MediaPipe code only runs client-side and pulls in a large WASM
// runtime — load it lazily so it's never part of the main page bundle.
const LivenessCamera = dynamic(() => import('./LivenessCamera'), { ssr: false })

const SESSION_TIMEOUT_MS = 30_000
const PER_CHALLENGE_TIMEOUT_MS = 10_000

type Screen = 'intro' | 'camera' | 'uploading' | 'success' | 'failure'

interface Props {
  mode: 'selfie-only' | 'combined'
  idFile?: File | null
  idType?: string
  documentNumber?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function LivenessVerificationModal({ mode, idFile, idType, documentNumber, onSuccess, onCancel }: Props) {
  const [screen, setScreen] = useState<Screen>('intro')
  const [challenges, setChallenges] = useState<ChallengeDef[]>([])
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [passedFlash, setPassedFlash] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(SESSION_TIMEOUT_MS / 1000)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const cameraRef = useRef<LivenessCameraHandle>(null)
  const engineRef = useRef(new ChallengeEngine())
  const spoofRef = useRef(new SpoofHeuristic())
  const resultsRef = useRef<GuidedLivenessMetadata['challenge_results']>([])
  const challengeStartedAtRef = useRef<number>(0)
  const challengeRetryRef = useRef(false)
  const sessionStartedAtRef = useRef<number>(0)
  const neutralPitchRef = useRef<number | null>(null)
  const cancelledRef = useRef(false)

  const startSession = useCallback(() => {
    const picked = pickRandomChallenges(3)
    setChallenges(picked)
    setChallengeIndex(0)
    resultsRef.current = []
    spoofRef.current = new SpoofHeuristic()
    neutralPitchRef.current = null
    sessionStartedAtRef.current = performance.now()
    challengeStartedAtRef.current = performance.now()
    challengeRetryRef.current = false
    engineRef.current.start(picked[0].id, null)
    setErrorMessage(null)
    setScreen('camera')
  }, [])

  const failSession = useCallback((message: string) => {
    setErrorMessage(message)
    setScreen('failure')
  }, [])

  const advanceChallenge = useCallback((outcome: { passed: boolean; confidence: number; completedAt: number }) => {
    const current = challenges[challengeIndex]
    resultsRef.current = [
      ...resultsRef.current,
      {
        challenge: current.id,
        passed: true,
        started_at: new Date(challengeStartedAtRef.current).toISOString(),
        completed_at: new Date(outcome.completedAt).toISOString(),
        confidence: outcome.confidence,
      },
    ]
    setPassedFlash(true)
    setTimeout(() => {
      setPassedFlash(false)
      const next = challengeIndex + 1
      if (next >= challenges.length) {
        finishAndUpload()
      } else {
        setChallengeIndex(next)
        challengeStartedAtRef.current = performance.now()
        challengeRetryRef.current = false
        engineRef.current.start(challenges[next].id, neutralPitchRef.current)
      }
    }, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, challengeIndex])

  const finishAndUpload = useCallback(async () => {
    const frameBlob = cameraRef.current?.captureFrame()
    const spoofResult = spoofRef.current.getResult()
    if (!frameBlob) { failSession('Could not capture your photo. Please try again.'); return }
    if (!spoofResult.passed) {
      failSession("We couldn't verify this is a live camera feed. Please try again with your real face in front of the camera.")
      return
    }

    setScreen('uploading')
    try {
      const file = new File([frameBlob], 'liveness-selfie.jpg', { type: 'image/jpeg' })
      const metadata: GuidedLivenessMetadata = {
        challenge_sequence: challenges.map((c) => c.id),
        challenge_results: resultsRef.current,
        spoof_check_passed: spoofResult.passed,
        spoof_check_detail: spoofResult.detail,
        client_platform: 'web',
        session_duration_ms: Math.round(performance.now() - sessionStartedAtRef.current),
      }
      if (mode === 'combined' && idFile && idType) {
        await verificationApi.submitBoth(idType, idFile, file, documentNumber, metadata)
      } else {
        await verificationApi.submitSelfie(file, metadata)
      }
      if (!cancelledRef.current) setScreen('success')
    } catch (err) {
      if (!cancelledRef.current) {
        failSession(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenges, mode, idFile, idType, documentNumber])

  const handleFrame = useCallback((frame: FaceFrameData) => {
    if (screen !== 'camera') return
    const now = performance.now()

    // Calibrate the neutral pitch baseline from the first ~1s of a session
    // (before any up/down challenge is likely to be first), so TURN_UP/DOWN
    // measure a delta rather than an absolute (unreliable) pitch reading.
    if (neutralPitchRef.current == null && now - sessionStartedAtRef.current < 1000 && frame.faceDetected) {
      neutralPitchRef.current = frame.pitch
    }

    const outcome = engineRef.current.feedFrame(frame)
    if (outcome) { advanceChallenge(outcome); return }

    // Per-challenge timeout: one retry (fresh timer, same challenge), then fail.
    if (now - challengeStartedAtRef.current > PER_CHALLENGE_TIMEOUT_MS) {
      if (!challengeRetryRef.current) {
        challengeRetryRef.current = true
        challengeStartedAtRef.current = now
        engineRef.current.start(challenges[challengeIndex].id, neutralPitchRef.current)
      } else {
        failSession("We couldn't detect that action in time. Please try again.")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, challenges, challengeIndex, advanceChallenge, failSession])

  // Session-wide 30s countdown + spoof sampling, while the camera screen is active.
  useEffect(() => {
    if (screen !== 'camera') return
    const interval = setInterval(() => {
      const elapsed = performance.now() - sessionStartedAtRef.current
      const remaining = Math.max(0, Math.ceil((SESSION_TIMEOUT_MS - elapsed) / 1000))
      setSecondsLeft(remaining)
      if (elapsed > SESSION_TIMEOUT_MS) {
        failSession('Time ran out. Please try again.')
      }
    }, 250)
    return () => clearInterval(interval)
  }, [screen, failSession])

  useEffect(() => {
    cancelledRef.current = false
    return () => { cancelledRef.current = true }
  }, [])

  const current = challenges[challengeIndex]
  const holdProgress = screen === 'camera' ? engineRef.current.getHoldProgress() : 0

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">Face Verification</span>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-muted" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-md mx-auto text-center">
        {screen === 'intro' && (
          <>
            <ShieldAlert className="w-14 h-14 text-primary" />
            <h2 className="text-xl font-semibold">Quick face verification</h2>
            <p className="text-sm text-muted-foreground">
              We'll ask you to do a few simple actions in front of your camera — like blinking or turning your head —
              to confirm it's really you. This takes about 30 seconds.
            </p>
            <button onClick={startSession} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
              Start Verification
            </button>
          </>
        )}

        {screen === 'camera' && (
          <>
            <p className="text-sm text-muted-foreground">Challenge {challengeIndex + 1} of {challenges.length}</p>
            <div className="flex gap-1.5">
              {challenges.map((c, i) => (
                <div key={c.id} className={`h-1.5 w-10 rounded-full ${i < challengeIndex ? 'bg-green-500' : i === challengeIndex ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>

            <LivenessCamera ref={cameraRef} onFrame={handleFrame} onError={setCameraError} />
            {/* Feed the spoof heuristic from the same video element the camera owns. */}
            <SpoofSampler cameraRef={cameraRef} spoofRef={spoofRef} active={screen === 'camera'} />

            {cameraError ? (
              <p className="text-sm text-destructive">{cameraError}</p>
            ) : (
              <>
                <p key={current?.id} className="text-lg font-semibold animate-in fade-in">
                  {passedFlash ? 'Nice!' : current?.instruction}
                </p>
                {passedFlash ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${holdProgress * 100}%` }} />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Time left: {secondsLeft}s</p>
              </>
            )}
          </>
        )}

        {screen === 'uploading' && (
          <>
            <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Submitting for review…</p>
          </>
        )}

        {screen === 'success' && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500" />
            <h2 className="text-xl font-semibold">Verification submitted</h2>
            <p className="text-sm text-muted-foreground">We'll notify you once it's reviewed.</p>
            <button onClick={onSuccess} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
              Done
            </button>
          </>
        )}

        {screen === 'failure' && (
          <>
            <XCircle className="w-14 h-14 text-destructive" />
            <h2 className="text-xl font-semibold">Verification failed</h2>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <button onClick={startSession} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
              Retry
            </button>
            <button onClick={onCancel} className="w-full py-2 text-sm text-muted-foreground">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Separate tiny component so it can poll the camera's <video> element each
// tick via the handle's getVideoElement(), without re-rendering the parent.
function SpoofSampler({ cameraRef, spoofRef, active }: { cameraRef: React.RefObject<LivenessCameraHandle | null>; spoofRef: React.RefObject<SpoofHeuristic>; active: boolean }) {
  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      const video = cameraRef.current?.getVideoElement()
      if (video) spoofRef.current.sample(video)
    }, 200)
    return () => clearInterval(interval)
  }, [active, cameraRef, spoofRef])
  return null
}
