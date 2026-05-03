'use client'

import { useEffect, useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function EvidenceBoard() {
  const navigate     = useCaseStore(s => s.navigate)
  const activeCase   = useCaseStore(s => s.activeCase)
  const investigation = useCaseStore(s => s.investigation)
  const updateEvidence = useCaseStore(s => s.updateEvidence)
  const updateSuspect  = useCaseStore(s => s.updateSuspect)

  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  console.log('EvidenceBoard rendering', { activeCase: !!activeCase, investigation: !!investigation })
  if (!activeCase || !investigation) return (
    <div style={{ color: 'white', padding: 32 }}>No Case Loaded</div>
  )

  const discovered = activeCase.evidence.filter(e => e.discovered)
  console.log('All evidence:', activeCase.evidence.map(e => ({ id: e.id, discovered: e.discovered })))
  console.log('Discovered:', discovered.length)
  const selected   = discovered.find(e => e.id === selectedEvidence)

  const getLocationName = (locationRef: string) => {
    console.log('locationRef:', locationRef)
    console.log('available ids:', activeCase.locations.map(l => l.id))
    const byId = activeCase.locations.find(l => l.id === locationRef)
    if (byId) return byId.name 
    const byName = activeCase.locations.find(l =>
      l.name.toLowerCase() === locationRef.toLowerCase()
    )
    if (byName) return byName.name
    return locationRef
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border-bright)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-surface)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            letterSpacing: 4,
            color: 'var(--red-bright)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Evidence Board
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 22,
            color: 'var(--cream)',
          }}>
            {discovered.length} item{discovered.length !== 1 ? 's' : ''} collected
          </div>
        </div>
        <button
          onClick={() => navigate('hub')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-bright)',
            color: 'var(--cream-dim)',
            fontFamily: 'var(--font-courier)',
            fontSize: 11,
            letterSpacing: 2,
            padding: '8px 20px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--cream)'
            e.currentTarget.style.borderColor = 'var(--cream-dim)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--cream-dim)'
            e.currentTarget.style.borderColor = 'var(--border-bright)'
          }}
        >
          ← Back to Hub
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 360px' : '1fr',
        overflow: 'hidden',
        height: 'calc(100vh - 89px)',
      }}>

        {/* Evidence grid */}
        <div style={{
          overflowY: 'auto',
          padding: '28px 32px',
        }}>

          {discovered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              fontFamily: 'var(--font-special)',
              fontSize: 15,
              color: 'var(--cream-dim)',
              fontStyle: 'italic',
              lineHeight: 1.8,
            }}>
              No evidence collected yet.<br />
              Search locations to find clues.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}>
              {discovered.map(evidence => {
                const isSelected = selectedEvidence === evidence.id
                const tagColor =
                  evidence.playerTag === 'relevant' ? 'var(--red-bright)' :
                  evidence.playerTag === 'red_herring' ? 'var(--cream-dim)' :
                  'transparent'

                return (
                  <button
                    key={evidence.id}
                    onClick={() => setSelectedEvidence(
                      isSelected ? null : evidence.id
                    )}
                    style={{
                      background: isSelected ? 'var(--bg-panel)' : 'var(--bg-surface)',
                      border: `1px solid ${isSelected ? 'var(--red-bright)' : 'var(--border-bright)'}`,
                      padding: '18px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--red-bright)'
                        e.currentTarget.style.background = 'var(--bg-panel)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-bright)'
                        e.currentTarget.style.background = 'var(--bg-surface)'
                      }
                    }}
                  >
                    {/* Player tag indicator */}
                    {evidence.playerTag !== 'none' && (
                      <div style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: tagColor,
                      }} />
                    )}

                    {/* Found location */}
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 9,
                      letterSpacing: 3,
                      color: 'var(--red-bright)',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}>
                      {getLocationName(evidence.location)}
                    </div>

                    {/* Name */}
                    <div style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 18,
                      color: 'var(--cream)',
                      marginBottom: 8,
                      lineHeight: 1.2,
                    }}>
                      {evidence.name}
                    </div>

                    {/* Description */}
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 12,
                      color: 'var(--cream-dim)',
                      lineHeight: 1.7,
                    }}>
                      {evidence.description}
                    </div>

                    {/* Player note preview */}
                    {evidence.playerNote && (
                      <div style={{
                        marginTop: 10,
                        padding: '6px 8px',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-courier)',
                        fontSize: 11,
                        color: 'var(--cream-dim)',
                        fontStyle: 'italic',
                      }}>
                        {evidence.playerNote}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{
            borderLeft: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            padding: '28px 24px',
            overflowY: 'auto',
            animation: 'fadeIn 0.3s ease forwards',
          }}>

            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              — Evidence Detail —
            </div>

            <div style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 24,
              color: 'var(--cream)',
              marginBottom: 8,
              lineHeight: 1.2,
            }}>
              {selected.name}
            </div>

            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 3,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Found at: {getLocationName(selected.location)}
            </div>

            <div style={{
              width: 40,
              height: 1,
              background: 'var(--border-bright)',
              marginBottom: 16,
            }} />

            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              color: 'var(--cream)',
              lineHeight: 1.8,
              marginBottom: 24,
            }}>
              {selected.description}
            </div>

            {/* Tag as */}
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 9,
                letterSpacing: 3,
                color: 'var(--cream-dim)',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                Tag Evidence
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(['none', 'relevant', 'red_herring'] as const).map(tag => (
                  <button
                    key={tag}
                    onClick={() => updateEvidence(selected.id, { playerTag: tag })}
                    style={{
                      padding: '8px 12px',
                      background: selected.playerTag === tag ? 'var(--red-dim)' : 'transparent',
                      border: `1px solid ${selected.playerTag === tag ? 'var(--red-bright)' : 'var(--border)'}`,
                      color: selected.playerTag === tag ? 'var(--cream)' : 'var(--cream-dim)',
                      fontFamily: 'var(--font-courier)',
                      fontSize: 10,
                      letterSpacing: 2,
                      cursor: 'pointer',
                      textAlign: 'left',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tag === 'none' ? 'Untagged'
                      : tag === 'red_herring' ? 'Red Herring'
                      : 'Relevant'}
                  </button>
                ))}
              </div>
            </div>

            {/* Links to suspects */}
            {selected.pointsTo.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 9,
                  letterSpacing: 3,
                  color: 'var(--cream-dim)',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                  Linked Suspects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selected.pointsTo.map(suspectId => {
                    const suspect = activeCase.suspects.find(s => s.id === suspectId)
                    if (!suspect) return null
                    return (
                      <button
                        key={suspectId}
                        onClick={() => {
                          useCaseStore.getState().setActiveSuspect(suspectId)
                          navigate('interview')
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'var(--bg-panel)',
                          border: '1px solid var(--border)',
                          color: 'var(--cream-dim)',
                          fontFamily: 'var(--font-courier)',
                          fontSize: 12,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          letterSpacing: 1,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--red-bright)'
                          e.currentTarget.style.color = 'var(--cream)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.color = 'var(--cream-dim)'
                        }}
                      >
                        Interview {suspect.name} →
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 9,
                letterSpacing: 3,
                color: 'var(--cream-dim)',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Your Notes
              </div>
              <textarea
                value={selected.playerNote}
                onChange={e => updateEvidence(selected.id, { playerNote: e.target.value })}
                placeholder="Add notes about this evidence..."
                rows={5}
                style={{
                  width: '100%',
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--cream)',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 12,
                  padding: '10px 12px',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.7,
                  caretColor: 'var(--red-bright)',
                }}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  )
}