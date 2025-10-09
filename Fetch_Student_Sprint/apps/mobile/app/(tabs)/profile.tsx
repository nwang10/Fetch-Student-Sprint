import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Crown, Award, Calendar, Settings } from 'lucide-react-native';
import { useProfile } from '../../src/hooks/useProfile';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-8">
        <Text className="text-gray-500 text-center">Failed to load profile</Text>
      </View>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-yellow-500 bg-yellow-50';
      case 'epic':
        return 'border-purple-500 bg-purple-50';
      case 'rare':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" testID="profile-screen">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-gray-900">Profile</Text>
          <TouchableOpacity
            className="p-2"
            testID="settings-button"
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Settings size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center">
          <Image
            source={{ uri: profile.avatar || 'https://via.placeholder.com/120' }}
            style={{ width: 120, height: 120, borderRadius: 60 }}
            accessibilityLabel={`${profile.username}'s profile picture`}
          />
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {profile.displayName}
          </Text>
          <Text className="text-base text-gray-600">@{profile.username}</Text>
          {profile.bio && (
            <Text className="text-sm text-gray-600 text-center mt-2 px-8">
              {profile.bio}
            </Text>
          )}

          {/* Stats Row */}
          <View className="flex-row gap-8 mt-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {profile.flipsCount}
              </Text>
              <Text className="text-sm text-gray-600">Flips</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {profile.followersCount}
              </Text>
              <Text className="text-sm text-gray-600">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {profile.followingCount}
              </Text>
              <Text className="text-sm text-gray-600">Following</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Points & Crowns */}
      <View className="px-4 mt-4">
        <View className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Award size={24} color="white" />
                <Text className="text-white text-lg font-semibold">Total Points</Text>
              </View>
              <Text className="text-white text-4xl font-bold">
                {profile.totalPoints.toLocaleString()}
              </Text>
            </View>

            <View className="items-center bg-white/20 rounded-2xl p-4">
              <Crown size={32} color="white" fill="white" />
              <Text className="text-white text-2xl font-bold mt-2">
                {profile.crowns}
              </Text>
              <Text className="text-white text-xs">Crowns</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Badges */}
      <View className="px-4 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900">Badges</Text>
          <Text className="text-sm text-gray-600">
            {profile.badges.length} earned
          </Text>
        </View>

        {profile.badges.length > 0 ? (
          <View className="flex-row flex-wrap gap-3">
            {profile.badges.map((badge, index) => (
              <Animated.View
                key={badge.id}
                entering={FadeInDown.delay(index * 100)}
                className="w-[30%]"
              >
                <TouchableOpacity
                  className={`rounded-2xl border-2 p-4 items-center ${getRarityColor(
                    badge.rarity
                  )}`}
                  testID={`badge-${badge.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={badge.name}
                  accessibilityHint={badge.description}
                >
                  <Image
                    source={{ uri: badge.iconUrl }}
                    style={{ width: 48, height: 48 }}
                    contentFit="contain"
                  />
                  <Text
                    className="text-xs font-semibold text-gray-900 text-center mt-2"
                    numberOfLines={2}
                  >
                    {badge.name}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Calendar size={10} color="#9ca3af" />
                    <Text className="text-xs text-gray-500">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
            <Award size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-center mt-4">
              No badges yet
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Complete challenges to earn badges!
            </Text>
          </View>
        )}
      </View>

      {/* Recent Flips */}
      <View className="px-4 mt-6 pb-8">
        <Text className="text-xl font-bold text-gray-900 mb-4">Recent Flips</Text>
        <View className="bg-white rounded-2xl p-8 items-center border border-gray-200">
          <Text className="text-gray-500 text-center">
            Your recent flips will appear here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
