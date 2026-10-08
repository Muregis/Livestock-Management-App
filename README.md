# Smart Livestock Management — MVP

A livestock operations prototype focused on records, health tracking, task management, and basic analytics.

**Live demo:** [livestock-management-app.vercel.app](https://livestock-management-app.vercel.app)

## What this project covers

- Dashboard with livestock and operational metrics
- Health monitoring views (alerts, treatments, vaccination scheduling UI)
- Task management (assignment, priority, progress)
- Role-based UI structure
- MySQL-backed data model (see `database/` and `MYSQL_SETUP.md`)

## Tech stack

| Layer | Stack |
|-------|--------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, Shadcn-style components |
| Charts | Recharts |
| Routing | React Router |

## Getting started

```bash
# Prerequisites: Node.js 18+
npm install
cp .env.example .env   # configure DB / API URLs as needed
npm run dev
```

See `MYSQL_SETUP.md` and `CORE_FEATURES.md` for database setup and feature notes.

## Project status

This is an **MVP / prototype**. Some features (e.g. blockchain, advanced disease detection) are sketched in the UI or docs and are not production-hardened. Treat the live demo as a product exploration surface, not a finished commercial system.

## License

MIT (if a LICENSE file is present in the repo).

---

Built by Victor Muregi
