import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Crown, Award, ChevronDown, Info } from 'lucide-react-native';
import { useStores, useStoreLeaderboard } from '../../src/hooks/useLeaderboards';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LeaderboardsScreen() {
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const { data: leaderboard, isLoading } = useStoreLeaderboard(selectedStoreId);

  const selectedStore = stores?.find((s) => s.id === selectedStoreId);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-600';
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  return (
    <View className="flex-1 bg-gray-50" testID="leaderboards-screen">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Leaderboards</Text>
        <Text className="text-sm text-gray-600 mt-1">Compete for the top spot</Text>
      </View>

      {/* Store Selector */}
      <TouchableOpacity
        onPress={() => setShowStorePicker(true)}
        className="bg-white mx-4 mt-4 rounded-xl p-4 flex-row items-center justify-between shadow-sm"
        testID="store-selector"
        accessibilityRole="button"
        accessibilityLabel="Select store"
      >
        {selectedStore ? (
          <View className="flex-row items-center flex-1">
            {selectedStore.logoUrl && (
              <Image
                source={{ uri: selectedStore.logoUrl }}
                style={{ width: 32, height: 32, borderRadius: 8 }}
              />
            )}
            <Text className="ml-3 text-lg font-semibold text-gray-900">
              {selectedStore.name}
            </Text>
          </View>
        ) : (
          <Text className="text-lg text-gray-500">Select a store</Text>
        )}
        <ChevronDown size={24} color="#6b7280" />
      </TouchableOpacity>

      {/* Content */}
      {!selectedStoreId ? (
        <View className="flex-1 items-center justify-center p-8">
          <Award size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-center mt-4 text-lg">
            Select a store to view leaderboard
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      ) : leaderboard ? (
        <ScrollView className="flex-1">
          {/* Week Info & Rules */}
          <View className="px-4 mt-4 mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">
                Week ending: {new Date(leaderboard.weekEnding).toLocaleDateString()}
              </Text>
              <TouchableOpacity
                onPress={() => setShowRules(true)}
                className="flex-row items-center gap-1"
                testID="show-rules-button"
              >
                <Info size={16} color="#0284c7" />
                <Text className="text-primary-600 text-sm font-medium">Rules</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Leaderboard Entries */}
          <View className="px-4 pb-8">
            {leaderboard.entries.map((entry, index) => (
              <Animated.View
                key={entry.userId}
                entering={FadeInDown.delay(index * 50)}
              >
                <View
                  className={`mb-3 p-4 rounded-xl border-2 ${getRankBg(entry.rank)}`}
                  testID={`leaderboard-entry-${entry.rank}`}
                >
                  <View className="flex-row items-center">
                    {/* Rank */}
                    <View className="w-12 items-center">
                      {entry.rank <= 3 ? (
                        <Crown size={32} color={getRankColor(entry.rank).replace('text-', '')} fill={getRankColor(entry.rank).replace('text-', '')} />
                      ) : (
                        <Text className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                          {entry.rank}
                        </Text>
                      )}
                    </View>

                    {/* Avatar */}
                    <Image
                      source={{
                        uri: entry.userAvatar || 'https://via.placeholder.com/48',
                      }}
                      style={{ width: 48, height: 48, borderRadius: 24, marginLeft: 12 }}
                    />

                    {/* User Info */}
                    <View className="flex-1 ml-3">
                      <Text className="text-lg font-bold text-gray-900">
                        {entry.username}
                      </Text>
                      <View className="flex-row items-center gap-3 mt-1">
                        <Text className="text-sm text-gray-600">
                          {entry.flipsCount} flips
                        </Text>
                        {entry.crowns > 0 && (
                          <View className="flex-row items-center gap-1">
                            <Crown size={14} color="#eab308" fill="#eab308" />
                            <Text className="text-sm text-yellow-600 font-medium">
                              {entry.crowns}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Points */}
                    <View className="items-end">
                      <Text className="text-xl font-bold text-primary-600">
                        {entry.points.toLocaleString()}
                      </Text>
                      <Text className="text-xs text-gray-500">points</Text>
                    </View>
                  </View>

                  {/* Badges */}
                  {entry.badges.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                      {entry.badges.map((badge, idx) => (
                        <View
                          key={idx}
                          className="bg-primary-100 rounded-full px-3 py-1"
                        >
                          <Text className="text-primary-700 text-xs font-medium">
                            {badge}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {/* Store Picker Modal */}
      <Modal
        visible={showStorePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStorePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-4 max-h-96">
            <Text className="text-xl font-bold text-gray-900 mb-4">Select Store</Text>
            <ScrollView>
              {stores?.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => {
                    setSelectedStoreId(store.id);
                    setShowStorePicker(false);
                  }}
                  className="flex-row items-center p-3 rounded-xl hover:bg-gray-50"
                  testID={`store-option-${store.id}`}
                >
                  {store.logoUrl && (
                    <Image
                      source={{ uri: store.logoUrl }}
                      style={{ width: 40, height: 40, borderRadius: 8 }}
                    />
                  )}
                  <Text className="ml-3 text-lg text-gray-900">{store.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rules Modal */}
      <Modal
        visible={showRules}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRules(false)}
      >
        <View className="flex-1 bg-black/50 justify-center p-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Rules</Text>
            {leaderboard?.rules && (
              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Text className="text-gray-700 font-medium">Points per flip:</Text>
                  <Text className="ml-2 text-gray-900 font-semibold">
                    {leaderboard.rules.pointsPerFlip}
                  </Text>
                </View>
                {leaderboard.rules.varietyBonus && (
                  <View className="flex-row items-start">
                    <Text className="text-gray-700 font-medium">Variety bonus:</Text>
                    <Text className="ml-2 text-gray-900 font-semibold">
                      +{leaderboard.rules.varietyBonus}%
                    </Text>
                  </View>
                )}
                {leaderboard.rules.frequencyMultiplier && (
                  <View className="flex-row items-start">
                    <Text className="text-gray-700 font-medium">Frequency multiplier:</Text>
                    <Text className="ml-2 text-gray-900 font-semibold">
                      {leaderboard.rules.frequencyMultiplier}x
                    </Text>
                  </View>
                )}
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowRules(false)}
              className="bg-primary-600 rounded-xl p-4 mt-6"
            >
              <Text className="text-white text-center font-semibold">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
