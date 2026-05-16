# Spelling Practice App

A tablet-first spelling revision app for primary school children (ages 5–10). Parents enter weekly word lists; children practise independently via audio-based sessions — no account or internet connection required.

## Features

- **Audio-only practice** — words are never shown as text during a session
- **Smart revision queue** — surfaces struggling words and spaced repetition across weeks
- **Parent mode** — PIN-protected word list management and progress view
- **Offline-first** — all data stored locally in IndexedDB, no backend or network calls
- **Gentle feedback** — child-friendly UI with no shaming on wrong answers

## Tech Stack

| Layer | Choice |
|-------|--------|
| UI | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Storage | IndexedDB (via `idb`) |
| TTS | Web Speech API |
| Testing | Vitest + React Testing Library |

## Getting Started

```bash
npm install
npm run dev       # start dev server
npm run build     # production build
npm run test      # run tests
npm run lint      # lint
```

The app is a PWA — on iOS/Android, use "Add to Home Screen" from the browser for the best tablet experience.

## Project Structure

```
src/
  components/     # UI components
  hooks/          # custom React hooks
  lib/            # core logic (revision list algorithm, DB helpers)
  constants/      # strings and config
```

## License

MIT — see [LICENSE](LICENSE).
