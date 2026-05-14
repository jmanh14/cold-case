'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

export default function LocationScreen() {
  const navigate            = useCaseStore(s => s.navigate)
  const activeCase          = useCaseStore(s => s.activeCase)
  const investigation       = useCaseStore(s => s.investigation)
  const activeLocationId    = useCaseStore(s => s.activeLocationId)
  const setActiveSuspect    = useCaseStore(s => s.setActiveSuspect)
  const markLocationVisited = useCaseStore(s => s.markLocationVisited)
  const discoverEvidence    = useCaseStore(s => s.discoverEvidence)

  const [loading, setLoading]     = useState(false)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [newFinds, setNewFinds]   = useState<string[]>([])
  const [error, setError]         = useState<string | null>(null)
  const [searched, setSearched]   = useState(false)

  if (!activeCase || !investigation || !activeLocationId) return null

  const locationId = activeLocationId
  const location        = activeCase.locations.find(l => l.id === locationId)!
  const alreadySearched = investigation.visitedLocations.includes(activeLocationId)
  const suspectsHere    = activeCase.suspects.filter(s => location.suspectIds.includes(s.id))
  const previousClues   = activeCase.evidence.filter(e => e.discovered).map(e => e.name)

  async function handleSearch() {
    if (loading || searched) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/search-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCase,
          locationId: locationId,
          previousClues,
        }),
      })

      if (!res.ok) throw new Error('Search failed')

      const data = await res.json()
      setNarrative(data.narrative)
      setSearched(true)
      markLocationVisited(locationId)

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>

      {/* Back + title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
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
            Location Report
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(18px, 2.5vw, 26px)',
            color: '#1a1209',
          }}>
            {location.name}
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

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="doc-scroll">

        {/* Location description */}
        <div style={{
          fontFamily: 'var(--font-special)',
          fontSize: 13,
          color: '#5a4a3a',
          lineHeight: 1.9,
          fontStyle: 'italic',
          marginBottom: 20,
          padding: '12px 16px',
          borderLeft: '3px solid #8b1a1a',
          background: 'rgba(0,0,0,0.03)',
        }}>
          {location.description}
        </div>

        {/* Suspects here */}
        {suspectsHere.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Persons of Interest
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {suspectsHere.map(suspect => (
                <button
                  key={suspect.id}
                  onClick={() => {
                    setActiveSuspect(suspect.id)
                    navigate('interview')
                  }}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    color: '#1a1209',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    letterSpacing: 1,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#8b1a1a'
                    e.currentTarget.style.color = '#8b1a1a'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'
                    e.currentTarget.style.color = '#1a1209'
                  }}
                >
                  {suspect.name} →
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search narrative */}
        {narrative && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Search Report
            </div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 12,
              color: '#1a1209',
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
            marginBottom: 20,
            padding: '12px 16px',
            border: '1px solid rgba(139,26,26,0.4)',
            background: 'rgba(139,26,26,0.05)',
          }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#8b1a1a',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              — Evidence Discovered —
            </div>
            {newFinds.map((name, i) => (
              <div key={i} style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 15,
                color: '#1a1209',
                marginBottom: 4,
              }}>
                + {name}
              </div>
            ))}
          </div>
        )}

        {/* Already searched */}
        {alreadySearched && !searched && (
          <div style={{
            marginBottom: 16,
            fontFamily: 'var(--font-courier)',
            fontSize: 11,
            color: '#5a4a3a',
            fontStyle: 'italic',
          }}>
            You have already searched this location.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16,
            color: '#8b1a1a',
            fontFamily: 'var(--font-courier)',
            fontSize: 12,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Buttons */}
        {!searched ? (
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 32px',
              background: loading ? 'transparent' : '#8b1a1a',
              border: `1px solid ${loading ? 'rgba(0,0,0,0.2)' : '#8b1a1a'}`,
              color: loading ? '#5a4a3a' : '#f0e6c8',
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              letterSpacing: 3,
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) e.currentTarget.style.background = '#6b1212'
            }}
            onMouseLeave={e => {
              if (!loading) e.currentTarget.style.background = '#8b1a1a'
            }}
          >
            {loading ? 'SEARCHING...' : alreadySearched ? 'SEARCH AGAIN' : 'SEARCH LOCATION'}
          </button>
        ) : (
          <button
            onClick={() => navigate('hub')}
            style={{
              padding: '10px 32px',
              background: '#8b1a1a',
              border: '1px solid #8b1a1a',
              color: '#f0e6c8',
              fontFamily: 'var(--font-courier)',
              fontSize: 11,
              letterSpacing: 3,
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#6b1212'}
            onMouseLeave={e => e.currentTarget.style.background = '#8b1a1a'}
          >
            RETURN TO HUB →
          </button>
        )}
      </div>
    </div>
  )
}