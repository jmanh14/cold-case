export type Genre = 'noir' | 'cozy' | 'thriller' | 'supernatural' | 'heist'

export type Suspect = {
  id: string
  name: string
  age: number
  occupation: string
  relationship: string
  appearance: string
  alibi: string
  alibiValid: boolean
  secrets: string[]
  personality: string
  voiceId: string
  interviewed: boolean
  trustLevel: number
  // player added
  playerTag: 'none' | 'innocent' | 'suspicious' | 'prime_suspect'
  playerNote: string
}

export type Evidence = {
  id: string
  name: string
  description: string
  location: string
  discovered: boolean
  isRedHerring: boolean
  pointsTo: string[]
  // player added
  playerTag: 'none' | 'relevant' | 'red_herring'
  playerNote: string
}

export type Location = {
  id: string
  name: string
  description: string
  searched: boolean
  evidenceIds: string[]
  suspectIds: string[]
  clues: string[]
}

export type Victim = {
  name: string
  age: number
  occupation: string
  background: string
  secrets: string[]
}

export type Crime = {
  type: string
  method: string
  time: string
  location: string
}

export type Killer = {
  suspectId: string
  motive: string
  opportunity: string
  method: string
}

export type Case = {
  id: string
  title: string
  genre: Genre
  setting: string
  victim: Victim
  crime: Crime
  killer: Killer
  suspects: Suspect[]
  evidence: Evidence[]
  locations: Location[]
}

export type InterviewEntry = {
  suspectId: string
  suspectName: string
  question: string
  response: string
  timestamp: number
}

export type InvestigationState = {
  caseId: string
  currentLocation: string | null
  visitedLocations: string[]
  interviewLog: InterviewEntry[]
  discoveredEvidence: string[]
  accusation: string | null
  solved: boolean
  correct: boolean
  turnsUsed: number
}

export type Screen =
  | 'menu'
  | 'setup'
  | 'briefing'
  | 'hub'
  | 'location'
  | 'interview'
  | 'evidence'
  | 'accusation'
  | 'closed'