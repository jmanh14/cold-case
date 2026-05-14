'use client'

import { useState } from 'react'
import { useCaseStore } from '@/store/caseStore'

const QUESTION_BANK = [
  {
    category: 'ALIBI',
    questions: [
      'Where were you when the crime occurred?',
      'Can anyone confirm your whereabouts?',
      'What time did you arrive and leave?',
      'Did you see or hear anything unusual?',
    ]
  },
  {
    category: 'RELATIONSHIP',
    questions: [
      'How did you know the victim?',
      'When did you last see them alive?',
      'How would you describe your relationship?',
      'Did you two have any recent disputes?',
    ]
  },
  {
    category: 'MOTIVE',
    questions: [
      'Did the victim have any enemies you know of?',
      'Who do you think could have done this?',
      'Was anyone angry with the victim recently?',
      'Did anyone stand to gain from their death?',
    ]
  },
  {
    category: 'CHARACTER',
    questions: [
      'What kind of person was the victim?',
      'Did the victim have any secrets you knew about?',
      'How were things between you recently?',
      "Is there anything you haven't told the police?",
    ]
  },
  {
    category: 'PRESSURE',
    questions: [
      "I think you're not telling me everything.",
      "Your alibi doesn't add up. Care to explain?",
      'We found evidence that contradicts your story.',
      "I'm going to give you one chance to tell the truth.",
    ]
  },
]

