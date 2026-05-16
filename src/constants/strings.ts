// All user-facing strings in one place — groundwork for future i18n

export const APP_TITLE = 'Spelling Practice'

// ── Navigation / general ─────────────────────────────────────────────────────

export const BTN_START_SESSION = 'Start practising'
export const BTN_CONTINUE = 'Continue'
export const BTN_DONE = 'Done'
export const BTN_CANCEL = 'Cancel'
export const BTN_SAVE = 'Save'
export const BTN_DELETE = 'Delete'
export const BTN_EDIT = 'Edit'
export const BTN_BACK = 'Back'
export const BTN_TRY_AGAIN = 'Try again'

// ── Session (child mode) ──────────────────────────────────────────────────────

export const BTN_REPLAY_WORD = 'Replay word'
export const ARIA_REPLAY_WORD = 'Hear the word again'
export const BTN_SUBMIT_ANSWER = 'Check my answer'
export const BTN_NEXT_WORD = 'Next word'
export const PLACEHOLDER_ANSWER = 'Type the word here…'
export const ARIA_ANSWER_INPUT = 'Type your spelling here'

export const LABEL_WORD_COUNT = (current: number, total: number) =>
  `Word ${current} of ${total}`

// Correct answer responses (picked randomly for variety)
export const CELEBRATION_MESSAGES = [
  'Brilliant! ⭐',
  'Amazing work!',
  'You got it!',
  'Fantastic spelling!',
  'Well done!',
  'Spot on!',
  'Superstar!',
]

// Incorrect answer — gentle, no shame
export const MSG_INCORRECT = 'Almost! The correct spelling is:'
export const MSG_INCORRECT_ENCOURAGEMENT = 'Keep going — you\'re doing great!'

// Session summary
export const SUMMARY_TITLE = 'Great session!'
export const SUMMARY_SCORE = (correct: number, total: number) =>
  `You got ${correct} out of ${total} right`
export const SUMMARY_PERFECT = 'Full marks — incredible!'
export const SUMMARY_ENCOURAGE = 'Keep practising and you\'ll get them all!'
export const BTN_FINISH_SESSION = 'Finish'

// No words available
export const MSG_NO_WORDS_TITLE = 'No words yet!'
export const MSG_NO_WORDS_BODY =
  'Ask a grown-up to add your word list so you can start practising.'

// ── Parent mode ───────────────────────────────────────────────────────────────

// PIN
export const LABEL_PIN_ENTRY = 'Enter parent PIN'
export const PLACEHOLDER_PIN = '····'
export const ARIA_PIN_INPUT = 'Enter your 4-digit PIN'
export const BTN_ENTER_PARENT_MODE = 'Parent login'
export const BTN_UNLOCK = 'Unlock'
export const MSG_WRONG_PIN = 'Incorrect PIN — please try again'
export const MSG_PIN_HINT = 'Enter your 4-digit PIN to manage word lists'

// Parent nav
export const NAV_WORD_LISTS = 'Word lists'
export const NAV_PROGRESS = 'Progress'
export const NAV_SETTINGS = 'Settings'
export const BTN_EXIT_PARENT_MODE = 'Exit parent mode'

// Week management
export const LABEL_WEEK_NUMBER = 'Week number'
export const LABEL_FOCUS_SOUND = 'Focus sound'
export const PLACEHOLDER_FOCUS_SOUND = 'e.g. igh, tion, ough'
export const BTN_ADD_WEEK = 'Add week'
export const BTN_ADD_WORD = 'Add word'
export const LABEL_WORD_TEXT = 'Word'
export const PLACEHOLDER_WORD = 'e.g. light'
export const LABEL_CATEGORY = 'Category'
export const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core',
  tricky: 'Tricky',
  extension: 'Extension',
}
export const MSG_NO_WEEKS = 'No weeks added yet. Tap "Add week" to start.'
export const MSG_NO_WORDS_IN_WEEK = 'No words in this week yet.'
export const MSG_DELETE_WORD_CONFIRM = (word: string) =>
  `Delete "${word}"? This cannot be undone.`
export const MSG_DELETE_WEEK_CONFIRM = (n: number) =>
  `Delete week ${n} and all its words? This cannot be undone.`

// Progress / stats
export const LABEL_MASTERED = 'Mastered'
export const LABEL_STRUGGLING = 'Struggling'
export const LABEL_ATTEMPTS = 'Attempts'
export const LABEL_CORRECT = 'Correct'
export const LABEL_ACCURACY = 'Accuracy'
export const MSG_NO_ATTEMPTS = 'No attempts recorded yet.'

// ── Errors ────────────────────────────────────────────────────────────────────

export const ERR_GENERIC = 'Something went wrong. Please try again.'
export const ERR_DB_OPEN = 'Could not open the local database. Try reloading the app.'
export const ERR_SAVE_FAILED = 'Could not save. Please try again.'
export const ERR_DELETE_FAILED = 'Could not delete. Please try again.'
