// API Service for communicating with the backend

// For web/localhost testing, use localhost
// For iOS testing, update this IP to match your computer's IPv4 address
// Run 'ipconfig' in terminal to find your computer's IPv4 address
// Make sure your iPhone is on the same Wi-Fi network as your computer

// Detect if running on web or native
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  }
  // For iOS/Android - Using current Wi-Fi IP
  // Make sure your iPhone is on the same Wi-Fi network as your computer
  return 'http://192.168.0.105:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface Post {
  id: string;
  avatar: string;
  name: string;
  subline: string;
  caption: string;
  imageSource: { uri: string } | number;
  initialLikes: number;
  initialComments: number;
  points: number;
  createdAt?: string;
}

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`);
    const data = await response.json();
    if (data.success) {
      return data.posts;
    }
    throw new Error('Failed to fetch posts');
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Fetch single post
export const fetchPost = async (id: string): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    const data = await response.json();
    if (data.success) {
      return data.post;
    }
    throw new Error('Failed to fetch post');
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

// Create new post
export const createPost = async (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    });
    const data = await response.json();
    if (data.success) {
      return data.post;
    }
    throw new Error('Failed to create post');
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Update post
export const updatePost = async (id: string, updates: Partial<Post>): Promise<Post> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (data.success) {
      return data.post;
    }
    throw new Error('Failed to update post');
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to delete post');
    }
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (postId: string, commentData: any): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    const data = await response.json();
    if (data.success) {
      return data.comment;
    }
    throw new Error('Failed to add comment');
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Delete comment from post
export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to delete comment');
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Like/unlike comment
export const likeComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
      method: 'PUT',
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to like comment');
    }
  } catch (error) {
    console.error('Error liking comment:', error);
    throw error;
  }
};

// Generate AI roast video
export interface GenerateRoastVideoResponse {
  success: boolean;
  videoUrl?: string;
  audioUrl?: string;
  message?: string;
  error?: string;
}

export const generateRoastVideo = async (
  roastText: string,
  receiptItems: Array<{ name: string; price: number }>
): Promise<GenerateRoastVideoResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-roast-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roastText, receiptItems }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating roast video:', error);
    return {
      success: false,
      error: 'Failed to generate roast video',
    };
  }
};
