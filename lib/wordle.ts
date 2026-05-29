export type Mode = "daily" | "random" | "practice"

export type LetterResult = "correct" | "present" | "absent"

export interface GuessResult {
  slot: number
  guess: string
  result: LetterResult
}

export const WORD_LENGTH = 5
export const MAX_ATTEMPTS = 6

export const MODES: { id: Mode; label: string; description: string }[] = [
  {
    id: "daily",
    label: "Daily",
    description: "Same word for everyone. One game per day.",
  },
  {
    id: "random",
    label: "Random",
    description: "A fresh random word every game.",
  },
  {
    id: "practice",
    label: "Practice",
    description: "Low pressure. Learn the patterns.",
  },
]

// Curated list of common 5-letter words for Practice mode.
export const PRACTICE_WORDS = [
  "apple",
  "bread",
  "chair",
  "dance",
  "eagle",
  "flame",
  "grape",
  "house",
  "input",
  "juice",
  "knife",
  "lemon",
  "mango",
  "ocean",
  "piano",
  "queen",
  "river",
  "sugar",
  "table",
  "water",
] as const

/** The keyboard layout rows. */
export const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
]

/** Priority so the keyboard shows the best result seen for a letter. */
const RESULT_PRIORITY: Record<LetterResult, number> = {
  correct: 3,
  present: 2,
  absent: 1,
}

/**
 * Build a map of letter -> best result seen so far, used to color the keyboard.
 */
export function buildLetterStates(
  results: GuessResult[][],
): Record<string, LetterResult> {
  const states: Record<string, LetterResult> = {}
  results.forEach((row) => {
    row.forEach(({ guess, result }) => {
      const letter = guess.toLowerCase()
      const current = states[letter]
      if (!current || RESULT_PRIORITY[result] > RESULT_PRIORITY[current]) {
        states[letter] = result
      }
    })
  })
  return states
}

/** A guess is a win when every letter is correct. */
export function isWinningRow(row: GuessResult[]): boolean {
  return row.length === WORD_LENGTH && row.every((r) => r.result === "correct")
}

const RESULT_EMOJI: Record<LetterResult, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
}

/** Build the shareable emoji grid summary. */
export function buildShareGrid(
  results: GuessResult[][],
  mode: Mode,
  won: boolean,
): string {
  const header = `Wordle (${mode}) ${won ? results.length : "X"}/${MAX_ATTEMPTS}`
  const grid = results
    .map((row) => row.map((r) => RESULT_EMOJI[r.result]).join(""))
    .join("\n")
  return `${header}\n\n${grid}`
}

/** Today's date key in local time, e.g. 2026-05-28. */
export function todayKey(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}
