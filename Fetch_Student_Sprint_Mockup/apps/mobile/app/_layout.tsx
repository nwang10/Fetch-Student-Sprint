import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="feed/index" />
      <Stack.Screen name="camera/index" />
      <Stack.Screen name="scan-results/index" />
      <Stack.Screen name="share-haul/index" />
      <Stack.Screen name="share-roast/index" />
      <Stack.Screen name="share-review/index" />
      <Stack.Screen name="review-camera/index" />
    </Stack>
  );
}
