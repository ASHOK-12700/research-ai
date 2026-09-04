import { buildApiUrl } from './apiClient';

export interface AIPreferences {
  user_id: string;
  model: string;
  temperature: number;
  reasoning_depth: 'Standard Analysis' | 'Deep Analysis' | 'Exhaustive';
}

export const aiPreferencesService = {
  async getPreferences(_userId: string): Promise<AIPreferences> {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = buildApiUrl('/preferences/');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to get preferences' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  async savePreferences(preferences: AIPreferences): Promise<AIPreferences> {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const url = buildApiUrl('/preferences/');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to save preferences' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Local storage fallback for when backend is unavailable
  getLocalPreferences(): Partial<AIPreferences> | null {
    const stored = localStorage.getItem('ai_preferences');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  setLocalPreferences(preferences: Partial<AIPreferences>): void {
    localStorage.setItem('ai_preferences', JSON.stringify(preferences));
  },
};
