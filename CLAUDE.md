# Pearl & Leaf

See `README.md` for architecture, data model and deployment.

## Constraints that are easy to break

- **Local ports are fixed.** The Firebase API key only accepts `http://localhost:5173` (dev) and
  `http://localhost:4173` (preview), enforced by `strictPort` in `vite.config.ts`. Never pass
  `--port` or change these ports; sign-in fails with `API_KEY_HTTP_REFERRER_BLOCKED` anywhere else.
  If a port is busy, stop the process using it. Adding a port or domain means updating the key's
  website restrictions in Google Cloud first (see README → API key restrictions).
- **The Firebase web config in `.env` is public by design.** Never commit service account or Admin
  SDK credentials.
- **Database rules live in `database.rules.json`** and deploy with `npm run deploy`
  (hosting + database). Any new database path needs a rule, because the root denies everything.
- **Data read back is untrusted.** Drinks from storage, share links or the database must go through
  `parseDrink` in `src/lib/drink.ts`.
