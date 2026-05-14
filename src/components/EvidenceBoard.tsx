'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function EvidenceBoard() {
  const navigate       = useCaseStore(s => s.navigate)
  const activeCase     = useCaseStore(s => s.activeCase)
  const investigation  = useCaseStore(s => s.investigation)
  const updateEvidence = useCaseStore(s => s.updateEvidence)

  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || !activeCase || !investigation) return null

  const discovered = activeCase.evidence.filter(e => e.discovered)
  const selected   = discovered.find(e => e.id === selectedEvidence)

  const getLocationName = (locationRef: string) => {
    const byId = activeCase.locations.find(l => l.id === locationRef)
    if (byId) return byId.name
    const byName = activeCase.locations.find(l =>
      l.name.toLowerCase() === locationRef.toLowerCase()
    )
    if (byName) return byName.name
    return locationRef
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 9,
            letterSpacing: 3,
            color: '#8b1a1a',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Evidence Log
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 20,
            color: '#1a1209',
          }}>
            {discovered.length} item{discovered.length !== 1 ? 's' : ''} collected
          </div>
        </div>
        <button
          onClick={() => navigate('hub')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(0,0,0,0.2)',
            color: '#5a4a3a',
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            letterSpacing: 2,
            padding: '6px 14px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#8b1a1a'
            e.currentTarget.style.color = '#8b1a1a'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,0,0,0.2)'
            e.currentTarget.style.color = '#5a4a3a'
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 280px' : '1fr',
        gap: 16,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* Evidence grid */}
        <div className="doc-scroll" style={{ overflowY: 'auto' }}>
          {discovered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 0',
              fontFamily: 'var(--font-special)',
              fontSize: 13,
              color: '#5a4a3a',
              fontStyle: 'italic',
              lineHeight: 1.8,
            }}>
              No evidence collected yet.<br />
              Search locations to find clues.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}>
              {discovered.map(evidence => {
                const isSelected = selectedEvidence === evidence.id
                return (
                  <button
                    key={evidence.id}
                    onClick={() => setSelectedEvidence(isSelected ? null : evidence.id)}
                    style={{
                      background: isSelected
                        ? 'rgba(139,26,26,0.08)'
                        : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isSelected
                        ? 'rgba(139,26,26,0.3)'
                        : 'rgba(0,0,0,0.12)'}`,
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)'
                        e.currentTarget.style.borderColor = 'rgba(139,26,26,0.25)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    {/* Tag dot */}
                    {evidence.playerTag !== 'none' && (
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: evidence.playerTag === 'relevant'
                          ? '#8b1a1a' : '#5a4a3a',
                      }} />
                    )}

                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 8,
                      letterSpacing: 3,
                      color: '#8b1a1a',
                      textTransform: 'uppercase',
                      marginBottom: 6,
                    }}>
                      {getLocationName(evidence.location)}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 15,
                      color: '#1a1209',
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}>
                      {evidence.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 10,
                      color: '#5a4a3a',
                      lineHeight: 1.6,
                    }}>
                      {evidence.description}
                    </div>

                    {evidence.playerNote && (
                      <div style={{
                        marginTop: 8,
                        padding: '5px 8px',
                        background: 'rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        fontFamily: 'var(--font-courier)',
                        fontSize: 9,
                        color: '#5a4a3a',
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
          <div
            className="doc-scroll"
            style={{
              borderLeft: '1px solid rgba(0,0,0,0.12)',
              paddingLeft: 16,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
            }}>
              — Evidence Detail —
            </div>

            <div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 20,
                color: '#1a1209',
                marginBottom: 4,
                lineHeight: 1.2,
              }}>
                {selected.name}
              </div>
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 9,
                letterSpacing: 2,
                color: '#8b1a1a',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                Found at: {getLocationName(selected.location)}
              </div>
              <div style={{
                width: 32,
                height: 1,
                background: 'rgba(0,0,0,0.15)',
                marginBottom: 12,
              }} />
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                color: '#1a1209',
                lineHeight: 1.8,
              }}>
                {selected.description}
              </div>
            </div>

            {/* Tag */}
            <div>
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 9,
                letterSpacing: 3,
                color: '#5a4a3a',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}>
                Tag Evidence
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {(['none', 'relevant', 'red_herring'] as const).map(tag => (
                  <button
                    key={tag}
                    onClick={() => updateEvidence(selected.id, { playerTag: tag })}
                    style={{
                      padding: '6px 10px',
                      background: selected.playerTag === tag
                        ? 'rgba(139,26,26,0.1)' : 'transparent',
                      border: `1px solid ${selected.playerTag === tag
                        ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.12)'}`,
                      color: selected.playerTag === tag ? '#8b1a1a' : '#5a4a3a',
                      fontFamily: 'var(--font-courier)',
                      fontSize: 9,
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

            {/* Linked suspects */}
            {selected.pointsTo.length > 0 && (
              <div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 9,
                  letterSpacing: 3,
                  color: '#5a4a3a',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  Linked Suspects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
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
                          padding: '6px 10px',
                          background: 'rgba(0,0,0,0.04)',
                          border: '1px solid rgba(0,0,0,0.12)',
                          color: '#1a1209',
                          fontFamily: 'var(--font-courier)',
                          fontSize: 10,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          letterSpacing: 1,
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = '#8b1a1a'
                          e.currentTarget.style.color = '#8b1a1a'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                          e.currentTarget.style.color = '#1a1209'
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
                color: '#5a4a3a',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Notes
              </div>
              <textarea
                value={selected.playerNote}
                onChange={e => updateEvidence(selected.id, { playerNote: e.target.value })}
                placeholder="Add notes..."
                rows={4}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  color: '#1a1209',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 11,
                  padding: '8px 10px',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: 1.6,
                  caretColor: '#8b1a1a',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}