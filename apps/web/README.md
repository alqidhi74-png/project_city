# Web app (Next.js) — public portal frontend

Sultan Haitham City portal. Currently contains the **City Pulse** dashboard at
`/[locale]/dashboard`, running on mock JSON only.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> — it redirects to `/ar/dashboard`. English is at
`/en/dashboard`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
Recharts 3 · Framer Motion 12. No i18n library — locales are typed dictionaries.

## Layout

```
app/[locale]/            ar | en. This IS the root layout — it owns <html lang dir>.
  dashboard/page.tsx     Server component: loads JSON, renders DashboardShell.
middleware.ts            Redirects unprefixed paths to /ar.
components/dashboard/    All dashboard UI, grouped by feature.
  state/                 DashboardProvider, LiveFeedProvider, StoryProvider, ThemeProvider.
  shell/ map/ kpi/ charts/ live/ table/ time/ story/ ask/ whatif/ ui/
lib/                     selectors, layers, ask, whatif, theme, format, motion, i18n.
data/                    The mock dataset (see below).
types/dashboard.ts       Shared vocabulary.
```

### State

One context holds `selectedDistrict`, `selectedYear`, `activeLayer` and
`period`; they are bundled as `selection` so every selector takes a single
argument. `lib/selectors.ts` is the only place filtering happens, which is why
the KPIs, all four charts and the table always agree with each other.

### Mock data (`data/`)

| File | Contents |
| --- | --- |
| `districts.json` | 6 districts: bilingual name, SVG path on an 800×600 viewBox, centroid, `establishedYear`, and population / energy / water / air / requests for every year 2024–2035. |
| `kpis.json` | 4 KPI *definitions*. Values are computed from `districts.json`, not hardcoded, so filters actually move them. |
| `requests.json` | 30 operational rows dated against the portal's "now" (2026-09-21). |
| `alerts.json` | 14 alert templates the live feed draws from. |
| `ask-the-city.json` | 10 questions: keyword sets per locale, answer templates, and a named computation. |

Regenerate with `node scripts/generate-mock-data.mjs`. It is deterministic, so
re-running reproduces the same files byte for byte.

## Colour

`lib/theme.ts` holds two palettes, and the distinction matters.

`BRAND` is the literal brand palette (velvet, evergreen, emerald, vermilion,
orchid, sunburst, gold gradient) and is used for **UI chrome** — sidebar,
buttons, badges, map outlines.

`CHART_COLORS_*` are the **series** colours: the same brand hues in the same
order, re-stepped in lightness. The literal values fail as a categorical
palette — evergreen `#3D4E1E` and emerald `#143534` are both near-black and
low-chroma, sitting only ΔE 11.6 apart under normal vision, which is
indistinguishable in a donut. Holding each hue fixed and moving only its
lightness into the legible band clears the separation gates in both themes.

Colour follows the entity, not its rank: each metric owns one slot
(`METRIC_SLOT`) and wears it on the map ramp, its KPI card and its chart, so
energy is gold in all three places. Map layers use one-hue sequential ramps
(`lib/layers.ts`), monotone in lightness.

## RTL and mobile

Arabic is the default and RTL throughout. Layout uses logical properties
(`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`) — no `left`/`right`.
Recharts is not RTL-aware, so `useChartDirection()` centralises the reversed
category axis and right-hand value axis. The **SVG map is never mirrored**:
geography stays fixed, only the chrome flips.

Under `md` the sidebar becomes a bottom tab bar, the drawer becomes a bottom
sheet, and the requests table scrolls inside its own container so the page body
never scrolls sideways.

## Reduced motion

`prefers-reduced-motion: reduce` disables count-up ramps, chart animations,
pulses, slide-ins and story auto-advance. Every feature stays usable — only the
motion goes. Gated centrally in `lib/motion.ts`, with a CSS backstop in
`app/globals.css`.

## Not implemented

Only Overview is built. Requests, Properties, City Live, Reports and Settings
are present in the navigation as placeholders and do not navigate. "Export PDF"
is a mock that opens the browser print dialog.
