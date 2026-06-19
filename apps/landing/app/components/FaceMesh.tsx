'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'

// Simplified face mesh edges — key facial structure lines
// Using a representative subset of the MediaPipe 468-landmark topology
const FACE_EDGES: [number, number][] = [
  // Jaw line
  [0, 17], [17, 61], [61, 291], [291, 0],
  [17, 84], [84, 16], [16, 314], [314, 405],
  // Eyes
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133],
  [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133],
  [362, 382], [382, 381], [381, 380], [380, 374], [374, 373], [373, 390], [390, 249], [249, 263],
  [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
  // Nose
  [1, 2], [2, 98], [98, 97], [97, 2], [2, 326], [326, 327], [327, 2],
  [4, 5], [5, 6], [6, 168], [168, 8], [8, 9],
  // Mouth
  [61, 185], [185, 40], [40, 39], [39, 37], [37, 0],
  [0, 267], [267, 269], [269, 270], [270, 409], [409, 291],
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
  // Forehead
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389],
  [10, 109], [109, 67], [67, 103], [103, 54], [54, 21], [21, 162],
  // Cheeks
  [116, 123], [123, 147], [147, 213], [213, 138],
  [345, 352], [352, 376], [376, 433], [433, 367],
  // Bridge
  [168, 6], [6, 197], [197, 195], [195, 5], [5, 4],
  // Brows
  [70, 63], [63, 105], [105, 66], [66, 107], [107, 55],
  [300, 293], [293, 334], [334, 296], [296, 336], [336, 285],
]

