import { create } from 'zustand'
import { Case, InvestigationState, Screen, Suspect, Evidence } from '@/types'

type CaseStore = {
  screen: Screen
  navigate: (screen: Screen) => void

  genre: string | null
  setGenre: (genre: string) => void

  activeCase: Case | null
  setCase: (c: Case) => void

  investigation: InvestigationState | null
  setInvestigation: (i: InvestigationState) => void

  activeSuspectId: string | null
  setActiveSuspect: (id: string) => void

  activeLocationId: string | null
  setActiveLocation: (id: string) => void

  updateSuspect: (id: string, updates: Partial<Suspect>) => void
  updateEvidence: (id: string, updates: Partial<Evidence>) => void
  addInterviewEntry: (entry: InvestigationState['interviewLog'][0]) => void
  discoverEvidence: (id: string) => void
  markLocationVisited: (id: string) => void

  resetCase: () => void
}

export const useCaseStore = create<CaseStore>((set) => ({
  screen: 'menu',
  navigate: (screen) => set({ screen }),

  genre: null,
  setGenre: (genre) => set({ genre }),

  activeCase: null,
  setCase: (c) => set({ activeCase: c }),

  investigation: null,
  setInvestigation: (i) => set({ investigation: i }),

  activeSuspectId: null,
  setActiveSuspect: (id) => set({ activeSuspectId: id }),

  activeLocationId: null,
  setActiveLocation: (id) => set({ activeLocationId: id }),

  updateSuspect: (id, updates) => set((state) => {
    if (!state.activeCase) return state
    return {
      activeCase: {
        ...state.activeCase,
        suspects: state.activeCase.suspects.map(s =>
          s.id === id ? { ...s, ...updates } : s
        )
      }
    }
  }),

  updateEvidence: (id, updates) => set((state) => {
    if (!state.activeCase) return state
    return {
      activeCase: {
        ...state.activeCase,
        evidence: state.activeCase.evidence.map(e =>
          e.id === id ? { ...e, ...updates } : e
        )
      }
    }
  }),

  addInterviewEntry: (entry) => set((state) => {
    if (!state.investigation) return state
    return {
      investigation: {
        ...state.investigation,
        interviewLog: [...state.investigation.interviewLog, entry],
        turnsUsed: state.investigation.turnsUsed + 1,
      }
    }
  }),

  discoverEvidence: (id) => set((state) => {
    if (!state.investigation) return state
    if (state.investigation.discoveredEvidence.includes(id)) return state
    return {
      investigation: {
        ...state.investigation,
        discoveredEvidence: [...state.investigation.discoveredEvidence, id],
      },
      activeCase: state.activeCase ? {
        ...state.activeCase,
        evidence: state.activeCase.evidence.map(e =>
          e.id === id ? { ...e, discovered: true } : e
        )
      } : null
    }
  }),

  markLocationVisited: (id) => set((state) => {
    if (!state.investigation) return state
    if (state.investigation.visitedLocations.includes(id)) return state
    return {
      investigation: {
        ...state.investigation,
        visitedLocations: [...state.investigation.visitedLocations, id],
      },
      activeCase: state.activeCase ? {
        ...state.activeCase,
        locations: state.activeCase.locations.map(l =>
          l.id === id ? { ...l, searched: true } : l
        )
      } : null
    }
  }),

  resetCase: () => set({
    activeCase: null,
    investigation: null,
    activeSuspectId: null,
    activeLocationId: null,
    screen: 'menu',
  }),
}))