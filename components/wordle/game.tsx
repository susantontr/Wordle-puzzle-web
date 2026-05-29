"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  MAX_ATTEMPTS,
  PRACTICE_WORDS,
  WORD_LENGTH,
  buildLetterStates,
  buildShareGrid,
  isWinningRow,
  todayKey,
  type GuessResult,
  type Mode,
} from "@/lib/wordle"
import { GameBoard } from "./game-board"
import { Keyboard } from "./keyboard"
import { ResultPanel } from "./result-panel"

type Status = "playing" | "won" | "lost"

interface DailySave {
  date: string
  guesses: string[]
  results: GuessResult[][]
  status: Status
}

interface GameProps {
  mode: Mode
  /** Whether this mode's tab is currently visible (controls key listening). */
  active: boolean
}

const randomSeed = () => Math.floor(Math.random() * 1_000_000)
const pickPracticeWord = () =>
  PRACTICE_WORDS[Math.floor(Math.random() * PRACTICE_WORDS.length)]

export function Game({ mode, active }: GameProps) {
  const [guesses, setGuesses] = useState<string[]>([])
  const [results, setResults] = useState<GuessResult[][]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [status, setStatus] = useState<Status>("playing")
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [shakeRow, setShakeRow] = useState<number | null>(null)

  // Mode-specific target identifiers.
  const [seed, setSeed] = useState(() => randomSeed())
  const [practiceWord, setPracticeWord] = useState(() => pickPracticeWord())

  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hydrated = useRef(false)

  const showBanner = useCallback((message: string) => {
    setBanner(message)
    if (bannerTimer.current) clearTimeout(bannerTimer.current)
    bannerTimer.current = setTimeout(() => setBanner(null), 1600)
  }, [])

  const triggerShake = useCallback((row: number) => {
    setShakeRow(row)
    setTimeout(() => setShakeRow(null), 500)
  }, [])

  // Load persisted Daily board on mount.
  useEffect(() => {
    if (mode !== "daily") {
      hydrated.current = true
      return
    }
    try {
      const raw = localStorage.getItem("wordle-daily")
      if (raw) {
        const save = JSON.parse(raw) as DailySave
        if (save.date === todayKey()) {
          setGuesses(save.guesses)
          setResults(save.results)
          setStatus(save.status)
        }
      }
    } catch {
      // ignore corrupt saves
    }
    hydrated.current = true
  }, [mode])

  // Persist Daily board whenever it changes.
  useEffect(() => {
    if (mode !== "daily" || !hydrated.current) return
    const save: DailySave = { date: todayKey(), guesses, results, status }
    try {
      localStorage.setItem("wordle-daily", JSON.stringify(save))
    } catch {
      // ignore quota errors
    }
  }, [mode, guesses, results, status])

  const submitGuess = useCallback(async () => {
    if (loading || status !== "playing") return
    if (currentGuess.length !== WORD_LENGTH) {
      showBanner("Not enough letters")
      triggerShake(guesses.length)
      return
    }

    setLoading(true)
    setBanner(null)
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          guess: currentGuess,
          seed: mode === "random" ? seed : undefined,
          word: mode === "practice" ? practiceWord : undefined,
        }),
      })

      if (res.status === 422) {
        showBanner("Not in word list")
        triggerShake(guesses.length)
        return
      }

      const data = await res.json()
      if (!res.ok) {
        showBanner(data?.error ?? "Something went wrong")
        triggerShake(guesses.length)
        return
      }

      const row = data.results as GuessResult[]
      const nextGuesses = [...guesses, currentGuess]
      const nextResults = [...results, row]
      setGuesses(nextGuesses)
      setResults(nextResults)
      setCurrentGuess("")

      if (isWinningRow(row)) {
        setStatus("won")
      } else if (nextGuesses.length >= MAX_ATTEMPTS) {
        setStatus("lost")
      }
    } catch {
      showBanner("Network error. Try again.")
      triggerShake(guesses.length)
    } finally {
      setLoading(false)
    }
  }, [
    loading,
    status,
    currentGuess,
    guesses,
    results,
    mode,
    seed,
    practiceWord,
    showBanner,
    triggerShake,
  ])

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing" || loading) return
      if (key === "enter") {
        submitGuess()
      } else if (key === "backspace") {
        setCurrentGuess((g) => g.slice(0, -1))
      } else if (/^[a-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => g + key)
      }
    },
    [status, loading, currentGuess, submitGuess],
  )

  // Physical keyboard support, only for the visible tab.
  useEffect(() => {
    if (!active) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const key = e.key.toLowerCase()
      if (key === "enter" || key === "backspace" || /^[a-z]$/.test(key)) {
        e.preventDefault()
        handleKey(key)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [active, handleKey])

  const newGame = useCallback(() => {
    setGuesses([])
    setResults([])
    setCurrentGuess("")
    setStatus("playing")
    setBanner(null)
    if (mode === "random") setSeed(randomSeed())
    if (mode === "practice") setPracticeWord(pickPracticeWord())
  }, [mode])

  const letterStates = buildLetterStates(results)
  const isOver = status !== "playing"

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Banner */}
      <div className="flex h-8 items-center justify-center">
        {banner && (
          <div
            role="status"
            className="rounded-md bg-foreground px-4 py-1.5 text-sm font-semibold text-background shadow-md"
          >
            {banner}
          </div>
        )}
      </div>

      <GameBoard
        guesses={guesses}
        results={results}
        currentGuess={currentGuess}
        shakeRow={shakeRow}
      />

      {isOver ? (
        <ResultPanel
          won={status === "won"}
          mode={mode}
          attempts={results.length}
          answer={mode === "practice" ? practiceWord : undefined}
          shareText={buildShareGrid(results, mode, status === "won")}
          canReplay={mode !== "daily"}
          onNewGame={newGame}
        />
      ) : (
        <div className="w-full">
          {loading && (
            <div className="mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Checking guess…
            </div>
          )}
          <Keyboard
            letterStates={letterStates}
            disabled={loading}
            onKey={handleKey}
          />
        </div>
      )}

      {mode === "daily" && isOver && (
        <p className="text-center text-sm text-muted-foreground">
          Come back tomorrow for a new word.
        </p>
      )}

      {/* Reset for non-daily modes mid-game */}
      {mode !== "daily" && !isOver && guesses.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={newGame}
          className="text-muted-foreground"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          New word
        </Button>
      )}
    </div>
  )
}
