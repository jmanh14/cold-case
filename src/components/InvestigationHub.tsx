'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function InvestigationHub() {
  const navigate        = useCaseStore(s => s.navigate)
  const activeCase      = useCaseStore(s => s.activeCase)
  const investigation   = useCaseStore(s => s.investigation)
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
            Active Investigation
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 22,
            color: 'var(--cream)',
          }}>
            {activeCase.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, marginRight: 8 }}>
            <MiniStat label="Turns" value={investigation.turnsUsed} />
            <MiniStat label="Evidence" value={`${discoveredEvidence.length}/${activeCase.evidence.length}`} />
            <MiniStat label="Locations" value={`${investigation.visitedLocations.length}/${activeCase.locations.length}`} />
          </div>

          {/* Action buttons */}
          <HubButton onClick={() => navigate('evidence')}>
            Evidence Board
          </HubButton>
          <HubButton onClick={() => navigate('accusation')} primary>
            Make Accusation
          </HubButton>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        {(['locations', 'suspects', 'evidence'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 28px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--red-bright)' : 'transparent'}`,
              color: activeTab === tab ? 'var(--cream)' : 'var(--cream-dim)',
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              letterSpacing: 3,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
      }}>

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {activeCase.locations.map(location => {
              const visited = investigation.visitedLocations.includes(location.id)
              const evidenceHere = activeCase.evidence.filter(
                e => e.location === location.id && e.discovered
              ).length
              const totalEvidenceHere = activeCase.evidence.filter(
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
                    background: 'var(--bg-surface)',
                    border: `1px solid ${visited ? 'var(--border-bright)' : 'var(--border)'}`,
                    padding: '20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--red-bright)'
                    e.currentTarget.style.background = 'var(--bg-panel)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = visited ? 'var(--border-bright)' : 'var(--border)'
                    e.currentTarget.style.background = 'var(--bg-surface)'
                  }}
                >
                  {/* Visited badge */}
                  {visited && (
                    <div style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontFamily: 'var(--font-courier)',
                      fontSize: 9,
                      letterSpacing: 2,
                      color: 'var(--red-bright)',
                      textTransform: 'uppercase',
                    }}>
                      Searched
                    </div>
                  )}

                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 20,
                    color: 'var(--cream)',
                    marginBottom: 8,
                  }}>
                    {location.name}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-courier)',
                    fontSize: 12,
                    color: 'var(--cream-dim)',
                    lineHeight: 1.7,
                    marginBottom: 16,
                  }}>
                    {location.description}
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    color: 'var(--cream-dim)',
                  }}>
                    <span>
                      {activeCase.suspects.filter(s => location.suspectIds.includes(s.id)).length} suspects
                    </span>
                    <span style={{ color: evidenceHere > 0 ? 'var(--red-bright)' : 'var(--cream-dim)' }}>
                      {evidenceHere}/{totalEvidenceHere} evidence
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* SUSPECTS TAB */}
        {activeTab === 'suspects' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {activeCase.suspects.map(suspect => (
              <button
                key={suspect.id}
                onClick={() => {
                  setActiveSuspect(suspect.id)
                  navigate('interview')
                }}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${suspect.interviewed ? 'var(--border-bright)' : 'var(--border)'}`,
                  padding: '20px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--red-bright)'
                  e.currentTarget.style.background = 'var(--bg-panel)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = suspect.interviewed ? 'var(--border-bright)' : 'var(--border)'
                  e.currentTarget.style.background = 'var(--bg-surface)'
                }}
              >
                {/* Interview badge */}
                {suspect.interviewed && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontFamily: 'var(--font-courier)',
                    fontSize: 9,
                    letterSpacing: 2,
                    color: 'var(--red-bright)',
                    textTransform: 'uppercase',
                  }}>
                    Interviewed
                  </div>
                )}

                {/* Player tag */}
                {suspect.playerTag !== 'none' && (
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    marginBottom: 10,
                    fontFamily: 'var(--font-courier)',
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    background: suspect.playerTag === 'prime_suspect' ? 'var(--red)'
                      : suspect.playerTag === 'suspicious' ? 'var(--red-dim)'
                      : 'var(--bg-panel)',
                    color: suspect.playerTag === 'innocent' ? 'var(--cream-dim)' : 'var(--cream)',
                    border: '1px solid var(--border)',
                  }}>
                    {suspect.playerTag === 'prime_suspect' ? 'Prime Suspect'
                      : suspect.playerTag === 'suspicious' ? 'Suspicious'
                      : 'Innocent'}
                  </div>
                )}

                <div style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: 22,
                  color: 'var(--cream)',
                  marginBottom: 4,
                }}>
                  {suspect.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 12,
                  color: 'var(--red-bright)',
                  marginBottom: 10,
                  letterSpacing: 1,
                }}>
                  {suspect.age} — {suspect.occupation}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 12,
                  color: 'var(--cream-dim)',
                  marginBottom: 12,
                  lineHeight: 1.6,
                }}>
                  {suspect.relationship}
                </div>
                <div style={{
                  fontFamily: 'var(--font-courier)',
                  fontSize: 11,
                  color: 'var(--cream-dim)',
                  fontStyle: 'italic',
                }}>
                  "{suspect.personality}"
                </div>

                {suspect.playerNote && (
                  <div style={{
                    marginTop: 12,
                    padding: '8px 10px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    color: 'var(--cream-dim)',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}>
                    Note: {suspect.playerNote}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* EVIDENCE TAB */}
        {activeTab === 'evidence' && (
          <div>
            {discoveredEvidence.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                fontFamily: 'var(--font-courier)',
                fontSize: 13,
                color: 'var(--cream-dim)',
                letterSpacing: 2,
              }}>
                No evidence discovered yet. Search locations to find clues.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}>
                {discoveredEvidence.map(evidence => (
                  <div
                    key={evidence.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-bright)',
                      padding: '20px',
                    }}
                  >
                    {evidence.playerTag !== 'none' && (
                      <div style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        marginBottom: 10,
                        fontFamily: 'var(--font-courier)',
                        fontSize: 9,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        background: evidence.playerTag === 'relevant' ? 'var(--red-dim)' : 'var(--bg-panel)',
                        color: 'var(--cream-dim)',
                        border: '1px solid var(--border)',
                      }}>
                        {evidence.playerTag === 'relevant' ? 'Relevant' : 'Red Herring'}
                      </div>
                    )}

                    <div style={{
                      fontFamily: 'var(--font-playfair)',
                      fontSize: 18,
                      color: 'var(--cream)',
                      marginBottom: 8,
                    }}>
                      {evidence.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 12,
                      color: 'var(--cream-dim)',
                      lineHeight: 1.7,
                      marginBottom: 10,
                    }}>
                      {evidence.description}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-courier)',
                      fontSize: 11,
                      color: 'var(--red-bright)',
                      letterSpacing: 1,
                    }}>
                      Found: {getLocationName(evidence.location)}
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
        color: 'var(--cream)',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 9,
        letterSpacing: 2,
        color: 'var(--cream-dim)',
        textTransform: 'uppercase',
        marginTop: 2,
      }}>
        {label}
      </div>
    </div>
  )
}

function HubButton({ onClick, children, primary = false }: {
  onClick: () => void
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        background: primary ? 'var(--red)' : 'transparent',
        border: `1px solid ${primary ? 'var(--red-bright)' : 'var(--border-bright)'}`,
        color: primary ? 'var(--cream)' : 'var(--cream-dim)',
        fontFamily: 'var(--font-courier)',
        fontSize: 11,
        letterSpacing: 2,
        cursor: 'pointer',
        textTransform: 'uppercase',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = primary ? 'var(--red-bright)' : 'var(--bg-panel)'
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