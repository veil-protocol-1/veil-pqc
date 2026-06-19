'use client'

import { useEffect, useRef } from 'react'
import { useMediaPipe, type FaceLandmark } from '../hooks/useMediaPipe'
import { TESSELATION } from '../lib/faceTesselation'

// Full MediaPipe FACEMESH_TESSELATION — every triangle, no filtering
const ALL_TRIS: [number, number, number][] = (() => {
  const out: [number, number, number][] = []
  for (let i = 0; i + 2 < TESSELATION.length; i += 3)
    out.push([TESSELATION[i][0], TESSELATION[i + 1][0], TESSELATION[i + 2][0]])
  return out
})()

// Feature highlight edges: eyes, brows, nose, lips, jawline, forehead arc
const HL_EDGES: [number, number][] = [
  [33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133], [133, 33],
  [263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381], [381, 382], [382, 362], [362, 263],
  [46, 53], [53, 52], [52, 65], [65, 55], [55, 107], [107, 66], [66, 105],
  [276, 283], [283, 282], [282, 295], [295, 285], [285, 336], [336, 296], [296, 334],
  [168, 6], [6, 4], [4, 1], [1, 19], [19, 94],
  [98, 97], [97, 99], [327, 326], [326, 328],
  [61, 40], [40, 37], [37, 0], [0, 267], [267, 270], [270, 291],
  [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291],
  [172, 136], [136, 150], [150, 149], [149, 176], [176, 148], [148, 152],
  [152, 377], [377, 400], [400, 378], [378, 379], [379, 365], [365, 397],
  [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
  [234, 127], [127, 162], [162, 21], [21, 54], [54, 103], [103, 67], [67, 109], [109, 10],
]

// Landmark clusters for feature lock-on detection
const CLUSTERS: Record<string, number[]> = {
  leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 246, 161, 160, 159, 158, 157, 173],
  rightEye: [263, 249, 390, 373, 374, 380, 381, 382, 362, 466, 388, 387, 386, 385, 384, 398],
  nose: [1, 2, 4, 5, 6, 19, 94, 98, 97, 99, 327, 326, 328],
  jaw: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397],
}
const VAR_LOCK = 5e-6 // EMA variance → locked
const VAR_UNLOCK = 2e-5 // EMA variance → unlocked (hysteresis)

// Static fallback face geometry (ported verbatim from AmbientFaceMesh.tsx)
const SV: [number, number][] = [
  [140,20],[108,28],[80,52],[54,86],[38,124],[36,162],[46,200],[68,234],[102,258],[140,268],
  [178,258],[212,234],[234,200],[246,162],[244,124],[226,86],[200,52],[172,28],
  [118,40],[140,34],[162,40],[96,68],[140,62],[184,68],[76,102],[204,102],
  [56,132],[66,114],[86,98],[108,90],[124,92],[140,98],[156,92],[172,90],[194,98],[214,114],[224,132],
  [78,126],[92,114],[110,110],[124,118],[110,130],[92,134],
  [156,118],[170,110],[188,114],[202,126],[188,134],[170,130],
  [130,140],[140,135],[150,140],[126,155],[140,150],[154,155],[120,168],[132,174],[140,176],[148,174],[160,168],
  [56,162],[74,158],[92,164],[108,172],[172,172],[188,164],[206,158],[224,162],
  [108,202],[120,195],[130,191],[140,189],[150,191],[160,195],[172,202],[162,212],[152,218],[140,220],[128,218],[118,212],
  [80,218],[60,190],[104,234],[140,238],[176,234],[200,218],[220,190],[116,256],[140,262],[164,256],
  [140,2],[112,6],[168,6],
]

