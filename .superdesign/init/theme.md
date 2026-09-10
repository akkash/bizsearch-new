# Theme tokens

## Compact token summary

Product: BizSearch — franchise-first Indian marketplace (Vite + React + Tailwind + shadcn).

### Color palette (HSL channels, used as `hsl(var(--token))`)

Light `:root`
- trust-blue: 215 45% 18% / light 215 40% 28% / dark 215 50% 12%
- growth-green: 160 72% 36% / light 160 65% 45% / dark 160 75% 28%
- electric-blue: 211 90% 48% (sparing)
- warning: 38 92% 50%
- background: 210 25% 97%
- foreground: 215 45% 12%
- card: 0 0% 100%
- primary: 215 45% 18% (navy)
- primary-foreground: 0 0% 100%
- secondary: 210 18% 94%
- muted: 210 16% 93% / muted-foreground: 215 14% 42%
- accent: 160 40% 94% / accent-foreground: 160 75% 26%
- destructive: 0 72% 51%
- success: 160 72% 36%
- border / input: 214 18% 86%
- ring: 160 72% 36% (growth green)

Dark `.dark` and `prefers-color-scheme: dark`
- background: 220 32% 7%
- foreground: 210 25% 96%
- card: 220 28% 10%
- primary: 158 64% 48% (growth green becomes primary)
- primary-foreground: 220 32% 7%
- muted-foreground: 215 12% 62%
- border: 220 18% 18%

Hero search bar uses a hard-coded near-black `bg-[hsl(220,32%,7%)]` with white type and a white search field.

### Typography
- UI / body: IBM Plex Sans 400/500/600/700
- Data / prices: JetBrains Mono, tabular nums (`.text-data`, `.text-price`, `.font-mono`)
- Headlines: weight 600–700, letter-spacing -0.02em to -0.025em
- Body line-height 1.65

### Spacing / radius / shadow
- `--radius: 0.5rem` → rounded-sm/md/lg/xl derived
- Shadows: `--shadow-sm` through `--shadow-xl` (slate-tinted, low elevation)
- Cards: `.card-hover-lift` translates -2px
- CTA: `.btn-growth` emerald gradient + lift on hover

### Motion
- Interactive: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Buttons active: scale(0.98)
- fade-in 300ms, slide-up 400ms, shimmer 2s
- Focus-visible: 2px ring in `--ring`

### Breakpoints
Tailwind defaults: sm 640, md 768, lg 1024, xl 1280. Mobile bottom nav appears below `md`.

### Product visual rules
- Financial intelligence clarity over decorative marketing
- No invented serifs, neon, or purple gradients
- Growth green is the conversion CTA; navy is trust/primary in light mode
- Empty marketplace tables: “No details found in the table.”

