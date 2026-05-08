# ArtisanBridge

Full-stack React and Express app for connecting clients with artists and creative freelancers.

## Local Development

Requires Node.js 20.x.

1. Copy env examples as needed:
   - `backend/.env.example` to `backend/.env`
   - `frontend/.env.example` to `frontend/.env` if you need a custom API base
2. Install dependencies:

```bash
npm run install:all
```

3. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000` (`GET /api/health`)

## Production

```bash
npm run install:all
npm run build
npm run start
```

Set a strong `JWT_SECRET`, production `MONGO_URI`, and matching `FRONTEND_ORIGIN` before deploying. See `DEPLOYMENT_GUIDE.md` for the full checklist.
