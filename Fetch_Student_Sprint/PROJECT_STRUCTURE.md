# Project Structure

Complete overview of the Fetch Student Sprint monorepo structure.

```
Fetch_Student_Sprint/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI pipeline
├── .vscode/
│   ├── settings.json                 # VS Code settings
│   └── extensions.json               # Recommended extensions
├── apps/
│   ├── backend/                      # Node.js + Express API
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── database.ts       # Postgres & Redis config
│   │   │   ├── middleware/
│   │   │   │   └── errorHandler.ts   # Error handling middleware
│   │   │   ├── routes/
│   │   │   │   └── user.ts           # User routes
│   │   │   └── index.ts              # App entry point
│   │   ├── .dockerignore
│   │   ├── .env.example              # Environment variables template
│   │   ├── .eslintrc.js              # ESLint config
│   │   ├── Dockerfile                # Docker configuration
│   │   ├── package.json
│   │   └── tsconfig.json             # TypeScript config
│   ├── admin/                        # Next.js 14 Admin Dashboard
│   │   ├── app/
│   │   │   ├── globals.css           # Global styles
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── page.tsx              # Home page
│   │   ├── .env.example              # Environment variables template
│   │   ├── .eslintrc.js              # ESLint config
│   │   ├── next.config.js            # Next.js config
│   │   ├── next-env.d.ts             # Next.js types
│   │   ├── package.json
│   │   ├── postcss.config.js         # PostCSS config
│   │   ├── tailwind.config.js        # Tailwind config
│   │   └── tsconfig.json             # TypeScript config
│   └── mobile/                       # React Native + Expo
│       ├── app/
│       │   ├── _layout.tsx           # Root layout
│       │   └── index.tsx             # Home screen
│       ├── assets/
│       │   └── .gitkeep              # Placeholder for assets
│       ├── .env.example              # Environment variables template
│       ├── .eslintrc.js              # ESLint config
│       ├── app.json                  # Expo config
│       ├── babel.config.js           # Babel config
│       ├── global.css                # Global styles
│       ├── package.json
│       ├── tailwind.config.js        # Tailwind/NativeWind config
│       └── tsconfig.json             # TypeScript config
├── packages/
│   ├── config/                       # Shared configurations
│   │   ├── eslint-preset.js          # ESLint preset
│   │   ├── prettier.config.js        # Prettier config
│   │   ├── typescript.json           # Base TypeScript config
│   │   └── package.json
│   ├── types/                        # Shared types & schemas
│   │   ├── src/
│   │   │   ├── user.ts               # User schemas (Zod)
│   │   │   └── index.ts              # Exports
│   │   ├── .eslintrc.js              # ESLint config
│   │   ├── package.json
│   │   └── tsconfig.json             # TypeScript config
│   └── ui/                           # Shared UI components
│       ├── src/
│       │   ├── components/
│       │   │   ├── Button.tsx        # Button component
│       │   │   ├── Card.tsx          # Card component
│       │   │   └── Input.tsx         # Input component
│       │   └── index.ts              # Exports
│       ├── .eslintrc.js              # ESLint config
│       ├── package.json
│       ├── tailwind.config.js        # Tailwind/NativeWind config
│       └── tsconfig.json             # TypeScript config
├── .gitignore                        # Git ignore rules
├── .prettierrc                       # Prettier config
├── docker-compose.yml                # Docker Compose config
├── Makefile                          # Make commands
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── turbo.json                        # Turbo config
├── CONTRIBUTING.md                   # Contributing guide
├── PROJECT_STRUCTURE.md              # This file
├── README.md                         # Project overview
└── SETUP.md                          # Setup instructions
```

## Apps

### Backend (`apps/backend`)
- **Tech**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via pg)
- **Cache**: Redis
- **Port**: 3000
- **Features**: REST API, User management, Health check

### Admin (`apps/admin`)
- **Tech**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Port**: 3001
- **Features**: Admin dashboard, User management UI

### Mobile (`apps/mobile`)
- **Tech**: React Native, Expo Router, TypeScript
- **Styling**: NativeWind (Tailwind for React Native)
- **Navigation**: Expo Router (file-based)
- **Features**: Mobile app, User interface

## Packages

### Config (`packages/config`)
Shared configuration files:
- ESLint preset
- TypeScript base config
- Prettier config

### Types (`packages/types`)
Shared TypeScript types and Zod schemas:
- User schema and types
- Validation schemas
- Exported via `@repo/types`

### UI (`packages/ui`)
Shared UI components for both web and mobile:
- Button, Card, Input components
- Works with both React (web) and React Native (mobile)
- Uses Tailwind/NativeWind
- Includes Lucide icons
- Exported via `@repo/ui`

## Infrastructure

### Docker
- **PostgreSQL**: Port 5432
- **Redis**: Port 6379
- **Backend**: Port 3000 (when running in Docker)

### CI/CD (GitHub Actions)
- Linting
- Type checking
- Testing
- Building all apps
- Docker image building

## Development Tools

### Turbo
- Manages build pipeline
- Handles caching
- Coordinates parallel builds

### pnpm
- Workspace management
- Dependency installation
- Efficient disk usage

### ESLint
- Code linting
- Consistent code style
- Shared configuration

### Prettier
- Code formatting
- Consistent style

### TypeScript
- Type checking
- Better DX
- Shared base config

## Key Features

### Monorepo Benefits
- Shared code between apps
- Consistent tooling
- Single source of truth
- Atomic commits across apps

### Type Safety
- End-to-end TypeScript
- Zod runtime validation
- Shared type definitions

### Developer Experience
- Hot reload in all apps
- Fast builds with Turbo
- Consistent code style
- Pre-configured tooling

### Production Ready
- Docker support
- CI/CD pipeline
- Environment management
- Build optimization

## Commands Quick Reference

```bash
# Development
pnpm dev                    # Start all apps
pnpm --filter backend dev   # Start backend only
pnpm --filter admin dev     # Start admin only
pnpm --filter mobile dev    # Start mobile only

# Building
pnpm build                  # Build all apps
pnpm --filter backend build # Build backend only

# Quality
pnpm lint                   # Lint all code
pnpm type-check             # Type check all code
pnpm test                   # Run all tests
pnpm format                 # Format all code

# Docker
pnpm docker:up              # Start services
pnpm docker:down            # Stop services
pnpm docker:logs            # View logs

# Maintenance
pnpm clean                  # Clean build artifacts
```

## Port Allocation

- **3000**: Backend API
- **3001**: Admin Dashboard
- **5432**: PostgreSQL
- **6379**: Redis
- **8081**: Expo Dev Server (mobile)

## Environment Variables

Each app has its own `.env.example` file:
- `apps/backend/.env.example` - Backend configuration
- `apps/admin/.env.example` - Admin configuration
- `apps/mobile/.env.example` - Mobile configuration

Copy these to `.env` and update with your values.
