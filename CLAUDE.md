# Spelling Practice App

A tablet-first spelling revision app for primary school children (ages 5–10).
Parents enter weekly word lists; children practise independently via audio-based sessions.

**Full requirements**: see `REQUIREMENTS.md` in the project root.

## Project context

- **Platform**: Tablet (iOS/Android or PWA saved to home screen)
- **Tech stack**: React + Vite, TypeScript, Tailwind CSS, IndexedDB (via idb)
- **No backend**: all data is local, offline-first
- **TTS**: Web Speech API (`window.speechSynthesis`) — no external service or API key
- **Testing**: Vitest + React Testing Library

## Data model

Three core entities stored in IndexedDB:

```
Week       { id, weekNumber, focusSound, createdAt }
Word       { id, weekId, text, category }   -- category: 'core' | 'tricky' | 'extension'
Attempt    { id, wordId, date, correct }
```

All derived data (scores, mastery, error counts) is computed from Attempt records — do not store derived state.

## Code conventions

- Functional components only; hooks for all state and side effects
- Files: `kebab-case.tsx`; components: `PascalCase`; hooks: `useHookName`
- Tailwind for all styling — no CSS modules or styled-components
- No inline `style={{}}` except for dynamic values that can't be expressed in Tailwind
- Prefer named exports; default export only for page-level components
- All user-facing strings in a `constants/strings.ts` file (groundwork for future i18n)

## Commands

```bash
npm run dev       # start dev server
npm run build     # production build
npm run test      # run Vitest
npm run lint      # ESLint
```

## Key UX rules (never break these)

- Word is NEVER displayed as text during a child's practice session — audio only
- Wrong answer feedback must be gentle: show correct spelling, no red X or buzzer sound
- Parent mode must not be reachable without the PIN
- Autocorrect and spellcheck must be disabled on the child's answer input (`autoCorrect="off" autoCapitalize="off" spellCheck={false}`)
- Replay button for TTS must always be visible during a session

## What to check before touching the algorithm

The revision list generator lives in `src/lib/revisionList.ts`.
Its logic is unit-tested in `src/lib/__tests__/revisionList.test.ts`.
Run tests after any change to that file.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
