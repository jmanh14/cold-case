'use client'

import { ReactNode } from 'react'
import { useCaseStore } from '@/store/caseStore'

type Tab = {
  id: string
  label: string
  screen: string
}

const TABS: Tab[] = [
  { id: 'briefing',   label: 'CASE BRIEF',    screen: 'briefing'   },
  { id: 'hub',        label: 'INVESTIGATION', screen: 'hub'        },
  { id: 'evidence',   label: 'EVIDENCE',      screen: 'evidence'   },
  { id: 'accusation', label: 'ACCUSATION',    screen: 'accusation' },
]

export default function DeskLayout({
  children,
  currentScreen,
}: {
  children: ReactNode
  currentScreen: string
}) {
  const navigate   = useCaseStore(s => s.navigate)
  const activeCase = useCaseStore(s => s.activeCase)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: 'url(/images/desk-bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>

      {/* Document sitting on desk */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '65vw',
        maxWidth: 900,
        height: '85vh',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Folder tabs above the paper */}
        <div style={{
          display: 'flex',
          gap: 6,
          paddingLeft: 16,
          flexShrink: 0,
          alignItems: 'flex-end',
        }}>
          {TABS.map(tab => {
            const isActive = currentScreen === tab.screen ||
              (tab.screen === 'hub' && ['hub', 'location', 'interview'].includes(currentScreen))
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.screen as any)}
                style={{
                  padding: '8px 20px 6px',
                  background: isActive
                    ? 'url(/images/paper-texture.png) center/cover'
                    : 'rgba(180,140,70,0.75)',
                  border: '1px solid rgba(0,0,0,0.25)',
                  borderBottom: isActive ? 'none' : '1px solid rgba(0,0,0,0.25)',
                  borderRadius: '6px 6px 0 0',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 'clamp(8px, 0.8vw, 10px)',
                  letterSpacing: 2,
                  color: isActive ? '#8b1a1a' : '#3a2a0a',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s',
                  boxShadow: isActive
                    ? '0 -4px 8px rgba(0,0,0,0.2)'
                    : '0 -2px 4px rgba(0,0,0,0.15)',
                  position: 'relative',
                  bottom: isActive ? -1 : -3,
                  minWidth: 100,
                  textAlign: 'center',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(196,163,90,0.9)'
                    e.currentTarget.style.bottom = '-1px'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(180,140,70,0.75)'
                    e.currentTarget.style.bottom = '-3px'
                  }
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Paper document */}
        <div style={{
          flex: 1,
          backgroundImage: 'url(/images/paper-texture.png)',
          backgroundSize: 'cover',
          border: '1px solid rgba(0,0,0,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2,
        }}>

          {/* Document header */}
          <div style={{
            borderBottom: '1px solid rgba(139,26,26,0.3)',
            padding: '10px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 'clamp(7px, 0.7vw, 9px)',
                letterSpacing: 3,
                color: '#8b1a1a',
                textTransform: 'uppercase',
              }}>
                Detective Bureau — Case Division
              </div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(12px, 1.5vw, 18px)',
                color: '#1a1209',
                marginTop: 2,
              }}>
                {activeCase?.title ?? 'Case File'}
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 'clamp(7px, 0.7vw, 9px)',
              letterSpacing: 2,
              color: '#5a4a3a',
              textAlign: 'right',
              textTransform: 'uppercase',
            }}>
              <div>Case #{activeCase?.id?.slice(-4).toUpperCase() ?? '0000'}</div>
              <div style={{ color: '#8b1a1a', fontWeight: 700 }}>CONFIDENTIAL</div>
            </div>
          </div>

          {/* Document content */}
          <div
            className="doc-scroll"
            style={{
              flex: 1,
              padding: '16px 24px',
              overflowY: 'auto',
            }}
          >
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}