import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

export default function ReviewCameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as 'photo' | 'video') || 'photo';

  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const recordingTimer = useRef(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = async () => {
    if (mode === 'video' && cameraRef.current) {
      setIsRecording(true);
      recordingTimer.current = 0;

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simulate recording timer
      const timer = setInterval(() => {
        recordingTimer.current += 1;
        setRecordingTime(recordingTimer.current);
      }, 1000);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        stopRecording();
        clearInterval(timer);
      }, 30000);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    // Simulate captured video
    setCapturedMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');
  };

  const takePhoto = () => {
    // Simulate photo capture
    setCapturedMedia('https://picsum.photos/seed/review-photo/800/600');
  };

  const handleUseMedia = () => {
    router.push({
      pathname: '/share-review',
      params: {
        media: capturedMedia,
        mediaType: mode,
      },
    });
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    setRecordingTime(0);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            We need access to your camera to {mode === 'video' ? 'record videos' : 'take photos'} for your reviews.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const CameraContent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.modeText}>
            {mode === 'video' ? '🎥 Video Review' : '📸 Photo Review'}
          </Text>
        </View>
        <View style={styles.closeButton} />
      </View>

      {/* Preview or Captured Media */}
      {capturedMedia ? (
        <View style={styles.previewContainer}>
          {mode === 'video' ? (
            <Video
              source={{ uri: capturedMedia }}
              style={styles.previewMedia}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
            />
          ) : (
            <View style={styles.previewMedia}>
              <Text style={styles.previewPlaceholder}>📸 Photo Preview</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionsBadge}>
              <Text style={styles.instructionsText}>
                {mode === 'video'
                  ? isRecording
                    ? `Recording... ${recordingTime}s`
                    : 'Press and hold to record your review'
                  : 'Tap to capture your product photo'}
              </Text>
            </View>
          </View>

          {/* Recording Timer */}
          {isRecording && (
            <View style={styles.timerContainer}>
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          )}

          {/* Frame Overlay for Product */}
          <View style={styles.frameOverlay}>
            <View style={styles.frame}>
              <View style={[styles.frameCorner, styles.frameCornerTL]} />
              <View style={[styles.frameCorner, styles.frameCornerTR]} />
              <View style={[styles.frameCorner, styles.frameCornerBL]} />
              <View style={[styles.frameCorner, styles.frameCornerBR]} />
              <Text style={styles.frameText}>
                {mode === 'video' ? 'Frame your product' : 'Position product here'}
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {capturedMedia ? (
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Text style={styles.retakeText}>🔄 Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.useButton}
              onPress={handleUseMedia}
            >
              <Text style={styles.useText}>Use {mode === 'video' ? 'Video' : 'Photo'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureControls}>
            {mode === 'video' ? (
              <TouchableOpacity
                style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.captureButtonInner,
                    isRecording && styles.captureButtonInnerRecording,
                    { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
                  ]}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Tips */}
      {!capturedMedia && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tipsText}>
            {mode === 'video'
              ? '• Keep it under 30 seconds\n• Show the product clearly\n• Share your honest thoughts!'
              : '• Good lighting is key\n• Show the product label\n• Get close for details'}
          </Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.camera}>
          <View style={styles.webCameraPlaceholder}>
            <Text style={styles.webCameraText}>📷</Text>
            <Text style={styles.webCameraSubtext}>Camera Preview</Text>
            <Text style={styles.webCameraNote}>(Works on mobile devices)</Text>
          </View>
          <CameraContent />
        </View>
      ) : (
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <CameraContent />
        </CameraView>
      )}
    </View>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerContainer: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  frameOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  frame: {
    width: 280,
    height: 280,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#F59E0B',
    borderWidth: 4,
  },
  frameCornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  frameCornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  frameCornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  frameCornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  frameText: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureControls: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  captureButtonRecording: {
    borderColor: '#EF4444',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  captureButtonInnerRecording: {
    borderRadius: 8,
    width: 40,
    height: 40,
    backgroundColor: '#EF4444',
  },
  previewControls: {
    flexDirection: 'row',
    gap: 16,
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  useButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 24,
  },
  useText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 16,
  },
  tipsTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewMedia: {
    flex: 1,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewPlaceholder: {
    fontSize: 48,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webCameraPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
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
  },
});
