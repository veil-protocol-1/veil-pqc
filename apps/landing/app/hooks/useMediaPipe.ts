'use client'

import { useRef, useState, useCallback, useEffect, type RefObject } from 'react'

export interface FaceLandmark {
  x: number
  y: number
  z: number
}

export interface MediaPipeState {
  videoRef: RefObject<HTMLVideoElement>
  landmarks: FaceLandmark[]
  confidence: number
  isReady: boolean // camera is streaming; mesh + ring show immediately
  hasDetection: boolean // at least one landmark result received
  permissionDenied: boolean
  initError: string | null // surfaces script-load/init failures to UI
  startCamera: () => Promise<void>
  stopCamera: () => void
}

interface FaceMeshResults {
  multiFaceLandmarks?: FaceLandmark[][]
}

const FACE_MESH_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
const CAMERA_UTILS_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export function useMediaPipe(onFrame?: (landmarks: FaceLandmark[]) => void): MediaPipeState {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cameraRef = useRef<{ stop: () => void } | null>(null)
  const faceMeshRef = useRef<{ close: () => void } | null>(null)
  const activeRef = useRef(false)
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame

  const [landmarks, setLandmarks] = useState<FaceLandmark[]>([])
  const [confidence, setConfidence] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [hasDetection, setHasDetection] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    activeRef.current = false
    cameraRef.current?.stop()
    cameraRef.current = null
    faceMeshRef.current?.close()
    faceMeshRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setIsReady(false)
    setLandmarks([])
    setConfidence(0)
    setHasDetection(false)
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    if (activeRef.current) return
    activeRef.current = true
    setInitError(null)

    try {
      // ── 1. Get camera stream ──────────────────────────────────────────────
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      if (!activeRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream

      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await new Promise<void>((resolve, reject) => {
        video.oncanplay = () => resolve()
        video.onerror = () => reject(new Error('video failed to start'))
        video.play().catch(reject)
      })
      if (!activeRef.current) return

      // Camera is ready — show the mesh overlay immediately
      setIsReady(true)

      // ── 2. Load FaceMesh + Camera utils via CDN script injection ──────────
      await loadScript(FACE_MESH_SCRIPT, 'veil-mediapipe-facemesh')
      await loadScript(CAMERA_UTILS_SCRIPT, 'veil-mediapipe-camera-utils')
      if (!activeRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (typeof w.FaceMesh !== 'function' || typeof w.Camera !== 'function') {
        setInitError('MediaPipe: FaceMesh/Camera not found after script load')
        activeRef.current = false
        return
      }

      const fm = new w.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      })

      fm.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      fm.onResults((results: FaceMeshResults) => {
        if (!activeRef.current) return
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const lms = results.multiFaceLandmarks[0]
          setLandmarks(lms)
          setHasDetection(true)
          setConfidence((prev) => Math.min(1, prev + 0.06))
          onFrameRef.current?.(lms)
        } else {
          setLandmarks([])
          setConfidence((prev) => Math.max(0, prev - 0.04))
        }
      })
      faceMeshRef.current = fm

      // ── 3. Drive frames through the camera utility ────────────────────────
      const cam = new w.Camera(video, {
        onFrame: async () => {
          await fm.send({ image: video })
        },
        width: 640,
        height: 480,
      })
      cam.start()
      cameraRef.current = cam
    } catch (err) {
      activeRef.current = false
      const e = err as Error
      if (e.name === 'NotAllowedError') {
        setPermissionDenied(true)
      } else {
        setInitError(`Camera error: ${e.message}`)
      }
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  return {
    videoRef: videoRef as RefObject<HTMLVideoElement>,
    landmarks,
    confidence,
    isReady,
    hasDetection,
    permissionDenied,
    initError,
    startCamera,
    stopCamera,
  }
}
