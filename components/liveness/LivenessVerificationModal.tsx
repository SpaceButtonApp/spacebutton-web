'use client'

import { useCallback, useRef, useState } from 'react'
import { X, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { LivenessCameraHandle } from './LivenessCamera'
import { pickRandomChallenges, type ChallengeDef } from '@/lib/liveness/challenges'
import { verificationApi } from '@/lib/api/users'

// Camera code only runs client-side — load it lazily so it's never part of
// the main page bundle.
const LivenessCamera = dynamic(() => import('./LivenessCamera'), { ssr: false })

// No real-time pass/fail here — this records a short video of the user
// performing 3 randomly-chosen actions on cue and uploads it for a human
// admin to review (mirrors the mobile app's approach; see git history for
// why the earlier real-time MediaPipe challenge-tracking was abandoned).
const LIGHT_CHECK_WARMUP_MS = 400
const POSITIONING_MS = 2000
const INSTRUCTION_DISPLAY_MS = 2000
const COUNTDOWN_STEP_MS = 1000 // "3, 2, 1" — 1s each

type Screen = 'intro' | 'recording' | 'uploading' | 'success' | 'failure'

interface Props {
  visible: boolean
  onSuccess: () => void
  onCancel: () => void
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export default function LivenessVerificationModal({ visible, onSuccess, onCancel }: Props) {
  const [screen, setScreen] = useState<Screen>('intro')
  const [challenges, setChallenges] = useState<ChallengeDef[]>([])
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [phaseLabel, setPhaseLabel] = useState('')
  const [instruction, setInstruction] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const cameraRef = useRef<LivenessCameraHandle>(null)
  const cancelledRef = useRef(false)

  const failSession = useCallback((message: string) => {
    if (cancelledRef.current) return
    setErrorMessage(message)
    setScreen('failure')
  }, [])

  const uploadVideo = useCallback(async (blob: Blob, usedChallenges: ChallengeDef[], durationMs: number) => {
    if (cancelledRef.current) return
    setScreen('uploading')
    try {
      const file = new File([blob], 'liveness.webm', { type: 'video/webm' })
      await verificationApi.submitLivenessVideo(file, usedChallenges.map((c) => c.id), durationMs)
      if (!cancelledRef.current) setScreen('success')
    } catch (err) {
      if (!cancelledRef.current) {
        failSession(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      }
    }
  }, [failSession])

  const runSession = useCallback(async () => {
    cancelledRef.current = false
    const picked = pickRandomChallenges(3)
    setChallenges(picked)
    setChallengeIndex(0)
    setErrorMessage(null)
    setCameraError(null)
    setScreen('recording')

    setPhaseLabel('Checking lighting…')
    setInstruction('')
    setCountdown(null)
    await delay(LIGHT_CHECK_WARMUP_MS)
    if (cancelledRef.current) return

    const lighting = cameraRef.current?.checkLighting()
    if (cancelledRef.current) return
    if (lighting && !lighting.ok) {
      failSession("It's too dark to verify your face. Please turn on a light or move somewhere brighter, then try again.")
      return
    }

    setPhaseLabel('Position your face in the circle')
    await delay(POSITIONING_MS)
    if (cancelledRef.current) return

    cameraRef.current?.startRecording()
    const sessionStartedAt = performance.now()

    for (let i = 0; i < picked.length; i++) {
      if (cancelledRef.current) return
      setChallengeIndex(i)
      setPhaseLabel('')
      setInstruction(picked[i].instruction)
      setCountdown(null)
      await delay(INSTRUCTION_DISPLAY_MS)
      for (let n = 3; n >= 1; n--) {
        if (cancelledRef.current) return
        setCountdown(n)
        await delay(COUNTDOWN_STEP_MS)
      }
    }

    if (cancelledRef.current) return
    setCountdown(null)
    setInstruction('')
    setChallengeIndex(picked.length)

    const videoBlob = await cameraRef.current?.stopRecording()
    if (cancelledRef.current) return
    if (!videoBlob) { failSession('Could not record video. Please try again.'); return }

    await uploadVideo(videoBlob, picked, Math.round(performance.now() - sessionStartedAt))
  }, [failSession, uploadVideo])

  const handleCancel = useCallback(() => {
    cancelledRef.current = true
    onCancel()
  }, [onCancel])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {screen === 'recording' ? (
        <div className="absolute inset-0 bg-black">
          <LivenessCamera ref={cameraRef} onError={setCameraError} />

          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-4">
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/60 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="flex gap-1.5">
              {challenges.map((c, i) => (
                <div
                  key={c.id}
                  className="h-1.5 w-7 rounded-full"
                  style={{ backgroundColor: i < challengeIndex ? '#10B981' : i === challengeIndex ? '#fff' : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          </div>

          {/* Face guide */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <ellipse cx="50" cy="48" rx="26" ry="32" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.6" strokeDasharray="2.5 2" vectorEffect="non-scaling-stroke" />
          </svg>

          <div className="absolute top-[12%] inset-x-0 flex flex-col items-center gap-2.5 px-6 text-center">
            {cameraError ? (
              <p className="text-white text-lg font-bold" style={{ textShadow: '0 0 8px rgba(0,0,0,0.6)' }}>{cameraError}</p>
            ) : (
              <>
                {!!phaseLabel && (
                  <p className="text-white text-[15px] font-semibold" style={{ textShadow: '0 0 6px rgba(0,0,0,0.6)' }}>{phaseLabel}</p>
                )}
                {!!instruction && (
                  <p className="text-white text-[22px] font-extrabold" style={{ textShadow: '0 0 8px rgba(0,0,0,0.6)' }}>{instruction}</p>
                )}
                {countdown != null && (
                  <p className="text-white text-[56px] font-extrabold leading-none" style={{ textShadow: '0 0 10px rgba(0,0,0,0.6)' }}>{countdown}</p>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-sm font-medium text-muted-foreground">Face Verification</span>
            <button onClick={handleCancel} className="p-2 rounded-full hover:bg-muted" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6 max-w-md mx-auto text-center">
            {screen === 'intro' && (
              <>
                <ShieldAlert className="w-14 h-14 text-primary" />
                <h2 className="text-xl font-semibold">Quick face verification</h2>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll record a short, 15-second video while you do 3 simple actions on cue — like turning your
                  head or smiling — to confirm it&apos;s really you. Our team reviews it shortly after.
                </p>
                <button onClick={runSession} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                  Start Verification
                </button>
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
                <p className="text-sm text-muted-foreground">We&apos;ll notify you once it&apos;s reviewed.</p>
                <button onClick={onSuccess} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                  Done
                </button>
              </>
            )}

            {screen === 'failure' && (
              <>
                <XCircle className="w-14 h-14 text-destructive" />
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <button onClick={runSession} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
                  Retry
                </button>
                <button onClick={handleCancel} className="w-full py-2 text-sm text-muted-foreground">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
