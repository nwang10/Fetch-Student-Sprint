.PHONY: help install dev build clean docker-up docker-down docker-logs lint type-check test format

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

dev: ## Start all apps in development mode
	pnpm dev

build: ## Build all apps
	pnpm build

clean: ## Clean all build artifacts and dependencies
	pnpm clean

docker-up: ## Start Docker services (Postgres + Redis)
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

lint: ## Run linting
	pnpm lint

type-check: ## Run type checking
	pnpm type-check

test: ## Run tests
	pnpm test

format: ## Format code with Prettier
	pnpm format

setup: ## Initial setup (install + env files)
	@echo "Installing dependencies..."
	pnpm install
	@echo "\nCopying environment files..."
	cp -n apps/backend/.env.example apps/backend/.env 2>/dev/null || true
	cp -n apps/admin/.env.example apps/admin/.env 2>/dev/null || true
	cp -n apps/mobile/.env.example apps/mobile/.env 2>/dev/null || true
	@echo "\nSetup complete! Run 'make docker-up' to start services, then 'make dev' to start development."
