import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Award, ExternalLink } from 'lucide-react-native';
import { Flip } from '@repo/types';

interface ShareCardPreviewProps {
  flip: Flip;
  onClose: () => void;
}

export function ShareCardPreview({ flip, onClose }: ShareCardPreviewProps) {
  const cardRef = useRef<View>(null);

  const handleShare = async (_platform: 'instagram' | 'tiktok' | 'snapchat' | 'general') => {
    try {
      // Capture the share card as an image
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Share the image
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your Flip',
        UTI: 'public.png',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-black/90 justify-center items-center p-6">
      {/* Share Card */}
      <View
        ref={cardRef}
        className="w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: 9 / 16 }}
      >
        {/* Background Image/Video Thumbnail */}
        <Image
          source={{ uri: flip.media.type === 'video' ? flip.media.thumbnail : flip.media.uri }}
          style={{ width: '100%', height: '70%' }}
          contentFit="cover"
        />

        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Content */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          {/* User Info */}
          <View className="flex-row items-center mb-4">
            <Image
              source={{ uri: flip.userAvatar || 'https://via.placeholder.com/48' }}
              style={{ width: 48, height: 48, borderRadius: 24 }}
            />
            <View className="ml-3 flex-1">
              <Text className="text-white text-lg font-bold">{flip.username}</Text>
              <Text className="text-white/80 text-sm">{flip.caption}</Text>
            </View>
          </View>

          {/* Points Badge */}
          <View className="bg-yellow-500 rounded-full self-start px-6 py-3 flex-row items-center gap-2">
            <Award size={24} color="white" fill="white" />
            <Text className="text-white text-xl font-bold">
              +{flip.pointsEarned} Points
            </Text>
          </View>

          {/* Deep Link */}
          <View className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 flex-row items-center">
            <ExternalLink size={20} color="white" />
            <Text className="text-white text-sm ml-2 flex-1" numberOfLines={1}>
              fetchflips://flip/{flip.id.slice(0, 8)}...
            </Text>
          </View>

          {/* Branding */}
          <View className="mt-4 items-center">
            <Text className="text-white font-bold text-2xl">Fetch Flips</Text>
            <Text className="text-white/60 text-xs">Share your haul, earn rewards</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="w-full mt-6 gap-3">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleShare('instagram')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4"
            testID="share-instagram"
          >
            <Text className="text-white font-bold text-center text-lg">Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShare('tiktok')}
            className="flex-1 bg-black rounded-2xl p-4"
            testID="share-tiktok"
          >
            <Text className="text-white font-bold text-center text-lg">TikTok</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => handleShare('snapchat')}
            className="flex-1 bg-yellow-400 rounded-2xl p-4"
            testID="share-snapchat"
          >
            <Text className="text-black font-bold text-center text-lg">Snapchat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleShare('general')}
            className="flex-1 bg-primary-600 rounded-2xl p-4"
            testID="share-general"
          >
            <Text className="text-white font-bold text-center text-lg">More</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onClose}
          className="bg-white/20 rounded-2xl p-4 mt-2"
          testID="close-share-modal"
        >
          <Text className="text-white font-semibold text-center text-lg">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
