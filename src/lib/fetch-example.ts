/** Fetches the first example sentence for a word from the Free Dictionary API. Returns null on any failure. */
export async function fetchExampleSentence(word: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!res.ok) return null
    const data = await res.json() as unknown[]
    if (!Array.isArray(data)) return null

    for (const entry of data) {
      const meanings = (entry as { meanings?: unknown[] }).meanings ?? []
      for (const meaning of meanings) {
        const definitions = (meaning as { definitions?: unknown[] }).definitions ?? []
        for (const def of definitions) {
          const example = (def as { example?: string }).example
          if (example) return example
        }
      }
    }
    return null
  } catch {
    return null
  }
}
