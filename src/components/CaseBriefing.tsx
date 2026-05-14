'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function CaseBriefing() {
  const navigate   = useCaseStore(s => s.navigate)
  const activeCase = useCaseStore(s => s.activeCase)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timings = [300, 900, 1500, 2100, 2700]
    const timers  = timings.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!activeCase) return null

  const show = (n: number) => step >= n

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 0',
      gap: 24,
    }}>

      {/* Case stamp */}
      <div style={{
        opacity: show(1) ? 1 : 0,
        transform: show(1) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          border: '2px solid #8b1a1a',
          padding: '4px 16px',
          fontFamily: 'var(--font-courier)',
          fontSize: 10,
          letterSpacing: 5,
          color: '#8b1a1a',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          Case File — {activeCase.genre.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(22px, 3.5vw, 36px)',
          color: '#1a1209',
          letterSpacing: 1,
        }}>
          {activeCase.title}
        </div>
      </div>

      {/* Setting */}
      <div style={{
        opacity: show(2) ? 1 : 0,
        transform: show(2) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        maxWidth: 560,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-special)',
          fontSize: 13,
          color: '#5a4a3a',
          lineHeight: 1.8,
          fontStyle: 'italic',
          borderLeft: '3px solid #8b1a1a',
          paddingLeft: 16,
          textAlign: 'left',
        }}>
          {activeCase.setting}
        </div>
      </div>

      {/* Victim + Crime cards */}
      <div style={{
        opacity: show(3) ? 1 : 0,
        transform: show(3) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        width: '100%',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>

          {/* Victim card */}
          <div style={{
            background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              — Victim —
            </div>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(16px, 2vw, 22px)',
              color: '#1a1209',
              marginBottom: 4,
              lineHeight: 1.2,
            }}>
              {activeCase.victim.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              color: '#8b1a1a',
              marginBottom: 10,
              letterSpacing: 1,
            }}>
              {activeCase.victim.age} — {activeCase.victim.occupation}
            </div>
            <div style={{
              width: 32,
              height: 1,
              background: 'rgba(0,0,0,0.2)',
              marginBottom: 10,
            }} />
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              color: '#5a4a3a',
              lineHeight: 1.8,
            }}>
              {activeCase.victim.background}
            </div>
          </div>

          {/* Crime card */}
          <div style={{
            background: 'rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              — The Crime —
            </div>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              color: '#8b1a1a',
              marginBottom: 4,
              textTransform: 'capitalize',
              lineHeight: 1.2,
            }}>
              {activeCase.crime.type}
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              color: '#5a4a3a',
              marginBottom: 10,
              letterSpacing: 1,
            }}>
              {activeCase.crime.time}
            </div>
            <div style={{
              width: 32,
              height: 1,
              background: 'rgba(0,0,0,0.2)',
              marginBottom: 10,
            }} />
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              color: '#5a4a3a',
              lineHeight: 1.8,
            }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: '#1a1209', letterSpacing: 1, textTransform: 'uppercase', fontSize: 9 }}>Method</span>
                <br />{activeCase.crime.method}
              </div>
              <div>
                <span style={{ color: '#1a1209', letterSpacing: 1, textTransform: 'uppercase', fontSize: 9 }}>Location</span>
                <br />{activeCase.crime.location}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        opacity: show(4) ? 1 : 0,
        transform: show(4) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        display: 'flex',
        gap: 16,
      }}>
        {[
          { label: 'SUSPECTS',  value: activeCase.suspects.length },
          { label: 'LOCATIONS', value: activeCase.locations.length },
          { label: 'EVIDENCE',  value: activeCase.evidence.length },
        ].map(({ label, value }) => (
          <div key={label} style={{
            textAlign: 'center',
            padding: '10px 20px',
            border: '1px solid rgba(0,0,0,0.12)',
            background: 'rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 28,
              color: '#1a1209',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 8,
              letterSpacing: 3,
              color: '#5a4a3a',
              textTransform: 'uppercase',
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Begin button */}
      <div style={{
        opacity: show(5) ? 1 : 0,
        transform: show(5) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
      }}>
        <button
          onClick={() => navigate('hub')}
          style={{
            padding: '12px 40px',
            background: '#8b1a1a',
            border: '1px solid #8b1a1a',
            color: '#f0e6c8',
            fontFamily: 'var(--font-courier)',
            fontSize: 12,
            letterSpacing: 4,
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#6b1212'}
          onMouseLeave={e => e.currentTarget.style.background = '#8b1a1a'}
        >
          BEGIN INVESTIGATION →
        </button>
      </div>

    </div>
  )
}