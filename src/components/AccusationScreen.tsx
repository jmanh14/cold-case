'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function AccusationScreen() {
  const navigate      = useCaseStore(s => s.navigate)
  const activeCase    = useCaseStore(s => s.activeCase)
  const investigation = useCaseStore(s => s.investigation)
  const setInvestigation = useCaseStore(s => s.setInvestigation)

  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null)
  const [reasoning, setReasoning]             = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  if (!activeCase || !investigation) return null

  const discoveredEvidence = activeCase.evidence.filter(e => e.discovered)
  const ready = selectedSuspect && reasoning.trim().length > 20

  async function handleAccuse() {
    if (!ready || loading || !selectedSuspect) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/accusation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCase,
          accusedSuspectId: selectedSuspect,
          playerReasoning: reasoning,
        }),
      })

      if (!res.ok) throw new Error('Accusation failed')

      const data = await res.json()

        setInvestigation({
        caseId: investigation.caseId ?? '',
        currentLocation: investigation.currentLocation,
        visitedLocations: investigation.visitedLocations,
        interviewLog: investigation.interviewLog,
        discoveredEvidence: investigation.discoveredEvidence,
        accusation: selectedSuspect,
        solved: true,
        correct: data.correct,
        turnsUsed: investigation.turnsUsed,
      })

      // store result in case for closed screen
      useCaseStore.setState({
        closedCaseResult: data,
      })

      navigate('closed')
    } catch (err) {
      console.error(err)
      setError('Failed to process accusation. Please try again.')
    } finally {
      setLoading(false)
    }
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
            Make Your Accusation
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 22,
            color: 'var(--cream)',
          }}>
            Who did it?
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
        gridTemplateColumns: '1fr 1fr',
        gap: 0,
        overflow: 'hidden',
        height: 'calc(100vh - 89px)',
      }}>

        {/* Left — suspect selection */}
        <div style={{
          borderRight: '1px solid var(--border)',
          padding: '32px',
          overflowY: 'auto',
        }}>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            letterSpacing: 4,
            color: 'var(--red-bright)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Select Your Suspect
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeCase.suspects.map(suspect => {
              const isSelected = selectedSuspect === suspect.id
              return (
                <button
                  key={suspect.id}
                  onClick={() => setSelectedSuspect(suspect.id)}
                  style={{
                    padding: '16px 20px',
                    background: isSelected ? 'var(--red)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? 'var(--red-bright)' : 'var(--border-bright)'}`,
                    color: 'var(--cream)',
                    fontFamily: 'var(--font-courier)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
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
                  <div style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: 20,
                    marginBottom: 4,
                  }}>
                    {suspect.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: isSelected ? 'rgba(232,220,200,0.8)' : 'var(--cream-dim)',
                    letterSpacing: 1,
                  }}>
                    {suspect.occupation} — {suspect.relationship}
                  </div>
                  {suspect.playerTag !== 'none' && (
                    <div style={{
                      marginTop: 8,
                      display: 'inline-block',
                      padding: '2px 8px',
                      fontSize: 9,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      background: suspect.playerTag === 'prime_suspect'
                        ? 'rgba(139,26,26,0.5)' : 'rgba(255,255,255,0.1)',
                      color: 'var(--cream)',
                    }}>
                      {suspect.playerTag === 'prime_suspect' ? 'Prime Suspect'
                        : suspect.playerTag === 'suspicious' ? 'Suspicious'
                        : 'Innocent'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right — reasoning + evidence summary */}
        <div style={{
          padding: '32px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}>

          {/* Evidence summary */}
          <div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Evidence Collected ({discoveredEvidence.length})
            </div>
            {discoveredEvidence.length === 0 ? (
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 12,
                color: 'var(--cream-dim)',
                fontStyle: 'italic',
              }}>
                No evidence collected. Are you sure you want to accuse?
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {discoveredEvidence.map(e => (
                  <div key={e.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'var(--font-courier)',
                    fontSize: 12,
                    color: e.playerTag === 'relevant' ? 'var(--cream)'
                      : e.playerTag === 'red_herring' ? 'var(--cream-dim)'
                      : 'var(--cream-dim)',
                  }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: e.playerTag === 'relevant' ? 'var(--red-bright)'
                        : e.playerTag === 'red_herring' ? 'var(--border-bright)'
                        : 'var(--border-bright)',
                      flexShrink: 0,
                    }} />
                    {e.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reasoning */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Your Reasoning
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              color: 'var(--cream-dim)',
              marginBottom: 10,
              lineHeight: 1.6,
            }}>
              Explain why you believe this suspect is guilty. What evidence points to them? What was their motive?
            </div>
            <textarea
              value={reasoning}
              onChange={e => setReasoning(e.target.value)}
              placeholder="State your case, detective..."
              rows={8}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-bright)',
                color: 'var(--cream)',
                fontFamily: 'var(--font-courier)',
                fontSize: 13,
                padding: '14px 16px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.8,
                caretColor: 'var(--red-bright)',
              }}
            />
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              color: reasoning.trim().length < 20 ? 'var(--red-bright)' : 'var(--cream-dim)',
              marginTop: 6,
              letterSpacing: 1,
            }}>
              {reasoning.trim().length < 20
                ? `${20 - reasoning.trim().length} more characters needed`
                : '✓ Ready to accuse'}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              color: 'var(--red-bright)',
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Accuse button */}
          <button
            onClick={handleAccuse}
            disabled={!ready || loading}
            style={{
              padding: '16px',
              background: ready && !loading ? 'var(--red)' : 'transparent',
              border: `1px solid ${ready && !loading ? 'var(--red-bright)' : 'var(--border)'}`,
              color: ready && !loading ? 'var(--cream)' : 'var(--cream-dim)',
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              letterSpacing: 4,
              cursor: ready && !loading ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (ready && !loading)
                e.currentTarget.style.background = 'var(--red-bright)'
            }}
            onMouseLeave={e => {
              if (ready && !loading)
                e.currentTarget.style.background = 'var(--red)'
            }}
          >
            {loading ? 'PROCESSING...' : selectedSuspect
              ? `ACCUSE ${activeCase.suspects.find(s => s.id === selectedSuspect)?.name.toUpperCase()} →`
              : 'SELECT A SUSPECT'}
          </button>
        </div>
      </div>
    </div>
  )
}