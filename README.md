# Wordle Puzzle (Web)

A Wordle-inspired web app built with v0 by Vercel. Players guess a hidden 5-letter word within 6 attempts. Each guess is validated against the Votee API, which returns per-letter feedback in real time.

🔗 **Live:** [v0-wordle-web-app.vercel.app](https://v0-wordle-web-app.vercel.app)

---

## Features

### Three Game Modes

| Mode | Description |
|---|---|
| **Daily** | One puzzle per day, same word for all players worldwide. Board locks after winning or losing and resets at midnight. |
| **Random** | A fresh random word every session. Play as many games as you want. |
| **Practice** | Guess against a curated word list. Great for learning patterns without competitive pressure. |

### Gameplay
- 6×5 tile grid — rows are attempts, columns are letter slots
- On-screen keyboard with per-letter colour feedback
- Tile colours update after each submitted guess:
  - 🟩 **Green** — right letter, right position
  - 🟨 **Yellow** — right letter, wrong position
  - ⬛ **Grey** — letter not in the word
- Invalid word detection — row shakes and a "Not in word list" toast appears; no attempt is consumed
- Share your result as an emoji grid after each game

### Daily Mode Extras
- Board state persists across page refreshes via `localStorage`
- Tab icon changes to ✅ on win or ❌ on loss so you know at a glance whether today's puzzle is done
- Trophy card on win showing which attempt you won on (e.g. "3 / 6 guesses" means you solved it on your 3rd try)

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React / Next.js |
| Styling | Tailwind CSS |
| Generated with | [v0 by Vercel](https://v0.dev) |
| Hosting | Vercel |
| Word Validation | Votee API |

---

## Getting Started (Local Development)

1. Clone or download this repository.
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API

All word validation is handled by the [Votee API](https://wordle.votee.dev:8000).

| Endpoint | Used by |
|---|---|
| `GET /daily?guess={word}&size=5` | Daily mode |
| `GET /random?guess={word}&size=5&seed={seed}` | Random mode |
| `GET /word/{target}?guess={word}` | Practice mode |

The app never receives the target word from the API — only per-letter feedback. This is why Daily and Random modes cannot reveal the answer on a loss.

---

## Out of Scope (V1)

- User accounts or leaderboards
- Push notifications for the daily reset
- Configurable word length
- Hard mode
- Accessibility (ARIA, screen reader support)

---

## Credits

Designed and built by **Susan Tang**.  
Web version generated with [v0](https://v0.dev) by Vercel.
