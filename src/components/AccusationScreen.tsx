'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function AccusationScreen() {
  const navigate         = useCaseStore(s => s.navigate)
  const activeCase       = useCaseStore(s => s.activeCase)
  const investigation    = useCaseStore(s => s.investigation)
  const setInvestigation = useCaseStore(s => s.setInvestigation)
  const snippets         = useCaseStore(s => s.snippets)
  const setSnippets      = useCaseStore(s => s.setSnippets)

  const [selectedSuspect, setSelectedSuspect]   = useState<string | null>(null)
  const [selectedSnippets, setSelectedSnippets] = useState<string[]>([])
  const [customReasoning, setCustomReasoning]   = useState('')
  const [loading, setLoading]                   = useState(false)
  const [snippetsLoading, setSnippetsLoading]   = useState(false)
  const [error, setError]                       = useState<string | null>(null)

  if (!activeCase || !investigation) return null

  const discoveredEvidence = activeCase.evidence.filter(e => e.discovered)
  const combinedReasoning  = [
    ...selectedSnippets,
    customReasoning.trim(),
  ].filter(Boolean).join(' ')

  const ready = selectedSuspect && combinedReasoning.length > 20

  useEffect(() => {
    if (snippets.length > 0) return
    generateSnippets()
  }, [])

  async function generateSnippets() {
    setSnippetsLoading(true)
    try {
      const res = await fetch('/api/generate-snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeCase, investigation }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setSnippets(data.snippets ?? [])
    } catch {
      // silently fail
    } finally {
      setSnippetsLoading(false)
    }
  }

  function toggleSnippet(snippet: string) {
    setSelectedSnippets(prev =>
      prev.includes(snippet)
        ? prev.filter(s => s !== snippet)
        : [...prev, snippet]
    )
  }

  async function handleAccuse() {
    if (!ready || loading || !selectedSuspect || !investigation) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/accusation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCase,
          accusedSuspectId: selectedSuspect,
          playerReasoning: combinedReasoning,
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

      useCaseStore.setState({ closedCaseResult: data })
      navigate('closed')

    } catch (err) {
      console.error(err)
      setError('Failed to process accusation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-courier)',
          fontSize: 9,
          letterSpacing: 3,
          color: '#8b1a1a',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          Accusation Form
        </div>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 22,
          color: '#1a1209',
        }}>
          Who is responsible?
        </div>
      </div>

      {/* Two column layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* Left — suspect selection */}
        <div className="doc-scroll" style={{ overflowY: 'auto' }}>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 9,
            letterSpacing: 3,
            color: '#5a4a3a',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Select Your Suspect
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeCase.suspects.map(suspect => {
              const isSelected = selectedSuspect === suspect.id
              return (
                <button
                  key={suspect.id}
                  onClick={() => setSelectedSuspect(suspect.id)}
                  style={{
                    padding: '12px 16px',
                    background: isSelected ? 'rgba(139,26,26,0.08)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(139,26,26,0.35)' : 'rgba(0,0,0,0.12)'}`,
                    color: '#1a1209',
                    fontFamily: 'var(--font-courier)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
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
                    color: '#5a4a3a',
                    letterSpacing: 1,
                    marginBottom: suspect.playerTag !== 'none' ? 6 : 0,
                  }}>
                    {suspect.occupation} — {suspect.relationship}
                  </div>
                  {suspect.playerTag !== 'none' && (
                    <div style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      fontSize: 8,
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      background: suspect.playerTag === 'prime_suspect'
                        ? 'rgba(139,26,26,0.12)' : 'rgba(0,0,0,0.06)',
                      color: suspect.playerTag === 'prime_suspect' ? '#8b1a1a' : '#5a4a3a',
                      border: '1px solid rgba(0,0,0,0.08)',
                      fontFamily: 'var(--font-courier)',
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

        {/* Right — snippets + reasoning */}
        <div
          className="doc-scroll"
          style={{
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            borderLeft: '1px solid rgba(0,0,0,0.12)',
            paddingLeft: 20,
          }}
        >

          {/* Snippets */}
          <div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#5a4a3a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Case Observations — Select to Include
            </div>

            {snippetsLoading ? (
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                color: '#5a4a3a',
                fontStyle: 'italic',
              }}>
                Analyzing your investigation...
              </div>
            ) : snippets.length === 0 ? (
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                color: '#5a4a3a',
                fontStyle: 'italic',
              }}>
                No observations available. Conduct more interviews and collect evidence.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {snippets.map((snippet, i) => {
                  const isSelected = selectedSnippets.includes(snippet)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSnippet(snippet)}
                      style={{
                        padding: '8px 12px',
                        background: isSelected ? 'rgba(139,26,26,0.08)' : 'rgba(0,0,0,0.03)',
                        border: `1px solid ${isSelected ? 'rgba(139,26,26,0.3)' : 'rgba(0,0,0,0.1)'}`,
                        color: isSelected ? '#1a1209' : '#5a4a3a',
                        fontFamily: 'var(--font-courier)',
                        fontSize: 11,
                        cursor: 'pointer',
                        textAlign: 'left',
                        lineHeight: 1.6,
                        transition: 'all 0.15s',
                        display: 'flex',
                        gap: 8,
                        alignItems: 'flex-start',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.06)'
                          e.currentTarget.style.color = '#1a1209'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(0,0,0,0.03)'
                          e.currentTarget.style.color = '#5a4a3a'
                        }
                      }}
                    >
                      <span style={{
                        color: isSelected ? '#8b1a1a' : 'rgba(0,0,0,0.2)',
                        flexShrink: 0,
                        fontSize: 12,
                        marginTop: 1,
                      }}>
                        {isSelected ? '✓' : '○'}
                      </span>
                      {snippet}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Custom reasoning */}
          <div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#5a4a3a',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
              Additional Reasoning
            </div>
            <textarea
              value={customReasoning}
              onChange={e => setCustomReasoning(e.target.value)}
              placeholder="Add anything else you've noticed..."
              rows={4}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.12)',
                color: '#1a1209',
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                padding: '10px 12px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.7,
                caretColor: '#8b1a1a',
              }}
            />
          </div>

          {/* Status */}
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            color: ready ? '#5a4a3a' : '#8b1a1a',
            letterSpacing: 1,
          }}>
            {!selectedSuspect ? '— Select a suspect to accuse'
              : combinedReasoning.length < 20 ? '— Select observations or add reasoning'
              : '✓ Ready to make your accusation'}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              color: '#8b1a1a',
              fontFamily: 'var(--font-courier)',
              fontSize: 12,
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Accuse button */}
          <button
            onClick={handleAccuse}
            disabled={!ready || loading}
            style={{
              padding: '12px',
              background: ready && !loading ? '#8b1a1a' : 'transparent',
              border: `1px solid ${ready && !loading ? '#8b1a1a' : 'rgba(0,0,0,0.15)'}`,
              color: ready && !loading ? '#f0e6c8' : '#5a4a3a',
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              letterSpacing: 3,
              cursor: ready && !loading ? 'pointer' : 'not-allowed',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (ready && !loading) e.currentTarget.style.background = '#6b1212'
            }}
            onMouseLeave={e => {
              if (ready && !loading) e.currentTarget.style.background = '#8b1a1a'
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