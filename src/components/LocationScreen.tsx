'use client'

import { useState, useEffect } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function LocationScreen() {
  const navigate          = useCaseStore(s => s.navigate)
  const activeCase        = useCaseStore(s => s.activeCase)
  const investigation     = useCaseStore(s => s.investigation)
  const activeLocationId  = useCaseStore(s => s.activeLocationId)
  const markLocationVisited = useCaseStore(s => s.markLocationVisited)
  const discoverEvidence  = useCaseStore(s => s.discoverEvidence)
  const setActiveSuspect = useCaseStore(s => s.setActiveSuspect)

  const [loading, setLoading]     = useState(false)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [newFinds, setNewFinds]   = useState<string[]>([])
  const [error, setError]         = useState<string | null>(null)
  const [searched, setSearched]   = useState(false)

  if (!activeCase || !investigation || !activeLocationId) return null

  const location = activeCase.locations.find(l => l.id === activeLocationId)!
  const alreadySearched = investigation.visitedLocations.includes(activeLocationId)
  const suspectsHere = activeCase.suspects.filter(s =>
    location.suspectIds.includes(s.id)
  )

  const previousClues = activeCase.evidence
    .filter(e => e.discovered)
    .map(e => e.name)

  async function handleSearch() {
    if (loading || searched || !activeLocationId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/search-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCase,
          locationId: activeLocationId,
          previousClues,
        }),
      })

      if (!res.ok) throw new Error('Search failed')

      const data = await res.json()
      setNarrative(data.narrative)
      setSearched(true)

      // mark location visited
      markLocationVisited(activeLocationId)

      // discover evidence
      if (data.foundEvidenceIds?.length > 0) {
        data.foundEvidenceIds.forEach((id: string) => discoverEvidence(id))
        const foundNames = activeCase?.evidence
          .filter(e => data.foundEvidenceIds.includes(e.id))
          .map(e => e.name) ?? []
        setNewFinds(foundNames)
      }

    } catch (err) {
      console.error(err)
      setError('Search failed. Please try again.')
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
            Location
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 26,
            color: 'var(--cream)',
          }}>
            {location.name}
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
        padding: '32px',
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Location description */}
        <div style={{
          fontFamily: 'var(--font-special)',
          fontSize: 15,
          color: 'var(--cream-dim)',
          lineHeight: 1.9,
          fontStyle: 'italic',
          marginBottom: 32,
          padding: '20px 24px',
          borderLeft: '3px solid var(--red)',
          background: 'var(--bg-surface)',
        }}>
          {location.description}
        </div>

        {/* Suspects here */}
        {suspectsHere.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Persons of Interest Here
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {suspectsHere.map(suspect => (
                <button
                  key={suspect.id}
                  onClick={() => {
                    setActiveSuspect(suspect.id)
                    navigate('interview')
                  }}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-bright)',
                    color: 'var(--cream-dim)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    letterSpacing: 1,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--red-bright)'
                    e.currentTarget.style.color = 'var(--cream)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-bright)'
                    e.currentTarget.style.color = 'var(--cream-dim)'
                  }}
                >
                  {suspect.name} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        {narrative && (
          <div style={{
            marginBottom: 32,
            animation: 'fadeIn 0.6s ease forwards',
          }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              Search Report
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 14,
              color: 'var(--cream)',
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap',
            }}>
              {narrative}
            </div>
          </div>
        )}

        {/* New evidence found */}
        {newFinds.length > 0 && (
          <div style={{
            marginBottom: 32,
            padding: '16px 20px',
            border: '1px solid var(--red-bright)',
            background: 'var(--bg-surface)',
            animation: 'fadeIn 0.6s ease 0.3s both',
          }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 10,
              letterSpacing: 4,
              color: 'var(--red-bright)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              — Evidence Discovered —
            </div>
            {newFinds.map((name, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 16,
                color: 'var(--cream)',
                marginBottom: 4,
              }}>
                + {name}
              </div>
            ))}
          </div>
        )}

        {/* Already searched notice */}
        {alreadySearched && !searched && (
          <div style={{
            marginBottom: 24,
            fontFamily: 'var(--font-courier)',
            fontSize: 12,
            color: 'var(--cream-dim)',
            letterSpacing: 1,
            fontStyle: 'italic',
          }}>
            You have already searched this location.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 24,
            color: 'var(--red-bright)',
            fontFamily: 'var(--font-courier)',
            fontSize: 13,
            letterSpacing: 1,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Search button */}
        {!searched && (
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '14px 40px',
              background: loading ? 'transparent' : 'var(--red)',
              border: `1px solid ${loading ? 'var(--border)' : 'var(--red-bright)'}`,
              color: loading ? 'var(--cream-dim)' : 'var(--cream)',
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              letterSpacing: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.background = 'var(--red-bright)'
            }}
            onMouseLeave={e => {
              if (!loading) e.currentTarget.style.background = 'var(--red)'
            }}
          >
            {loading ? 'SEARCHING...' : alreadySearched ? 'SEARCH AGAIN' : 'SEARCH LOCATION'}
          </button>
        )}

        {/* After search — back to hub */}
        {searched && (
          <button
            onClick={() => navigate('hub')}
            style={{
              padding: '14px 40px',
              background: 'var(--red)',
              border: '1px solid var(--red-bright)',
              color: 'var(--cream)',
              fontFamily: 'var(--font-courier)',
              fontSize: 13,
              letterSpacing: 4,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              animation: 'fadeIn 0.6s ease 0.6s both',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bright)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
          >
            RETURN TO HUB →
          </button>
        )}
      </div>
    </div>
  )
}