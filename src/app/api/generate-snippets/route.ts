import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Case, InvestigationState } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { activeCase, investigation }: {
      activeCase: Case
      investigation: InvestigationState
    } = await req.json()

    const interviewSummary = investigation.interviewLog
      .map(e => `${e.suspectName}: Q: "${e.question}" A: "${e.response}"`)
      .join('\n')

    const evidenceSummary = activeCase.evidence
      .filter(e => e.discovered)
      .map(e => `${e.name} — ${e.description}${e.playerTag !== 'none' ? ` [Tagged: ${e.playerTag}]` : ''}`)
      .join('\n')

    const suspectAssessments = activeCase.suspects
      .filter(s => s.playerTag !== 'none')
      .map(s => `${s.name}: ${s.playerTag}${s.playerNote ? ` — Note: ${s.playerNote}` : ''}`)
      .join('\n')

    const prompt = `You are a detective's case analysis assistant reviewing an investigation.

CASE: ${activeCase.title}
VICTIM: ${activeCase.victim.name} — ${activeCase.victim.occupation}
CRIME: ${activeCase.crime.type} by ${activeCase.crime.method} at ${activeCase.crime.time}
SUSPECTS: ${activeCase.suspects.map(s => s.name).join(', ')}

INTERVIEW LOG:
${interviewSummary || 'No interviews conducted'}

EVIDENCE FOUND:
${evidenceSummary || 'No evidence collected'}

DETECTIVE ASSESSMENTS:
${suspectAssessments || 'No assessments made'}

Generate 6-10 sharp detective-style observation snippets based on this investigation. Each snippet should be one sentence that could be used as reasoning in an accusation. Focus on:
- Suspicious behavior during interviews
- Evidence that implicates specific suspects
- Contradictions in alibis
- Connections between evidence and suspects
- Notable moments from the investigation

Make them sound like a seasoned detective's case notes — specific, observational, and compelling.

Respond ONLY with valid JSON:
{
  "snippets": [
    "One sentence detective observation",
    "Another observation"
  ]
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content.map(b => b.type === 'text' ? b.text : '').join('')
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (err) {
    console.error('Snippet generation error:', err)
    return NextResponse.json({ error: 'Failed to generate snippets' }, { status: 500 })
  }
}