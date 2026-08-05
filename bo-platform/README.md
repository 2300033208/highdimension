# HD-BO Bench — High-Dimensional Bayesian Optimisation Benchmark & Algorithm-Selection Platform

A premium, Apple-inspired frontend for a research platform that benchmarks high-dimensional
Bayesian Optimisation algorithms (Vanilla BO, SAASBO, TuRBO, BAxUS, HEBO, Optuna, Random
Search, Grid Search) and recommends the best optimiser for a given problem.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · Framer Motion · React Router · TanStack Query ·
React Hook Form + Zod · Lucide Icons · Recharts

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  components/
    layout/        Navbar, Footer, AppShell (collapsible sidebar + topbar)
    ui/             Reusable primitives (Button, Card, Badge, Input, Progress…)
    OptimizationLandscape.tsx   Signature animated hero visual
  data/mock.ts      Realistic mock data (algorithms, datasets, experiments, users…)
  pages/            One file per route (see below)
  App.tsx           Route table + animated page transitions
  main.tsx          App entry point (Router + QueryClient providers)
```

## Routes

| Path | Page |
|---|---|
| `/` | Landing page (hero, features, algorithms, workflow, testimonials, FAQ) |
| `/login`, `/register`, `/forgot-password` | Authentication |
| `/dashboard` | Stat cards, quick actions, charts, recent experiments |
| `/upload` | Dataset drag-and-drop upload, preview, validation |
| `/experiment/new` | Experiment configuration & launch |
| `/benchmark` | Benchmark comparison dashboard (convergence, radar, scatter, ranking) |
| `/recommendation` | Recommended optimiser with reasoning & alternatives |
| `/visualisations` | Interactive analytics, filters, parallel coordinates, leaderboard |
| `/reports` | Generate PDF / CSV / Excel reports |
| `/admin` | User, experiment and system-log management |
| `/profile`, `/settings` | Profile and account settings |
| `/research` | Literature review, methodology, references |

## Notes

- All data is realistic mock data in `src/data/mock.ts` — there is no backend. Swap in
  real API calls (Axios + TanStack Query hooks) by replacing the imports in each page.
- Every route is wired up in `App.tsx`; there are no dead links or placeholder screens.
- Design tokens (colors, radii, shadows) live in `tailwind.config.js`; the signature motif
  (an animated contour/converging-optimum visual) lives in `OptimizationLandscape.tsx` and
  is reused on the landing hero and the 404 page.
- This code was generated without network access to run `npm install`, so dependency
  versions have not been build-verified in this environment — please run `npm install`
  locally and report any version mismatches.