const ST: [number, number, number][] = [
  [0,1,18],[0,18,19],[0,19,20],[0,20,17],
  [1,2,21],[1,21,18],[18,21,22],[19,18,22],[19,22,23],[20,19,23],
  [20,23,16],[16,17,20],[16,23,25],[15,16,25],
  [2,3,24],[2,24,21],[3,4,26],[3,26,24],
  [14,15,25],[13,14,36],[13,36,25],
  [24,26,27],[24,27,28],[24,28,29],[24,29,21],
  [21,29,30],[21,30,31],[21,31,22],
  [22,31,32],[22,32,33],[22,33,23],
  [23,33,34],[23,34,35],[23,35,25],[25,35,36],
  [4,5,26],
  [26,27,37],[27,28,38],[28,38,37],
  [28,29,39],[28,39,38],[29,30,40],[29,40,39],[30,31,40],
  [37,38,42],[38,39,42],[39,41,42],[39,40,41],
  [26,37,42],[26,42,61],[26,61,60],[5,26,60],[5,60,6],
  [42,41,62],[41,63,62],[41,40,63],[62,63,55],
  [31,32,43],[32,33,44],[32,44,43],[33,34,45],[33,45,44],[34,35,46],[35,36,46],
  [43,44,48],[44,45,48],[45,47,48],[45,46,47],
  [36,46,67],[36,67,13],[46,47,66],[47,65,66],[47,48,65],[48,64,65],[48,43,64],
  [40,43,50],[40,50,49],[43,51,50],[43,48,51],
  [40,41,52],[40,49,52],[48,54,51],[48,59,54],
  [49,50,52],[50,53,52],[50,54,53],[50,51,54],
  [52,53,56],[53,57,56],[53,54,57],[54,58,57],[54,59,58],
  [52,55,56],[56,57,55],
  [55,56,69],[56,57,70],[57,71,70],[57,72,71],[58,72,57],[58,59,72],[59,73,72],
  [55,68,69],[56,69,70],[55,63,68],[63,79,68],
  [59,64,73],[64,73,74],[64,74,75],
  [68,69,79],[69,78,79],[69,70,78],[70,77,78],[70,71,77],
  [71,76,77],[71,72,76],[72,75,76],[72,73,75],[73,74,75],
  [60,61,42],[61,62,42],[61,62,63],
  [64,65,48],[65,66,47],
  [62,79,80],[62,63,79],
  [5,6,81],[6,81,80],[6,7,80],[7,80,82],[7,8,82],
  [80,82,83],[82,83,87],[87,83,88],[8,82,87],[8,87,9],
  [87,88,9],[88,89,9],[89,10,9],[10,84,89],[10,11,84],
  [11,85,84],[11,12,85],[12,86,85],[12,13,86],
  [83,84,89],[83,84,88],
  [68,79,80],[68,80,81],[74,75,84],[75,76,83],[76,77,83],
  [77,78,83],[78,80,83],[74,85,84],[85,86,67],[86,67,13],
  [90,91,1],[90,1,0],[90,0,17],[90,17,92],
  [91,18,1],[91,2,18],[92,20,17],[92,16,20],
]

// Per-triangle depth shade: face center ≈ 1.0, skull silhouette ≈ 0.0
const ST_DEPTH = ST.map(([a, b, c]) => {
  const [x1, y1] = SV[a]!, [x2, y2] = SV[b]!, [x3, y3] = SV[c]!
  const cx = (x1 + x2 + x3) / 3, cy = (y1 + y2 + y3) / 3
  return Math.max(0, 1 - Math.sqrt(((cx - 140) / 130) ** 2 + ((cy - 150) / 160) ** 2))
})

interface FeatureState {
  emaX: number; emaY: number
  varX: number; varY: number
  locked: boolean; lockT: number
}

interface VeilFaceMeshProps {
  width?: number
  height?: number
  className?: string
  /** Controlled mode: pass landmarks directly (e.g. [] ) to skip the internal camera and force the static breathing fallback. */
  landmarks?: FaceLandmark[]
  failed?: boolean
}

