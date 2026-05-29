"use client"

import { useState } from "react"
import { Check, Copy, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Mode } from "@/lib/wordle"

interface ResultPanelProps {
  won: boolean
  mode: Mode
  attempts: number
  /** Revealed answer (practice mode only). */
  answer?: string
  shareText: string
  canReplay: boolean
  onNewGame: () => void
}

export function ResultPanel({
  won,
  mode,
  attempts,
  answer,
  shareText,
  canReplay,
  onNewGame,
}: ResultPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center">
      <div
        className={cnIcon(won)}
        aria-hidden="true"
      >
        <Trophy className="size-6" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-balance">
          {won ? "You got it!" : "Out of guesses"}
        </h2>
        <p className="text-sm text-muted-foreground text-pretty">
          {won
            ? `Solved in ${attempts} ${attempts === 1 ? "try" : "tries"}.`
            : "Better luck next time."}
        </p>
        {!won && answer && (
          <p className="text-sm">
            The word was{" "}
            <span className="font-bold uppercase tracking-wide">{answer}</span>.
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        <Button onClick={handleShare} variant="secondary" className="w-full">
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" />
              Share result
            </>
          )}
        </Button>

        {canReplay && (
          <Button onClick={onNewGame} className="w-full">
            <RotateCcw className="size-4" aria-hidden="true" />
            New game
          </Button>
        )}
      </div>
    </div>
  )
}

function cnIcon(won: boolean) {
  return [
    "flex size-14 items-center justify-center rounded-full",
    won
      ? "bg-correct text-correct-foreground"
      : "bg-muted text-muted-foreground",
  ].join(" ")
}
