import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../services/api';

const { width } = Dimensions.get('window');
const GRID_ITEM_SIZE = (width - 48) / 3; // 3 columns with padding

interface Friend {
  id: string;
  name: string;
  avatar: string;
  points: number;
}

interface UserStats {
  totalPoints: number;
  postsCount: number;
  friendsCount: number;
  scansThisWeek: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?img=50');
  const [activeTab, setActiveTab] = useState<'posts' | 'friends'>('posts');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User stats
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 2847,
    postsCount: 0,
    friendsCount: 47,
    scansThisWeek: 12,
  });

  // Mock friends data
  const [friends] = useState<Friend[]>([
    { id: '1', name: 'Sarah Chen', avatar: 'https://i.pravatar.cc/100?img=1', points: 3245 },
    { id: '2', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/100?img=2', points: 2891 },
    { id: '3', name: 'Emily Davis', avatar: 'https://i.pravatar.cc/100?img=3', points: 2654 },
    { id: '4', name: 'Alex Kim', avatar: 'https://i.pravatar.cc/100?img=4', points: 2432 },
    { id: '5', name: 'Rachel Green', avatar: 'https://i.pravatar.cc/100?img=5', points: 2156 },
    { id: '6', name: 'David Lee', avatar: 'https://i.pravatar.cc/100?img=6', points: 1987 },
  ]);

  useEffect(() => {
    loadUserPosts();
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setProfileImage(savedImage);
      }
    } catch (error) {
      console.error('Failed to load profile picture:', error);
    }
  };

  const saveProfilePicture = async (uri: string) => {
    try {
      await AsyncStorage.setItem('profileImage', uri);
    } catch (error) {
      console.error('Failed to save profile picture:', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await api.fetchPosts();

      // Get current profile picture
      const currentAvatar = await AsyncStorage.getItem('profileImage');
      const avatarToUse = currentAvatar || 'https://i.pravatar.cc/100?img=50';

      // Filter to only show user's posts and update avatar to current one
      const myPosts = allPosts
        .filter((post: any) => post.name === 'You')
        .map((post: any) => ({ ...post, avatar: avatarToUse }));

      setUserPosts(myPosts);
      setStats(prev => ({ ...prev, postsCount: myPosts.length }));
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfilePicture = async () => {
    let newImageUri: string;

    if (Platform.OS === 'web') {
      // For web, use a random avatar
      const randomNum = Math.floor(Math.random() * 70) + 1;
      newImageUri = `https://i.pravatar.cc/150?img=${randomNum}`;
      setProfileImage(newImageUri);
      await saveProfilePicture(newImageUri);
      return;
    }

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to change your profile picture!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      newImageUri = result.assets[0].uri;
      setProfileImage(newImageUri);
      await saveProfilePicture(newImageUri);
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{stats.totalPoints.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Fetch Points</Text>
      </View>
      <View style={[styles.statItem, styles.statBorder]}>
        <Text style={styles.statValue}>{stats.postsCount}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={[styles.statItem, styles.statBorder]}>
        <Text style={styles.statValue}>{stats.friendsCount}</Text>
        <Text style={styles.statLabel}>Friends</Text>
      </View>
      <View style={[styles.statItem, styles.statBorder]}>
        <Text style={styles.statValue}>{stats.scansThisWeek}</Text>
        <Text style={styles.statLabel}>Scans This Week</Text>
      </View>
    </View>
  );

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendPoints}>{item.points.toLocaleString()} points</Text>
      </View>
      <TouchableOpacity style={styles.viewProfileButton}>
        <Text style={styles.viewProfileText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item }: { item: any }) => {
    // Determine what to show as thumbnail - use actual post content
    let thumbnailSource;
    let showPlaceholder = false;
    let placeholderContent = null;

    if (item.isRoast) {
      // For roasts, show colored background with emoji since there's no photo
      showPlaceholder = true;
      placeholderContent = (
        <View style={[styles.gridImage, styles.roastPlaceholder]}>
          <Text style={styles.roastPlaceholderEmoji}>{item.roastEmoji || '🔥'}</Text>
          <Text style={styles.roastPlaceholderText}>Roast</Text>
        </View>
      );
    } else if (item.isReview) {
      // For reviews, show the actual review media if available
      if (item.reviewMedia) {
        thumbnailSource = { uri: item.reviewMedia };
      } else {
        // No media, show colored background with star rating
        showPlaceholder = true;
        placeholderContent = (
          <View style={[styles.gridImage, styles.reviewPlaceholder]}>
            <Text style={styles.reviewPlaceholderStars}>{'⭐'.repeat(item.rating || 5)}</Text>
            <Text style={styles.reviewPlaceholderText}>Review</Text>
          </View>
        );
      }
    } else if (item.imageSource && typeof item.imageSource === 'object' && 'uri' in item.imageSource && item.imageSource.uri) {
      // For regular haul posts, show the actual image
      thumbnailSource = item.imageSource;
    } else {
      // Fallback - show a simple placeholder
      showPlaceholder = true;
      placeholderContent = (
        <View style={[styles.gridImage, styles.defaultPlaceholder]}>
          <Text style={styles.defaultPlaceholderText}>📷</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.gridItem}
        onPress={() => router.push({
          pathname: '/feed',
          params: { scrollToPost: item.id }
        })}
      >
        {showPlaceholder ? (
          placeholderContent
        ) : (
          <Image source={thumbnailSource} style={styles.gridImage} />
        )}
        {item.isRoast && (
          <View style={styles.postBadge}>
            <Text style={styles.postBadgeText}>🔥 Roast</Text>
          </View>
        )}
        {item.isReview && (
          <View style={[styles.postBadge, { backgroundColor: '#7C3AED' }]}>
            <Text style={styles.postBadgeText}>⭐ Review</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Profile</Text>
        </View>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.push('/feed')}>
            <Text style={styles.navText}>Play</Text>
          </TouchableOpacity>
          <Text style={styles.navDot}>•</Text>
          <TouchableOpacity onPress={() => router.push('/feed')}>
            <Text style={styles.navText}>Feed</Text>
          </TouchableOpacity>
          <Text style={styles.navDot}>•</Text>
          <Text style={styles.navText}>Leaderboard</Text>
          <Text style={styles.navDot}>•</Text>
          <Text style={styles.navTextActive}>Profile</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleChangeProfilePicture} style={styles.profileImageContainer}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>You</Text>
          <Text style={styles.profileUsername}>@fetch_user</Text>
        </View>

        {/* Stats Card */}
        {renderStatsCard()}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Posts ({stats.postsCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
            onPress={() => setActiveTab('friends')}
          >
            <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
              Friends ({stats.friendsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'posts' ? (
          <View style={styles.postsGrid}>
            {loading ? (
              <Text style={styles.loadingText}>Loading posts...</Text>
            ) : userPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📷</Text>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>
                  Start scanning receipts and sharing your hauls!
                </Text>
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => router.push('/camera')}
                >
                  <Text style={styles.scanButtonText}>Scan Receipt</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={userPosts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                columnWrapperStyle={styles.gridRow}
              />
            )}
          </View>
        ) : (
          <View style={styles.friendsList}>
            <FlatList
              data={friends}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Camera Button */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => router.push('/camera')}
        accessibilityLabel="Open camera to scan receipt"
        accessibilityRole="button"
      >
        <Text style={styles.cameraEmoji}>📷</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  navText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  navTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
    paddingBottom: 4,
  },
  navDot: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#7C3AED',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7C3AED',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editBadgeText: {
    fontSize: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  postsGrid: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  roastPlaceholder: {
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roastPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  roastPlaceholderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  reviewPlaceholder: {
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewPlaceholderStars: {
    fontSize: 24,
    marginBottom: 8,
  },
  reviewPlaceholderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  defaultPlaceholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultPlaceholderText: {
    fontSize: 48,
  },
  postBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  scanButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  friendsList: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  friendPoints: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  viewProfileButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 32,
    right: '50%',
    marginRight: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraEmoji: {
    fontSize: 32,
  },
});
