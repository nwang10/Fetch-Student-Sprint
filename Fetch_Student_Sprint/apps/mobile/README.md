# Fetch Flips Mobile App

A social shopping rewards app built with React Native and Expo Router.

## Features

### 📱 Feed Screen
- Vertical scroll like Instagram Reels/TikTok
- Infinite scroll with optimistic likes
- Double-tap to like
- Video and image support
- Share functionality
- Challenge CTAs

### ✨ Create Flip Screen
- Camera integration
- Photo/video picker
- Receipt upload with OCR
- Auto-brand detection
- Points preview
- Caption with character limit

### 🏆 Challenges Screen
- Three tabs: Live, Upcoming, Completed
- Threshold unlock cards with progress bars
- Live participant counts
- Challenge details

### 📊 Store Leaderboards
- Store selector modal
- Weekly leaderboards
- Crown/badge display
- Rules modal
- Top 3 special styling

### 👤 Profile Screen
- User stats (flips, followers, following)
- Total points and crowns
- Badge collection with rarity colors
- Recent flips grid

### 📤 Share Card Preview
- Pre-rendered share cards
- Instagram, TikTok, Snapchat integration
- Deep link generation
- Screenshot capture for sharing

## Tech Stack

- **React Native** 0.76
- **Expo Router** 4.0 - File-based routing
- **TypeScript** - Type safety
- **NativeWind** 4.0 - Tailwind CSS for React Native
- **React Query** - Server state management
- **Zustand** - Client state management
- **Reanimated** 4.1 - Smooth animations
- **Expo AV** - Video playback
- **Expo Camera** - Camera access
- **Expo Image Picker** - Media selection

## Project Structure

```
apps/mobile/
├── app/
│   ├── (tabs)/
│   │   ├── feed.tsx           # Feed screen (Reels-like)
│   │   ├── create.tsx         # Create flip screen
│   │   ├── challenges.tsx     # Challenges with tabs
│   │   ├── leaderboards.tsx   # Store leaderboards
│   │   ├── profile.tsx        # User profile
│   │   └── _layout.tsx        # Tab navigator
│   ├── _layout.tsx            # Root layout
│   └── index.tsx              # Entry point
├── src/
│   ├── components/
│   │   ├── FlipCard.tsx       # Individual flip component
│   │   ├── ChallengeCard.tsx  # Challenge card
│   │   ├── ShareCardPreview.tsx # Share modal
│   │   └── SkeletonLoader.tsx # Loading states
│   ├── hooks/
│   │   ├── useFlips.ts        # Flip queries
│   │   ├── useChallenges.ts   # Challenge queries
│   │   ├── useLeaderboards.ts # Leaderboard queries
│   │   └── useProfile.ts      # Profile queries
│   ├── stores/
│   │   ├── flipsStore.ts      # Flip state (optimistic updates)
│   │   └── userStore.ts       # User state
│   └── lib/
│       └── api.ts             # API client
├── app.json                   # Expo configuration
└── babel.config.js            # Babel with reanimated plugin
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# From monorepo root
cd apps/mobile
pnpm install
```

### Development

```bash
# Start Expo dev server
pnpm dev

# Run on iOS
pnpm ios

# Run on Android
pnpm android

# Run on web (limited support)
pnpm web
```

## Key Features Implementation

### Optimistic UI Updates
The app uses Zustand and React Query for optimistic updates:
```typescript
const likeMutation = useLikeFlip();
likeMutation.mutate({ flipId, isLiked }); // Instant UI update
```

### Infinite Scroll
Feed implements infinite scroll with React Query:
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['flips'],
  queryFn: ({ pageParam }) => apiClient.getFlips(pageParam, 10),
});
```

### Smooth Animations
Uses Reanimated for 60fps animations:
```typescript
<Animated.View entering={FadeInDown.delay(index * 100)}>
  <ChallengeCard challenge={challenge} />
</Animated.View>
```

### Deep Linking
Deep link format: `fetchflips://flip/{flipId}`

## Accessibility

All components include:
- `accessibilityRole` - Button, text, image roles
- `accessibilityLabel` - Descriptive labels
- `accessibilityHint` - Additional context
- `testID` - For automated testing

Example:
```tsx
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Like this flip"
  accessibilityHint={`Currently has ${likeCount} likes`}
  testID="like-button"
>
```

## API Integration

The app uses a centralized API client (`src/lib/api.ts`) with:
- Type-safe requests using `@repo/types`
- Error handling
- Request/response interceptors
- OCR for receipt scanning

## Testing

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Build
pnpm build
```

## Environment Variables

Create `.env` from `.env.example`:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Performance Optimizations

- **FlipCard**: Uses `removeClippedSubviews` for better scroll performance
- **Pagination**: `maxToRenderPerBatch={3}` limits initial renders
- **Images**: Expo Image with built-in caching
- **Video**: Only plays when card is active

## Common Issues

### Video not playing
- Ensure media URI is accessible
- Check `isActive` prop is working
- Verify video codec compatibility

### Slow scroll performance
- Reduce `windowSize` in FlatList
- Enable `removeClippedSubviews`
- Optimize image sizes

### Camera permissions
- Check `app.json` has proper permissions
- Request permissions before use
- Handle permission denials gracefully

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the monorepo root.

## License

MIT
