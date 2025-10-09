import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Trophy, Users, Clock } from 'lucide-react-native';
import { Challenge } from '@repo/types';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  onPress: () => void;
}

export function ChallengeCard({ challenge, index, onPress }: ChallengeCardProps) {
  const isThresholdUnlock = challenge.type === 'threshold_unlock';
  const progress = challenge.threshold
    ? (challenge.currentProgress / challenge.threshold) * 100
    : 0;

  const getStatusColor = () => {
    switch (challenge.status) {
      case 'live':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (challenge.status) {
      case 'live':
        return 'LIVE NOW';
      case 'upcoming':
        return 'COMING SOON';
      case 'completed':
        return 'ENDED';
      default:
        return challenge.status.toUpperCase();
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl overflow-hidden shadow-md mb-4"
        testID={`challenge-card-${challenge.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${challenge.name} challenge`}
        accessibilityHint={`Status: ${challenge.status}, ${challenge.participants} participants`}
      >
        {/* Image Header */}
        {challenge.imageUrl && (
          <Image
            source={{ uri: challenge.imageUrl }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
          />
        )}

        {/* Status Badge */}
        <View className={`absolute top-4 right-4 ${getStatusColor()} rounded-full px-3 py-1`}>
          <Text className="text-white text-xs font-bold">{getStatusText()}</Text>
        </View>

        {/* Content */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-2">{challenge.name}</Text>
          <Text className="text-sm text-gray-600 mb-4" numberOfLines={2}>
            {challenge.description}
          </Text>

          {/* Progress Bar for Threshold Unlock */}
          {isThresholdUnlock && challenge.threshold && (
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-700">Community Progress</Text>
                <Text className="text-sm font-bold text-primary-600">
                  {challenge.currentProgress.toLocaleString()} / {challenge.threshold.toLocaleString()}
                </Text>
              </View>
              <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <Animated.View
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-700"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {progress.toFixed(1)}% unlocked
              </Text>
            </View>
          )}

          {/* Stats Row */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Users size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600">
                {challenge.participants.toLocaleString()}
              </Text>
            </View>

            {challenge.prize && (
              <View className="flex-row items-center gap-1">
                <Trophy size={16} color="#eab308" />
                <Text className="text-sm text-yellow-600 font-medium">
                  {challenge.prize}
                </Text>
              </View>
            )}

            <View className="flex-row items-center gap-1">
              <Clock size={16} color="#6b7280" />
              <Text className="text-sm text-gray-600">
                {new Date(challenge.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
