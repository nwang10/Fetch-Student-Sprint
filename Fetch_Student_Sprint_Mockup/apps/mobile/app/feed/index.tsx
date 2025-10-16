import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from '../components/Toast';
import * as api from '../../services/api';

// Types
interface Post {
  id: string;
  avatar: string;
  name: string;
  subline: string;
  caption: string;
  imageSource: ImageSourcePropType | { uri: string };
  initialLikes: number;
  initialComments: number;
  points: number;
  createdAt?: string;
}

// Avatar Component
const Avatar: React.FC<{ uri: string }> = ({ uri }) => (
  <Image
    source={{ uri }}
    style={styles.avatar}
    accessibilityLabel="User avatar"
  />
);

// Post Header Component
const PostHeader: React.FC<{
  avatar: string;
  name: string;
  subline: string;
  onDelete?: () => void;
  isOwner?: boolean;
}> = ({ avatar, name, subline, onDelete, isOwner }) => (
  <View style={styles.postHeader}>
    <Avatar uri={avatar} />
    <View style={styles.postHeaderText}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.subline}>{subline}</Text>
    </View>
    {isOwner && onDelete && (
      <TouchableOpacity
        onPress={onDelete}
        style={styles.deleteButton}
        accessibilityLabel="Delete post"
        accessibilityRole="button"
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Post Image Component
const PostImage: React.FC<{ source: ImageSourcePropType | { uri: string } }> = ({
  source,
}) => {
  const [imageError, setImageError] = useState(false);
  const isLocalSource = typeof source === 'number';
  const hasUri = !isLocalSource && 'uri' in source && source.uri;

  if (imageError || (!isLocalSource && !hasUri)) {
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={styles.postImage}
      resizeMode="cover"
      onError={() => setImageError(true)}
      accessibilityLabel="Post image"
    />
  );
};

// Post Footer Component
const PostFooter: React.FC<{
  likes: number;
  comments: number;
  points: number;
  onLike: () => void;
  onComment: () => void;
  isLiked: boolean;
}> = ({ likes, comments, points, onLike, onComment, isLiked }) => (
  <View style={styles.postFooter}>
    <View style={styles.postFooterActions}>
      <TouchableOpacity
        onPress={onLike}
        style={styles.actionButton}
        accessibilityLabel={`Like button, ${likes} likes`}
        accessibilityRole="button"
      >
        <Text style={styles.emoji}>{isLiked ? '💜' : '🤍'}</Text>
        <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
          {likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onComment}
        style={styles.actionButton}
        accessibilityLabel={`Comment button, ${comments} comments`}
        accessibilityRole="button"
      >
        <Text style={styles.emoji}>💬</Text>
        <Text style={styles.actionText}>{comments}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.pointsBadge}>
      <Text style={styles.pointsText}>
        {points} Fetch
      </Text>
    </View>
  </View>
);

// Post Card Component
const PostCard: React.FC<{ post: Post; onDelete: (id: string) => void }> = ({ post, onDelete }) => {
  const [likes, setLikes] = useState(post.initialLikes);
  const [comments, setComments] = useState(post.initialComments);
  const [isLiked, setIsLiked] = useState(false);
  const isOwner = post.name === 'You';

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  const handleComment = () => {
    setComments(comments + 1);
  };

  const handleDelete = () => {
    console.log('Delete button clicked for post:', post.id);

    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this post?')) {
        console.log('Delete confirmed for post:', post.id);
        onDelete(post.id);
      } else {
        console.log('Delete cancelled');
      }
    } else {
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Delete cancelled'),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              console.log('Delete confirmed for post:', post.id);
              onDelete(post.id);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.postCard}>
      <PostHeader
        avatar={post.avatar}
        name={post.name}
        subline={post.subline}
        onDelete={handleDelete}
        isOwner={isOwner}
      />

      <View style={styles.caption}>
        <Text style={styles.captionText}>{post.caption}</Text>
      </View>

      <PostImage source={post.imageSource} />

      <PostFooter
        likes={likes}
        comments={comments}
        points={post.points}
        onLike={handleLike}
        onComment={handleComment}
        isLiked={isLiked}
      />
    </View>
  );
};

// Header Component
const FeedHeader: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.headerTitle}>
      <Text style={styles.headerTitleText}>
        Socialize
      </Text>
    </View>
    <View style={styles.headerNav}>
      <Text style={styles.navText}>Play</Text>
      <Text style={styles.navDot}>•</Text>
      <Text style={styles.navTextActive}>Feed</Text>
      <Text style={styles.navDot}>•</Text>
      <Text style={styles.navText}>Leaderboard</Text>
    </View>
  </View>
);

