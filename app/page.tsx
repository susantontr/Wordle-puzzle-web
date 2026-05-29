"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { MODES, type Mode } from "@/lib/wordle"
import { Game } from "@/components/wordle/game"

export default function Page() {
  const [mode, setMode] = useState<Mode>("daily")
  const activeMeta = MODES.find((m) => m.id === mode)!

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 pb-10">
      <header className="w-full border-b">
        <div className="mx-auto flex max-w-2xl flex-col items-center py-4">
          <h1 className="text-3xl font-extrabold tracking-tight">WORDLE</h1>
        </div>
      </header>

      {/* Mode selector */}
      <nav
        className="mt-5 flex w-full max-w-sm items-center gap-1 rounded-lg bg-muted p-1"
        aria-label="Game mode"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            aria-current={mode === m.id}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              mode === m.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <p className="mt-2 text-center text-sm text-muted-foreground text-pretty">
        {activeMeta.description}
      </p>

      <section className="mt-4 w-full max-w-md">
        {MODES.map((m) => (
          <div key={m.id} className={cn(mode !== m.id && "hidden")}>
            <Game mode={m.id} active={mode === m.id} />
          </div>
        ))}
      </section>
    </main>
  )
}