export default function InterviewScreen() {
  const navigate          = useCaseStore(s => s.navigate)
  const activeCase        = useCaseStore(s => s.activeCase)
  const activeSuspectId   = useCaseStore(s => s.activeSuspectId)
  const investigation     = useCaseStore(s => s.investigation)
  const addInterviewEntry = useCaseStore(s => s.addInterviewEntry)
  const updateSuspect     = useCaseStore(s => s.updateSuspect)

  const [question, setQuestion]             = useState('')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('ALIBI')
  const [localLog, setLocalLog]             = useState<{
    question: string
    response: string
    emotion: string
  }[]>([])

  if (!activeCase || !activeSuspectId || !investigation) return null

  const suspect = activeCase.suspects.find(s => s.id === activeSuspectId)!

  const emotionColor = (emotion: string) => {
    switch (emotion) {
      case 'nervous':     return '#b8860b'
      case 'angry':       return '#8b1a1a'
      case 'defensive':   return '#8b1a1a'
      case 'sad':         return '#4a6a8a'
      case 'calm':        return '#5a4a3a'
      case 'cooperative': return '#2a6a2a'
      default:            return '#5a4a3a'
    }
  }

  async function askQuestion(q: string) {
    if (loading || !q.trim()) return
    setLoading(true)
    setError(null)

    const interviewHistory = localLog.map(l => ({
      question: l.question,
      response: l.response,
    }))

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCase,
          suspectId: activeSuspectId,
          question: q.trim(),
          interviewHistory,
        }),
      })

      if (!res.ok) throw new Error('Interview failed')

      const data = await res.json()

      setLocalLog(prev => [...prev, {
        question: q.trim(),
        response: data.response,
        emotion: data.emotion,
      }])

      addInterviewEntry({
        suspectId: activeSuspectId ?? '',
        suspectName: suspect.name,
        question: q.trim(),
        response: data.response,
        timestamp: Date.now(),
      })

      if (activeSuspectId) updateSuspect(activeSuspectId, { interviewed: true })
      setQuestion('')

    } catch (err) {
      console.error(err)
      setError('Interview failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: 0,
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        marginBottom: 12,
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
            Interview Transcript
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(16px, 2vw, 22px)',
            color: '#1a1209',
          }}>
            {suspect.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 10,
            color: '#5a4a3a',
            marginTop: 2,
            letterSpacing: 1,
          }}>
            {suspect.age} — {suspect.occupation} — {suspect.relationship}
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

      {/* Two column layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 220px',
        gap: 16,
        overflow: 'hidden',
        minHeight: 0,
      }}>

        {/* Left — conversation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}>

          {/* Transcript area */}
          <div
            className="doc-scroll"
            style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: 12,
              minHeight: 0,
            }}
          >
            {localLog.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                fontFamily: 'var(--font-special)',
                fontSize: 13,
                color: '#5a4a3a',
                fontStyle: 'italic',
                lineHeight: 1.8,
              }}>
                {suspect.name} sits across from you.<br />
                Select a question to begin.
              </div>
            )}

            {localLog.map((entry, i) => (
              <div key={i} style={{ marginBottom: 20 }}>

                {/* Detective question */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 8,
                }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    background: 'rgba(139,26,26,0.08)',
                    border: '1px solid rgba(139,26,26,0.2)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    color: '#1a1209',
                    lineHeight: 1.6,
                  }}>
                    <div style={{
                      fontSize: 8,
                      letterSpacing: 3,
                      color: '#8b1a1a',
                      marginBottom: 4,
                      textTransform: 'uppercase',
                    }}>
                      Detective
                    </div>
                    {entry.question}
                  </div>
                </div>

                {/* Suspect response */}
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.12)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    color: '#1a1209',
                    lineHeight: 1.6,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}>
                      <div style={{
                        fontSize: 8,
                        letterSpacing: 3,
                        color: '#5a4a3a',
                        textTransform: 'uppercase',
                      }}>
                        {suspect.name}
                      </div>
                      <div style={{
                        fontSize: 8,
                        letterSpacing: 2,
                        color: emotionColor(entry.emotion),
                        textTransform: 'uppercase',
                      }}>
                        {entry.emotion}
                      </div>
                    </div>
                    {entry.response}
                  </div>
                </div>

              </div>
            ))}

            {loading && (
              <div style={{
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                color: '#5a4a3a',
                fontStyle: 'italic',
                padding: '8px 0',
              }}>
                {suspect.name} considers your question...
              </div>
            )}

            {error && (
              <div style={{
                color: '#8b1a1a',
                fontFamily: 'var(--font-courier)',
                fontSize: 11,
                padding: '6px 0',
              }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Question bank */}
          <div style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(0,0,0,0.12)',
            paddingTop: 10,
          }}>

            {/* Category tabs */}
            <div style={{
              display: 'flex',
              gap: 0,
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              marginBottom: 10,
              overflowX: 'auto',
            }}>
              {QUESTION_BANK.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  style={{
                    padding: '5px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeCategory === cat.category ? '#8b1a1a' : 'transparent'}`,
                    color: activeCategory === cat.category ? '#8b1a1a' : '#5a4a3a',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 9,
                    letterSpacing: 2,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    marginBottom: -1,
                    flexShrink: 0,
                  }}
                >
                  {cat.category}
                </button>
              ))}
              <button
                onClick={() => setActiveCategory('CUSTOM')}
                style={{
                  padding: '5px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeCategory === 'CUSTOM' ? '#8b1a1a' : 'transparent'}`,
                  color: activeCategory === 'CUSTOM' ? '#8b1a1a' : '#5a4a3a',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 9,
                  letterSpacing: 2,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  marginBottom: -1,
                  flexShrink: 0,
                }}
              >
                CUSTOM
              </button>
            </div>

            {/* Questions or input */}
            {activeCategory === 'CUSTOM' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askQuestion(question)}
                  placeholder="Type your own question..."
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    color: '#1a1209',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 11,
                    padding: '8px 12px',
                    outline: 'none',
                    caretColor: '#8b1a1a',
                  }}
                />
                <button
                  onClick={() => askQuestion(question)}
                  disabled={!question.trim() || loading}
                  style={{
                    padding: '8px 16px',
                    background: question.trim() && !loading ? '#8b1a1a' : 'transparent',
                    border: `1px solid ${question.trim() && !loading ? '#8b1a1a' : 'rgba(0,0,0,0.15)'}`,
                    color: question.trim() && !loading ? '#f0e6c8' : '#5a4a3a',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 10,
                    letterSpacing: 2,
                    cursor: question.trim() && !loading ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (question.trim() && !loading)
                      e.currentTarget.style.background = '#6b1212'
                  }}
                  onMouseLeave={e => {
                    if (question.trim() && !loading)
                      e.currentTarget.style.background = '#8b1a1a'
                  }}
                >
                  ASK →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUESTION_BANK.find(c => c.category === activeCategory)?.questions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => askQuestion(q)}
                    disabled={loading}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.12)',
                      color: '#1a1209',
                      fontFamily: 'var(--font-courier)',
                      fontSize: 10,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                      lineHeight: 1.5,
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.borderColor = '#8b1a1a'
                        e.currentTarget.style.color = '#8b1a1a'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                      e.currentTarget.style.color = '#1a1209'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — dossier */}
        <div style={{
          borderLeft: '1px solid rgba(0,0,0,0.12)',
          paddingLeft: 16,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
          className="doc-scroll"
        >
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 9,
            letterSpacing: 3,
            color: '#8b1a1a',
            textTransform: 'uppercase',
          }}>
            — Dossier —
          </div>

          <DossierField label="Appearance" value={suspect.appearance} />
          <DossierField label="Alibi" value={suspect.alibi} />
          <DossierField label="Personality" value={suspect.personality} />

          {/* Assessment */}
          <div>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: '#5a4a3a',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Assessment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(['none', 'innocent', 'suspicious', 'prime_suspect'] as const).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (activeSuspectId) updateSuspect(activeSuspectId, { playerTag: tag })
                  }}
                  style={{
                    padding: '5px 10px',
                    background: suspect.playerTag === tag
                      ? 'rgba(139,26,26,0.12)' : 'transparent',
                    border: `1px solid ${suspect.playerTag === tag
                      ? 'rgba(139,26,26,0.4)' : 'rgba(0,0,0,0.12)'}`,
                    color: suspect.playerTag === tag ? '#8b1a1a' : '#5a4a3a',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 9,
                    letterSpacing: 2,
                    cursor: 'pointer',
                    textAlign: 'left',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >
                  {tag === 'none' ? 'Unassessed'
                    : tag === 'prime_suspect' ? 'Prime Suspect'
                    : tag.charAt(0).toUpperCase() + tag.slice(1)}
                </button>
              ))}
            </div>
          </div>

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
              value={suspect.playerNote}
              onChange={e => {
                if (activeSuspectId) updateSuspect(activeSuspectId, { playerNote: e.target.value })
              }}
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
      </div>
    </div>
  )
}

function DossierField({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 9,
        letterSpacing: 3,
        color: '#5a4a3a',
        textTransform: 'uppercase',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 11,
        color: '#1a1209',
        lineHeight: 1.7,
      }}>
        {value}
      </div>
    </div>
  )
}