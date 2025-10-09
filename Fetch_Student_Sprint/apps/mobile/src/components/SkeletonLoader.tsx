import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, className = '' }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.6]),
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        { width, height, borderRadius },
      ]}
      className={`bg-gray-300 ${className}`}
      accessibilityLabel="Loading"
    />
  );
}

export function FlipCardSkeleton() {
  return (
    <View className="h-full w-full bg-gray-900 justify-end p-4">
      <View className="absolute inset-0">
        <Skeleton width="100%" height="100%" borderRadius={0} />
      </View>

      {/* User info skeleton */}
      <View className="absolute top-12 left-4 flex-row items-center">
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={120} height={16} borderRadius={8} className="ml-3" />
      </View>

      {/* Actions skeleton */}
      <View className="absolute right-4 bottom-32 space-y-6">
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      {/* Caption skeleton */}
      <View className="mb-6 space-y-2">
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
}

export function ChallengeCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-md mb-4 p-4">
      <Skeleton width="100%" height={180} borderRadius={12} className="mb-4" />
      <Skeleton width="70%" height={20} className="mb-2" />
      <Skeleton width="90%" height={16} className="mb-4" />
      <View className="flex-row gap-2">
        <Skeleton width={80} height={14} />
        <Skeleton width={80} height={14} />
      </View>
    </View>
  );
}

export function LeaderboardEntrySkeleton() {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-center">
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={48} height={48} borderRadius={24} className="ml-4" />
        <View className="flex-1 ml-3 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </View>
        <Skeleton width={60} height={24} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="bg-white p-6">
      <View className="items-center">
        <Skeleton width={120} height={120} borderRadius={60} className="mb-4" />
        <Skeleton width={150} height={24} className="mb-2" />
        <Skeleton width={100} height={16} className="mb-4" />

        <View className="flex-row gap-8 mt-4">
          <View className="items-center">
            <Skeleton width={40} height={24} className="mb-1" />
            <Skeleton width={50} height={14} />
          </View>
          <View className="items-center">
            <Skeleton width={40} height={24} className="mb-1" />
            <Skeleton width={50} height={14} />
          </View>
          <View className="items-center">
            <Skeleton width={40} height={24} className="mb-1" />
            <Skeleton width={50} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
}
