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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';
import CommentsModal from '../components/CommentsModal';
import RoastImage from '../components/RoastImage';
import ReviewCard from '../components/ReviewCard';
import * as api from '../../services/api';

// Types
interface Comment {
  id: string;
  avatar: string;
  name: string;
  text: string;
  likes: number;
  isLiked: boolean;
  isOwner: boolean;
  replies: Comment[];
  createdAt: string;
  parentId?: string;
}

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
  comments?: Comment[];
  // Roast-specific fields
  isRoast?: boolean;
  roastText?: string;
  roastEmoji?: string;
  // Review-specific fields
  isReview?: boolean;
  productName?: string;
  rating?: number;
  reviewText?: string;
  reviewMedia?: string;
  storeName?: string;
  // Shared field for both roast and review
  receiptItems?: Array<{ name: string; price: number }>;
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
  currentUserAvatar?: string;
}> = ({ avatar, name, subline, onDelete, isOwner, currentUserAvatar }) => {
  // Use current user avatar if this is the user's post
  const displayAvatar = isOwner && currentUserAvatar ? currentUserAvatar : avatar;

  return (
    <View style={styles.postHeader}>
      <Avatar uri={displayAvatar} />
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
};

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
const PostCard: React.FC<{
  post: Post;
  onDelete: (id: string) => void;
  onOpenComments: (post: Post) => void;
  currentUserAvatar?: string;
}> = ({ post, onDelete, onOpenComments, currentUserAvatar }) => {
  const [likes, setLikes] = useState(post.initialLikes);
  const [commentsCount, setCommentsCount] = useState(post.initialComments);
  const [isLiked, setIsLiked] = useState(false);
  const isOwner = post.name === 'You';

  // Update comments count when post.comments changes
  useEffect(() => {
    if (post.comments) {
      // Recursive function to count all comments and nested replies
      const countAllComments = (comments: Comment[]): number => {
        return comments.reduce((sum, comment) => {
          // Count this comment + all its nested replies recursively
          return sum + 1 + countAllComments(comment.replies || []);
        }, 0);
      };

      const totalComments = countAllComments(post.comments);
      setCommentsCount(totalComments);
    }
  }, [post.comments]);

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
    onOpenComments(post);
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
        currentUserAvatar={currentUserAvatar}
      />

      {!post.isReview && (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      )}

      {post.isRoast && post.roastText ? (
        <RoastImage
          roastText={post.roastText}
          roastEmoji={post.roastEmoji}
          receiptItems={post.receiptItems}
        />
      ) : post.isReview && post.productName && post.rating ? (
        <ReviewCard
          productName={post.productName}
          rating={post.rating}
          reviewText={post.reviewText || ''}
          mediaUri={post.reviewMedia}
          storeName={post.storeName}
          receiptItems={post.receiptItems}
        />
      ) : (
        <>
          <PostImage source={post.imageSource} />
          {post.storeName && post.receiptItems && post.receiptItems.length > 0 && (
            <View style={styles.haulReceiptInfo}>
              <View style={styles.haulHeader}>
                <Text style={styles.haulStore}>{post.storeName}</Text>
                <Text style={styles.haulPoints}>+{post.points} pts</Text>
              </View>
              <View style={styles.haulItemsContainer}>
                <Text style={styles.haulItemsTitle}>Items ({post.receiptItems.length})</Text>
                <View style={styles.haulItemsGrid}>
                  {post.receiptItems.slice(0, 6).map((item: any, index: number) => (
                    <View key={index} style={styles.haulItemPill}>
                      <Text style={styles.haulItemText}>{item.name}</Text>
                    </View>
                  ))}
                  {post.receiptItems.length > 6 && (
                    <View style={styles.haulItemPill}>
                      <Text style={styles.haulItemText}>+{post.receiptItems.length - 6} more</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </>
      )}

      <PostFooter
        likes={likes}
        comments={commentsCount}
        points={post.points}
        onLike={handleLike}
        onComment={handleComment}
        isLiked={isLiked}
      />
    </View>
  );
};

// Header Component
const FeedHeader: React.FC<{ router: any }> = ({ router }) => (
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
      <Text style={styles.navDot}>•</Text>
      <TouchableOpacity onPress={() => router.push('/profile')}>
        <Text style={styles.navText}>Profile</Text>
      </TouchableOpacity>
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);
  const [userAvatar, setUserAvatar] = useState('https://i.pravatar.cc/100?img=50');
  const processedPosts = React.useRef<Set<string>>(new Set());

  // Load posts from backend on mount
  useEffect(() => {
    loadPosts();
    loadUserAvatar();
  }, []);

  const loadUserAvatar = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        setUserAvatar(savedImage);
      }
    } catch (error) {
      console.error('Failed to load user avatar:', error);
    }
  };

  // Handle new posts from navigation params
  useEffect(() => {
    if (params.newPost) {
      try {
        const newPostData = JSON.parse(params.newPost as string);

        // Create a unique key for this post to prevent duplicates
        const postKey = `${newPostData.type}-${JSON.stringify(newPostData)}`;

        // Only process if we haven't seen this exact post data before
        if (!processedPosts.current.has(postKey)) {
          processedPosts.current.add(postKey);
          handleNewPost(newPostData);
        } else {
          console.log('Skipping duplicate post creation');
        }
      } catch (e) {
        console.error('Failed to parse new post:', e);
      }
    }
  }, [params.newPost]);

  // Handle scrolling to a specific post
  useEffect(() => {
    if (params.scrollToPost && posts.length > 0 && flatListRef.current) {
      const postIndex = posts.findIndex(post => post.id === params.scrollToPost);
      if (postIndex !== -1) {
        // Small delay to ensure the list is rendered
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: postIndex,
            animated: true,
            viewPosition: 0.1, // Position at top of viewport with some padding
          });
        }, 100);
      }
    }
  }, [params.scrollToPost, posts]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await api.fetchPosts();

      // Update all "You" posts to use current profile picture
      const currentAvatar = await AsyncStorage.getItem('profileImage');
      const avatarToUse = currentAvatar || 'https://i.pravatar.cc/100?img=50';

      const updatedPosts = fetchedPosts.map((post: Post) => {
        if (post.name === 'You') {
          return { ...post, avatar: avatarToUse };
        }
        return post;
      });

      setPosts(updatedPosts);
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
      const mediaUri = postData.media || postData.image; // Support both new and old format
      newPost = {
        avatar: userAvatar,
        name: 'You',
        subline: postData.mediaType === 'video' ? 'Shared a haul video' : 'Just posted',
        caption: postData.caption,
        imageSource: { uri: mediaUri },
        initialLikes: 0,
        initialComments: 0,
        points,
        // Add receipt data for hauls
        storeName: postData.storeName,
        receiptItems: postData.receiptItems || [],
      };
      setToastMessage(`Posted to your Fetch Feed! +${points} Fetch Points earned.`);
      setToastEmoji('🎉');
    } else if (postData.type === 'roast') {
      points = postData.shareExternal ? 40 : 30;
      // Receipt items from scan - hardcoded junk food
      const receiptItems = [
        { name: 'Oreos (Family Size)', price: 5.99 },
        { name: 'Doritos Cool Ranch', price: 4.49 },
        { name: 'Pringles Original', price: 2.99 },
        { name: 'Chips Ahoy Cookies', price: 4.29 },
        { name: 'Coca-Cola (12-pack)', price: 6.99 },
        { name: 'Mountain Dew (2 Liter)', price: 2.49 },
        { name: 'Cheetos Flamin Hot', price: 3.99 },
        { name: 'Pop-Tarts Frosted Strawberry', price: 4.79 },
        { name: 'Reeses Peanut Butter Cups', price: 1.99 },
        { name: 'Hostess Twinkies', price: 4.49 },
        { name: 'Little Debbie Swiss Rolls', price: 3.29 },
        { name: 'Hot Cheetos (Party Size)', price: 5.49 },
      ];

      newPost = {
        avatar: userAvatar,
        name: 'You',
        subline: 'AI Roasted their receipt 🔥',
        caption: `${postData.roastText}`,
        imageSource: { uri: '' }, // Not used for roast posts
        initialLikes: 0,
        initialComments: 0,
        points,
        // Roast-specific data
        isRoast: true,
        roastText: postData.roastText,
        roastEmoji: postData.roastEmoji,
        receiptItems,
      };
      setToastMessage(`Your Roast is live! +${points} Fetch Points earned.`);
      setToastEmoji('🔥');
    } else if (postData.type === 'review') {
      points = postData.shareExternal ? 50 : 40;
      newPost = {
        avatar: userAvatar,
        name: 'You',
        subline: `Reviewed ${postData.productName}`,
        caption: '', // Caption not shown for reviews
        imageSource: { uri: '' }, // Not used for review posts
        initialLikes: 0,
        initialComments: 0,
        points,
        // Review-specific data
        isReview: true,
        productName: postData.productName,
        rating: postData.rating,
        reviewText: postData.reviewText,
        reviewMedia: postData.media,
        storeName: postData.storeName,
        receiptItems: postData.receiptItems || [],
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

  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  };

  const handleCloseComments = () => {
    setShowCommentsModal(false);
    setSelectedPost(null);
  };

  const handleAddComment = async (postId: string, commentText: string, parentId?: string): Promise<Comment> => {
    try {
      // Create comment data to send to backend
      const commentData = {
        avatar: userAvatar,
        name: 'You',
        text: commentText,
        likes: 0,
        isLiked: false,
        isOwner: true,
        parentId,
      };

      // Add comment to backend
      const newComment = await api.addComment(postId, commentData);

      // Helper function to recursively add reply to parent at any level
      const addReplyToParent = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...comment.replies, newComment] };
          }
          if (comment.replies.length > 0) {
            return { ...comment, replies: addReplyToParent(comment.replies) };
          }
          return comment;
        });
      };

      // Update local state - handle replies properly
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const comments = post.comments || [];

            if (parentId) {
              // Add as reply to parent comment at any nesting level
              return {
                ...post,
                comments: addReplyToParent(comments)
              };
            } else {
              // Add as top-level comment
              return { ...post, comments: [newComment, ...comments] };
            }
          }
          return post;
        })
      );

      // Update selected post for modal
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => {
          if (!prev) return prev;
          const comments = prev.comments || [];

          if (parentId) {
            // Add as reply to parent comment at any nesting level
            return {
              ...prev,
              comments: addReplyToParent(comments)
            };
          } else {
            // Add as top-level comment
            return { ...prev, comments: [newComment, ...comments] };
          }
        });
      }

      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string): Promise<void> => {
    try {
      // Delete comment from backend
      await api.deleteComment(postId, commentId);

      // Helper function to recursively delete comment and its replies
      const deleteCommentAndReplies = (comments: Comment[]): Comment[] => {
        return comments
          .filter(c => c.id !== commentId)
          .map(comment => ({
            ...comment,
            replies: comment.replies.filter(r => r.id !== commentId)
          }));
      };

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const comments = deleteCommentAndReplies(post.comments || []);
            return { ...post, comments };
          }
          return post;
        })
      );

      // Update selected post for modal
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => {
          if (!prev) return prev;
          const comments = deleteCommentAndReplies(prev.comments || []);
          return { ...prev, comments };
        });
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      throw error;
    }
  };

  const handleLikeComment = async (postId: string, commentId: string): Promise<void> => {
    try {
      // Like/unlike comment on backend
      await api.likeComment(postId, commentId);

      // Helper function to recursively update likes
      const updateCommentLikes = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          // Check replies
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            };
          }
          return comment;
        });
      };

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            const comments = updateCommentLikes(post.comments || []);
            return { ...post, comments };
          }
          return post;
        })
      );

      // Update selected post for modal
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => {
          if (!prev) return prev;
          const comments = updateCommentLikes(prev.comments || []);
          return { ...prev, comments };
        });
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
      throw error;
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
      <FeedHeader router={router} />
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onDelete={handleDeletePost}
            onOpenComments={handleOpenComments}
            currentUserAvatar={userAvatar}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onScrollToIndexFailed={(info) => {
          // Handle scroll to index failure by waiting and trying again
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
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

      {/* Comments Modal */}
      {selectedPost && (
        <CommentsModal
          visible={showCommentsModal}
          onClose={handleCloseComments}
          postId={selectedPost.id}
          initialComments={selectedPost.comments || []}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onLikeComment={handleLikeComment}
          postAvatar={selectedPost.avatar}
          postName={selectedPost.name}
          postCaption={selectedPost.caption}
          postImage={selectedPost.imageSource}
        />
      )}

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
  haulReceiptInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  haulHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  haulStore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  haulPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  haulItemsContainer: {
    marginTop: 8,
  },
  haulItemsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  haulItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  haulItemPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  haulItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
});
