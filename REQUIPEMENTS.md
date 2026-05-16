# Requirements — Spelling Practice App

## Users

- **Parent** — enters and manages word lists, reviews progress, manages child profiles. Uses a PIN to access admin screens.
- **Child** — primary user of the practice session. Age 5–10, primary school. Selects their profile and uses the app independently on a tablet. Multiple children can share one device.

---

## Modes

### Parent mode
- Accessible only via PIN — no obvious entry point visible to a child
- Enter the weekly word list, assigning each word a category: `core`, `tricky`, or `extension`
- Record the week number and focus sound for each week's list
- Edit or delete words from any week
- View progress stats and session history **per child**
- Export all word lists to an XML file (backup / cross-device sharing)
- Import word lists from an XML file (merges alongside existing data; duplicate week numbers are skipped with a warning)
- Manage child profiles: add, rename, and delete named profiles
- Deletion of a profile with existing attempt records is blocked (data safety)

### Child mode
- Default experience when the app opens — no login required
- If multiple child profiles exist, the home screen shows a **profile picker** before starting
- If only one child profile exists, it is auto-selected (no picker shown)
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

## Child profiles

- Each named child has their own independent attempt history
- Word lists (weeks + words) are **shared** across all children — the parent enters them once
- The active child is stored in `localStorage` so the selection persists across sessions
- On first launch after a device upgrade from the single-child version, all existing attempt history is automatically assigned to a default profile named "Child 1"; the parent can rename it in Settings

---

## Data rules

- All scores, mastery status, and error counts are **derived from raw Attempt records** — never stored as separate state
- Attempt records are partitioned by `childId` — queries always filter to the active child
- No data leaves the device — fully offline, no network calls

---

## Out of scope (for now)

- Per-child word lists (all children share the same parent-managed word lists)
- Teacher / school-wide sharing
- Cloud sync (XML export/import is supported for local backup and manual cross-device transfer)
- Hints or letter scaffolding during a session