'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export interface FaceFrameData {
  timestamp: number
  faceDetected: boolean
  blendshapes: Record<string, number>
  yaw: number
  pitch: number
  roll: number
}

export interface LivenessCameraHandle {
  captureFrame: () => Blob | null
  getVideoElement: () => HTMLVideoElement | null
}

interface LivenessCameraProps {
  onFrame: (data: FaceFrameData) => void
  onError?: (message: string) => void
}

// Decompose MediaPipe's row-major 4x4 facial transformation matrix into yaw/
// pitch/roll (degrees). Sign conventions are calibrated empirically against
// the live feed in ChallengeEngine, not assumed correct from the math alone.
function matrixToEuler(m: number[]) {
  const m02 = m[2], m10 = m[4], m11 = m[5], m12 = m[6], m22 = m[10]
  const toDeg = (r: number) => (r * 180) / Math.PI
  return {
    yaw: toDeg(Math.atan2(m02, m22)),
    pitch: toDeg(Math.atan2(-m12, Math.sqrt(m10 * m10 + m11 * m11))),
    roll: toDeg(Math.atan2(m10, m11)),
  }
}

let landmarkerPromise: Promise<FaceLandmarker> | null = null
function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks('/mediapipe/wasm').then((fileset) =>
      FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: '/mediapipe/models/face_landmarker.task', delegate: 'GPU' },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      }),
    )
  }
  return landmarkerPromise
}

const LivenessCamera = forwardRef<LivenessCameraHandle, LivenessCameraProps>(function LivenessCamera(
  { onFrame, onError },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.videoWidth === 0) return null
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      // Mirror horizontally so the saved frame matches what the user saw (and
      // what a normal front-camera selfie looks like), not an un-mirrored feed.
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      let result: Blob | null = null
      canvas.toBlob((b) => { result = b }, 'image/jpeg', 0.85)
      return result
    },
    getVideoElement: () => videoRef.current,
  }))

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null

    async function start() {
      try {
        const [landmarker, mediaStream] = await Promise.all([
          getFaceLandmarker(),
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 480, height: 480 }, audio: false }),
        ])
        if (cancelled) { mediaStream.getTracks().forEach((t) => t.stop()); return }
        stream = mediaStream
        streamRef.current = mediaStream
        const video = videoRef.current
        if (!video) return
        video.srcObject = mediaStream
        await video.play()
        setReady(true)

        const tick = () => {
          if (cancelled || !videoRef.current) return
          const v = videoRef.current
          if (v.readyState >= 2) {
            const result = landmarker.detectForVideo(v, performance.now())
            const face = result.faceLandmarks?.[0]
            const shapesArr = result.faceBlendshapes?.[0]?.categories ?? []
            const blendshapes: Record<string, number> = {}
            for (const c of shapesArr) blendshapes[c.categoryName] = c.score
            const matrix = result.facialTransformationMatrixes?.[0]?.data
            const euler = matrix ? matrixToEuler(Array.from(matrix)) : { yaw: 0, pitch: 0, roll: 0 }
            onFrame({
              timestamp: performance.now(),
              faceDetected: !!face,
              blendshapes,
              ...euler,
            })
          }
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Could not access the camera.')
      }
    }

    start()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      stream?.getTracks().forEach((t) => t.stop())
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative w-64 h-64 mx-auto">
      <div className="absolute inset-0 rounded-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ transform: 'scaleX(-1)', width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {/* Face guide outline */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 256 256">
        <ellipse cx="128" cy="128" rx="90" ry="110" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeDasharray="8 6" />
      </svg>
      {!ready && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40">
          <span className="text-white text-sm">Starting camera…</span>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
})

export default LivenessCamera
