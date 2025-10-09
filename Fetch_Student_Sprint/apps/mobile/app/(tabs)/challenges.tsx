import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useChallenges } from '../../src/hooks/useChallenges';
import { ChallengeCard } from '../../src/components/ChallengeCard';

type TabType = 'live' | 'upcoming' | 'completed';

export default function ChallengesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('live');

  const { data: challenges, isLoading, error } = useChallenges(activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'live', label: 'Live' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ];

  const handleChallengePress = (challengeId: string) => {
    // TODO: Navigate to challenge details
    console.log('Open challenge:', challengeId);
  };

  return (
    <View className="flex-1 bg-gray-50" testID="challenges-screen">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Challenges</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Join challenges to earn exclusive rewards
        </Text>
      </View>

      {/* Tabs */}
      <View className="bg-white px-4 py-3 flex-row gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 rounded-lg ${
              activeTab === tab.key
                ? 'bg-primary-600'
                : 'bg-gray-100'
            }`}
            testID={`tab-${tab.key}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0284c7" />
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-red-600 text-center">
              Failed to load challenges. Please try again.
            </Text>
          </View>
        ) : challenges && challenges.length > 0 ? (
          challenges.map((challenge, index) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              index={index}
              onPress={() => handleChallengePress(challenge.id)}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-center">
              No {activeTab} challenges at the moment.
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Check back later for new challenges!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
