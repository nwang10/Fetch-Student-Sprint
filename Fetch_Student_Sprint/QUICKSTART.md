# Quick Start Guide

Get up and running in 5 minutes! 🚀

## Prerequisites

Ensure you have these installed:
- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm 8+ (`npm install -g pnpm`)
- Docker Desktop ([Download](https://www.docker.com/get-started))

## 1. Install Dependencies

```bash
pnpm install
```

⏱️ This will take 1-2 minutes

## 2. Set Up Environment Files

```bash
# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env
```

💡 You can edit these files later if needed

## 3. Start Docker Services

```bash
pnpm docker:up
```

⏱️ This starts PostgreSQL and Redis

## 4. Start Development

### Option A: Start Everything

```bash
pnpm dev
```

This starts:
- Backend API → http://localhost:3000
- Admin Dashboard → http://localhost:3001
- Mobile App → Follow Expo CLI instructions

### Option B: Start Individual Apps

**Backend Only:**
```bash
pnpm --filter backend dev
```

**Admin Dashboard Only:**
```bash
pnpm --filter admin dev
```

**Mobile App Only:**
```bash
pnpm --filter mobile dev
```

## What You Get

### 1. Backend API (http://localhost:3000)

Try the health check:
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Admin Dashboard (http://localhost:3001)

Open in your browser to see the admin interface.

### 3. Mobile App

After running `pnpm --filter mobile dev`:
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator
- Press `w` for Web Browser
- Scan QR code with Expo Go app

## Project Structure

```
Fetch_Student_Sprint/
├── apps/
│   ├── backend/     → Node.js + Express API
│   ├── admin/       → Next.js 14 Admin Dashboard
│   └── mobile/      → React Native + Expo App
└── packages/
    ├── ui/          → Shared components
    ├── types/       → Shared types & schemas
    └── config/      → Shared configs
```

## Common Commands

```bash
# Development
pnpm dev                    # Start all apps

# Individual apps
pnpm --filter backend dev   # Backend only
pnpm --filter admin dev     # Admin only
pnpm --filter mobile dev    # Mobile only

# Docker
pnpm docker:up              # Start services
pnpm docker:down            # Stop services
pnpm docker:logs            # View logs

# Code quality
pnpm lint                   # Lint code
pnpm type-check             # Type check
pnpm format                 # Format code

# Build
pnpm build                  # Build all apps
```

## Next Steps

1. ✅ **Explore the code**
   - Check out `apps/backend/src/index.ts`
   - Look at `apps/admin/app/page.tsx`
   - Review `apps/mobile/app/index.tsx`

2. ✅ **Read the docs**
   - [README.md](./README.md) - Full overview
   - [SETUP.md](./SETUP.md) - Detailed setup
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
   - [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete structure

3. ✅ **Start building**
   - Add your first API endpoint in `apps/backend/src/routes/`
   - Create a new page in `apps/admin/app/`
   - Build a screen in `apps/mobile/app/`

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is taken:
- Backend: Edit `PORT` in `apps/backend/.env`
- Admin: Edit `-p` flag in `apps/admin/package.json` dev script

### Docker Won't Start

```bash
# Stop everything
pnpm docker:down

# Remove volumes
docker-compose down -v

# Start fresh
pnpm docker:up
```

### Build Errors

```bash
# Clean everything
pnpm clean

# Reinstall
pnpm install
```

## Need Help?

- 📖 Check [SETUP.md](./SETUP.md) for detailed instructions
- 🐛 Check GitHub Issues
- 💬 Ask in pull request comments

---

Happy coding! 🎉
