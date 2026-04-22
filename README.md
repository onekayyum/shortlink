# Shortlink SaaS (Full-stack)

Production-style URL shortener with Next.js + Express and JSON storage designed for MongoDB migration.

## Features
- Username/password auth with bcrypt + JWT sessions.
- Login rate limiting + account lockout on repeated failure.
- Link creation modal with basic/advanced tabs.
- Custom slugs, auto IDs, password-protected links.
- Expiry validation and expired-link blocking.
- Geo/device-based redirect + fallback URL.
- Real click logs (timestamp, IP, country, device, OS, referrer) with de-dup protection.
- Analytics dashboard with daily graph and referrer breakdown.
- QR code modal + PNG download.
- User settings: username update, password update endpoint, defaults, API key regeneration, logout all sessions.
- API key endpoints for automation.
- Admin panel: users, links, SMTP + feature toggles + logs + global stats.
- Webhook callback per click.
- Security: helmet, validation, sanitization, malicious URL blocking, rate limiting.

## Monorepo structure
- `backend/` Express API + local JSON database.
- `frontend/` Next.js app (Tailwind + Framer Motion + Recharts).

## Environment
### Backend (`backend/.env`)
Copy `backend/.env.example`:
```bash
PORT=4000
BASE_URL=http://localhost:4000
JWT_SECRET=super-secret-change-this
```

### Frontend (`frontend/.env.local`)
Copy `frontend/.env.example`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Run locally
```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:4000`.

## API snippets
### Signup/Login
- `POST /auth/signup`
- `POST /auth/login`

### Link operations
- `POST /links` (JWT)
- `GET /links` (JWT)
- `GET /links/analytics/:id` (JWT)
- `GET /:code` redirect endpoint

### API-key automation
- `POST /links/api/create` with header `x-api-key`

### Admin
- `GET /admin/stats`
- `GET /admin/users`
- `PATCH /admin/users/:id/status`
- `DELETE /admin/users/:id`
- `GET|PATCH /admin/settings`

## Notes on scalability / Mongo migration
JSON collections already mirror document style (`users`, `links`, `clickLogs`, `settings`, `sessions`, `systemLogs`) so each module can be swapped to Mongo repositories with minimal route changes.
