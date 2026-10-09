'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface LivenessCameraHandle {
  startRecording: () => void
  // Stops the MediaRecorder and resolves with the finished recording once
  // its 'stop' event fires (MediaRecorder flushes the last chunk there).
  stopRecording: () => Promise<Blob | null>
  // Draws the current video frame to a small offscreen canvas and reads its
  // average luminance directly — unlike the mobile app (no EXIF data to lean
  // on), the browser gives us real pixel access, so this is exact rather
  // than a hardware-exposure heuristic.
  checkLighting: () => { ok: boolean }
}

interface Props {
  onError?: (message: string) => void
}

const DARK_LUMINANCE_THRESHOLD = 50 // 0-255 scale

const LivenessCamera = forwardRef<LivenessCameraHandle, Props>(function LivenessCamera({ onError }, ref) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null)
  const mimeTypeRef = useRef('video/webm')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let stream: MediaStream | null = null

    async function start() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 480, height: 480 },
          audio: false,
        })
        if (cancelled) { mediaStream.getTracks().forEach((t) => t.stop()); return }
        stream = mediaStream
        streamRef.current = mediaStream
        const video = videoRef.current
        if (!video) return
        video.srcObject = mediaStream
        await video.play()
        setReady(true)
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Could not access the camera.')
      }
    }

    start()
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    startRecording: () => {
      const stream = streamRef.current
      if (!stream) return
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm'
      mimeTypeRef.current = mimeType
      chunksRef.current = []
      const recorder = new MediaRecorder(stream, { mimeType })
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        stopResolveRef.current?.(blob)
        stopResolveRef.current = null
      }
      recorderRef.current = recorder
      recorder.start()
    },
    stopRecording: () => new Promise<Blob | null>((resolve) => {
      const recorder = recorderRef.current
      if (!recorder || recorder.state === 'inactive') { resolve(null); return }
      stopResolveRef.current = resolve
      recorder.stop()
    }),
    checkLighting: () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.videoWidth === 0) return { ok: true }
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (!ctx) return { ok: true }
      try {
        ctx.drawImage(video, 0, 0, 32, 32)
        const { data } = ctx.getImageData(0, 0, 32, 32)
        let sum = 0
        const pixelCount = data.length / 4
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
        }
        return { ok: sum / pixelCount > DARK_LUMINANCE_THRESHOLD }
      } catch {
        return { ok: true }
      }
    },
  }))

  return (
    <div className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        muted
        playsInline
        style={{ transform: 'scaleX(-1)', width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas ref={canvasRef} className="hidden" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <span className="text-white text-sm">Starting camera…</span>
        </div>
      )}
    </div>
  )
})

export default LivenessCamera
