'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  drift: number
  age: number
  maxAge: number
}

export default function SmokeEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animRef   = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function spawnParticle() {
      const x = canvas!.width * 0.5 + (Math.random() - 0.5) * 60
      particles.current.push({
        x,
        y: canvas!.height * 0.75,
        size: Math.random() * 18 + 8,
        opacity: 0,
        speed: Math.random() * 0.4 + 0.2,
        drift: (Math.random() - 0.5) * 0.3,
        age: 0,
        maxAge: Math.random() * 200 + 150,
      })
    }

    let spawnTimer = 0

    function tick() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      spawnTimer++
      if (spawnTimer % 18 === 0) spawnParticle()

      particles.current = particles.current.filter(p => p.age < p.maxAge)

      for (const p of particles.current) {
        p.age++
        p.y -= p.speed
        p.x += p.drift
        p.size += 0.04

        const progress = p.age / p.maxAge
        p.opacity = progress < 0.15
          ? progress / 0.15 * 0.18
          : progress > 0.7
          ? (1 - (progress - 0.7) / 0.3) * 0.18
          : 0.18

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
        grad.addColorStop(0, `rgba(180, 160, 140, ${p.opacity})`)
        grad.addColorStop(1, `rgba(180, 160, 140, 0)`)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
      }}
    />
  )
}