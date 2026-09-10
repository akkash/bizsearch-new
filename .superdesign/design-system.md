# BizSearch design system

Extracted from the live codebase. Implementable without opening the repo.

## Product

BizSearch is a franchise-first Indian marketplace. Franchisees discover, match, enquire, and apply. Franchisors list brands, review a pipeline of inquiries, and track growth. Business sales exist as secondary inventory.

Primary journeys: Discover → View → Match → Enquire → Apply → Review → Meeting → Territory → Location intent → Agreement → Opened.

## Visual identity

Swiss typography-first marketplace. High contrast, oversized type, hairline borders, lots of whitespace.

- **Near-black** (`--foreground` / `--primary` / `--growth-green`): chrome, CTAs, scores
- **Off-white** (`--background` `#F9F9F9`): page surface
- **Hairline** (`--border` `#E5E5E5`): 1–2px borders, no drop shadows
- **Type**: Cabinet Grotesk for display; Satoshi for UI; JetBrains Mono for money, scores, and metrics
- **Do not introduce** serif display fonts, navy+emerald marketing chrome, neon, purple gradients, glassmorphism blobs, or stock-illustration heroes
- **Logo**: real BizSearch mark (`/logo.png` light, `/logo-dark.png` on inverted footer) — never initials, emoji, or a fake icon wordmark

## Color (HSL)

Light: background 0 0% 98%; foreground 0 0% 4%; primary 0 0% 4%; growth-green 0 0% 4%; accent 0 0% 94%; border 0 0% 90%; ring 0 0% 4%.

Dark: inverted Swiss — background 0 0% 4%; foreground 0 0% 98%; card 0 0% 7%; border 0 0% 18%.

Hero sits on the page background (not a navy strip). Search field is transparent with a 2px near-black border.

## Type scale

- Home H1: 40–96px extra-bold uppercase, Cabinet Grotesk, leading ~0.9
- Page H1: 30–48px bold uppercase
- Section H2: 24–48px bold uppercase
- Body: 14–16px Satoshi, 1.65 line-height
- Data: JetBrains Mono 600–700, tabular nums
- Buttons: 12–14px bold uppercase, tracking-widest

## Components

- Buttons: sharp corners; default is inverted (near-black fill, off-white type); height 36–64px
- Inputs: 36–64px, 2px border, no radius
- Cards: 2px border, no shadow, no radius
- Badges: outline or 10% near-black tint
- Empty data: “No details found in the table.”

## Motion

200ms ease on color/opacity only. No lift, no scale-on-press, no parallax.

## Layout

Desktop: container + 24px padding, max content ~1120–1280px. Mobile: bottom nav (Home / Search / Saved / Inbox). Matcher and dashboards are single-column cards that go 2–4 columns at `md`.

## Voice

Direct, operator-grade, Indian market (₹). No hype. Franchise language: brand, territory, enquiry, application — not CRM/leads-as-a-product-name in franchisee UI.
