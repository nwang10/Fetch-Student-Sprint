# Contributing Guide

Thank you for your interest in contributing to Fetch Student Sprint! This guide will help you get started.

## Development Workflow

### 1. Setting Up Your Environment

```bash
# Clone the repository
git clone <repository-url>
cd Fetch_Student_Sprint

# Install dependencies
pnpm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/mobile/.env.example apps/mobile/.env

# Start Docker services
pnpm docker:up
```

### 2. Creating a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 3. Making Changes

1. Make your changes in the appropriate package or app
2. Write or update tests as needed
3. Ensure your code follows the project style

### 4. Testing Your Changes

```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Build to ensure no build errors
pnpm build
```

### 5. Committing Your Changes

We follow conventional commits. Your commit messages should follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(backend): add user authentication endpoint"
git commit -m "fix(admin): resolve dashboard layout issue"
git commit -m "docs: update setup instructions"
```

### 6. Pushing and Creating a Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

## Code Style

### TypeScript

- Use TypeScript for all new code
- Use strict type checking
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names

### React/React Native

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Follow the existing component structure

### Imports

Organize imports in this order:
1. External libraries
2. Internal absolute imports
3. Internal relative imports

```typescript
// External
import { useState } from 'react';
import { View, Text } from 'react-native';

// Internal absolute
import { Button } from '@repo/ui';
import { User } from '@repo/types';

// Internal relative
import { Header } from './Header';
```

### File Naming

- React components: `PascalCase.tsx`
- Utilities/helpers: `camelCase.ts`
- Types/interfaces: `PascalCase.ts`
- Tests: `*.test.ts` or `*.test.tsx`

## Project Structure

```
├── apps/
│   ├── mobile/       # React Native app
│   ├── admin/        # Next.js admin
│   └── backend/      # Express API
└── packages/
    ├── ui/           # Shared components
    ├── types/        # Shared types
    └── config/       # Shared configs
```

### Adding a New Package

1. Create a new directory in `packages/`
2. Add a `package.json` with name `@repo/package-name`
3. Add to workspace by ensuring it matches the pattern in `pnpm-workspace.yaml`
4. Install in consuming apps: `pnpm add @repo/package-name --workspace`

### Adding Dependencies

```bash
# Add to root
pnpm add -w <package>

# Add to specific workspace
pnpm add <package> --filter <workspace-name>

# Examples
pnpm add lodash --filter backend
pnpm add -D typescript --filter @repo/types
```

## Testing

### Unit Tests

- Place test files next to the code they test
- Name them `*.test.ts` or `*.test.tsx`
- Write tests for utility functions and business logic

### Integration Tests

- Place in `__tests__` directories
- Test API endpoints, database operations, etc.

## Documentation

- Update README.md if you change setup or architecture
- Add JSDoc comments for public APIs
- Update SETUP.md if you change the setup process
- Add inline comments for complex logic

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project style
- [ ] All tests pass (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] No type errors (`pnpm type-check`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated if needed

### PR Description

Include:
1. What changes you made
2. Why you made them
3. How to test the changes
4. Screenshots (for UI changes)
5. Related issues (if any)

Example:
```markdown
## Changes
- Added user authentication endpoint
- Created login form component
- Added JWT token generation

## Why
Implements user authentication as per issue #123

## Testing
1. Start the backend: `pnpm --filter backend dev`
2. Visit http://localhost:3000/api/auth/login
3. Test with credentials: user@example.com / password123

## Related Issues
Closes #123
```

## Getting Help

- Check existing issues on GitHub
- Ask questions in pull request comments
- Review the documentation in README.md and SETUP.md

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the golden rule: treat others as you want to be treated

Thank you for contributing! 🚀
