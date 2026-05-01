'use client'

import { useEffect, useRef } from 'react'
import { useCaseStore } from '@/store/caseStore'
import CaseSetup from '@/components/CaseSetup'
import CaseBriefing from '@/components/CaseBriefing'
import InvestigationHub from '@/components/InvestigationHub'
import LocationScreen from '@/components/LocationScreen'
import InterviewScreen from '@/components/InterviewScreen'
import EvidenceBoard from '@/components/EvidenceBoard'
import AccusationScreen from '@/components/AccusationScreen'
import CaseClosedScreen from '@/components/CaseClosedScreen'
import SmokeEffect from '@/components/SmokeEffect'

export default function Home() {
  const screen = useCaseStore(s => s.screen)
  const navigate = useCaseStore(s => s.navigate)

  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <SmokeEffect />

      {screen === 'menu'       && <TitleScreen navigate={navigate} />}
      {screen === 'setup'      && <CaseSetup />}
      {screen === 'briefing'   && <CaseBriefing />}
      {screen === 'hub'        && <InvestigationHub />}
      {screen === 'location'   && <LocationScreen />}
      {screen === 'interview'  && <InterviewScreen />}
      {screen === 'evidence'   && <EvidenceBoard />}
      {screen === 'accusation' && <AccusationScreen />}
      {screen === 'closed'     && <CaseClosedScreen />}
    </main>
  )
}

function TitleScreen({ navigate }: { navigate: (s: any) => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
    }}>

      {/* Top rule */}
      <div style={{
        width: 120,
        height: 1,
        background: 'var(--red)',
        marginBottom: 32,
      }} />

      {/* Eyebrow */}
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 11,
        letterSpacing: 6,
        color: 'var(--cream-dim)',
        textTransform: 'uppercase',
        marginBottom: 16,
      }}>
        Detective Bureau — Case Division
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 'clamp(56px, 10vw, 96px)',
        color: 'var(--cream)',
        letterSpacing: 8,
        lineHeight: 1,
        textAlign: 'center',
        textShadow: '0 0 40px rgba(139, 26, 26, 0.4)',
      }}>
        COLD
        <br />
        <span style={{ color: 'var(--red-bright)' }}>CASE</span>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'var(--font-special)',
        fontSize: 13,
        color: 'var(--cream-dim)',
        letterSpacing: 3,
        marginTop: 20,
        marginBottom: 56,
        textAlign: 'center',
      }}>
        Every case has a truth. Find it.
      </div>

      {/* Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
        maxWidth: 300,
      }}>
        <TitleButton
          onClick={() => navigate('setup')}
          primary
        >
          OPEN A NEW CASE
        </TitleButton>

        <TitleButton onClick={() => navigate('files')}>
          CASE FILES
        </TitleButton>
      </div>

      {/* Bottom rule */}
      <div style={{
        position: 'absolute',
        bottom: 28,
        fontSize: 10,
        letterSpacing: 4,
        color: 'var(--cream-dim)',
        opacity: 0.3,
        fontFamily: 'var(--font-courier)',
      }}>
        PROCEDURAL MYSTERY ENGINE
      </div>

    </div>
  )
}

function TitleButton({
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
        width: '100%',
        padding: '14px',
        background: primary ? 'var(--red)' : 'transparent',
        border: `1px solid ${primary ? 'var(--red-bright)' : 'var(--border-bright)'}`,
        color: primary ? 'var(--cream)' : 'var(--cream-dim)',
        fontFamily: 'var(--font-courier)',
        fontSize: 13,
        letterSpacing: 4,
        cursor: 'pointer',
        transition: 'all 0.2s',
        textTransform: 'uppercase',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.background = primary ? 'var(--red-bright)' : 'var(--bg-surface)'
        el.style.color = 'var(--cream)'
        el.style.borderColor = primary ? 'var(--red-bright)' : 'var(--cream-dim)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.background = primary ? 'var(--red)' : 'transparent'
        el.style.color = primary ? 'var(--cream)' : 'var(--cream-dim)'
        el.style.borderColor = primary ? 'var(--red-bright)' : 'var(--border-bright)'
      }}
    >
      {children}
    </button>
  )
}