// Generic face positions (normalized -1 to 1, approximate anatomy)
function buildGenericFace(): Float32Array {
  // 468 landmarks all at origin initially, then we place key ones
  const positions = new Float32Array(468 * 3)

  // Map a few key landmark positions (simplified face shape)
  const keyPoints: [number, number, number, number][] = [
    // [index, x, y, z]
    [0, 0, -0.35, 0.1],      // chin
    [1, 0, -0.05, 0.2],      // nose tip
    [4, 0, -0.0, 0.22],      // nose bottom
    [5, 0, 0.05, 0.18],
    [6, 0, 0.1, 0.15],
    [8, 0, 0.12, 0.1],
    [9, 0, 0.13, 0.05],
    [10, 0, 0.5, 0],         // forehead top
    [16, 0, -0.3, 0],
    [17, 0, -0.35, 0],
    [21, -0.55, 0.4, -0.1],
    [33, -0.28, 0.1, 0.12],  // right eye inner
    [37, -0.07, -0.2, 0.1],
    [39, -0.04, -0.2, 0.1],
    [40, -0.02, -0.18, 0.1],
    [54, -0.5, 0.35, -0.05],
    [55, -0.32, 0.22, 0.05],
    [61, -0.13, -0.2, 0.1],  // mouth right
    [63, -0.22, 0.2, 0.08],
    [66, -0.14, 0.25, 0.1],
    [67, -0.38, 0.38, -0.02],
    [70, -0.36, 0.19, 0.04],
    [84, -0.1, -0.28, 0.05],
    [91, -0.08, -0.3, 0.05],
    [97, -0.06, 0.0, 0.22],
    [98, -0.07, -0.02, 0.22],
    [103, -0.42, 0.32, 0.0],
    [105, -0.18, 0.23, 0.1],
    [107, -0.1, 0.25, 0.12],
    [109, -0.28, 0.45, -0.05],
    [116, -0.42, -0.02, 0.02],
    [123, -0.38, -0.1, 0.05],
    [133, -0.08, 0.1, 0.15], // right eye outer
    [138, -0.4, -0.15, 0.02],
    [144, -0.24, 0.07, 0.12],
    [145, -0.22, 0.05, 0.12],
    [146, -0.12, -0.22, 0.1],
    [147, -0.36, -0.15, 0.04],
    [153, -0.2, 0.09, 0.12],
    [154, -0.16, 0.1, 0.13],
    [155, -0.12, 0.1, 0.14],
    [157, -0.1, 0.13, 0.14],
    [158, -0.14, 0.15, 0.13],
    [159, -0.18, 0.16, 0.13],
    [160, -0.22, 0.15, 0.12],
    [161, -0.25, 0.13, 0.12],
    [162, -0.58, 0.35, -0.12],
    [163, -0.28, 0.09, 0.11],
    [168, 0, 0.15, 0.2],
    [173, -0.1, 0.12, 0.14],
    [181, -0.07, -0.27, 0.07],
    [185, -0.08, -0.17, 0.1],
    [195, 0, 0.08, 0.2],
    [197, 0, 0.11, 0.2],
    [213, -0.35, -0.22, 0.0],
    [246, -0.26, 0.14, 0.12],
    [249, 0.26, 0.14, 0.12],
    [251, 0.45, 0.45, -0.08],
    [263, 0.08, 0.1, 0.15],
    [267, 0.07, -0.2, 0.1],
    [269, 0.04, -0.2, 0.1],
    [270, 0.02, -0.18, 0.1],
    [284, 0.5, 0.35, -0.05],
    [285, 0.32, 0.22, 0.05],
    [291, 0.13, -0.2, 0.1],
    [293, 0.22, 0.2, 0.08],
    [296, 0.14, 0.25, 0.1],
    [297, 0.38, 0.38, -0.02],
    [300, 0.36, 0.19, 0.04],
    [314, 0.1, -0.28, 0.05],
    [321, 0.08, -0.3, 0.05],
    [326, 0.06, 0.0, 0.22],
    [327, 0.07, -0.02, 0.22],
    [332, 0.42, 0.32, 0.0],
    [334, 0.18, 0.23, 0.1],
    [336, 0.1, 0.25, 0.12],
    [338, 0.28, 0.45, -0.05],
    [345, 0.42, -0.02, 0.02],
    [352, 0.38, -0.1, 0.05],
    [362, 0.28, 0.1, 0.12],
    [367, 0.4, -0.15, 0.02],
    [373, 0.2, 0.09, 0.12],
    [374, 0.24, 0.07, 0.12],
    [375, 0.12, -0.22, 0.1],
    [376, 0.36, -0.15, 0.04],
    [380, 0.22, 0.07, 0.12],
    [381, 0.2, 0.09, 0.12],
    [382, 0.18, 0.1, 0.13],
    [384, 0.22, 0.15, 0.12],
    [385, 0.25, 0.15, 0.12],
    [386, 0.28, 0.13, 0.12],
    [387, 0.1, 0.13, 0.14],
    [388, 0.14, 0.15, 0.13],
    [389, 0.55, 0.4, -0.1],
    [390, 0.26, 0.14, 0.12],
    [398, 0.25, 0.13, 0.12],
    [405, 0.1, -0.28, 0.05],
    [409, 0.08, -0.17, 0.1],
    [433, 0.35, -0.22, 0.0],
    [466, 0.1, 0.12, 0.14],
  ]

  keyPoints.forEach(([idx, x, y, z]) => {
    positions[idx * 3] = x
    positions[idx * 3 + 1] = y
    positions[idx * 3 + 2] = z
  })

  return positions
}

