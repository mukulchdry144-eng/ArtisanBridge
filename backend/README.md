# Backend (Express)

## Setup

1. Copy `.env.example` to `.env`
2. Install deps: `npm install`
3. Run: `npm run dev`

## Database
- Default local development: file database `data/db.json`
- MongoDB (optional): set `MONGO_URI` in `backend/.env` and use `MONGO_DB_NAME=finalproject`
- Force local file storage while testing: set `STORAGE_DRIVER=file`
- Production: use MongoDB and do not deploy local `data/db.json`

Example MongoDB Atlas:
```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
MONGO_DB_NAME=finalproject
```

## Admin
- Seed or reset the admin account: `npm run seed:admin`
- Default seed login is for local development only. Override it before deployment.
- Override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `.env`
- Admin panel routes:
  - `POST /api/auth/admin-login`
  - `GET /api/admin/overview` (admin Bearer token)
  - `GET /api/admin/users` (admin Bearer token)
  - `PATCH /api/admin/users/:id` -> `{ role?, status? }` (admin Bearer token)
  - `GET /api/admin/inquiries` (admin Bearer token)
  - `PATCH /api/admin/inquiries/:id` -> `{ status }` (admin Bearer token)
  - `GET /api/admin/emails` (admin Bearer token)

## Email notifications
- Public request form: `POST /api/inquiries`
- Signup and request submissions create admin notifications and email logs.
- Add SMTP config in `.env` to send real email:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - `ADMIN_NOTIFY_EMAIL`
- Without SMTP, emails are stored as queued logs in the admin panel.

## API
- `GET /api/health`
- `POST /api/auth/register` -> `{ email, password, name?, role }`
- `POST /api/auth/login` -> `{ email, password }`
- `GET /api/auth/me` (Bearer token)
- `GET /api/todos` (Bearer token)
- `POST /api/todos` -> `{ title }` (Bearer token)
- `PATCH /api/todos/:id` -> `{ title?, completed? }` (Bearer token)
- `DELETE /api/todos/:id` (Bearer token)
