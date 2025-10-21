import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ImageSourcePropType,
  Keyboard,
  ScrollView,
} from 'react-native';

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

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  initialComments: Comment[];
  onAddComment: (postId: string, commentText: string, parentId?: string) => Promise<Comment>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  onLikeComment: (postId: string, commentId: string) => Promise<void>;
  postAvatar: string;
  postName: string;
  postCaption: string;
  postImage: ImageSourcePropType | { uri: string };
}

export default function CommentsModal({
  visible,
  onClose,
  postId,
  initialComments,
  onAddComment,
  onDeleteComment,
  onLikeComment,
  postAvatar,
  postName,
  postCaption,
  postImage,
}: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const newComment = await onAddComment(postId, commentText, replyingTo?.id);

      if (replyingTo) {
        // Helper function to recursively find and add reply to parent
        const addReplyToParent = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === replyingTo.id) {
              return { ...comment, replies: [...comment.replies, newComment] };
            }
            if (comment.replies.length > 0) {
              return { ...comment, replies: addReplyToParent(comment.replies) };
            }
            return comment;
          });
        };

        setComments(prevComments => addReplyToParent(prevComments));
      } else {
        // Add as top-level comment
        setComments(prevComments => [newComment, ...prevComments]);
      }

      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss(); // Hide keyboard after sending
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string, parentId?: string) => {
    // Find the comment to check if it has replies
    const commentToDelete = comments.find(c => c.id === commentId);
    const hasReplies = commentToDelete && commentToDelete.replies && commentToDelete.replies.length > 0;

    const confirmDelete = () => {
      return new Promise<boolean>((resolve) => {
        const message = hasReplies && !parentId
          ? `Are you sure you want to delete this comment? This will also delete ${commentToDelete.replies.length} ${commentToDelete.replies.length === 1 ? 'reply' : 'replies'}.`
          : 'Are you sure you want to delete this comment?';

        if (Platform.OS === 'web') {
          resolve(window.confirm(message));
        } else {
          Alert.alert(
            'Delete Comment',
            message,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ]
          );
        }
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await onDeleteComment(postId, commentId);

      if (parentId) {
        // Delete reply
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === parentId
              ? { ...comment, replies: comment.replies.filter(r => r.id !== commentId) }
              : comment
          )
        );
      } else {
        // Delete top-level comment (with all its replies automatically)
        setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string, parentId?: string) => {
    try {
      await onLikeComment(postId, commentId);

      if (parentId) {
        // Like reply
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === parentId
              ? {
                  ...comment,
                  replies: comment.replies.map(reply =>
                    reply.id === commentId
                      ? {
                          ...reply,
                          isLiked: !reply.isLiked,
                          likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                        }
                      : reply
                  ),
                }
              : comment
          )
        );
      } else {
        // Like top-level comment
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isHighlighted = replyingTo?.id === comment.id;

    return (
      <View key={comment.id} style={[
        styles.commentCard,
        isReply && styles.replyCard,
        isHighlighted && styles.highlightedComment
      ]}>
        <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.name}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>

        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => handleLikeComment(comment.id, comment.parentId)}
          >
            <Text style={styles.commentActionIcon}>{comment.isLiked ? '💜' : '🤍'}</Text>
            <Text style={[styles.commentActionText, comment.isLiked && styles.commentActionTextActive]}>
              {comment.likes > 0 ? comment.likes : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentAction}
            onPress={() => setReplyingTo({ id: comment.id, name: comment.name })}
          >
            <Text style={styles.commentActionIcon}>💬</Text>
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>

          {comment.isOwner && (
            <TouchableOpacity
              style={styles.commentAction}
              onPress={() => handleDeleteComment(comment.id, comment.parentId)}
            >
              <Text style={styles.commentActionIcon}>🗑️</Text>
              <Text style={[styles.commentActionText, styles.commentActionTextDelete]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Render replies */}
        {comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => renderComment({ ...reply, parentId: comment.id }, true))}
          </View>
        )}
      </View>
    </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comments</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content (Post + Comments) */}
        <FlatList
          data={comments}
          renderItem={({ item }) => renderComment(item)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View style={styles.originalPostContainer}>
              <View style={styles.originalPostHeader}>
                <Image source={{ uri: postAvatar }} style={styles.postAvatar} />
                <Text style={styles.postName}>{postName}</Text>
              </View>
              <Text style={styles.postCaption}>{postCaption}</Text>
              {postImage && typeof postImage === 'object' && 'uri' in postImage && postImage.uri && postImage.uri !== '' ? (
                <Image source={postImage} style={styles.postImage} resizeMode="cover" />
              ) : null}
              <View style={styles.originalPostDivider} />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>💬</Text>
              <Text style={styles.emptyStateText}>No comments yet</Text>
              <Text style={styles.emptyStateSubtext}>Be the first to comment!</Text>
            </View>
          }
        />

        {/* Input Area with Keyboard Avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            {replyingTo && (
              <View style={styles.replyingToBar}>
                <Text style={styles.replyingToText}>
                  Replying to <Text style={styles.replyingToName}>{replyingTo.name}</Text>
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)}>
                  <Text style={styles.cancelReply}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : 'Add a comment...'}
                placeholderTextColor="#9CA3AF"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => {
                  if (commentText.trim()) {
                    handleAddComment();
                  } else {
                    Keyboard.dismiss();
                  }
                }}
              />
              <TouchableOpacity
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  commentsList: {
    padding: 16,
  },
  originalPostContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    paddingBottom: 8,
  },
  originalPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  postName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postCaption: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  originalPostDivider: {
    height: 8,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
    marginHorizontal: -16,
  },
  commentCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  replyCard: {
    marginLeft: 0,
    backgroundColor: '#F9FAFB',
  },
  highlightedComment: {
    backgroundColor: '#EDE9FE',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionIcon: {
    fontSize: 14,
  },
  commentActionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  commentActionTextActive: {
    color: '#7C3AED',
  },
  commentActionTextDelete: {
    color: '#EF4444',
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: -12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  replyingToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
  },
  replyingToText: {
    fontSize: 13,
    color: '#6B7280',
  },
  replyingToName: {
    fontWeight: '600',
    color: '#7C3AED',
  },
  cancelReply: {
    fontSize: 16,
    color: '#6B7280',
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
});
