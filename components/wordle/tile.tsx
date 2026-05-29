"use client"

import { cn } from "@/lib/utils"
import type { LetterResult } from "@/lib/wordle"

interface TileProps {
  letter: string
  result?: LetterResult
  /** True while the letter is typed but not yet submitted. */
  active?: boolean
  /** Stagger index used to delay the reveal flip animation. */
  revealIndex?: number
}

const RESULT_CLASSES: Record<LetterResult, string> = {
  correct: "bg-correct text-correct-foreground border-correct",
  present: "bg-present text-present-foreground border-present",
  absent: "bg-absent text-absent-foreground border-absent",
}

export function Tile({ letter, result, active, revealIndex = 0 }: TileProps) {
  const revealed = Boolean(result)

  return (
    <div
      className={cn(
        "flex aspect-square w-full items-center justify-center rounded-md border-2 text-2xl font-bold uppercase select-none sm:text-3xl",
        revealed
          ? RESULT_CLASSES[result as LetterResult]
          : "bg-background text-foreground",
        !revealed && letter && "border-muted-foreground/60",
        !revealed && !letter && "border-tile-border",
        active && letter && "animate-pop",
        revealed && "animate-flip",
      )}
      style={revealed ? { animationDelay: `${revealIndex * 90}ms` } : undefined}
      aria-label={
        result
          ? `${letter || "empty"}, ${result}`
          : letter
            ? letter
            : "empty"
      }
    >
      {letter}
    </div>
  )
}
