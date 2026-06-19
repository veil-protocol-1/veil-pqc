'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface Particle {
  vx: number
  vy: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.innerWidth < 768
    const COUNT = isMobile ? 100 : 300

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      0.1,
      100
    )
    camera.position.z = 10

    renderer.setSize(window.innerWidth, window.innerHeight)

    // Positions
    const positions = new Float32Array(COUNT * 3)
    const velocities: Particle[] = []

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * window.innerWidth
      positions[i * 3 + 1] = (Math.random() - 0.5) * window.innerHeight
      positions[i * 3 + 2] = 0
      const speed = 0.1 + Math.random() * 0.2
      const angle = Math.random() * Math.PI * 2
      velocities.push({ vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed })
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 2.5,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const halfW = window.innerWidth / 2
    const halfH = window.innerHeight / 2

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)

      const pos = geometry.attributes.position as THREE.BufferAttribute
      const mx = (mouseRef.current.x - 0.5) * 20
      const my = (mouseRef.current.y - 0.5) * -20

      for (let i = 0; i < COUNT; i++) {
        let x = (pos.array as Float32Array)[i * 3] + velocities[i].vx + mx * 0.001
        let y = (pos.array as Float32Array)[i * 3 + 1] + velocities[i].vy + my * 0.001

        if (x > halfW) x = -halfW
        if (x < -halfW) x = halfW
        if (y > halfH) y = -halfH
        if (y < -halfH) y = halfH

        ;(pos.array as Float32Array)[i * 3] = x
        ;(pos.array as Float32Array)[i * 3 + 1] = y
      }
      pos.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight)
      camera.left = -window.innerWidth / 2
      camera.right = window.innerWidth / 2
      camera.top = window.innerHeight / 2
      camera.bottom = -window.innerHeight / 2
      camera.updateProjectionMatrix()
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
