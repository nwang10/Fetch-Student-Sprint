import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function ShareHaulScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [shareExternal, setShareExternal] = useState(false);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // For web, use a placeholder
      setImage('https://picsum.photos/seed/haul/800/600');
      return;
    }

    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to select photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      // For web, use a placeholder
      setImage('https://picsum.photos/seed/photo/800/600');
      return;
    }

    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = () => {
    // Navigate back with post data
    router.push({
      pathname: '/feed',
      params: {
        newPost: JSON.stringify({
          type: 'haul',
          image,
          caption: caption || 'Check out my latest haul!',
          shareExternal,
        }),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/scan-results')}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share My Haul</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!image}
          style={[styles.postButton, !image && styles.postButtonDisabled]}
        >
          <Text
            style={[
              styles.postButtonText,
              !image && styles.postButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Image Preview or Picker */}
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={pickImage}
            >
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>🛍️</Text>
            <Text style={styles.placeholderTitle}>Add a Photo</Text>
            <Text style={styles.placeholderSubtitle}>
              Show off your shopping haul!
            </Text>

            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Text style={styles.photoButtonEmoji}>📷</Text>
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Text style={styles.photoButtonEmoji}>🖼️</Text>
                <Text style={styles.photoButtonText}>Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Weekend grocery haul 🥑"
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{caption.length}/200</Text>
        </View>

        {/* Share External Toggle */}
        <View style={styles.externalShareContainer}>
          <View style={styles.externalShareInfo}>
            <Text style={styles.externalShareTitle}>
              Share to TikTok/Instagram
            </Text>
            <Text style={styles.externalShareSubtitle}>
              +10 bonus points
            </Text>
          </View>
          <Switch
            value={shareExternal}
            onValueChange={setShareExternal}
            trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Points Info */}
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsInfoEmoji}>✨</Text>
          <View style={styles.pointsInfoText}>
            <Text style={styles.pointsInfoTitle}>You'll earn</Text>
            <Text style={styles.pointsInfoValue}>
              {shareExternal ? '35' : '25'} Fetch Points
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    fontSize: 24,
    color: '#111827',
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  imagePlaceholder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  photoButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  captionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  externalShareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  externalShareInfo: {
    flex: 1,
  },
  externalShareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  externalShareSubtitle: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    padding: 20,
    borderRadius: 16,
  },
  pointsInfoEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  pointsInfoText: {
    flex: 1,
  },
  pointsInfoTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  pointsInfoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
});
