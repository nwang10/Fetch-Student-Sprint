import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Heart, MessageCircle, Share2, Award } from 'lucide-react-native';
import { Flip } from '@repo/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface FlipCardProps {
  flip: Flip;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onJoinChallenge: () => void;
  isActive: boolean;
}

export function FlipCard({
  flip,
  onLike,
  onComment,
  onShare,
  onJoinChallenge,
  isActive,
}: FlipCardProps) {
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const handleDoubleTap = () => {
    if (!flip.isLiked) {
      onLike();
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
  };

  return (
    <View className="h-full w-full bg-black" testID={`flip-card-${flip.id}`}>
      {/* Media */}
      <Pressable
        onPress={handleDoubleTap}
        className="absolute inset-0"
        testID="flip-media-pressable"
      >
        {flip.media.type === 'image' ? (
          <Image
            source={{ uri: flip.media.uri }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessibilityLabel={`Flip by ${flip.username}`}
          />
        ) : (
          <Video
            source={{ uri: flip.media.uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive}
            isLooping
            isMuted={false}
            accessibilityLabel={`Video flip by ${flip.username}`}
          />
        )}

        {/* Like Animation */}
        {showLikeAnimation && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="absolute inset-0 items-center justify-center"
          >
            <Heart size={120} color="white" fill="white" />
          </Animated.View>
        )}
      </Pressable>

      {/* Gradient Overlay */}
      <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Top Section - User Info */}
      <View className="absolute top-12 left-4 right-4 flex-row items-center">
        <Image
          source={{ uri: flip.userAvatar || 'https://via.placeholder.com/40' }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
          accessibilityLabel={`${flip.username}'s profile picture`}
        />
        <Text className="ml-3 text-white font-semibold text-base" accessibilityRole="text">
          {flip.username}
        </Text>
      </View>

      {/* Right Side Actions */}
      <View className="absolute right-4 bottom-32 space-y-6">
        {/* Like */}
        <TouchableOpacity
          onPress={onLike}
          className="items-center"
          testID="like-button"
          accessibilityRole="button"
          accessibilityLabel={`${flip.isLiked ? 'Unlike' : 'Like'} this flip`}
          accessibilityHint={`Currently has ${flip.likeCount} likes`}
        >
          <Heart
            size={32}
            color="white"
            fill={flip.isLiked ? 'white' : 'none'}
            strokeWidth={flip.isLiked ? 0 : 2}
          />
          <Text className="text-white text-xs mt-1">{flip.likeCount}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          onPress={onComment}
          className="items-center"
          testID="comment-button"
          accessibilityRole="button"
          accessibilityLabel="View comments"
          accessibilityHint={`${flip.commentCount} comments`}
        >
          <MessageCircle size={32} color="white" strokeWidth={2} />
          <Text className="text-white text-xs mt-1">{flip.commentCount}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          onPress={onShare}
          className="items-center"
          testID="share-button"
          accessibilityRole="button"
          accessibilityLabel="Share this flip"
        >
          <Share2 size={32} color="white" strokeWidth={2} />
        </TouchableOpacity>

        {/* Points Badge */}
        <View className="items-center bg-yellow-500 rounded-full p-2">
          <Award size={24} color="white" fill="white" />
          <Text className="text-white text-xs font-bold mt-1">+{flip.pointsEarned}</Text>
        </View>
      </View>

      {/* Bottom Section - Caption & Challenge */}
      <View className="absolute bottom-20 left-4 right-20">
        <Text className="text-white text-sm mb-2" numberOfLines={3} accessibilityRole="text">
          {flip.caption}
        </Text>

        {/* Brands */}
        {flip.brands.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {flip.brands.slice(0, 3).map((brand, index) => (
              <View key={index} className="bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white text-xs">{brand}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Challenge CTA */}
        {flip.challengeName && (
          <TouchableOpacity
            onPress={onJoinChallenge}
            className="bg-primary-600 rounded-full px-4 py-2 self-start"
            testID="join-challenge-button"
            accessibilityRole="button"
            accessibilityLabel={`Join ${flip.challengeName} challenge`}
          >
            <Text className="text-white font-semibold text-sm">
              Join: {flip.challengeName}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
