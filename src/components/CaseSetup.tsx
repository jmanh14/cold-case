'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'
import { Case } from '@/types'
import { Search, Home, Zap, Moon, Briefcase } from 'lucide-react'

const GENRES = [
  {
    id: 'noir',
    label: 'Noir',
    description: 'Rain-soaked streets, moral ambiguity, hardboiled cynicism',
    icon: <Search size={28} />,
  },
  {
    id: 'cozy',
    label: 'Cozy',
    description: 'Small town charm, amateur sleuth, lighter stakes',
    icon: <Home size={28} />,
  },
  {
    id: 'thriller',
    label: 'Thriller',
    description: 'High stakes, psychological tension, modern setting',
    icon: <Zap size={28} />,
  },
  {
    id: 'supernatural',
    label: 'Supernatural',
    description: 'Gothic atmosphere, dark secrets, paranormal undertones',
    icon: <Moon size={28} />,
  },
  {
    id: 'heist',
    label: 'Heist',
    description: 'No murder — a theft. Everyone has an angle',
    icon: <Briefcase size={28} />,
  },
]

export default function CaseSetup() {
  const navigate    = useCaseStore(s => s.navigate)
  const setCase     = useCaseStore(s => s.setCase)
  const setInvestigation = useCaseStore(s => s.setInvestigation)

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  async function handleOpenCase() {
    if (!selectedGenre || loading) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre: selectedGenre }),
      })

      if (!res.ok) throw new Error('Failed to generate case')

      const caseData: Case = await res.json()

      // assign voices to suspects from pool
      const VOICE_POOL = [
        'pNInz6obpgDQGcFmaJgB', // Adam
        'ErXwobaYiN019PkySvjV', // Antoni
        'VR6AewLTigWG4xSOukaG', // Arnold
        'EXAVITQu4vr4xnSDxMaL', // Bella
        'MF3mGyEYCl7XYWbV9V6O', // Elli
        'jsCqWAovK2LkecY7zXl4', // Clyde
        'onwK4e9ZLuTAKqWW03F9', // Daniel
        'z9fAnlkpzviPz146aGWa', // Giovanni
      ]

      const shuffled = [...VOICE_POOL].sort(() => Math.random() - 0.5)
      caseData.suspects = caseData.suspects.map((s, i) => ({
        ...s,
        voiceId: shuffled[i % shuffled.length],
      }))

      setCase(caseData)
      setInvestigation({
        caseId: caseData.id,
        currentLocation: null,
        visitedLocations: [],
        interviewLog: [],
        discoveredEvidence: [],
        accusation: null,
        solved: false,
        correct: false,
        turnsUsed: 0,
      })

      navigate('briefing')
    } catch (err) {
      console.error(err)
      setError('Failed to open case. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* Back button */}
      <button
        onClick={() => navigate('menu')}
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          background: 'transparent',
          border: 'none',
          color: 'var(--cream-dim)',
          fontFamily: 'var(--font-courier)',
          fontSize: 12,
          letterSpacing: 3,
          cursor: 'pointer',
          textTransform: 'uppercase',
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div className="anim-1" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          fontFamily: 'var(--font-courier)',
          fontSize: 11,
          letterSpacing: 6,
          color: 'var(--red-bright)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}>
          New Case — Select Genre
        </div>
        <div style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 32,
          color: 'var(--cream)',
        }}>
          What kind of case is this?
        </div>
      </div>

      {/* Genre grid */}
      <div className="anim-2" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        width: '100%',
        maxWidth: 720,
        marginBottom: 36,
      }}>
        {GENRES.map(genre => {
          const selected = selectedGenre === genre.id
          return (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              style={{
                padding: '20px 16px',
                background: selected ? 'var(--red)' : 'var(--bg-surface)',
                border: `1px solid ${selected ? 'var(--red-bright)' : 'var(--border-bright)'}`,
                color: selected ? 'var(--cream)' : 'var(--cream-dim)',
                fontFamily: 'var(--font-courier)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--cream-dim)'
                  e.currentTarget.style.color = 'var(--cream)'
                }
              }}
              onMouseLeave={e => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                  e.currentTarget.style.color = 'var(--cream-dim)'
                }
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{genre.icon}</div>
              <div style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 18,
                marginBottom: 8,
                color: selected ? 'var(--cream)' : 'var(--cream)',
              }}>
                {genre.label}
              </div>
              <div style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: selected ? 'rgba(232,220,200,0.8)' : 'var(--cream-dim)',
              }}>
                {genre.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          color: 'var(--red-bright)',
          fontFamily: 'var(--font-courier)',
          fontSize: 13,
          letterSpacing: 2,
          marginBottom: 16,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Open Case button */}
      <div className="anim-3">
        <button
          onClick={handleOpenCase}
          disabled={!selectedGenre || loading}
          style={{
            padding: '14px 48px',
            background: selectedGenre && !loading ? 'var(--red)' : 'transparent',
            border: `1px solid ${selectedGenre && !loading ? 'var(--red-bright)' : 'var(--border)'}`,
            color: selectedGenre && !loading ? 'var(--cream)' : 'var(--cream-dim)',
            fontFamily: 'var(--font-courier)',
            fontSize: 13,
            letterSpacing: 4,
            cursor: selectedGenre && !loading ? 'pointer' : 'not-allowed',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
            minWidth: 280,
          }}
        >
          {loading ? 'OPENING CASE FILE...' : selectedGenre ? 'OPEN CASE FILE →' : 'SELECT A GENRE'}
        </button>
      </div>

    </div>
  )
}