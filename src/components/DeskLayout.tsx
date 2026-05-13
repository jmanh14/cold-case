'use client'

import { ReactNode } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { motion, AnimatePresence } from 'framer-motion'

type Tab = {
  id: string
  label: string
  screen: string
}

const TABS: Tab[] = [
  { id: 'briefing',   label: 'CASE BRIEF',   screen: 'briefing'   },
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

      {/* Folder behind documents */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75vw',
        maxWidth: 1000,
        aspectRatio: '4/3',
        zIndex: 1,
      }}>
        <img
          src="/images/folder.png"
          alt="case folder"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
          }}
        />

        {/* Case label on folder tab */}
        {activeCase && (
          <div style={{
            position: 'absolute',
            top: '4%',
            right: '8%',
            fontFamily: 'var(--font-courier)',
            fontSize: 'clamp(7px, 0.8vw, 10px)',
            color: '#1a1209',
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
            width: '14%',
            lineHeight: 1.3,
          }}>
            {activeCase.title.split(' ').slice(0, 3).join(' ')}
          </div>
        )}
      </div>

      {/* Document on top of folder */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -48%)',
        width: '62vw',
        maxWidth: 860,
        height: '80vh',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Document tabs */}
        <div style={{
          display: 'flex',
          gap: 4,
          paddingLeft: 20,
          position: 'relative',
          zIndex: 3,
        }}>
          {TABS.map(tab => {
            const isActive = currentScreen === tab.screen ||
              (tab.screen === 'hub' && ['hub', 'location', 'interview'].includes(currentScreen))
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.screen as any)}
                style={{
                  padding: '6px 16px',
                  background: isActive
                    ? 'url(/images/paper-texture.png) center/cover'
                    : 'rgba(196,163,90,0.6)',
                  border: '1px solid rgba(0,0,0,0.2)',
                  borderBottom: isActive ? 'none' : '1px solid rgba(0,0,0,0.2)',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 'clamp(8px, 0.8vw, 10px)',
                  letterSpacing: 2,
                  color: '#1a1209',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  bottom: isActive ? -1 : 0,
                  fontWeight: isActive ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Document paper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 20, rotate: -0.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -20, rotate: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              flex: 1,
              backgroundImage: 'url(/images/paper-texture.png)',
              backgroundSize: 'cover',
              border: '1px solid rgba(0,0,0,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
              overflowY: 'auto',
              position: 'relative',
            }}
          >
            {/* Document header */}
            <div style={{
              borderBottom: '2px solid #8b1a1a',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(0,0,0,0.04)',
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
            <div style={{ padding: '16px 24px', height: 'calc(100% - 60px)', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}