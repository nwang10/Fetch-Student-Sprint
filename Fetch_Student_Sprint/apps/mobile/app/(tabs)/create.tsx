import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, Upload, X } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/lib/api';
import { CreateFlip } from '@repo/types';
import { router } from 'expo-router';

export default function CreateFlipScreen() {
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [brands, setBrands] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [previewPoints, setPreviewPoints] = useState(0);

  const createFlipMutation = useMutation({
    mutationFn: (data: CreateFlip) => apiClient.createFlip(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flips'] });
      Alert.alert('Success', 'Your flip has been posted!');
      resetForm();
      router.push('/(tabs)/feed');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create flip. Please try again.');
    },
  });

  const resetForm = () => {
    setCaption('');
    setMediaUri(null);
    setMediaType(null);
    setReceiptUri(null);
    setBrands([]);
    setPreviewPoints(0);
  };

  const pickMedia = async (type: 'image' | 'video') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to continue.');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes:
        type === 'image'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access to continue.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('image');
    }
  };

  const pickReceipt = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access to continue.');
      return;
    }

    const result = await ImagePicker.launchImagePickerAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
      scanReceipt(result.assets[0].uri);
    }
  };

  const scanReceipt = async (uri: string) => {
    setIsScanning(true);
    try {
      const result = await apiClient.scanReceipt(uri);
      setBrands(result.brands);
      setPreviewPoints(Math.floor(result.totalAmount * 10)); // Example points calculation
    } catch (error) {
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = () => {
    if (!mediaUri || !mediaType) {
      Alert.alert('Missing media', 'Please add a photo or video to your flip.');
      return;
    }

    if (caption.trim().length === 0) {
      Alert.alert('Missing caption', 'Please add a caption to your flip.');
      return;
    }

    createFlipMutation.mutate({
      caption: caption.trim(),
      mediaUri,
      mediaType,
      receiptUri: receiptUri || undefined,
      brands,
    });
  };

  return (
    <ScrollView className="flex-1 bg-white" testID="create-flip-screen">
      {/* Header */}
      <View className="px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Create Flip</Text>
        <Text className="text-sm text-gray-600 mt-1">Share your haul and earn points!</Text>
      </View>

      {/* Media Selection */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Add Media</Text>
        {mediaUri ? (
          <View className="relative">
            <Image
              source={{ uri: mediaUri }}
              style={{ width: '100%', height: 300, borderRadius: 12 }}
              contentFit="cover"
            />
            <TouchableOpacity
              onPress={() => setMediaUri(null)}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
              testID="remove-media-button"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 bg-primary-600 rounded-xl p-4 items-center"
              testID="take-photo-button"
            >
              <Camera size={32} color="white" />
              <Text className="text-white font-semibold mt-2">Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickMedia('image')}
              className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
              testID="pick-photo-button"
            >
              <ImageIcon size={32} color="#374151" />
              <Text className="text-gray-700 font-semibold mt-2">Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => pickMedia('video')}
              className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
              testID="pick-video-button"
            >
              <Upload size={32} color="#374151" />
              <Text className="text-gray-700 font-semibold mt-2">Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Caption */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Tell us about your haul..."
          multiline
          numberOfLines={4}
          maxLength={500}
          className="border border-gray-300 rounded-xl p-4 text-base"
          textAlignVertical="top"
          testID="caption-input"
        />
        <Text className="text-xs text-gray-500 mt-2 text-right">
          {caption.length}/500
        </Text>
      </View>

      {/* Receipt Upload */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">
          Receipt (Optional)
        </Text>
        {receiptUri ? (
          <View className="relative">
            <Image
              source={{ uri: receiptUri }}
              style={{ width: '100%', height: 200, borderRadius: 12 }}
              contentFit="contain"
            />
            <TouchableOpacity
              onPress={() => {
                setReceiptUri(null);
                setBrands([]);
                setPreviewPoints(0);
              }}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
            {isScanning && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-xl">
                <ActivityIndicator size="large" color="white" />
                <Text className="text-white mt-2">Scanning receipt...</Text>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            onPress={pickReceipt}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
            testID="upload-receipt-button"
          >
            <Upload size={32} color="#9ca3af" />
            <Text className="text-gray-600 mt-2">Upload Receipt</Text>
            <Text className="text-xs text-gray-500 mt-1">Auto-detect brands & earn more points</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Detected Brands */}
      {brands.length > 0 && (
        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Detected Brands
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {brands.map((brand, index) => (
              <View key={index} className="bg-primary-100 rounded-full px-4 py-2">
                <Text className="text-primary-700 font-medium">{brand}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Points Preview */}
      {previewPoints > 0 && (
        <View className="mx-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <Text className="text-yellow-800 font-semibold text-center">
            You'll earn approximately {previewPoints} points!
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View className="p-4 pb-8">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createFlipMutation.isPending}
          className={`rounded-xl p-4 items-center ${
            createFlipMutation.isPending ? 'bg-gray-400' : 'bg-primary-600'
          }`}
          testID="submit-flip-button"
        >
          {createFlipMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Post Flip</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
