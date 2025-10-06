# Setup Guide

This guide will help you get started with the Fetch Student Sprint monorepo.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (v8 or higher) - Install with: `npm install -g pnpm`
- **Docker & Docker Compose** - [Download](https://www.docker.com/get-started)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all packages and apps in the monorepo.

### 2. Set Up Environment Variables

Copy the example environment files and update them with your values:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Admin Dashboard
cp apps/admin/.env.example apps/admin/.env

# Mobile App
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Start Docker Services

Start PostgreSQL and Redis:

```bash
pnpm docker:up
```

This will start:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

To view logs:
```bash
pnpm docker:logs
```

To stop services:
```bash
pnpm docker:down
```

### 4. Run the Applications

#### Option A: Run All Apps Together

```bash
pnpm dev
```

This will start all apps in development mode.

#### Option B: Run Individual Apps

**Backend API:**
```bash
pnpm --filter backend dev
```
API will be available at http://localhost:3000

**Admin Dashboard:**
```bash
pnpm --filter admin dev
```
Dashboard will be available at http://localhost:3001

**Mobile App:**
```bash
pnpm --filter mobile dev
```
Then follow the Expo CLI instructions to run on iOS/Android/Web.

## Verify Everything Works

### 1. Check Backend Health

Visit http://localhost:3000/health - you should see:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Check Admin Dashboard

Visit http://localhost:3001 - you should see the admin dashboard.

### 3. Check Mobile App

After running `pnpm --filter mobile dev`, you can:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web Browser

## Building for Production

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter backend build
pnpm --filter admin build
pnpm --filter mobile build
```

## Running Tests & Linting

```bash
# Lint all code
pnpm lint

# Type check all code
pnpm type-check

# Run tests (when added)
pnpm test

# Format code
pnpm format
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:
- Backend (3000): Change `PORT` in `apps/backend/.env`
- Admin (3001): Change the port in `apps/admin/package.json` dev script
- Postgres (5432): Change the port mapping in `docker-compose.yml`
- Redis (6379): Change the port mapping in `docker-compose.yml`

### Docker Issues

If Docker services fail to start:
```bash
# Stop all services
pnpm docker:down

# Remove volumes
docker-compose down -v

# Start fresh
pnpm docker:up
```

### Dependency Issues

If you encounter dependency issues:
```bash
# Clean everything
pnpm clean

# Reinstall
pnpm install
```

### TypeScript Errors

If you see TypeScript errors:
```bash
# Run type check to see detailed errors
pnpm type-check
```

## Next Steps

1. Explore the codebase structure in `README.md`
2. Check out the example code in each app
3. Start building your features!

## Need Help?

- Check the main `README.md` for architecture details
- Review the code examples in each app
- Check GitHub Issues for known problems