export default function FaceMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const rotRef = useRef(0)
  const scaleRef = useRef(1)
  const scaleDir = useRef(1)
  const positionsRef = useRef<Float32Array>(buildGenericFace())

  const cleanupRef = useRef<(() => void) | null>(null)

  const initThree = useCallback((canvas: HTMLCanvasElement) => {
    const W = canvas.clientWidth
    const H = canvas.clientHeight

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.z = 2.5

    // Build wireframe from edges
    const linePositions = new Float32Array(FACE_EDGES.length * 6)
    const lineGeometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(linePositions, 3)
    lineGeometry.setAttribute('position', posAttr)

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.7,
    })

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    // Point glow at each vertex
    const uniqueIndices = Array.from(new Set(FACE_EDGES.flat()))
    const dotPositions = new Float32Array(uniqueIndices.length * 3)
    const dotGeometry = new THREE.BufferGeometry()
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    const dotMaterial = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 3,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: false,
    })
    const dots = new THREE.Points(dotGeometry, dotMaterial)
    scene.add(dots)

    // Outer scan ring
    const ringGeometry = new THREE.RingGeometry(0.72, 0.74, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    scene.add(ring)

    // Edge glow (sprite)
    const spriteMat = new THREE.SpriteMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.08,
    })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.scale.set(1.8, 1.8, 1)
    scene.add(sprite)

    let breatheT = 0
    let rotT = 0

    const updateGeometry = () => {
      const src = positionsRef.current
      const scale = scaleRef.current

      // Update line positions
      for (let i = 0; i < FACE_EDGES.length; i++) {
        const [a, b] = FACE_EDGES[i]
        linePositions[i * 6] = src[a * 3] * scale
        linePositions[i * 6 + 1] = src[a * 3 + 1] * scale
        linePositions[i * 6 + 2] = src[a * 3 + 2] * scale
        linePositions[i * 6 + 3] = src[b * 3] * scale
        linePositions[i * 6 + 4] = src[b * 3 + 1] * scale
        linePositions[i * 6 + 5] = src[b * 3 + 2] * scale
      }
      posAttr.needsUpdate = true

      // Update dot positions
      uniqueIndices.forEach((idx, i) => {
        dotPositions[i * 3] = src[idx * 3] * scale
        dotPositions[i * 3 + 1] = src[idx * 3 + 1] * scale
        dotPositions[i * 3 + 2] = src[idx * 3 + 2] * scale
      })
      ;(dotGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
    }

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      breatheT += 0.005
      rotT += 0.003

      // Breathing scale (fallback only)
      scaleRef.current = 1.0 + Math.sin(breatheT) * 0.015

      // Slow rotation
      rotRef.current = Math.sin(rotT) * (5 * Math.PI / 180)
      lines.rotation.y = rotRef.current
      dots.rotation.y = rotRef.current

      // Ring slow spin
      ring.rotation.z += 0.003

      updateGeometry()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      const W2 = canvas.clientWidth
      const H2 = canvas.clientHeight
      renderer.setSize(W2, H2)
      camera.aspect = W2 / H2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', handleResize)
      lineGeometry.dispose()
      lineMaterial.dispose()
      dotGeometry.dispose()
      dotMaterial.dispose()
      ringGeometry.dispose()
      ringMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  const initMediaPipe = useCallback(async (canvas: HTMLCanvasElement) => {
    try {
      const { FaceMesh: MPFaceMesh } = await import('@mediapipe/face_mesh')
      const { Camera } = await import('@mediapipe/camera_utils')

      const video = document.createElement('video')
      video.style.display = 'none'
      document.body.appendChild(video)

      const faceMesh = new MPFaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
      })

      await faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results: { multiFaceLandmarks?: { x: number; y: number; z: number }[][] }) => {
        if (!results.multiFaceLandmarks?.[0]) return
        const landmarks = results.multiFaceLandmarks[0]
        const src = positionsRef.current

        landmarks.forEach((lm, i) => {
          src[i * 3] = (lm.x - 0.5) * 2
          src[i * 3 + 1] = -(lm.y - 0.5) * 2
          src[i * 3 + 2] = -lm.z * 2
        })
      })

      const cam = new Camera(video, {
        onFrame: async () => {
          await faceMesh.send({ image: video })
        },
        width: 320,
        height: 240,
      })
      await cam.start()

      return () => {
        cam.stop()
        video.remove()
        faceMesh.close()
      }
    } catch {
      // Camera denied or MediaPipe failed — fallback animation runs
      return () => {}
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cleanup: (() => void) | null = null
    let mpCleanup: (() => void) | null = null

    cleanup = initThree(canvas)

    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then(async (stream) => {
        stream.getTracks().forEach((t) => t.stop())
        mpCleanup = await initMediaPipe(canvas)
      })
      .catch(() => {
        // no camera — fallback already running
      })

    return () => {
      cleanup?.()
      mpCleanup?.()
    }
  }, [initThree, initMediaPipe])

  return (
    <div className="relative w-full h-full">
      {/* Purple radial glow behind mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  )
}
