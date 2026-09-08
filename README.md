# Burger Builder

Build a burger ingredient by ingredient, watch the price update live, then sign in and order it.
Orders are stored per account and listed back on an orders page.

**Live:** https://my-react-burgerbuilder-app.web.app

## Stack

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| Language | TypeScript 6 (strict) |
| UI | React 19 |
| State | Redux Toolkit + RTK Query |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 (`@theme` tokens, no config file) |
| Fonts | Self-hosted via `@fontsource` |
| Lint | oxlint |
| Tests | Vitest + Testing Library |
| Backend | Firebase Realtime Database + Firebase Auth, over REST |
| Hosting | Firebase Hosting, deployed from GitHub Actions |

## Quickstart

Requires Node 20 or newer (see `.nvmrc`).

```bash
npm install
npm run dev
```

| Script | Does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Typecheck then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Build and deploy to Firebase Hosting |

## Architecture

```
src/
├── components/   presentational components, one PascalCase folder each
├── routes/       page components, lazy-loaded except the builder
├── store/        Redux Toolkit slices and RTK Query APIs
├── data/         typed constants — prices, labels, form field config
├── lib/          cn() class helper, form validation
├── types/        shared domain types
└── test/         Vitest setup and specs
```

State is split in two:

- **`burgerSlice`** holds only the ingredient counts. The total price is a derived selector
  (`selectTotalPrice`) rather than stored state, so it can never disagree with what is on screen.
- **`authSlice`** holds the session. A listener middleware owns persistence and a single
  cancellable auto-logout timer.

All network access goes through RTK Query (`dbApi`, `authApi`), which supplies the loading, error
and cache-invalidation states the UI renders.

## Where data is stored

**Firebase Realtime Database** (project `my-react-burgerbuilder-app`), accessed over its REST API:

| Path | Used for |
| --- | --- |
| `GET /ingredients.json` | Starting ingredient counts. Readable without auth. |
| `POST /orders.json?auth=<token>` | Placing an order: ingredients, price, contact details, `userId`. |
| `GET /orders.json?auth=<token>&orderBy="userId"&equalTo="<uid>"` | That account's order history. |

**Firebase Authentication** (email/password) through the Identity Toolkit REST API. Orders are
readable only by the account that placed them, enforced by the database rules.

**Browser `localStorage`** holds the session under `burger-builder.session` — the ID token, user id
and expiry timestamp. It is rehydrated on boot and cleared on logout or expiry.

## Configuration

`.env` carries the Firebase web config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_DB_URL=...
```

These are committed on purpose. A [Firebase web API key is a public
identifier](https://firebase.google.com/docs/projects/api-keys), not a credential — it ships in any
production bundle regardless, and access is controlled by the database rules rather than by keeping
the key hidden. Override them locally with `.env.local`, which is gitignored.

## Deployment

Deploys to Firebase Hosting are manual:

```bash
npm run deploy
```

That typechecks, builds to `dist/`, and uploads. It uses `npx`, so no global install is needed —
though `npm install -g firebase-tools` makes it faster if you deploy often.

First time only, authenticate the CLI (this opens a browser):

```bash
npx --yes firebase-tools login
```

CI is separate and needs no credentials: `.github/workflows/ci.yml` runs lint, tests and a build on
every push to `master` and every pull request. It never deploys.
