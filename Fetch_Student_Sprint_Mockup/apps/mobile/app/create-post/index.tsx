import React, { useState, useRef } from 'react';
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
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

type MediaType = 'photo' | 'video' | null;

export default function CreatePostScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [caption, setCaption] = useState('');
  const [shareExternal, setShareExternal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const pickMediaFromLibrary = async () => {
    if (Platform.OS === 'web') {
      setMedia('https://picsum.photos/seed/post/800/600');
      setMediaType('photo');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to select media!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'photo');
    }
  };

  const openCamera = async () => {
    if (Platform.OS === 'web') {
      setMedia('https://picsum.photos/seed/camera/800/600');
      setMediaType('photo');
      return;
    }

    if (!cameraPermission) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        alert('Camera permission is required');
        return;
      }
    }

    if (!cameraPermission?.granted) {
      const { status } = await requestCameraPermission();
      if (status !== 'granted') {
        alert('Camera permission is required');
        return;
      }
    }

    setShowCameraModal(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && Platform.OS !== 'web') {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        setMedia(photo.uri);
        setMediaType('photo');
        setShowCameraModal(false);
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handlePost = () => {
    if (!media) return;

    router.push({
      pathname: '/feed',
      params: {
        newPost: JSON.stringify({
          type: 'haul',
          image: media,
          caption: caption || 'Check out my post! 🎉',
          shareExternal,
        }),
      },
    });
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!media}
          style={[styles.postButton, !media && styles.postButtonDisabled]}
        >
          <Text
            style={[
              styles.postButtonText,
              !media && styles.postButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Media Preview or Picker */}
        {media ? (
          <View style={styles.mediaContainer}>
            <Image source={{ uri: media }} style={styles.media} />
            {mediaType === 'video' && (
              <View style={styles.videoIndicator}>
                <Text style={styles.videoIndicatorText}>🎥 Video</Text>
              </View>
            )}
            <View style={styles.mediaActions}>
              <TouchableOpacity
                style={styles.changeMediaButton}
                onPress={pickMediaFromLibrary}
              >
                <Text style={styles.changeMediaText}>📁 Choose Different</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={removeMedia}
              >
                <Text style={styles.removeMediaText}>🗑️ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Text style={styles.placeholderEmoji}>📸</Text>
            <Text style={styles.placeholderTitle}>Add Photo or Video</Text>
            <Text style={styles.placeholderSubtitle}>
              Share your moment with the Fetch community!
            </Text>

            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={openCamera}
              >
                <Text style={styles.mediaButtonEmoji}>📷</Text>
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mediaButton}
                onPress={pickMediaFromLibrary}
              >
                <Text style={styles.mediaButtonEmoji}>🖼️</Text>
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Caption Input */}
        <View style={styles.captionContainer}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="What's on your mind? 💭"
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
          />
          <Text style={styles.charCount}>{caption.length}/300</Text>
        </View>

        {/* Share External Toggle */}
        <View style={styles.externalShareContainer}>
          <View style={styles.externalShareInfo}>
            <Text style={styles.externalShareTitle}>
              Share to Social Media
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

      {/* Camera Modal */}
      <Modal
        visible={showCameraModal}
        animationType="slide"
        onRequestClose={() => setShowCameraModal(false)}
      >
        <View style={styles.cameraContainer}>
          {Platform.OS === 'web' ? (
            <View style={styles.webCameraPlaceholder}>
              <Text style={styles.webCameraText}>📷</Text>
              <Text style={styles.webCameraSubtext}>Camera Preview</Text>
              <Text style={styles.webCameraNote}>(Camera works on mobile devices)</Text>
              <TouchableOpacity
                style={styles.webCameraButton}
                onPress={() => {
                  setMedia('https://picsum.photos/seed/camera/800/600');
                  setMediaType('photo');
                  setShowCameraModal(false);
                }}
              >
                <Text style={styles.webCameraButtonText}>Use Placeholder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraFacing}
            >
              {/* Camera Controls */}
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.cameraCancelButton}
                  onPress={() => setShowCameraModal(false)}
                >
                  <Text style={styles.cameraCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cameraFlipButton}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.cameraFlipText}>🔄</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cameraBottomControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>
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
  mediaContainer: {
    marginBottom: 24,
  },
  media: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  videoIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  videoIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  changeMediaButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
  },
  changeMediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  removeMediaButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  removeMediaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  mediaPlaceholder: {
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
    textAlign: 'center',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  mediaButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  mediaButtonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    minHeight: 120,
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
  // Camera Modal Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  cameraCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  cameraCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraFlipButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFlipText: {
    fontSize: 24,
  },
  cameraBottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  webCameraPlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  webCameraText: {
    fontSize: 80,
    marginBottom: 16,
  },
  webCameraSubtext: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  webCameraNote: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  webCameraButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  webCameraButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
