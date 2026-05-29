import { NextResponse } from "next/server"
import { WORD_LENGTH, type GuessResult, type Mode } from "@/lib/wordle"

const BASE_URL = "https://wordle.votee.dev:8000"

export async function POST(request: Request) {
  let body: {
    mode?: Mode
    guess?: string
    seed?: number
    word?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { mode, guess, seed, word } = body

  if (!guess || typeof guess !== "string" || guess.length !== WORD_LENGTH) {
    return NextResponse.json(
      { error: `Guess must be ${WORD_LENGTH} letters.` },
      { status: 400 },
    )
  }

  const normalized = guess.toLowerCase()

  // Build the upstream URL for the requested mode.
  let url: string
  if (mode === "daily") {
    url = `${BASE_URL}/daily?guess=${normalized}&size=${WORD_LENGTH}`
  } else if (mode === "random") {
    url = `${BASE_URL}/random?guess=${normalized}&size=${WORD_LENGTH}`
    if (typeof seed === "number") url += `&seed=${seed}`
  } else if (mode === "practice") {
    if (!word) {
      return NextResponse.json(
        { error: "Practice mode requires a target word." },
        { status: 400 },
      )
    }
    url = `${BASE_URL}/word/${word.toLowerCase()}?guess=${normalized}`
  } else {
    return NextResponse.json({ error: "Unknown game mode." }, { status: 400 })
  }

  let upstream: Response
  try {
    upstream = await fetch(url, { cache: "no-store" })
  } catch {
    return NextResponse.json(
      { error: "Could not reach the word service. Check your connection." },
      { status: 502 },
    )
  }

  // The API returns 422 for words it does not recognize.
  if (upstream.status === 422) {
    return NextResponse.json({ error: "Not in word list" }, { status: 422 })
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "The word service returned an unexpected response." },
      { status: 502 },
    )
  }

  let data: GuessResult[]
  try {
    data = (await upstream.json()) as GuessResult[]
  } catch {
    return NextResponse.json(
      { error: "Received a malformed response from the word service." },
      { status: 502 },
    )
  }

  if (!Array.isArray(data) || data.length !== WORD_LENGTH) {
    return NextResponse.json(
      { error: "Received an unexpected response from the word service." },
      { status: 502 },
    )
  }

  return NextResponse.json({ results: data })
}
