export type WordCategory = 'core' | 'tricky' | 'extension'

export type AppMode = 'child' | 'parent'

export interface Week {
  id: string
  weekNumber: number
  focusSound: string
  createdAt: number
}

export interface Word {
  id: string
  weekId: string
  text: string
  category: WordCategory
}

export interface Attempt {
  id: string
  wordId: string
  childId: string
  date: number
  correct: boolean
}

export interface ChildProfile {
  id: string
  name: string
  createdAt: number
}
