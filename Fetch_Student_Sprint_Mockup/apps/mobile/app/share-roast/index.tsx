import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';

const { width } = Dimensions.get('window');

// Receipt items from scan
const RECEIPT_ITEMS = [
  { name: 'Organic Bananas', price: 3.49 },
  { name: 'Whole Milk (1 Gallon)', price: 4.99 },
  { name: 'Greek Yogurt', price: 5.99 },
  { name: 'Bread - Whole Wheat', price: 3.29 },
  { name: 'Eggs (Dozen)', price: 4.49 },
  { name: 'Orange Juice', price: 5.49 },
  { name: 'Chicken Breast (2 lbs)', price: 12.99 },
  { name: 'Mixed Salad Greens', price: 4.29 },
  { name: 'Tomatoes', price: 3.99 },
  { name: 'Pasta - Penne', price: 2.49 },
];

interface Roast {
  id: number;
  text: string;
  emoji: string;
  color: string;
}

// AI Roast Generator - analyzes receipt contents
function generateRoasts(): Roast[] {
  const roasts: Roast[] = [];
  const totalPrice = RECEIPT_ITEMS.reduce((sum, item) => sum + item.price, 0);
  const itemNames = RECEIPT_ITEMS.map(item => item.name.toLowerCase());

  // Roast #1: Check for expensive items
  const expensiveItem = RECEIPT_ITEMS.find(item => item.price > 10);
  if (expensiveItem) {
    roasts.push({
      id: 1,
      text: `$${expensiveItem.price.toFixed(2)} for ${expensiveItem.name}? Someone's living their best life! 💅`,
      emoji: "💎",
      color: "#8B5CF6",
    });
  }

  // Roast #2: Check for healthy items
  const healthyKeywords = ['organic', 'salad', 'yogurt', 'chicken breast'];
  const healthyCount = itemNames.filter(name =>
    healthyKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (healthyCount >= 3) {
    roasts.push({
      id: 2,
      text: `${healthyCount} healthy items? Are you okay? Who forced you to be an adult? 🥗`,
      emoji: "🥗",
      color: "#10B981",
    });
  }

  // Roast #3: Check total price
  if (totalPrice > 40) {
    roasts.push({
      id: 3,
      text: `$${totalPrice.toFixed(2)} total... and here I am eating ramen. Living different lives! 💸`,
      emoji: "💰",
      color: "#F59E0B",
    });
  } else if (totalPrice < 30) {
    roasts.push({
      id: 3,
      text: `Only $${totalPrice.toFixed(2)}? Either you're budgeting or just forgot to eat 😅`,
      emoji: "🛒",
      color: "#EC4899",
    });
  }

  // Roast #4: Check for dairy items
  const dairyKeywords = ['milk', 'yogurt', 'cheese', 'eggs'];
  const dairyCount = itemNames.filter(name =>
    dairyKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (dairyCount >= 3) {
    roasts.push({
      id: 4,
      text: `${dairyCount} dairy items... Your bones must be STRONG STRONG 🦴`,
      emoji: "🥛",
      color: "#3B82F6",
    });
  }

  // Roast #5: Check number of items
  if (RECEIPT_ITEMS.length >= 10) {
    roasts.push({
      id: 5,
      text: `${RECEIPT_ITEMS.length} items!? This receipt is longer than my attention span 📜`,
      emoji: "📋",
      color: "#EF4444",
    });
  } else if (RECEIPT_ITEMS.length <= 5) {
    roasts.push({
      id: 5,
      text: `Only ${RECEIPT_ITEMS.length} items? What is this, a sample menu? 🍽️`,
      emoji: "🛍️",
      color: "#F97316",
    });
  }

  // Roast #6: Check for breakfast items
  const breakfastKeywords = ['eggs', 'bread', 'milk', 'yogurt', 'juice'];
  const breakfastCount = itemNames.filter(name =>
    breakfastKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (breakfastCount >= 4) {
    roasts.push({
      id: 6,
      text: `Full breakfast setup! Look at you, actually eating breakfast like a responsible human 🍳`,
      emoji: "🍳",
      color: "#FBBF24",
    });
  }

  // Roast #7: Check for pasta/carbs
  const carbKeywords = ['pasta', 'bread', 'rice'];
  const carbCount = itemNames.filter(name =>
    carbKeywords.some(keyword => name.includes(keyword))
  ).length;
  if (carbCount >= 2) {
    roasts.push({
      id: 7,
      text: `Carb loading I see... Training for a marathon or just living your best life? 🍝`,
      emoji: "🍝",
      color: "#F43F5E",
    });
  }

  // Roast #8: Generic roast based on organic items
  const organicCount = itemNames.filter(name => name.includes('organic')).length;
  if (organicCount >= 1) {
    roasts.push({
      id: 8,
      text: `"Organic" bananas... We get it, you care about the planet 🌍`,
      emoji: "🌱",
      color: "#22C55E",
    });
  }

  // Default roast if none match
  if (roasts.length === 0) {
    roasts.push({
      id: 9,
      text: `Pretty basic shopping trip... but hey, at least you're eating! 🤷`,
      emoji: "🛒",
      color: "#6B7280",
    });
  }

  return roasts;
}

export default function ShareRoastScreen() {
  const router = useRouter();
  const [availableRoasts] = useState<Roast[]>(generateRoasts());
  const [selectedRoast, setSelectedRoast] = useState<Roast>(availableRoasts[0]);
  const [shareExternal, setShareExternal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const fadeAnim = new Animated.Value(0);
  const videoRef = useRef<Video>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      // Pick a random roast from AI-generated roasts
      const randomRoast = availableRoasts[Math.floor(Math.random() * availableRoasts.length)];
      setSelectedRoast(randomRoast);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 1500);
  }, []);

  const regenerateRoast = () => {
    setIsGenerating(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        const currentIndex = availableRoasts.findIndex(r => r.id === selectedRoast.id);
        const nextIndex = (currentIndex + 1) % availableRoasts.length;
        setSelectedRoast(availableRoasts[nextIndex]);
        setIsGenerating(false);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 1000);
    });
  };

  const handleVideoLoad = (status: any) => {
    if (status.isLoaded && status.durationMillis) {
      const durationInSeconds = Math.floor(status.durationMillis / 1000);
      setVideoDuration(durationInSeconds);

      // If video is longer than 30 seconds, stop it at 30 seconds
      if (durationInSeconds > 30) {
        videoRef.current?.setPositionAsync(0);
      }
    }
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && status.positionMillis && status.durationMillis) {
      const positionInSeconds = Math.floor(status.positionMillis / 1000);

      // Stop video at 30 seconds if it's longer
      if (positionInSeconds >= 30) {
        videoRef.current?.pauseAsync();
        videoRef.current?.setPositionAsync(0);
      }
    }
  };

  const handlePost = () => {
    router.push({
      pathname: '/feed',
      params: {
        newPost: JSON.stringify({
          type: 'roast',
          roastText: selectedRoast.text,
          roastEmoji: selectedRoast.emoji,
          roastColor: selectedRoast.color,
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
        <Text style={styles.headerTitle}>Receipt Roast</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={isGenerating}
          style={[styles.postButton, isGenerating && styles.postButtonDisabled]}
        >
          <Text
            style={[
              styles.postButtonText,
              isGenerating && styles.postButtonTextDisabled,
            ]}
          >
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* AI Label */}
        <View style={styles.aiLabel}>
          <Text style={styles.aiLabelEmoji}>🤖</Text>
          <Text style={styles.aiLabelText}>AI-Generated Roast</Text>
        </View>

        {/* Video Player */}
        {!isGenerating && (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{
                // TO ADD YOUR VIDEO: Place your video file in apps/mobile/assets/
                // and replace 'roast-video.mp4' with your filename
                uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
              }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay={false}
              onLoad={handleVideoLoad}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoLabel}>📹 AI Roast Video (Max 30s)</Text>
            </View>
            {videoDuration > 0 && videoDuration > 30 && (
              <View style={styles.videoDurationBadge}>
                <Text style={styles.videoDurationText}>⚠️ Trimmed to 30s</Text>
              </View>
            )}
          </View>
        )}

        {/* Roast Card */}
        <View style={styles.roastCardContainer}>
          {isGenerating ? (
            <View style={styles.loadingCard}>
              <Animated.Text
                style={[
                  styles.loadingEmoji,
                  {
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ]}
              >
                🔥
              </Animated.Text>
              <Text style={styles.loadingText}>Analyzing your receipt...</Text>
              <Text style={styles.loadingSubtext}>Preparing the perfect roast</Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.roastCard,
                { backgroundColor: selectedRoast.color + '20', opacity: fadeAnim },
              ]}
            >
              <Text style={styles.roastEmoji}>{selectedRoast.emoji}</Text>
              <Text style={styles.roastText}>{selectedRoast.text}</Text>

              <TouchableOpacity
                style={[
                  styles.regenerateButton,
                  { backgroundColor: selectedRoast.color },
                ]}
                onPress={regenerateRoast}
              >
                <Text style={styles.regenerateEmoji}>🔄</Text>
                <Text style={styles.regenerateText}>Generate Another</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Share External Toggle */}
        {!isGenerating && (
          <>
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
                trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Points Info */}
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsInfoEmoji}>😂</Text>
              <View style={styles.pointsInfoText}>
                <Text style={styles.pointsInfoTitle}>You'll earn</Text>
                <Text style={styles.pointsInfoValue}>
                  {shareExternal ? '40' : '30'} Fetch Points
                </Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                💡 Your roast is based on your recent purchases. Share it with friends and earn bonus points!
              </Text>
            </View>
          </>
        )}
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
    backgroundColor: '#EF4444',
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
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiLabelEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  aiLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  roastCardContainer: {
    marginBottom: 24,
    minHeight: 300,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  roastCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  roastEmoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  roastText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 32,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  regenerateEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  regenerateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#EF4444',
    fontWeight: '600',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
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
    color: '#EF4444',
  },
  infoCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  videoContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: width - 40,
    height: (width - 40) * 9 / 16,
    backgroundColor: '#000',
  },
  videoOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoDurationBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
