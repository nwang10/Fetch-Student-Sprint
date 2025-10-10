# Fetch Mobile App

React Native mobile application built with Expo and NativeWind (Tailwind CSS).

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Start the development server:
```bash
npm start
```

3. Run on a platform:
```bash
npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # Web browser
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router app directory
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Root redirect to /feed
│   └── feed/
│       └── index.tsx      # Feed screen with posts
├── assets/                # Images and static assets
│   └── exmaple.png       # Example image for first post
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration with NativeWind
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── global.css            # Global Tailwind styles
└── package.json          # Dependencies and scripts
```

## Features

- **Feed Screen**: Scrollable social feed with posts
- **Interactive Elements**: Like and comment buttons with local state
- **NativeWind Styling**: Tailwind CSS for React Native
- **Expo Router**: File-based routing
- **TypeScript**: Full type safety

## Tech Stack

- Expo ~52.0.0
- React Native 0.76.5
- Expo Router ~4.0.0
- NativeWind ^4.0.1
- TypeScript ^5.3.3
