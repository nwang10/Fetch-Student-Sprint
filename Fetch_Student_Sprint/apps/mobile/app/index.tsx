import { View, Text } from 'react-native';
import { Button, Card } from '@repo/ui';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const handlePress = () => {
    console.log('Button pressed!');
  };

  return (
    <View className="flex-1 bg-gray-50 p-4 justify-center">
      <StatusBar style="auto" />

      <Card className="mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Mobile App
        </Text>
        <Text className="text-gray-600 mb-4">
          This is a React Native app with Expo Router and NativeWind.
        </Text>
        <Button title="Get Started" onPress={handlePress} variant="primary" />
      </Card>
    </View>
  );
}
