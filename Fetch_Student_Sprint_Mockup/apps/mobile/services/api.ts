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
  return 'http://192.168.12.58:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);

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

// Helper function to add timeout to fetch
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms - Check if backend server is running and accessible`);
    }
    throw error;
  }
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    console.log('Fetching posts from:', `${API_BASE_URL}/posts`);
    const startTime = Date.now();

    const response = await fetchWithTimeout(`${API_BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, 10000);

    const fetchTime = Date.now() - startTime;
    console.log(`Fetch took ${fetchTime}ms`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const data = await response.json();
    console.log('Response data:', data);

    if (data.success) {
      console.log('Successfully fetched', data.posts.length, 'posts');
      return data.posts;
    }
    throw new Error('Failed to fetch posts');
  } catch (error) {
    console.error('Error fetching posts:', error);
    console.error('Error type:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      throw new Error('Cannot connect to backend server. Make sure:\n1. Backend is running\n2. Your device is on the same WiFi\n3. IP address is correct (192.168.12.58)');
    }
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
