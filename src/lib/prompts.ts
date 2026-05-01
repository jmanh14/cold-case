import { Case } from '@/types'

const GENRE_STYLES = {
  noir:          'hardboiled 1940s detective fiction. Cynical tone, rain slicked streets, moral ambiguity, sharp witty dialogue.',
  cozy:          'charming small town mystery. Light tone, eccentric characters, amateur sleuth, no graphic violence.',
  thriller:      'modern high stakes psychological thriller. Tense atmosphere, unreliable characters, time pressure.',
  supernatural:  'gothic mystery with paranormal elements. Atmosphere of dread, secrets buried for decades, nothing is quite what it seems.',
  heist:         'stylish crime caper. No murder — a theft. Clever characters, misdirection, everyone has an angle.',
}

export function buildCaseGenerationPrompt(genre: string): string {
  const style = GENRE_STYLES[genre as keyof typeof GENRE_STYLES] ?? 'classic mystery'
  const suspectCount = Math.floor(Math.random() * 3) + 3 // 3-5 suspects
  const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]

  return `You are a master mystery writer generating a complete detective case in the style of ${style}

Generate a fully realized mystery case with ${suspectCount} suspects. Difficulty: ${difficulty} (${
    difficulty === 'easy' ? 'clues are fairly obvious, killer makes clear mistakes' :
    difficulty === 'medium' ? 'clues require careful attention, some red herrings' :
    'clues are subtle, strong red herrings, killer is clever'
  }).

The killer must be one of the suspects. Plant real clues that point to them and red herrings that point to others. Every suspect should have a believable motive even if they are innocent.

IMPORTANT: Every evidence item's "location" field MUST exactly match one of the location "id" values. Do not use location names — use the id strings like "location_1", "location_2" etc.

Be highly creative with all names — victims, suspects, and locations should feel unique and fitting for the ${genre} genre. Avoid common placeholder names like John Smith or Jane Doe.

Respond ONLY with valid JSON, no markdown, no explanation:
{
  "id": "unique_case_id",
  "title": "Evocative case title (4-6 words)",
  "genre": "${genre}",
  "difficulty": "${difficulty}",
  "setting": "Vivid 2-3 sentence description of the setting and atmosphere",
  "victim": {
    "name": "A unique full name fitting the ${genre} genre and setting. Be creative and varied.",
    "age": ${Math.floor(Math.random() * 60) + 25},
    "occupation": "occupation",
    "background": "2-3 sentence background",
    "secrets": ["secret 1", "secret 2"]
  },
  "crime": {
    "type": "murder | theft | disappearance",
    "method": "specific method",
    "time": "specific time window",
    "location": "specific location within setting"
  },
  "killer": {
    "suspectId": "must match one of the suspect ids below",
    "motive": "specific compelling motive",
    "opportunity": "how they had access",
    "method": "exactly how they did it"
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full name",
      "age": 38,
      "occupation": "occupation",
      "relationship": "relationship to victim",
      "appearance": "brief physical description",
      "alibi": "what they claim they were doing",
      "alibiValid": true,
      "secrets": ["things they are hiding unrelated to the crime"],
      "personality": "2-3 word personality descriptor",
      "voiceId": "",
      "interviewed": false,
      "trustLevel": 50,
      "playerTag": "none",
      "playerNote": ""
    }
  ],
  "evidence": [
    {
      "id": "evidence_1",
      "name": "Evidence name",
      "description": "MUST be one of the location ids from the locations array (e.g. location_1, location_2)",
      "location": "location_id where this is found",
      "discovered": false,
      "isRedHerring": false,
      "pointsTo": ["suspect_id"],
      "playerTag": "none",
      "playerNote": ""
    }
  ],
  "locations": [
    {
      "id": "location_1",
      "name": "Location name",
      "description": "Atmospheric description",
      "searched": false,
      "evidenceIds": ["evidence_1"],
      "suspectIds": ["suspect_1"],
      "clues": ["atmospheric detail", "subtle hint"]
    }
  ]
}`
}

export function buildLocationSearchPrompt(
  activeCase: Case,
  locationId: string,
  previousClues: string[]
): string {
  const location = activeCase.locations.find(l => l.id === locationId)!
  const availableEvidence = activeCase.evidence.filter(
    e => e.location === locationId && !e.discovered
  )
  const discoveredEvidence = activeCase.evidence.filter(
    e => e.location === locationId && e.discovered
  )

  return `You are narrating a detective investigation in a ${activeCase.genre} mystery.

CASE: ${activeCase.title}
SETTING: ${activeCase.setting}
VICTIM: ${activeCase.victim.name}, ${activeCase.victim.occupation}
CRIME: ${activeCase.crime.type} by ${activeCase.crime.method} at ${activeCase.crime.time}

LOCATION BEING SEARCHED: ${location.name}
LOCATION DESCRIPTION: ${location.description}

EVIDENCE ALREADY FOUND HERE: ${discoveredEvidence.length > 0 ? discoveredEvidence.map(e => e.name).join(', ') : 'None yet'}
EVIDENCE STILL HIDDEN HERE: ${availableEvidence.map(e => `${e.name} — ${e.description}`).join('\n') || 'Nothing more to find'}
ATMOSPHERIC CLUES TO WEAVE IN: ${location.clues.join(', ')}
PREVIOUS CLUES FOUND ELSEWHERE: ${previousClues.join(', ') || 'None yet'}

Write a vivid 2-3 paragraph description of the detective searching this location. 
${availableEvidence.length > 0 ? `Naturally reveal the following evidence during the search: ${availableEvidence.map(e => e.name).join(', ')}` : 'No new evidence is found but describe interesting atmospheric details.'}
Weave in the atmospheric clues naturally. Match the ${activeCase.genre} tone.

Respond ONLY with valid JSON:
{
  "narrative": "2-3 paragraphs describing the search",
  "foundEvidenceIds": ${JSON.stringify(availableEvidence.map(e => e.id))},
  "newClue": "One subtle additional clue or atmospheric detail noticed (max 20 words)"
}`
}

