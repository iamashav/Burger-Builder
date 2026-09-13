# Pearl & Leaf

A bubble tea builder. Pick a cup size, tea, milk, sweetness and ice, then stack toppings and reorder
the layers. The cup redraws live, and price, calories and allergens update as you go. Undo anything,
share a drink as a link, save favourites to your account, and order several drinks for pickup or
delivery.

**Live:** https://pearl-and-leaf.web.app

> Grew out of a 2021 React course exercise; redesigned as a different product and rebuilt from
> scratch in 2026.

## Features

- **Layered drinks.** Toppings form an ordered stack (up to four scoops) drawn as an SVG cup.
  Reorder by drag and drop, with the up/down buttons, or with Alt + ↑/↓ on a focused layer.
- **Undo / redo** for every change, including reorders and loading a shared drink
  (Ctrl+Z / Ctrl+Shift+Z).
- **Menu data with dietary filters.** Each item carries price, calories, allergens and
  animal/caffeine flags. Vegan, dairy-free and caffeine-free filters disable options that do not
  fit and say why.
- **Shareable links.** `/?d=L.mat.oat.25.no.pop-fom` rebuilds a drink. Codes are short and readable,
  and validated against the menu.
- **Favourites** saved per account, which you can load, share, add to an order or delete.
- **Cart and checkout.** Order several drinks at once for pickup (with a time slot) or delivery.
  The cart survives a reload.
- **Order history** with "Make again" on every drink.

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
| Hosting | Firebase Hosting, deployed manually |

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
| `npm run deploy` | Build, then deploy hosting and database rules |

## Architecture

```
src/
├── components/   presentational components, one PascalCase folder each
├── routes/       page components, lazy-loaded except the builder
├── store/        Redux Toolkit slices, the undo history reducer, RTK Query APIs
├── data/         typed menu catalogue and brand constants
├── lib/          pure domain logic (pricing, nutrition, share codes) and small hooks
├── types/        shared domain types
└── test/         Vitest setup and specs
```

| Slice | Holds |
| --- | --- |
| `drink` | The drink being built, wrapped in `undoable()` as `{ past, present, future }` |
| `filters` | Active dietary filters |
| `cart` | Order lines `{ id, drink, quantity }`, persisted to localStorage |
| `auth` | The session; a listener middleware owns persistence and a single auto-logout timer |
| `dbApi`, `authApi` | RTK Query: orders, favourites, sign-in; loading, error and cache invalidation |

## Design decisions

- **Undo is a generic higher-order reducer** (`store/history.ts`), not something built into the
  drink slice. It skips actions that change nothing, caps the history, and merges consecutive
  actions that share a key, so dragging the sweetness slider undoes in one step.
- **Price and nutrition are derived, never stored.** `lib/drink.ts` computes them from the drink
  with pure functions, so they cannot drift from what is on screen. Prices are rounded to whole
  cents to avoid float noise.
- **Anything read back is untrusted.** Share codes, localStorage and database records all pass
  through `parseDrink`, which accepts only drinks this menu can make. It also restores `layers`,
  because the Realtime Database drops empty arrays. Unknown records are skipped rather than
  crashing a page.
- **Layers are ordered, and order is identity.** Two drinks with the same toppings in a different
  order are different drinks: separate cart lines, separate share codes.
- **Server timestamps.** Orders and favourites send `{".sv": "timestamp"}`, and the rules require
  `createdAt === now`, so clients cannot backdate records.
- **The database rules are in the repo** (`database.rules.json`) and deploy with the app.

## Where data is stored

**Firebase Realtime Database**, accessed over its REST API with the ID token as `?auth=`:

| Path | Used for |
| --- | --- |
| `POST /orders.json` | Placing an order: lines, total, fulfilment, contact, `userId`, `createdAt` |
| `GET /orders.json?orderBy="userId"&equalTo="<uid>"` | That account's order history |
| `GET/POST /favourites/<uid>.json` | Listing and saving favourites |
| `DELETE /favourites/<uid>/<id>.json` | Removing a favourite |

The rules deny everything by default. A user can list only their own orders, through that exact
query. Orders can be created but never edited. `favourites/<uid>` is private to its owner. The
shape of every write is validated.

**Firebase Authentication** (email/password) through the Identity Toolkit REST API.

**Browser `localStorage`** holds the session (`pearl-and-leaf.session`) and the cart
(`pearl-and-leaf.cart`).

## Configuration

`.env` carries the Firebase web config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_DB_URL=...
```

These are committed on purpose. A [Firebase web API key is a public
identifier](https://firebase.google.com/docs/projects/api-keys), not a credential. It ships in any
production bundle regardless, and access is controlled by the database rules rather than by
keeping the key hidden. Override them locally with `.env.local`, which is gitignored.

### API key restrictions

The key is restricted in [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials?project=pearl-and-leaf)
so it only works from this app.

| Restriction | Allowed |
| --- | --- |
| Websites | `https://pearl-and-leaf.web.app/*`, `https://pearl-and-leaf.firebaseapp.com/*`, `http://localhost:5173/*`, `http://localhost:4173/*` |
| APIs | Identity Toolkit API, Token Service API |

- **Ports are fixed.** `npm run dev` uses 5173 and `npm run preview` uses 4173, both with
  `strictPort` in `vite.config.ts`. If a port is taken, Vite exits instead of moving to another
  port, where sign-in would fail with `API_KEY_HTTP_REFERRER_BLOCKED`. Free the port rather than
  changing it. A new port or domain has to be added to the key's website list first. Google does
  not accept a wildcard port such as `localhost:*`.
- **Tests do not need the key.** Vitest stubs `fetch`, so the restrictions never affect
  `npm test` or CI.
- **Only sign-in uses the key.** Realtime Database requests are authorised by the user's ID token
  and `database.rules.json` instead. If the app starts calling another Google API with the key,
  that API has to be added to the key's API list.

## Deployment

Deploys are manual:

```bash
npm run deploy
```

That typechecks, builds to `dist/`, and uploads both the site and `database.rules.json`. It uses
`npx`, so no global install is needed.

First time only, authenticate the CLI (this opens a browser):

```bash
npx --yes firebase-tools login
```

CI is separate and needs no credentials. `.github/workflows/ci.yml` runs lint, tests and a build on
every push to `master` and every pull request. It never deploys.
