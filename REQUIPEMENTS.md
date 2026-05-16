# Requirements — Spelling Practice App

## Users

- **Parent** — enters and manages word lists, reviews progress. Uses a PIN to access admin screens.
- **Child** — primary user of the practice session. Age 5–10, primary school. Uses the app independently on a tablet.

---

## Modes

### Parent mode
- Accessible only via PIN — no obvious entry point visible to a child
- Enter the weekly word list, assigning each word a category: `core`, `tricky`, or `extension`
- Record the week number and focus sound for each week's list
- Edit or delete words from any week
- View progress stats and session history

### Child mode
- Default experience when the app opens — no login required
- Word is presented by audio only; the word text is never shown during a session
- Child types their answer into a text input
- Tap a replay button at any time to hear the word again
- After submitting, see a result: correct (celebration) or incorrect (gentle reveal of correct spelling)
- At the end of a session, see a friendly summary screen (stars / score, no shaming)

---

## Word list structure

Each weekly list has:
- A week number
- A focus sound (e.g. "igh", "tion")
- Words split into three difficulty categories (easiest → hardest):
  1. **Core words** — on-pattern, straightforward
  2. **Tricky words** — irregular or harder spellings
  3. **Extension words** — most challenging; may include words from previous weeks

---

## Daily revision list

Target: 10 words per session (configurable by parent in settings).

Composition:
| Slot | Count | Source |
|------|-------|--------|
| Current week | 4 | Core-heavy early in the week; extension-heavy later |
| Previous weeks | 3 | Weighted toward recent weeks; exclude words seen in the last 24 hours |
| Struggling words | 3 | Wrong ≥ 2 times; sorted by most-recently-wrong first |

Rules:
- Never show the same word two sessions in a row
- A word is "mastered" when answered correctly ≥ 3 consecutive times; it leaves the struggling pool
- Answers are compared case-insensitively with leading/trailing whitespace trimmed

---

## UX rules — must never be broken

1. The word text is **never shown** during a child's practice session — audio only
2. Wrong answer feedback is **gentle**: show the correct spelling quietly, no red X, no buzzer
3. Parent mode is **not reachable without the PIN**
4. Autocorrect, autocapitalise, and spellcheck are **disabled** on the child's answer input
5. The TTS replay button is **always visible** during a session
6. Touch targets are a **minimum of 56px** tall throughout the child UI
7. Font size in the child UI is a **minimum of 24px**; use 32px for the primary prompt area

---

## Data rules

- All scores, mastery status, and error counts are **derived from raw Attempt records** — never stored as separate state
- No data leaves the device — fully offline, no network calls

---

## Out of scope (for now)

- Multi-child or multi-user profiles
- Teacher / school-wide sharing
- Cloud sync
- Hints or letter scaffolding during a session