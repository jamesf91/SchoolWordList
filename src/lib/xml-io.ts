import type { Week, Word, WordCategory } from '@/types'
import { nanoid } from 'nanoid'

const VALID_CATEGORIES = new Set<WordCategory>(['core', 'tricky', 'extension'])

export interface ImportResult {
  weeks: Week[]
  words: Word[]
  errors: string[]
}

export function exportToXml(weeks: Week[], words: Word[]): string {
  const wordsByWeek = new Map<string, Word[]>()
  for (const word of words) {
    const bucket = wordsByWeek.get(word.weekId) ?? []
    bucket.push(word)
    wordsByWeek.set(word.weekId, bucket)
  }

  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<wordlists>']

  for (const week of [...weeks].sort((a, b) => a.weekNumber - b.weekNumber)) {
    const escaped = escapeXml(week.focusSound)
    lines.push(`  <week number="${week.weekNumber}" focusSound="${escaped}">`)
    for (const word of wordsByWeek.get(week.id) ?? []) {
      lines.push(`    <word category="${word.category}">${escapeXml(word.text)}</word>`)
    }
    lines.push('  </week>')
  }

  lines.push('</wordlists>')
  return lines.join('\n')
}

export function parseXml(xml: string): ImportResult {
  const errors: string[] = []
  const weeks: Week[] = []
  const words: Word[] = []

  let doc: Document
  try {
    const parser = new DOMParser()
    doc = parser.parseFromString(xml, 'application/xml')
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      return { weeks, words, errors: ['Invalid XML: ' + parseError.textContent?.split('\n')[0]] }
    }
  } catch {
    return { weeks, words, errors: ['Could not parse file as XML.'] }
  }

  const root = doc.documentElement
  if (root.tagName !== 'wordlists') {
    return { weeks, words, errors: [`Expected root element <wordlists>, got <${root.tagName}>.`] }
  }

  const weekEls = Array.from(root.querySelectorAll(':scope > week'))
  if (weekEls.length === 0) {
    return { weeks, words, errors: ['No <week> elements found.'] }
  }

  const seenNumbers = new Set<number>()

  for (const weekEl of weekEls) {
    const rawNumber = weekEl.getAttribute('number')
    const weekNumber = rawNumber !== null ? parseInt(rawNumber, 10) : NaN
    if (!rawNumber || isNaN(weekNumber) || weekNumber < 1) {
      errors.push(`Skipped <week> with invalid number="${rawNumber ?? ''}".`)
      continue
    }
    if (seenNumbers.has(weekNumber)) {
      errors.push(`Skipped duplicate week number ${weekNumber}.`)
      continue
    }
    seenNumbers.add(weekNumber)

    const focusSound = (weekEl.getAttribute('focusSound') ?? '').trim()
    const week: Week = { id: nanoid(), weekNumber, focusSound, createdAt: Date.now() }
    weeks.push(week)

    const wordEls = Array.from(weekEl.querySelectorAll(':scope > word'))
    for (const wordEl of wordEls) {
      const text = wordEl.textContent?.trim() ?? ''
      const rawCat = wordEl.getAttribute('category') ?? ''
      if (!text) {
        errors.push(`Week ${weekNumber}: skipped empty <word>.`)
        continue
      }
      if (!VALID_CATEGORIES.has(rawCat as WordCategory)) {
        errors.push(`Week ${weekNumber}: word "${text}" has unknown category "${rawCat}", defaulting to "core".`)
      }
      const category: WordCategory = VALID_CATEGORIES.has(rawCat as WordCategory)
        ? (rawCat as WordCategory)
        : 'core'
      words.push({ id: nanoid(), weekId: week.id, text, category })
    }
  }

  return { weeks, words, errors }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
