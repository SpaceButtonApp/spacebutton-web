import type { ChallengeId } from '@/lib/liveness/challenges'
import type { FaceFrameData } from './LivenessCamera'

const HOLD_MS = 450
const YAW_THRESHOLD = 25
const PITCH_THRESHOLD = 12 // degrees delta from the calibrated neutral baseline
// Flip to -1 if a real-camera test shows TURN_LEFT/TURN_RIGHT swapped —
// matrix-decomposition sign conventions aren't assumed correct without
// verifying against a live camera.
const YAW_SIGN = 1 as 1 | -1

export interface ChallengeOutcome {
  passed: boolean
  confidence: number
  completedAt: number
}

export class ChallengeEngine {
  private challenge: ChallengeId | null = null
  private neutralPitch: number | null = null
  private holdStartedAt: number | null = null
  private blinkState: 'WAIT_CLOSE' | 'WAIT_OPEN' = 'WAIT_CLOSE'
  private blinkCount = 0

  start(challenge: ChallengeId, neutralPitch: number | null) {
    this.challenge = challenge
    this.neutralPitch = neutralPitch
    this.holdStartedAt = null
    this.blinkState = 'WAIT_CLOSE'
    this.blinkCount = 0
  }

  feedFrame(frame: FaceFrameData): ChallengeOutcome | null {
    if (!this.challenge || !frame.faceDetected) return null
    switch (this.challenge) {
      case 'BLINK_TWICE': return this.evalBlink(frame)
      case 'TURN_LEFT': return this.evalYaw(frame, -1)
      case 'TURN_RIGHT': return this.evalYaw(frame, 1)
      case 'TURN_UP': return this.evalPitch(frame, 1)
      case 'TURN_DOWN': return this.evalPitch(frame, -1)
      case 'SMILE':
        return this.evalBlendshapeHold(frame, (b) => ((b.mouthSmileLeft ?? 0) + (b.mouthSmileRight ?? 0)) / 2, 0.4)
      case 'OPEN_MOUTH':
        return this.evalBlendshapeHold(frame, (b) => b.jawOpen ?? 0, 0.5)
      case 'RAISE_EYEBROWS':
        return this.evalBlendshapeHold(frame, (b) => b.browInnerUp ?? 0, 0.4)
      default:
        return null
    }
  }

  getHoldProgress(): number {
    if (this.holdStartedAt == null) return 0
    return Math.min(1, (performance.now() - this.holdStartedAt) / HOLD_MS)
  }

  private evalBlink(frame: FaceFrameData): ChallengeOutcome | null {
    const openness = 1 - ((frame.blendshapes.eyeBlinkLeft ?? 0) + (frame.blendshapes.eyeBlinkRight ?? 0)) / 2
    if (this.blinkState === 'WAIT_CLOSE' && openness < 0.3) {
      this.blinkState = 'WAIT_OPEN'
    } else if (this.blinkState === 'WAIT_OPEN' && openness > 0.6) {
      this.blinkState = 'WAIT_CLOSE'
      this.blinkCount += 1
      if (this.blinkCount >= 2) {
        return { passed: true, confidence: openness, completedAt: Date.now() }
      }
    }
    return null
  }

  private evalYaw(frame: FaceFrameData, direction: 1 | -1): ChallengeOutcome | null {
    const signedYaw = frame.yaw * YAW_SIGN
    const active = signedYaw * direction > YAW_THRESHOLD
    return this.evalHold(active, Math.min(1, Math.abs(signedYaw) / 45))
  }

  private evalPitch(frame: FaceFrameData, direction: 1 | -1): ChallengeOutcome | null {
    if (this.neutralPitch == null) this.neutralPitch = frame.pitch
    const delta = (frame.pitch - this.neutralPitch) * direction
    const active = delta > PITCH_THRESHOLD
    return this.evalHold(active, Math.min(1, Math.abs(delta) / (PITCH_THRESHOLD * 2)))
  }

  private evalBlendshapeHold(
    frame: FaceFrameData,
    getValue: (b: Record<string, number>) => number,
    threshold: number,
  ): ChallengeOutcome | null {
    const value = getValue(frame.blendshapes)
    return this.evalHold(value > threshold, Math.min(1, value))
  }

  private evalHold(active: boolean, confidence: number): ChallengeOutcome | null {
    const now = performance.now()
    if (!active) { this.holdStartedAt = null; return null }
    if (this.holdStartedAt == null) this.holdStartedAt = now
    if (now - this.holdStartedAt >= HOLD_MS) {
      return { passed: true, confidence, completedAt: Date.now() }
    }
    return null
  }
}
