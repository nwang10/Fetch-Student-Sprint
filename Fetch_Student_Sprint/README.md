# Fetch Student Sprint Monorepo

A full-stack TypeScript monorepo using pnpm, Turbo, and modern web technologies.

## 📚 Documentation

- **[Quick Start](./QUICKSTART.md)** - Get running in 5 minutes
- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[Architecture](./ARCHITECTURE.md)** - System architecture and design
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Complete file structure
- **[Summary](./SUMMARY.md)** - What's included in this project

## 📦 Project Structure

```
.
├── apps/
│   ├── mobile/          # React Native + Expo Router app
│   ├── admin/           # Next.js 14 admin dashboard
│   └── backend/         # Node.js + Express API
├── packages/
│   ├── ui/              # Shared React/React Native components
│   ├── types/           # Shared Zod schemas and TypeScript types
│   └── config/          # Shared ESLint, TypeScript, Prettier configs
└── docker-compose.yml   # Docker setup for Postgres + Redis
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for backend services)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Start individual apps
pnpm --filter backend dev
pnpm --filter admin dev
pnpm --filter mobile dev

# Start Docker services (Postgres + Redis)
docker-compose up -d
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter backend build
```

### Testing & Linting

```bash
# Run linting
pnpm lint

# Type check
pnpm type-check

# Run tests
pnpm test

# Format code
pnpm format
```

## 🏗️ Tech Stack

### Apps

- **mobile**: React Native, Expo Router, NativeWind, TypeScript
- **admin**: Next.js 14 (App Router), Tailwind CSS, TypeScript
- **backend**: Node.js, Express, TypeScript, Postgres, Redis

### Packages

- **ui**: Shared components with Tailwind/NativeWind, Lucide icons
- **types**: Zod schemas and TypeScript types
- **config**: Shared ESLint, TypeScript, and Prettier configurations

### Infrastructure

- **Monorepo**: pnpm workspaces + Turbo
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **CI/CD**: GitHub Actions
- **Containerization**: Docker + Docker Compose

## 📝 Available Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all apps
- `pnpm type-check` - Type check all apps
- `pnpm test` - Run tests
- `pnpm format` - Format code with Prettier
- `pnpm clean` - Clean build artifacts

## 🐳 Docker

Start the backend services:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Backend API on port 3000

## 📱 Apps

### Mobile App (Expo)

```bash
cd apps/mobile
pnpm dev

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

### Admin Dashboard (Next.js)

```bash
cd apps/admin
pnpm dev
```

Visit http://localhost:3001

### Backend API (Express)

```bash
cd apps/backend
pnpm dev
```

API available at http://localhost:3000

Health check: http://localhost:3000/health

## 🔧 Environment Variables

See `.env.example` files in each app directory for required environment variables.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm type-check`
4. Submit a pull request

## 📄 License

MIT
