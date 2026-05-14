'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function InvestigationHub() {
  const navigate          = useCaseStore(s => s.navigate)
  const activeCase        = useCaseStore(s => s.activeCase)
  const investigation     = useCaseStore(s => s.investigation)
  const setActiveLocation = useCaseStore(s => s.setActiveLocation)
  const setActiveSuspect  = useCaseStore(s => s.setActiveSuspect)

  const [activeTab, setActiveTab] = useState<'locations' | 'suspects' | 'evidence'>('locations')

  if (!activeCase || !investigation) return null

  const discoveredEvidence = activeCase.evidence.filter(e => e.discovered)

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

      {/* Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <MiniStat label="Turns" value={investigation.turnsUsed} />
          <MiniStat label="Evidence" value={`${discoveredEvidence.length}/${activeCase.evidence.length}`} />
          <MiniStat label="Locations" value={`${investigation.visitedLocations.length}/${activeCase.locations.length}`} />
        </div>
        <button
          onClick={() => navigate('accusation')}
          style={{
            padding: '8px 20px',
            background: '#8b1a1a',
            border: '1px solid #8b1a1a',
            color: '#f0e6c8',
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            letterSpacing: 2,
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#6b1212'}
          onMouseLeave={e => e.currentTarget.style.background = '#8b1a1a'}
        >
          Make Accusation →
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 0,
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        marginBottom: 16,
      }}>
        {(['locations', 'suspects', 'evidence'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? '#8b1a1a' : 'transparent'}`,
              color: activeTab === tab ? '#8b1a1a' : '#5a4a3a',
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 3,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
              marginBottom: -1,
            }}
            onMouseEnter={e => {
              if (activeTab !== tab) e.currentTarget.style.color = '#1a1209'
            }}
            onMouseLeave={e => {
              if (activeTab !== tab) e.currentTarget.style.color = '#5a4a3a'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="doc-scroll">

        {/* LOCATIONS */}
        {activeTab === 'locations' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {activeCase.locations.map(location => {
              const visited = investigation.visitedLocations.includes(location.id)
              const evidenceHere = activeCase.evidence.filter(
                e => e.location === location.id && e.discovered
              ).length
              const totalHere = activeCase.evidence.filter(
                e => e.location === location.id
              ).length

              return (
                <button
                  key={location.id}
                  onClick={() => {
                    setActiveLocation(location.id)
                    navigate('location')
                  }}
                  style={{
                    background: visited ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.02)',
                    border: `1px solid ${visited ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.12)'}`,
                    padding: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(139,26,26,0.4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = visited ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.02)'
                    e.currentTarget.style.borderColor = visited ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.12)'
                  }}
                >
                  {visited && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 10,
                      fontFamily: 'var(--font-courier)',
                      fontSize: 8,
                      letterSpacing: 2,
                      color: '#8b1a1a',
                      textTransform: 'uppercase',
                    }}>
                      Searched
                    </div>
                  )}
                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 16,
                    color: '#1a1209',
                    marginBottom: 6,
                  }}>
                    {location.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    color: '#5a4a3a',
                    lineHeight: 1.6,
                    marginBottom: 10,
                  }}>
                    {location.description}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 10,
                    color: '#5a4a3a',
                  }}>
                    <span>
                      {activeCase.suspects.filter(s => location.suspectIds.includes(s.id)).length} suspects
                    </span>
                    <span style={{ color: evidenceHere > 0 ? '#8b1a1a' : '#5a4a3a' }}>
                      {evidenceHere}/{totalHere} evidence
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* SUSPECTS */}
        {activeTab === 'suspects' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {activeCase.suspects.map(suspect => (
              <button
                key={suspect.id}
                onClick={() => {
                  setActiveSuspect(suspect.id)
                  navigate('interview')
                }}
                style={{
                  background: suspect.interviewed ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${suspect.interviewed ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.12)'}`,
                  padding: '14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.07)'
                  e.currentTarget.style.borderColor = 'rgba(139,26,26,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = suspect.interviewed ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.02)'
                  e.currentTarget.style.borderColor = suspect.interviewed ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.12)'
                }}
              >
                {suspect.interviewed && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 10,
                    fontFamily: 'var(--font-courier)',
                    fontSize: 8,
                    letterSpacing: 2,
                    color: '#8b1a1a',
                    textTransform: 'uppercase',
                  }}>
                    Interviewed
                  </div>
                )}

                {suspect.playerTag !== 'none' && (
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    marginBottom: 8,
                    fontFamily: 'var(--font-courier)',
                    fontSize: 8,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    background: suspect.playerTag === 'prime_suspect'
                      ? 'rgba(139,26,26,0.15)'
                      : 'rgba(0,0,0,0.06)',
                    color: suspect.playerTag === 'prime_suspect' ? '#8b1a1a' : '#5a4a3a',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}>
                    {suspect.playerTag === 'prime_suspect' ? 'Prime Suspect'
                      : suspect.playerTag === 'suspicious' ? 'Suspicious'
                      : 'Innocent'}
                  </div>
                )}

                <div style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 18,
                  color: '#1a1209',
                  marginBottom: 4,
                }}>
                  {suspect.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 10,
                  color: '#8b1a1a',
                  marginBottom: 6,
                  letterSpacing: 1,
                }}>
                  {suspect.age} — {suspect.occupation}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 11,
                  color: '#5a4a3a',
                  lineHeight: 1.6,
                  marginBottom: 8,
                }}>
                  {suspect.relationship}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 10,
                  color: '#5a4a3a',
                  fontStyle: 'italic',
                }}>
                  "{suspect.personality}"
                </div>

                {suspect.playerNote && (
                  <div style={{
                    marginTop: 10,
                    padding: '6px 8px',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 10,
                    color: '#5a4a3a',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}>
                    {suspect.playerNote}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* EVIDENCE */}
        {activeTab === 'evidence' && (
          <div>
            {discoveredEvidence.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                fontFamily: 'var(--font-courier)',
                fontSize: 12,
                color: '#5a4a3a',
                fontStyle: 'italic',
              }}>
                No evidence discovered yet. Search locations to find clues.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 12,
              }}>
                {discoveredEvidence.map(evidence => (
                  <div
                    key={evidence.id}
                    style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.12)',
                      padding: '14px',
                    }}
                  >
                    {evidence.playerTag !== 'none' && (
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        marginBottom: 8,
                        fontFamily: 'var(--font-courier)',
                        fontSize: 8,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        background: evidence.playerTag === 'relevant'
                          ? 'rgba(139,26,26,0.15)' : 'rgba(0,0,0,0.06)',
                        color: evidence.playerTag === 'relevant' ? '#8b1a1a' : '#5a4a3a',
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}>
                        {evidence.playerTag === 'relevant' ? 'Relevant' : 'Red Herring'}
                      </div>
                    )}
                    <div style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 15,
                      color: '#1a1209',
                      marginBottom: 6,
                    }}>
                      {evidence.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 11,
                      color: '#5a4a3a',
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}>
                      {evidence.description}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 9,
                      color: '#8b1a1a',
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}>
                      {getLocationName(evidence.location)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string, value: string | number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: 20,
        color: '#1a1209',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 8,
        letterSpacing: 2,
        color: '#5a4a3a',
        textTransform: 'uppercase',
        marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  )
}