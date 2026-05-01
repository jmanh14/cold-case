'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function CaseBriefing() {
  const navigate    = useCaseStore(s => s.navigate)
  const activeCase  = useCaseStore(s => s.activeCase)
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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* Case stamp */}
      <div style={{
        opacity: show(1) ? 1 : 0,
        transform: show(1) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        textAlign: 'center',
        marginBottom: 40,
      }}>
        <div style={{
          display: 'inline-block',
          border: '2px solid var(--red)',
          padding: '6px 20px',
          fontFamily: 'var(--font-courier)',
          fontSize: 11,
          letterSpacing: 6,
          color: 'var(--red-bright)',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Case File — {activeCase.genre.toUpperCase()}
        </div>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(28px, 5vw, 48px)',
          color: 'var(--cream)',
          letterSpacing: 2,
          textShadow: '0 0 30px rgba(139,26,26,0.3)',
        }}>
          {activeCase.title}
        </div>
      </div>

      {/* Setting */}
      <div style={{
        opacity: show(2) ? 1 : 0,
        transform: show(2) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        maxWidth: 600,
        textAlign: 'center',
        marginBottom: 40,
      }}>
        <div style={{
          fontFamily: 'var(--font-special)',
          fontSize: 15,
          color: 'var(--cream-dim)',
          lineHeight: 1.8,
          letterSpacing: 1,
          fontStyle: 'italic',
        }}>
          {activeCase.setting}
        </div>
      </div>

      {/* Victim + Crime */}
      <div style={{
        opacity: show(3) ? 1 : 0,
        transform: show(3) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        width: '100%',
        maxWidth: 600,
        marginBottom: 32,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
        }}>
          <CaseCard label="VICTIM">
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 28,
              color: 'var(--cream)',
              marginBottom: 6,
              lineHeight: 1.1,
            }}>
              {activeCase.victim.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              color: 'var(--red-bright)',
              marginBottom: 12,
              letterSpacing: 1,
            }}>
              {activeCase.victim.age} — {activeCase.victim.occupation}
            </div>
            <div style={{
              width: 40,
              height: 1,
              background: 'var(--border-bright)',
              marginBottom: 12,
            }} />
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              color: 'var(--cream-dim)',
              lineHeight: 1.8,
            }}>
              {activeCase.victim.background}
            </div>
          </CaseCard>

          <CaseCard label="THE CRIME">
            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 28,
              color: 'var(--red-bright)',
              marginBottom: 6,
              textTransform: 'capitalize',
              lineHeight: 1.1,
            }}>
              {activeCase.crime.type}
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              color: 'var(--cream-dim)',
              marginBottom: 12,
              letterSpacing: 1,
            }}>
              {activeCase.crime.time}
            </div>
            <div style={{
              width: 40,
              height: 1,
              background: 'var(--border-bright)',
              marginBottom: 12,
            }} />
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              color: 'var(--cream-dim)',
              lineHeight: 1.8,
            }}>
              <div style={{ marginBottom: 6 }}>
                <span style={{ color: 'var(--cream)', letterSpacing: 1 }}>METHOD</span>
                <br />{activeCase.crime.method}
              </div>
              <div>
                <span style={{ color: 'var(--cream)', letterSpacing: 1 }}>LOCATION</span>
                <br />{activeCase.crime.location}
              </div>
            </div>
          </CaseCard>
        </div>
      </div>

      {/* Suspects count + evidence count */}
      <div style={{
        opacity: show(4) ? 1 : 0,
        transform: show(4) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        display: 'flex',
        gap: 24,
        marginBottom: 48,
      }}>
        <StatPill label="SUSPECTS" value={activeCase.suspects.length} />
        <StatPill label="LOCATIONS" value={activeCase.locations.length} />
        <StatPill label="EVIDENCE" value={activeCase.evidence.length} />
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
            padding: '14px 48px',
            background: 'var(--red)',
            border: '1px solid var(--red-bright)',
            color: 'var(--cream)',
            fontFamily: 'var(--font-courier)',
            fontSize: 13,
            letterSpacing: 4,
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bright)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
        >
          BEGIN INVESTIGATION →
        </button>
      </div>

    </div>
  )
}

function CaseCard({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-bright)',
      padding: '24px 20px',
      position: 'relative',
    }}>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 12,
        letterSpacing: 4,
        color: 'var(--red-bright)',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function StatPill({ label, value }: { label: string, value: number }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '12px 24px',
      border: '1px solid var(--border-bright)',
      background: 'var(--bg-surface)',
    }}>
      <div style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 28,
        color: 'var(--cream)',
        lineHeight: 1,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 9,
        letterSpacing: 3,
        color: 'var(--cream-dim)',
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  )
}