// Main Feed Screen
export default function FeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastEmoji, setToastEmoji] = useState('🎉');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load posts from backend on mount
  useEffect(() => {
    loadPosts();
  }, []);

  // Handle new posts from navigation params
  useEffect(() => {
    if (params.newPost) {
      try {
        const newPostData = JSON.parse(params.newPost as string);
        handleNewPost(newPostData);
      } catch (e) {
        console.error('Failed to parse new post:', e);
      }
    }
  }, [params.newPost]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await api.fetchPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
      Alert.alert('Error', 'Failed to load posts. Make sure the backend server is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleNewPost = async (postData: any) => {
    let newPost: Omit<Post, 'id' | 'createdAt'>;
    let points = 0;
    let emoji = '🎉';

    if (postData.type === 'haul') {
      points = postData.shareExternal ? 35 : 25;
      newPost = {
        avatar: 'https://i.pravatar.cc/100?img=50',
        name: 'You',
        subline: 'Just posted',
        caption: postData.caption,
        imageSource: { uri: postData.image },
        initialLikes: 0,
        initialComments: 0,
        points,
      };
      setToastMessage(`Posted to your Fetch Feed! +${points} Fetch Points earned.`);
      setToastEmoji('🎉');
    } else if (postData.type === 'roast') {
      points = postData.shareExternal ? 40 : 30;
      newPost = {
        avatar: 'https://i.pravatar.cc/100?img=50',
        name: 'You',
        subline: 'AI Roasted their receipt',
        caption: `${postData.roastEmoji} ${postData.roastText}`,
        imageSource: { uri: 'https://picsum.photos/seed/roast/800/600' },
        initialLikes: 0,
        initialComments: 0,
        points,
      };
      setToastMessage(`Your Roast is live! +${points} Fetch Points earned.`);
      setToastEmoji('😂');
    } else if (postData.type === 'review') {
      points = postData.shareExternal ? 50 : 40;
      newPost = {
        avatar: 'https://i.pravatar.cc/100?img=50',
        name: 'You',
        subline: 'Reviewed a product',
        caption: `${'⭐'.repeat(postData.rating)} ${postData.productName}\n"${postData.reviewText}"`,
        imageSource: { uri: 'https://picsum.photos/seed/review/800/600' },
        initialLikes: 0,
        initialComments: 0,
        points,
      };
      setToastMessage(`Review posted! +${points} Fetch Points earned.`);
      setToastEmoji('⭐');
    } else {
      return;
    }

    // Create post in backend
    try {
      await api.createPost(newPost);
      // Reload all posts from backend to show full feed
      await loadPosts();
      setShowToast(true);

      // Show bonus toast if external share
      if (postData.shareExternal) {
        setTimeout(() => {
          setToastMessage('Shared externally! +10 bonus points.');
          setToastEmoji('🚀');
          setShowToast(true);
        }, 3500);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handleDeletePost = async (id: string) => {
    console.log('handleDeletePost called with id:', id);
    console.log('Current posts count:', posts.length);

    try {
      console.log('Calling API to delete post:', id);
      await api.deletePost(id);
      console.log('API delete successful, updating local state');

      const updatedPosts = posts.filter(post => post.id !== id);
      console.log('Updated posts count:', updatedPosts.length);

      setPosts(updatedPosts);
      setToastMessage('Post deleted successfully');
      setToastEmoji('🗑️');
      setShowToast(true);
      console.log('Delete completed successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      if (Platform.OS === 'web') {
        alert('Error: Failed to delete post. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete post. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FeedHeader />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onDelete={handleDeletePost} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Camera Button */}
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => router.push('/camera')}
        accessibilityLabel="Open camera to scan receipt"
        accessibilityRole="button"
      >
        <Text style={styles.cameraEmoji}>📷</Text>
      </TouchableOpacity>

      {/* Toast */}
      <Toast
        visible={showToast}
        message={toastMessage}
        emoji={toastEmoji}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subline: {
    fontSize: 14,
    color: '#6B7280',
  },
  caption: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  postImage: {
    width: '100%',
    height: 320,
  },
  imagePlaceholder: {
    width: '100%',
    height: 320,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: '#9CA3AF',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emoji: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  actionTextLiked: {
    color: '#7C3AED',
  },
  pointsBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6D28D9',
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
