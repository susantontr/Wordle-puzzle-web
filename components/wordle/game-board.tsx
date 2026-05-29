"use client"

import { cn } from "@/lib/utils"
import {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  type GuessResult,
} from "@/lib/wordle"
import { Tile } from "./tile"

interface GameBoardProps {
  /** Submitted guesses (lowercase words). */
  guesses: string[]
  /** Per-letter results, parallel to guesses. */
  results: GuessResult[][]
  /** The row currently being typed (only when game is active). */
  currentGuess: string
  /** Index of the active row, used to trigger the shake animation. */
  shakeRow: number | null
}

export function GameBoard({
  guesses,
  results,
  currentGuess,
  shakeRow,
}: GameBoardProps) {
  const rows = Array.from({ length: MAX_ATTEMPTS })
  const activeRowIndex = guesses.length

  return (
    <div className="mx-auto grid w-full max-w-[20rem] gap-1.5">
      {rows.map((_, rowIndex) => {
        const isSubmitted = rowIndex < guesses.length
        const isActive = rowIndex === activeRowIndex
        const word = isSubmitted
          ? guesses[rowIndex]
          : isActive
            ? currentGuess
            : ""

        return (
          <div
            key={rowIndex}
            className={cn(
              "grid grid-cols-5 gap-1.5",
              shakeRow === rowIndex && "animate-shake",
            )}
          >
            {Array.from({ length: WORD_LENGTH }).map((_, col) => {
              const letter = word[col] ?? ""
              const result = isSubmitted
                ? results[rowIndex]?.[col]?.result
                : undefined
              return (
                <Tile
                  key={col}
                  letter={letter}
                  result={result}
                  active={isActive}
                  revealIndex={col}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