export default function VeilFaceMesh({
  width = 320,
  height = 320,
  className,
  landmarks: landmarksProp,
  failed: failedProp,
}: VeilFaceMeshProps) {
  const controlled = landmarksProp !== undefined
  const mp = useMediaPipe()

  useEffect(() => {
    if (controlled) return
    mp.startCamera()
    return () => mp.stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const landmarksRef = useRef<FaceLandmark[]>([])
  const boundsRef = useRef({ minX: 0.25, maxX: 0.75, minY: 0.10, maxY: 0.90 })
  const failedRef = useRef(false)
  const rafRef = useRef(0)
  const tRef = useRef(0)

  const confRef = useRef(0)
  const triOrderRef = useRef<number[] | null>(null)
  const featuresRef = useRef<Record<string, FeatureState>>({
    leftEye: { emaX: -1, emaY: -1, varX: 1, varY: 1, locked: false, lockT: -1 },
    rightEye: { emaX: -1, emaY: -1, varX: 1, varY: 1, locked: false, lockT: -1 },
    nose: { emaX: -1, emaY: -1, varX: 1, varY: 1, locked: false, lockT: -1 },
    jaw: { emaX: -1, emaY: -1, varX: 1, varY: 1, locked: false, lockT: -1 },
  })
  const pulseRef = useRef({ active: false, startT: 0, triggered: false })
  const scanPhaseRef = useRef(0)

  landmarksRef.current = controlled ? landmarksProp! : mp.landmarks
  failedRef.current = controlled ? !!failedProp : mp.permissionDenied || !!mp.initError

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = width / 2
    const cy = height / 2
    const TARGET_W = width * 0.82
    const TARGET_H = height * 0.82

    let prev = performance.now()

    const drawFallback = (t: number) => {
      const breath = 1 + 0.03 * Math.sin(t * (2 * Math.PI / 3))
      const scale = Math.min(width / 280, height / 320) * 0.95 * breath
      const ox = width / 2, oy = height / 2
      const ccx = 140, ccy = 150

      ctx.save()
      ctx.lineJoin = 'round'
      ctx.shadowColor = '#A855F7'
      ctx.shadowBlur = 12
      for (let i = 0; i < ST.length; i++) {
        const [a, b, c] = ST[i]
        const [x1, y1] = SV[a]!, [x2, y2] = SV[b]!, [x3, y3] = SV[c]!
        const d = ST_DEPTH[i]!
        ctx.beginPath()
        ctx.moveTo(ox + (x1 - ccx) * scale, oy + (y1 - ccy) * scale)
        ctx.lineTo(ox + (x2 - ccx) * scale, oy + (y2 - ccy) * scale)
        ctx.lineTo(ox + (x3 - ccx) * scale, oy + (y3 - ccy) * scale)
        ctx.closePath()
        ctx.fillStyle = `rgba(168,85,247,${(0.04 + 0.07 * d).toFixed(3)})`
        ctx.strokeStyle = `rgba(168,85,247,${(0.55 + 0.35 * d).toFixed(3)})`
        ctx.lineWidth = 0.6
        ctx.fill()
        ctx.stroke()
      }
      ctx.restore()
    }

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const now = performance.now()
      const dt = Math.min((now - prev) / 1000, 0.1) // cap dt to avoid jumps after tab switch
      tRef.current += dt
      prev = now
      const t = tRef.current
      const isFailed = failedRef.current
      const lms = landmarksRef.current
      const hasFace = lms.length >= 468

      ctx.clearRect(0, 0, width, height)

      if (!hasFace) {
        drawFallback(t)
        return
      }

      // ── Confidence ramp ────────────────────────────────────────────
      confRef.current = Math.max(0, Math.min(1, confRef.current + 0.015))
      const conf = confRef.current

      // ── Variable-speed scan line ──────────────────────────────────
      const period = 4 - conf * 3.2
      scanPhaseRef.current = (scanPhaseRef.current + dt / period) % 1
      const scanY = cy - TARGET_H / 2 + scanPhaseRef.current * TARGET_H
      const scanAlpha = 0.38 + 0.35 * Math.abs(Math.sin(t * Math.PI * 2 / period))
      const scanColor = isFailed
        ? `rgba(255,51,102,${scanAlpha.toFixed(2)})`
        : `rgba(168,85,247,${scanAlpha.toFixed(2)})`

      ctx.save()
      ctx.strokeStyle = scanColor
      ctx.lineWidth = 2
      ctx.shadowColor = scanColor
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(cx - TARGET_W / 2, scanY)
      ctx.lineTo(cx + TARGET_W / 2, scanY)
      ctx.stroke()
      ctx.restore()

      // ── EMA face bounds ──────────────────────────────────────────────
      let rx0 = Infinity, rx1 = -Infinity, ry0 = Infinity, ry1 = -Infinity
      for (let i = 0; i < lms.length; i++) {
        const l = lms[i]
        if (l.x < rx0) rx0 = l.x; if (l.x > rx1) rx1 = l.x
        if (l.y < ry0) ry0 = l.y; if (l.y > ry1) ry1 = l.y
      }
      const A = 0.08
      const b = boundsRef.current
      b.minX += (rx0 - b.minX) * A; b.maxX += (rx1 - b.maxX) * A
      b.minY += (ry0 - b.minY) * A; b.maxY += (ry1 - b.maxY) * A

      const faceBottom = b.maxY
      const faceTop = b.minY - (b.maxY - b.minY) * 0.45
      const faceCX = (b.minX + b.maxX) / 2
      const faceCY = (faceTop + faceBottom) / 2
      const faceW = b.maxX - b.minX
      const faceH = faceBottom - faceTop
      const scale = Math.min(TARGET_W / faceW, TARGET_H / faceH) * 0.72

      // ── Project all 468 landmarks ────────────────────────────────────
      const px = new Float32Array(lms.length)
      const py = new Float32Array(lms.length)
      for (let i = 0; i < lms.length; i++) {
        const l = lms[i]
        const nx = -(l.x - faceCX) * scale
        const ny = (l.y - faceCY) * scale
        px[i] = cx + nx * (1 + l.z * 0.3)
        py[i] = cy + ny
      }

      // ── Build triangle sort order once on first valid frame ─────────
      if (!triOrderRef.current) {
        let fcx = 0, fcy = 0
        for (let i = 0; i < lms.length; i++) { fcx += lms[i].x; fcy += lms[i].y }
        fcx /= lms.length; fcy /= lms.length
        triOrderRef.current = ALL_TRIS
          .map(([a, bv, c], i) => ({
            i,
            d: ((lms[a].x - fcx) ** 2 + (lms[a].y - fcy) ** 2 +
                (lms[bv].x - fcx) ** 2 + (lms[bv].y - fcy) ** 2 +
                (lms[c].x - fcx) ** 2 + (lms[c].y - fcy) ** 2) / 3,
          }))
          .sort((a, b2) => b2.d - a.d)
          .map((x) => x.i)
      }

      // ── Update feature cluster variance → lock state ──────────────────
      const EMA_F = 0.18
      const features = featuresRef.current
      for (const key of Object.keys(CLUSTERS)) {
        const idxs = CLUSTERS[key]
        const feat = features[key]
        let mx = 0, my = 0
        for (const idx of idxs) { mx += lms[idx].x; my += lms[idx].y }
        mx /= idxs.length; my /= idxs.length
        if (feat.emaX < 0) { feat.emaX = mx; feat.emaY = my }
        const dx = mx - feat.emaX, dy = my - feat.emaY
        feat.emaX += dx * EMA_F; feat.emaY += dy * EMA_F
        feat.varX += (dx * dx - feat.varX) * EMA_F
        feat.varY += (dy * dy - feat.varY) * EMA_F
        const totalVar = feat.varX + feat.varY
        if (!feat.locked && totalVar < VAR_LOCK) { feat.locked = true; feat.lockT = t }
        else if (feat.locked && totalVar > VAR_UNLOCK) { feat.locked = false }
      }

      // Shared colors
      const baseColor = isFailed ? 'rgba(255,51,102,0.7)' : 'rgba(139,49,204,0.7)'
      const glowColor = isFailed ? 'rgba(255,51,102,0.8)' : 'rgba(168,85,247,0.8)'

      // ── Progressive triangle fill (outer → inner as conf 0→1) ───────
      const order = triOrderRef.current
      const nTris = Math.floor(conf * ALL_TRIS.length)

      ctx.save()
      ctx.strokeStyle = baseColor
      ctx.lineWidth = 0.5
      ctx.lineJoin = 'round'
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 8
      ctx.beginPath()
      for (let oi = 0; oi < nTris; oi++) {
        const tri = ALL_TRIS[order[oi]]
        ctx.moveTo(px[tri[0]], py[tri[0]])
        ctx.lineTo(px[tri[1]], py[tri[1]])
        ctx.lineTo(px[tri[2]], py[tri[2]])
        ctx.closePath()
      }
      ctx.stroke()
      ctx.restore()

      // ── Highlight edges ──────────────────────────────────────────────
      const hlColor = isFailed ? 'rgba(255,102,153,0.95)' : 'rgba(192,132,252,0.95)'
      ctx.save()
      ctx.strokeStyle = hlColor
      ctx.lineWidth = 0.9
      ctx.lineCap = 'round'
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 8
      ctx.beginPath()
      for (let i = 0; i < HL_EDGES.length; i++) {
        const [a, bv] = HL_EDGES[i]
        ctx.moveTo(px[a], py[a]); ctx.lineTo(px[bv], py[bv])
      }
      ctx.stroke()
      ctx.restore()

      // ── Feature lock-on corner brackets ───────────────────────────────
      const PAD = 5
      for (const key of Object.keys(CLUSTERS)) {
        const feat = features[key]
        if (!feat.locked) continue

        const idxs = CLUSTERS[key]
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        for (const idx of idxs) {
          if (px[idx] < minX) minX = px[idx]; if (px[idx] > maxX) maxX = px[idx]
          if (py[idx] < minY) minY = py[idx]; if (py[idx] > maxY) maxY = py[idx]
        }
        minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD

        const lockAge = t - feat.lockT
        const flashA = lockAge < 0.2
          ? 0.6 + 0.35 * Math.abs(Math.sin(lockAge * Math.PI / 0.05))
          : 0.65
        const bkCol = isFailed
          ? `rgba(255,100,140,${flashA.toFixed(2)})`
          : `rgba(192,132,252,${flashA.toFixed(2)})`
        const bLen = Math.min(maxX - minX, maxY - minY) * 0.30

        ctx.save()
        ctx.strokeStyle = bkCol
        ctx.lineWidth = 1.5
        ctx.shadowColor = isFailed ? 'rgba(255,51,102,0.7)' : 'rgba(192,132,252,0.7)'
        ctx.shadowBlur = 8
        ctx.lineCap = 'square'
        ctx.beginPath()
        ctx.moveTo(minX + bLen, minY); ctx.lineTo(minX, minY); ctx.lineTo(minX, minY + bLen)
        ctx.moveTo(maxX - bLen, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + bLen)
        ctx.moveTo(minX + bLen, maxY); ctx.lineTo(minX, maxY); ctx.lineTo(minX, maxY - bLen)
        ctx.moveTo(maxX - bLen, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - bLen)
        ctx.stroke()
        ctx.restore()
      }

      // ── Radial pulse when confidence crosses 94% ──────────────────────
      const pulse = pulseRef.current
      if (conf >= 0.94 && !pulse.triggered) {
        pulse.triggered = true
        pulse.active = true
        pulse.startT = t
      }
      if (conf < 0.80) pulse.triggered = false

      if (pulse.active) {
        const elapsed = t - pulse.startT
        const DURATION = 0.6
        if (elapsed < DURATION) {
          const progress = elapsed / DURATION
          const radius = progress * Math.max(width, height) * 0.6
          const alpha = (1 - progress) * 0.6
          ctx.save()
          ctx.strokeStyle = `rgba(168,85,247,${alpha.toFixed(3)})`
          ctx.lineWidth = 2
          ctx.shadowColor = 'rgba(168,85,247,0.5)'
          ctx.shadowBlur = 18
          ctx.beginPath()
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        } else {
          pulse.active = false
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [width, height])

  return (
    <div className={className} style={{ position: 'relative', width, height }}>
      <video ref={mp.videoRef} style={{ display: 'none' }} playsInline muted />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, display: 'block' }}
      />
    </div>
  )
}
