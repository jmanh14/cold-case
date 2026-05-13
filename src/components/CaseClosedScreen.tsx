'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function CaseClosedScreen() {
  const navigate          = useCaseStore(s => s.navigate)
  const activeCase        = useCaseStore(s => s.activeCase)
  const investigation     = useCaseStore(s => s.investigation)
  const closedCaseResult  = useCaseStore(s => s.closedCaseResult)
  const resetCase         = useCaseStore(s => s.resetCase)

  const [step, setStep] = useState(0)

  useEffect(() => {
    const timings = [300, 900, 1600, 2300, 3000]
    const timers  = timings.map((delay, i) =>
      setTimeout(() => setStep(i + 1), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  if (!activeCase || !investigation || !closedCaseResult) return null

  const correct  = closedCaseResult.correct
  const show     = (n: number) => step >= n

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

      {/* Verdict stamp */}
      <div style={{
        opacity: show(1) ? 1 : 0,
        transform: show(1) ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.6s ease',
        marginBottom: 40,
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-block',
          border: `3px solid ${correct ? 'var(--red-bright)' : 'var(--border-bright)'}`,
          padding: '12px 32px',
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(28px, 5vw, 48px)',
          color: correct ? 'var(--red-bright)' : 'var(--cream-dim)',
          letterSpacing: 8,
          textTransform: 'uppercase',
          transform: 'rotate(-2deg)',
          textShadow: correct ? '0 0 20px rgba(192,57,43,0.5)' : 'none',
        }}>
          {correct ? 'CASE CLOSED' : 'WRONG SUSPECT'}
        </div>
      </div>

      {/* Case title */}
      <div style={{
        opacity: show(2) ? 1 : 0,
        transform: show(2) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        textAlign: 'center',
        marginBottom: 32,
      }}>
        <div style={{
          fontFamily: 'var(--font-courier)',
          fontSize: 10,
          letterSpacing: 4,
          color: 'var(--red-bright)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}>
          {activeCase.genre.toUpperCase()} — {activeCase.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(18px, 3vw, 28px)',
          color: 'var(--cream)',
          marginBottom: 8,
        }}>
          The killer was{' '}
          <span style={{ color: 'var(--red-bright)' }}>
            {closedCaseResult.killerName}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-courier)',
          fontSize: 12,
          color: 'var(--cream-dim)',
          letterSpacing: 1,
        }}>
          {investigation.turnsUsed} turns — {investigation.discoveredEvidence.length} evidence collected
        </div>
      </div>

      {/* Narrative reveal */}
      <div style={{
        opacity: show(3) ? 1 : 0,
        transform: show(3) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        maxWidth: 680,
        width: '100%',
        marginBottom: 32,
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-bright)',
          borderLeft: `4px solid ${correct ? 'var(--red-bright)' : 'var(--border-bright)'}`,
          padding: '24px 28px',
        }}>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 9,
            letterSpacing: 4,
            color: 'var(--red-bright)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            — The Truth —
          </div>
          <div style={{
            fontFamily: 'var(--font-special)',
            fontSize: 15,
            color: 'var(--cream)',
            lineHeight: 1.9,
            whiteSpace: 'pre-wrap',
          }}>
            {closedCaseResult.narrative}
          </div>
        </div>
      </div>

      {/* Key facts */}
      <div style={{
        opacity: show(4) ? 1 : 0,
        transform: show(4) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        maxWidth: 680,
        width: '100%',
        marginBottom: 40,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          <FactCard label="Motive" value={closedCaseResult.motive} />
          <FactCard label="Method" value={closedCaseResult.method} />
        </div>
      </div>

      {/* Actions */}
      <div style={{
        opacity: show(5) ? 1 : 0,
        transform: show(5) ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <ActionButton
          onClick={() => {
            resetCase()
            navigate('setup')
          }}
          primary
        >
          NEW CASE
        </ActionButton>

        <ActionButton onClick={() => {
          resetCase()
          navigate('menu')
        }}>
          MAIN MENU
        </ActionButton>
      </div>

    </div>
  )
}

function FactCard({ label, value }: { label: string, value: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      padding: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 9,
        letterSpacing: 3,
        color: 'var(--red-bright)',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 13,
        color: 'var(--cream)',
        lineHeight: 1.7,
      }}>
        {value}
      </div>
    </div>
  )
}

function ActionButton({
  onClick,
  children,
  primary = false,
}: {
  onClick: () => void
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 36px',
        background: primary ? 'var(--red)' : 'transparent',
        border: `1px solid ${primary ? 'var(--red-bright)' : 'var(--border-bright)'}`,
        color: primary ? 'var(--cream)' : 'var(--cream-dim)',
        fontFamily: 'var(--font-courier)',
        fontSize: 12,
        letterSpacing: 4,
        cursor: 'pointer',
        textTransform: 'uppercase',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = primary ? 'var(--red-bright)' : 'var(--bg-surface)'
        e.currentTarget.style.color = 'var(--cream)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = primary ? 'var(--red)' : 'transparent'
        e.currentTarget.style.color = primary ? 'var(--cream)' : 'var(--cream-dim)'
      }}
    >
      {children}
    </button>
  )
}