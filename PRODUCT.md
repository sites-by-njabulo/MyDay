# Product

## Register

product

## Users

A single user (Njabulo, a web designer) on his own devices: laptop browser during the day, installed Android PWA for on-the-go checks and push reminders. No other users, no onboarding, no multi-tenant concerns. Checked in short bursts throughout the day (morning verse, midday to-do, evening workout/prayer), not a sit-down session.

## Product Purpose

A personal daily-operations dashboard replacing scattered habits: forgetting to pray, losing to-do lists, hunting for paused YouTube videos, and manually tracking a 60-day $10,000/month income challenge. Success looks like: opening the app takes under a second to understand "what's left today," and logging a completed habit (prayer, workout rep, task) feels satisfying enough that he actually does it instead of skipping it.

## Brand Personality

Calm and focused, in the lane of Apple Health/Fitness's warmth and satisfying micro-moments, but rendered through a restrained dark-product palette (not Apple Health's colorful rings). Three words: **quiet, accountable, rewarding**. The interface should never feel like it's nagging, but completing something should feel small-but-good.

## Anti-references

- Generic AI-generated SaaS dashboard look: glassmorphism cards, gradient-text stat callouts, identical icon+heading+text card grids.
- Gamified/childish habit-tracker aesthetics (confetti, cartoon mascots, badges).
- Side-stripe colored borders as a decorative crutch.
- Anything that makes a missed habit feel like failure/shame rather than a neutral "not yet."

## Design Principles

1. **Calm by default, warm on completion.** Resting state is quiet and restrained; the moment something is logged (a task checked, a prayer tapped, a rep added) is where the interface allows itself a small reward.
2. **One glance, not one read.** Every section should be scannable in under 2 seconds — hierarchy through size/weight, not walls of equal-weight text.
3. **Accent is earned, not decorative.** Purple appears only where the user just did something or is about to (active state, button, progress fill) — never as ambient brand color.
4. **No nagging.** Empty/incomplete states are neutral observations ("nothing logged yet"), never guilt-toned.
5. **Personal-tool density.** This is a tool for one person who already knows what everything means — favor information density and speed of interaction over hand-holding or marketing-style whitespace.

## Accessibility & Inclusion

Single sighted user on modern devices (current Chrome desktop + Android Chrome PWA) — no screen-reader or low-vision requirements reported. Still hold the line on WCAG AA contrast for text/icons against the dark palette, comfortable touch targets (≥40px) for the Android PWA, and respect `prefers-reduced-motion` for any added micro-animations.
