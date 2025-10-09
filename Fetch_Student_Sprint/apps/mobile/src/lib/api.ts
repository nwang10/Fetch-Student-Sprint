import { Flip, CreateFlip, Challenge, StoreLeaderboard, UserProfile } from '@repo/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Flips
  async getFlips(page = 1, limit = 10): Promise<Flip[]> {
    return this.request(`/api/flips?page=${page}&limit=${limit}`);
  }

  async createFlip(data: CreateFlip): Promise<Flip> {
    return this.request('/api/flips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async likeFlip(flipId: string): Promise<void> {
    return this.request(`/api/flips/${flipId}/like`, { method: 'POST' });
  }

  async unlikeFlip(flipId: string): Promise<void> {
    return this.request(`/api/flips/${flipId}/unlike`, { method: 'DELETE' });
  }

  // Challenges
  async getChallenges(status?: 'live' | 'upcoming' | 'completed'): Promise<Challenge[]> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/challenges${query}`);
  }

  async getChallenge(id: string): Promise<Challenge> {
    return this.request(`/api/challenges/${id}`);
  }

  // Leaderboards
  async getStoreLeaderboard(storeId: string): Promise<StoreLeaderboard> {
    return this.request(`/api/leaderboards/store/${storeId}`);
  }

  async getStores(): Promise<{ id: string; name: string; logoUrl?: string }[]> {
    return this.request('/api/stores');
  }

  // Profile
  async getProfile(userId?: string): Promise<UserProfile> {
    const endpoint = userId ? `/api/users/${userId}` : '/api/profile';
    return this.request(endpoint);
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // OCR for receipt scanning
  async scanReceipt(imageUri: string): Promise<{ brands: string[]; totalAmount: number }> {
    const formData = new FormData();
    formData.append('receipt', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'receipt.jpg',
    } as any);

    const response = await fetch(`${API_URL}/api/receipts/scan`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Receipt scan failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
