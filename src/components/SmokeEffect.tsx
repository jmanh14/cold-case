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
      const x = Math.random() * canvas!.width
      particles.current.push({
        x,
        y: canvas!.height + 20,
        size: Math.random() * 20 + 15,
        opacity: 0,
        speed: Math.random() * 0.5 + 0.3,
        drift: (Math.random() - 0.5) * 0.4,
        age: 0,
        maxAge: Math.random() * 400 + 300,
      })
    }

    let spawnTimer = 0

    function tick() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      spawnTimer++
      if (spawnTimer % 6 === 0) spawnParticle()

      particles.current = particles.current.filter(p => p.age < p.maxAge)

      for (const p of particles.current) {
        p.age++
        p.y -= p.speed
        p.x += p.drift
        p.size += 0.15

        const progress = p.age / p.maxAge
        p.opacity = progress < 0.2
          ? progress / 0.2 * 0.15
          : progress > 0.6
          ? (1 - (progress - 0.6) / 0.4) * 0.15
          : 0.15

        const grad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.size
        )
        grad.addColorStop(0, `rgba(160, 140, 120, ${p.opacity})`)
        grad.addColorStop(0.4, `rgba(140, 120, 100, ${p.opacity * 0.6})`)
        grad.addColorStop(1, `rgba(120, 100, 80, 0)`)

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.scale(1, 2.5)
        ctx.translate(-p.x, -p.y)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
        ctx.restore()
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