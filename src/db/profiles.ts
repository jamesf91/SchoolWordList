import type { SpellingIDB } from './schema'
import type { ChildProfile } from '@/types'
import { STORE_PROFILES } from '@/constants/db'

export async function getAllProfiles(db: SpellingIDB): Promise<ChildProfile[]> {
  return db.getAll(STORE_PROFILES)
}

export async function getProfile(db: SpellingIDB, id: string): Promise<ChildProfile | undefined> {
  return db.get(STORE_PROFILES, id)
}

export async function upsertProfile(db: SpellingIDB, profile: ChildProfile): Promise<void> {
  await db.put(STORE_PROFILES, profile)
}

export async function deleteProfile(db: SpellingIDB, id: string): Promise<void> {
  await db.delete(STORE_PROFILES, id)
}
