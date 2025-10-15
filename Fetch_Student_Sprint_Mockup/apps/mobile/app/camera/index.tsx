import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 80;
const DROP_ZONE_SIZE = 200;

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [showDropZone, setShowDropZone] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const dropZoneOpacity = useRef(new Animated.Value(0)).current;
  const dropZoneScale = useRef(new Animated.Value(0.8)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });

        // Show drop zone when user starts dragging
        setShowDropZone(true);
        Animated.parallel([
          Animated.timing(dropZoneOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(dropZoneScale, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();

        // Calculate if button was released inside drop zone
        const centerX = width / 2;
        const centerY = height / 2;
        const buttonCenterX = centerX + gestureState.moveX - width / 2;
        const buttonCenterY = height - 50 - BUTTON_SIZE / 2 + gestureState.dy;

        const distanceFromCenter = Math.sqrt(
          Math.pow(buttonCenterX - centerX, 2) + Math.pow(buttonCenterY - centerY, 2)
        );

        if (distanceFromCenter < DROP_ZONE_SIZE / 2) {
          // Inside drop zone - start scanning
          handleScan();
        } else {
          // Outside drop zone - return to original position
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.timing(dropZoneOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setShowDropZone(false);
            dropZoneScale.setValue(0.8);
          });
        }
      },
    })
  ).current;

  const handleScan = () => {
    setIsScanning(true);

    // Animate button to checkmark
    Animated.sequence([
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate scanning and navigate to results
    setTimeout(() => {
      router.push('/scan-results');
    }, 1500);
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
            We need access to your camera to scan receipts.
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
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          {isScanning ? 'Scanning receipt...' : 'Hold and drag the button to the circle to scan'}
        </Text>
      </View>

      {/* Drop Zone */}
      {showDropZone && (
        <Animated.View
          style={[
            styles.dropZone,
            {
              opacity: dropZoneOpacity,
              transform: [{ scale: dropZoneScale }],
            },
          ]}
        >
          <View style={styles.dropZoneInner}>
            <Text style={styles.dropZoneText}>Release to Scan</Text>
          </View>
        </Animated.View>
      )}

      {/* Camera Button */}
      <View style={styles.buttonContainer}>
        <Animated.View
          style={[
            styles.cameraButtonWrapper,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cameraButton}>
            {isScanning ? (
              <Animated.Text style={[styles.buttonIcon, { opacity: buttonOpacity }]}>
                ✓
              </Animated.Text>
            ) : (
              <View style={styles.buttonInner} />
            )}
          </View>
        </Animated.View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <View style={styles.camera}>
          <View style={styles.webCameraPlaceholder}>
            <Text style={styles.webCameraText}>📷</Text>
            <Text style={styles.webCameraSubtext}>Camera Preview</Text>
            <Text style={styles.webCameraNote}>(Camera works on mobile devices)</Text>
          </View>
          <CameraContent />
        </View>
      ) : (
        <CameraView style={styles.camera} facing="back">
          <CameraContent />
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  dropZone: {
    position: 'absolute',
    top: height / 2 - DROP_ZONE_SIZE / 2,
    left: width / 2 - DROP_ZONE_SIZE / 2,
    width: DROP_ZONE_SIZE,
    height: DROP_ZONE_SIZE,
    borderRadius: DROP_ZONE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneInner: {
    width: '100%',
    height: '100%',
    borderRadius: DROP_ZONE_SIZE / 2,
    backgroundColor: 'rgba(251, 146, 60, 0.3)',
    borderWidth: 3,
    borderColor: 'rgba(251, 146, 60, 0.6)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropZoneText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraButtonWrapper: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
  cameraButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FB923C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonInner: {
    width: BUTTON_SIZE - 16,
    height: BUTTON_SIZE - 16,
    borderRadius: (BUTTON_SIZE - 16) / 2,
    backgroundColor: '#FFFFFF',
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
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
    backgroundColor: '#FB923C',
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