## Raw source dumps

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./main.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
  			mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			'electric-blue': 'hsl(var(--electric-blue))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			'trust-blue': {
  				DEFAULT: 'hsl(var(--trust-blue))',
  				light: 'hsl(var(--trust-blue-light))',
  				dark: 'hsl(var(--trust-blue-dark))'
  			},
  			'growth-green': {
  				DEFAULT: 'hsl(var(--growth-green))',
  				light: 'hsl(var(--growth-green-light))',
  				dark: 'hsl(var(--growth-green-dark))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { backgroundPosition: '200% 0' },
  				'100%': { backgroundPosition: '-200% 0' },
  			},
  			fadeIn: {
  				'0%': { opacity: '0', transform: 'translateY(10px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  		},
  		animation: {
  			shimmer: 'shimmer 2s infinite',
  			fadeIn: 'fadeIn 0.3s ease-out',
  			scaleIn: 'scaleIn 0.2s ease-out',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
```

### `src/index.css`

Full file at `src/index.css` (BizSearch Design System). Token blocks are `:root` (light) and `.dark`. Typography is IBM Plex Sans + JetBrains Mono. Hero/CTA utilities: `.btn-growth`, `.bg-trust-blue`, `.text-growth-green`, `.card-hover-lift`, `.gradient-hero`.


### `src/index.css`

```css
/*
 * BizSearch Design System
 * Deep navy + emerald marketplace identity
 * Financial intelligence clarity over decorative marketing
 */

@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===================================
   LIGHT MODE
   =================================== */
:root {
  /* Navy / Trust Blue */
  --trust-blue: 215 45% 18%;
  --trust-blue-light: 215 40% 28%;
  --trust-blue-dark: 215 50% 12%;

  /* Emerald / Growth Green */
  --growth-green: 160 72% 36%;
  --growth-green-light: 160 65% 45%;
  --growth-green-dark: 160 75% 28%;

  /* Electric blue — sparingly */
  --electric-blue: 211 90% 48%;
  /* Amber warning */
  --warning: 38 92% 50%;
  --warning-foreground: 215 50% 12%;

  /* Base */
  --background: 210 25% 97%;
  --foreground: 215 45% 12%;
  --card: 0 0% 100%;
  --card-foreground: 215 45% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 215 45% 12%;

  --primary: 215 45% 18%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 18% 94%;
  --secondary-foreground: 215 45% 18%;

  --muted: 210 16% 93%;
  --muted-foreground: 215 14% 42%;

  --accent: 160 40% 94%;
  --accent-foreground: 160 75% 26%;

  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;

  --success: 160 72% 36%;
  --success-foreground: 0 0% 100%;

  --border: 214 18% 86%;
  --input: 214 18% 86%;
  --ring: 160 72% 36%;

  --radius: 0.5rem;

  --chart-1: 215 45% 28%;
  --chart-2: 160 72% 36%;
  --chart-3: 38 92% 50%;
  --chart-4: 211 90% 48%;
  --chart-5: 0 72% 51%;

  --shadow-sm: 0 1px 2px 0 rgb(15 23 42 / 0.04);
  --shadow: 0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06);
  --shadow-lg: 0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.06);
  --shadow-xl: 0 20px 25px -5px rgb(15 23 42 / 0.1), 0 8px 10px -6px rgb(15 23 42 / 0.06);
}

/* ===================================
   DARK MODE
   Sophisticated, Premium Dark Theme
   =================================== */
.dark {
  --trust-blue: 214 48% 62%;
  --trust-blue-light: 214 45% 72%;
  --trust-blue-dark: 214 55% 48%;

  --growth-green: 158 64% 48%;
  --growth-green-light: 158 58% 58%;
  --growth-green-dark: 158 70% 38%;

  --electric-blue: 211 95% 58%;
  --warning: 38 92% 55%;
  --warning-foreground: 215 28% 7%;

  /* Deep navy / charcoal */
  --background: 220 32% 7%;
  --foreground: 210 25% 96%;
  --card: 220 28% 10%;
  --card-foreground: 210 25% 96%;
  --popover: 220 28% 10%;
  --popover-foreground: 210 25% 96%;

  --primary: 158 64% 48%;
  --primary-foreground: 220 32% 7%;

  --secondary: 220 22% 14%;
  --secondary-foreground: 210 25% 96%;

  --muted: 220 20% 14%;
  --muted-foreground: 215 12% 62%;

  --accent: 158 35% 14%;
  --accent-foreground: 158 64% 58%;

  --destructive: 0 70% 48%;
  --destructive-foreground: 0 0% 100%;

  --success: 158 64% 48%;
  --success-foreground: 220 32% 7%;

  --border: 220 18% 18%;
  --input: 220 18% 18%;
  --ring: 158 64% 48%;

  --chart-1: 214 55% 62%;
  --chart-2: 158 64% 48%;
  --chart-3: 38 92% 55%;
  --chart-4: 211 95% 58%;
  --chart-5: 0 70% 55%;
}

/* System-aware dark mode */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    --trust-blue: 214 48% 62%;
    --trust-blue-light: 214 45% 72%;
    --trust-blue-dark: 214 55% 48%;
    --growth-green: 158 64% 48%;
    --growth-green-light: 158 58% 58%;
    --growth-green-dark: 158 70% 38%;
    --electric-blue: 211 95% 58%;
    --warning: 38 92% 55%;
    --warning-foreground: 215 28% 7%;
    --background: 220 32% 7%;
    --foreground: 210 25% 96%;
    --card: 220 28% 10%;
    --card-foreground: 210 25% 96%;
    --popover: 220 28% 10%;
    --popover-foreground: 210 25% 96%;
    --primary: 158 64% 48%;
    --primary-foreground: 220 32% 7%;
    --secondary: 220 22% 14%;
    --secondary-foreground: 210 25% 96%;
    --muted: 220 20% 14%;
    --muted-foreground: 215 12% 62%;
    --accent: 158 35% 14%;
    --accent-foreground: 158 64% 58%;
    --destructive: 0 70% 48%;
    --destructive-foreground: 0 0% 100%;
    --success: 158 64% 48%;
    --success-foreground: 220 32% 7%;
    --border: 220 18% 18%;
    --input: 220 18% 18%;
    --ring: 158 64% 48%;
  }
}

