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
      'I\'m going to give you one chance to tell the truth.',
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

  const [question, setQuestion]           = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('ALIBI')
  const [localLog, setLocalLog]           = useState<{
    question: string
    response: string
    emotion: string
  }[]>([])

  if (!activeCase || !activeSuspectId || !investigation) return null

  const suspect = activeCase.suspects.find(s => s.id === activeSuspectId)!

  const emotionColor = (emotion: string) => {
    switch (emotion) {
      case 'nervous':     return '#c9a84c'
      case 'angry':       return 'var(--red-bright)'
      case 'defensive':   return 'var(--red-bright)'
      case 'sad':         return '#7a9fc4'
      case 'calm':        return 'var(--cream-dim)'
      case 'cooperative': return '#7aad7a'
      default:            return 'var(--cream-dim)'
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
            Interrogation Room
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 26,
            color: 'var(--cream)',
          }}>
            {suspect.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 12,
            color: 'var(--cream-dim)',
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

      {/* Two column layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        overflow: 'hidden',
      }}>

        {/* Left — interview */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 89px)',
        }}>

          {/* Conversation area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px',
          }}>

            {localLog.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                fontFamily: 'var(--font-special)',
                fontSize: 15,
                color: 'var(--cream-dim)',
                fontStyle: 'italic',
                lineHeight: 1.8,
              }}>
                {suspect.name} sits across from you.<br />
                The room is quiet. Ask your first question.
              </div>
            )}

            {localLog.map((entry, i) => (
              <div key={i} style={{ marginBottom: 28 }}>

                {/* Detective question */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 12,
                }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    background: 'var(--red-dim)',
                    border: '1px solid var(--red)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 13,
                    color: 'var(--cream)',
                    lineHeight: 1.7,
                  }}>
                    <div style={{
                      fontSize: 9,
                      letterSpacing: 3,
                      color: 'var(--red-bright)',
                      marginBottom: 6,
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
                    maxWidth: '75%',
                    padding: '12px 16px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-bright)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 13,
                    color: 'var(--cream)',
                    lineHeight: 1.7,
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}>
                      <div style={{
                        fontSize: 9,
                        letterSpacing: 3,
                        color: 'var(--cream-dim)',
                        textTransform: 'uppercase',
                      }}>
                        {suspect.name}
                      </div>
                      <div style={{
                        fontSize: 9,
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
                fontSize: 13,
                color: 'var(--cream-dim)',
                fontStyle: 'italic',
                padding: '12px 0',
              }}>
                {suspect.name} considers your question...
              </div>
            )}

            {error && (
              <div style={{
                color: 'var(--red-bright)',
                fontFamily: 'var(--font-courier)',
                fontSize: 13,
                padding: '8px 0',
              }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Fixed question footer */}
          <div style={{
            borderTop: '1px solid var(--border-bright)',
            background: 'var(--bg-surface)',
          }}>

            {/* Category tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              overflowX: 'auto',
            }}>
              {QUESTION_BANK.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategory(cat.category)}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeCategory === cat.category ? 'var(--red-bright)' : 'transparent'}`,
                    color: activeCategory === cat.category ? 'var(--cream)' : 'var(--cream-dim)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 10,
                    letterSpacing: 2,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {cat.category}
                </button>
              ))}
              <button
                onClick={() => setActiveCategory('CUSTOM')}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeCategory === 'CUSTOM' ? 'var(--red-bright)' : 'transparent'}`,
                  color: activeCategory === 'CUSTOM' ? 'var(--cream)' : 'var(--cream-dim)',
                  fontFamily: 'var(--font-courier)',
                  fontSize: 10,
                  letterSpacing: 2,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
              >
                CUSTOM
              </button>
            </div>

            {/* Questions or custom input */}
            <div style={{ padding: '12px 32px 16px' }}>
              {activeCategory === 'CUSTOM' ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askQuestion(question)}
                    placeholder="Type your own question..."
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-bright)',
                      color: 'var(--cream)',
                      fontFamily: 'var(--font-courier)',
                      fontSize: 13,
                      padding: '10px 14px',
                      outline: 'none',
                      caretColor: 'var(--red-bright)',
                    }}
                  />
                  <button
                    onClick={() => askQuestion(question)}
                    disabled={!question.trim() || loading}
                    style={{
                      padding: '10px 24px',
                      background: question.trim() && !loading ? 'var(--red)' : 'transparent',
                      border: `1px solid ${question.trim() && !loading ? 'var(--red-bright)' : 'var(--border)'}`,
                      color: question.trim() && !loading ? 'var(--cream)' : 'var(--cream-dim)',
                      fontFamily: 'var(--font-courier)',
                      fontSize: 11,
                      letterSpacing: 2,
                      cursor: question.trim() && !loading ? 'pointer' : 'not-allowed',
                      textTransform: 'uppercase',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      if (question.trim() && !loading)
                        e.currentTarget.style.background = 'var(--red-bright)'
                    }}
                    onMouseLeave={e => {
                      if (question.trim() && !loading)
                        e.currentTarget.style.background = 'var(--red)'
                    }}
                  >
                    {loading ? 'ASKING...' : 'ASK →'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {QUESTION_BANK.find(c => c.category === activeCategory)?.questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => askQuestion(q)}
                      disabled={loading}
                      style={{
                        padding: '8px 14px',
                        background: 'var(--bg-panel)',
                        border: '1px solid var(--border-bright)',
                        color: 'var(--cream-dim)',
                        fontFamily: 'var(--font-courier)',
                        fontSize: 12,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                        lineHeight: 1.5,
                        opacity: loading ? 0.5 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!loading) {
                          e.currentTarget.style.borderColor = 'var(--red-bright)'
                          e.currentTarget.style.color = 'var(--cream)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-bright)'
                        e.currentTarget.style.color = 'var(--cream-dim)'
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — suspect dossier */}
        <div style={{
          borderLeft: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '24px 20px',
          overflowY: 'auto',
          height: 'calc(100vh - 89px)',
        }}>

          <div style={{
            fontFamily: 'var(--font-courier)',
            fontSize: 9,
            letterSpacing: 4,
            color: 'var(--red-bright)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            — Dossier —
          </div>

          <DossierField label="Appearance" value={suspect.appearance} />
          <DossierField label="Alibi" value={suspect.alibi} />
          <DossierField label="Personality" value={suspect.personality} />

          {/* Player tag */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: 'var(--font-courier)',
              fontSize: 9,
              letterSpacing: 3,
              color: 'var(--cream-dim)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Your Assessment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['none', 'innocent', 'suspicious', 'prime_suspect'] as const).map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    if (activeSuspectId) updateSuspect(activeSuspectId, { playerTag: tag })
                  }}
                  style={{
                    padding: '6px 12px',
                    background: suspect.playerTag === tag ? 'var(--red-dim)' : 'transparent',
                    border: `1px solid ${suspect.playerTag === tag ? 'var(--red-bright)' : 'var(--border)'}`,
                    color: suspect.playerTag === tag ? 'var(--cream)' : 'var(--cream-dim)',
                    fontFamily: 'var(--font-courier)',
                    fontSize: 10,
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

          {/* Player note */}
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
              value={suspect.playerNote}
              onChange={e => {
                if (activeSuspectId) updateSuspect(activeSuspectId, { playerNote: e.target.value })
              }}
              placeholder="Add your notes..."
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
      </div>
    </div>
  )
}

function DossierField({ label, value }: { label: string, value: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 9,
        letterSpacing: 3,
        color: 'var(--cream-dim)',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-courier)',
        fontSize: 12,
        color: 'var(--cream)',
        lineHeight: 1.7,
      }}>
        {value}
      </div>
    </div>
  )
}