export function buildInterviewPrompt(
  activeCase: Case,
  suspectId: string,
  question: string,
  interviewHistory: { question: string, response: string }[]
): string {
  const suspect = activeCase.suspects.find(s => s.id === suspectId)!
  const isKiller = activeCase.killer.suspectId === suspectId
  const discoveredEvidence = activeCase.evidence.filter(e => e.discovered)

  const historyText = interviewHistory.length > 0
    ? interviewHistory.map(h => `Detective: ${h.question}\n${suspect.name}: ${h.response}`).join('\n\n')
    : 'This is the first question.'

  return `You are playing ${suspect.name} in a ${activeCase.genre} mystery interrogation.

FULL CASE CONTEXT (never reveal this directly):
- Victim: ${activeCase.victim.name} — ${activeCase.victim.background}
- Crime: ${activeCase.crime.type} by ${activeCase.crime.method} at ${activeCase.crime.time} in ${activeCase.crime.location}
- You are ${isKiller ? 'THE KILLER' : 'INNOCENT'}
${isKiller ? `- Your motive: ${activeCase.killer.motive}
- How you did it: ${activeCase.killer.method}
- You must lie convincingly but leave subtle cracks if pressed hard` : `- You had nothing to do with the crime
- Your alibi: ${suspect.alibi} (${suspect.alibiValid ? 'this is true' : 'this is a lie — you were somewhere embarrassing but not the crime'})`}

YOUR CHARACTER:
- Name: ${suspect.name}, ${suspect.age}, ${suspect.occupation}
- Relationship to victim: ${suspect.relationship}
- Personality: ${suspect.personality}
- Your secrets (unrelated to crime, but you are hiding these): ${suspect.secrets.join(', ')}

EVIDENCE THE DETECTIVE HAS FOUND: ${discoveredEvidence.length > 0 ? discoveredEvidence.map(e => e.name).join(', ') : 'Nothing yet'}

INTERVIEW SO FAR:
${historyText}

The detective asks: "${question}"

Respond in character as ${suspect.name}. Stay true to your personality. 
${isKiller ? 'Be defensive if they are getting close to the truth. Deflect, misdirect, but stay believable.' : 'Be honest about most things but protective of your personal secrets.'}
Keep response to 2-4 sentences. No actions or stage directions — just dialogue.

Respond ONLY with valid JSON:
{
  "response": "Your in-character response as ${suspect.name}",
  "emotion": "nervous | calm | angry | sad | defensive | cooperative",
  "revealedClue": "optional — if you accidentally revealed something useful, describe it in 10 words or null",
  "trustDelta": -10
}`
}

export function buildAccusationPrompt(
  activeCase: Case,
  accusedSuspectId: string,
  playerReasoning: string
): string {
  const accused = activeCase.suspects.find(s => s.id === accusedSuspectId)!
  const killer = activeCase.suspects.find(s => s.id === activeCase.killer.suspectId)!
  const isCorrect = accusedSuspectId === activeCase.killer.suspectId

  return `You are narrating the conclusion of a ${activeCase.genre} mystery.

FULL CASE TRUTH:
- Victim: ${activeCase.victim.name}
- Killer: ${killer.name}
- Motive: ${activeCase.killer.motive}
- Method: ${activeCase.killer.method}
- Opportunity: ${activeCase.killer.opportunity}
- All suspects: ${activeCase.suspects.map(s => s.name).join(', ')}

THE DETECTIVE ACCUSED: ${accused.name}
THE DETECTIVE'S REASONING: ${playerReasoning}
CORRECT ANSWER: ${isCorrect ? 'YES — the detective got it right' : `NO — the real killer was ${killer.name}`}

Write a dramatic case closed scene in the style of ${activeCase.genre}. 
${isCorrect ? 'The killer breaks down and confesses. The detective is triumphant.' : `${accused.name} protests their innocence. The real killer ${killer.name} is revealed. The detective is humbled.`}
Reveal the full truth — motive, method, opportunity. Make it satisfying and dramatic.

Respond ONLY with valid JSON:
{
  "narrative": "3-4 dramatic paragraphs revealing the truth",
  "correct": ${isCorrect},
  "killerName": "${killer.name}",
  "motive": "${activeCase.killer.motive}",
  "method": "${activeCase.killer.method}",
  "verdict": "CASE CLOSED | WRONG SUSPECT"
}`
}