/* ===================================
   TYPOGRAPHY — IBM Plex Sans (financial trust)
   =================================== */
* {
  font-family: "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

h1,
h2,
h3,
h4,
h5,
h6,
.text-headline {
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

h1,
.text-display {
  font-weight: 700;
  letter-spacing: -0.025em;
}

/* Body copy - Readable */
p,
.text-body {
  line-height: 1.65;
  font-weight: 400;
}

/* Data typography - Monospaced */
.text-data,
.font-mono {
  font-family: "JetBrains Mono", "SF Mono", "Consolas", monospace;
  font-feature-settings: "tnum" on, "lnum" on;
}

/* Price/number formatting */
.text-price {
  font-family: "JetBrains Mono", monospace;
  font-weight: 600;
  font-feature-settings: "tnum" on;
}

/* ===================================
   BASE STYLES
   =================================== */
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*[class*="border"] {
  border-color: hsl(var(--border));
}

/* Radius classes */
.rounded-sm {
  border-radius: calc(var(--radius) - 4px);
}

.rounded {
  border-radius: calc(var(--radius) - 2px);
}

.rounded-md {
  border-radius: var(--radius);
}

.rounded-lg {
  border-radius: calc(var(--radius) + 2px);
}

.rounded-xl {
  border-radius: calc(var(--radius) + 6px);
}

.rounded-2xl {
  border-radius: calc(var(--radius) + 10px);
}

/* ===================================
   INTERACTIVE STATES
   =================================== */
html {
  scroll-behavior: smooth;
}

/* Smooth transitions */
button,
a,
input,
textarea,
select {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:active:not(:disabled) {
  transform: scale(0.98);
}

/* Focus states */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Selection */
::selection {
  background-color: hsl(var(--trust-blue) / 0.2);
  color: hsl(var(--foreground));
}

/* ===================================
   GROWTH GREEN CTA STYLES
   =================================== */
.btn-growth {
  background: linear-gradient(135deg, hsl(var(--growth-green)) 0%, hsl(var(--growth-green-dark)) 100%);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 14px 0 hsl(var(--growth-green) / 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-growth:hover {
  box-shadow: 0 6px 20px 0 hsl(var(--growth-green) / 0.35);
  transform: translateY(-2px);
}

.btn-growth:active {
  transform: translateY(0);
}

/* ===================================
   TRUST BLUE ACCENTS
   =================================== */
.bg-trust-blue {
  background-color: hsl(var(--trust-blue));
}

.text-trust-blue {
  color: hsl(var(--trust-blue));
}

.border-trust-blue {
  border-color: hsl(var(--trust-blue));
}

.bg-growth-green {
  background-color: hsl(var(--growth-green));
}

.text-growth-green {
  color: hsl(var(--growth-green));
}

/* ===================================
   CARD EFFECTS
   =================================== */
.card-hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.12);
}

/* Glass overlay — prefer bg-card / bg-popover tokens for surfaces */
.glass {
  background: hsl(var(--card) / 0.92);
  border: 1px solid hsl(var(--border));
}

.dark .glass {
  background: hsl(var(--card) / 0.92);
}

/* ===================================
   SCROLLBAR
   =================================== */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark ::-webkit-scrollbar-track {
  background: hsl(var(--background));
}

.dark ::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

/* ===================================
   ANIMATIONS
   =================================== */
@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-soft {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}

/* Compatibility aliases — no decorative glow/float */
.animate-pulse-glow {
  animation: pulse-soft 2s ease-in-out infinite;
}

.animate-float {
  animation: none;
}

/* ===================================
   UTILITY CLASSES — solid product surfaces
   =================================== */
.gradient-trust {
  background: hsl(var(--secondary));
}

.gradient-growth {
  background: hsl(var(--growth-green));
  color: white;
}

.gradient-hero {
  background: hsl(var(--card));
}

.text-gradient-trust {
  color: hsl(var(--growth-green));
}
```
