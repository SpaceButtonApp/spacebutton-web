// Explicitly scoped-down anti-spoofing: catches a static photo or a frozen/
// looped video held up to the camera (consecutive near-identical frames), not
// a sophisticated prerecorded-video replay. Real texture/depth/replay-proof
// liveness detection needs a commercial vendor SDK — out of scope here.
const THUMB_SIZE = 16
const SAMPLE_INTERVAL_MS = 400
const STATIC_EPSILON = 2 // mean abs pixel diff (0-255 scale) below which a frame counts as "static"
const MAX_CONSECUTIVE_STATIC = 6 // ~2.4s at one sample per SAMPLE_INTERVAL_MS

export interface SpoofCheckResult {
  passed: boolean
  detail: { max_consecutive_static_frames: number; min_frame_variance: number | null }
}

export class SpoofHeuristic {
  private canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D | null
  private prevData: Uint8ClampedArray | null = null
  private lastSampleAt = 0
  private consecutiveStatic = 0
  private maxConsecutiveStatic = 0
  private minVariance = Infinity
  private failed = false

  constructor() {
    this.canvas.width = THUMB_SIZE
    this.canvas.height = THUMB_SIZE
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
  }

  sample(video: HTMLVideoElement) {
    if (!this.ctx || video.videoWidth === 0 || this.failed) return
    const now = performance.now()
    if (now - this.lastSampleAt < SAMPLE_INTERVAL_MS) return
    this.lastSampleAt = now

    this.ctx.drawImage(video, 0, 0, THUMB_SIZE, THUMB_SIZE)
    const frame = this.ctx.getImageData(0, 0, THUMB_SIZE, THUMB_SIZE).data

    if (this.prevData) {
      let diffSum = 0
      for (let i = 0; i < frame.length; i += 4) diffSum += Math.abs(frame[i] - this.prevData[i])
      const meanDiff = diffSum / (THUMB_SIZE * THUMB_SIZE)
      this.minVariance = Math.min(this.minVariance, meanDiff)
      if (meanDiff < STATIC_EPSILON) {
        this.consecutiveStatic += 1
        this.maxConsecutiveStatic = Math.max(this.maxConsecutiveStatic, this.consecutiveStatic)
        if (this.consecutiveStatic > MAX_CONSECUTIVE_STATIC) this.failed = true
      } else {
        this.consecutiveStatic = 0
      }
    }
    this.prevData = frame
  }

  getResult(): SpoofCheckResult {
    return {
      passed: !this.failed,
      detail: {
        max_consecutive_static_frames: this.maxConsecutiveStatic,
        min_frame_variance: this.minVariance === Infinity ? null : Math.round(this.minVariance * 100) / 100,
      },
    }
  }
}
