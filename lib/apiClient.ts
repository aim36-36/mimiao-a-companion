import { supabase } from './supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
    private async getAuthToken(): Promise<string | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    }

    private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await this.getAuthToken();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Auth
    async deviceLogin(deviceId: string, username?: string) {
        return this.request('/auth/device-login', {
            method: 'POST',
            body: JSON.stringify({ deviceId, username }),
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    // Chat
    async getChatHistory(limit = 50, offset = 0) {
        return this.request(`/chat/history?limit=${limit}&offset=${offset}`);
    }

    async sendMessage(text: string, imageUrl?: string) {
        return this.request('/chat/message', {
            method: 'POST',
            body: JSON.stringify({ text, image_url: imageUrl }),
        });
    }

    async clearChatHistory() {
        return this.request('/chat/history', { method: 'DELETE' });
    }

    // Moments
    async getMoments(limit = 20, offset = 0) {
        return this.request(`/moments?limit=${limit}&offset=${offset}`);
    }

    async createMoment(content: string, imageUrl?: string, location?: string) {
        return this.request('/moments', {
            method: 'POST',
            body: JSON.stringify({ content, image_url: imageUrl, location }),
        });
    }

    async toggleMomentLike(momentId: number) {
        return this.request(`/moments/${momentId}/like`, { method: 'POST' });
    }

    async addComment(momentId: number, content: string) {
        return this.request(`/moments/${momentId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async deleteComment(commentId: number) {
        return this.request(`/moments/comments/${commentId}`, { method: 'DELETE' });
    }

    async toggleCommentLike(commentId: number) {
        return this.request(`/moments/comments/${commentId}/like`, { method: 'POST' });
    }

    // Story
    async getStorySaves() {
        return this.request('/story/saves');
    }

    async saveStoryProgress(slotNumber: number, title: string, saveType: string, saveData: any) {
        return this.request('/story/saves', {
            method: 'POST',
            body: JSON.stringify({
                slot_number: slotNumber,
                title,
                save_type: saveType,
                save_data: saveData,
            }),
        });
    }

    async loadStorySave(saveId: number) {
        return this.request(`/story/saves/${saveId}`);
    }

    async getCGGallery() {
        return this.request('/story/cg');
    }

    async unlockCG(cgId: number) {
        return this.request(`/story/cg/${cgId}/unlock`, { method: 'POST' });
    }

    async getStorySettings() {
        return this.request('/story/settings');
    }

    async updateStorySettings(settings: any) {
        return this.request('/story/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    }

    // Game
    async getGameState(gameType: string) {
        return this.request(`/game/${gameType}/state`);
    }

    async saveGameState(gameType: string, stateData: any) {
        return this.request(`/game/${gameType}/state`, {
            method: 'PUT',
            body: JSON.stringify({ state_data: stateData }),
        });
    }

    async clearGameState(gameType: string) {
        return this.request(`/game/${gameType}/state`, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
