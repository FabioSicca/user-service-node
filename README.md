# user-service-node

User management API with email/password login and social OAuth 2.0 (Google and GitHub). After a successful OAuth callback the service issues the same JWT used by `/auth/login`.

## Environment

Copy `.env.example` to `.env` and fill in:

- `DB_*` — PostgreSQL connection
- `JWT_SECRET` — signs access tokens
- `COOKIE_SECRET` — signs the short-lived OAuth `state` cookie
- `OAUTH_BASE_URL` — public origin of this API (e.g. `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

Register these redirect URIs with the providers:

- `{OAUTH_BASE_URL}/auth/google/callback`
- `{OAUTH_BASE_URL}/auth/github/callback`

## Scripts

```bash
npm run dev
npm run db:generate
npm run db:migrate
```

Open `http://localhost:3000/docs` for Swagger. Social login is browser-based: visit `/auth/google` or `/auth/github`.
