"use client"

import { Delete, CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { KEYBOARD_ROWS, type LetterResult } from "@/lib/wordle"

interface KeyboardProps {
  letterStates: Record<string, LetterResult>
  disabled?: boolean
  onKey: (key: string) => void
}

const STATE_CLASSES: Record<LetterResult, string> = {
  correct: "bg-correct text-correct-foreground",
  present: "bg-present text-present-foreground",
  absent: "bg-absent text-absent-foreground",
}

export function Keyboard({ letterStates, disabled, onKey }: KeyboardProps) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-1.5">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isAction = key === "enter" || key === "backspace"
            const state = letterStates[key]
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                aria-label={key}
                className={cn(
                  "flex h-12 items-center justify-center rounded-md text-sm font-semibold uppercase transition-colors sm:h-14",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  isAction ? "flex-[1.5] px-1" : "flex-1",
                  state
                    ? STATE_CLASSES[state]
                    : "bg-key text-key-foreground hover:opacity-80",
                )}
              >
                {key === "backspace" ? (
                  <Delete className="size-5" aria-hidden="true" />
                ) : key === "enter" ? (
                  <CornerDownLeft className="size-5" aria-hidden="true" />
                ) : (
                  key
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
