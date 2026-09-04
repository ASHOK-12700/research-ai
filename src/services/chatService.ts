import { buildApiUrl } from './apiClient';
import type { ChatMessage } from '../types';

// Store conversation history in memory during session
let conversationHistory: ChatMessage[] = [];

export const chatService = {
  async getHistory(): Promise<ChatMessage[]> {
    return [...conversationHistory];
  },

  async sendMessage(query: string): Promise<ChatMessage> {
    // Add user message to history
    const userMessage: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    conversationHistory.push(userMessage);

    try {
      const url = buildApiUrl('/api/chat/message');
      
      // Build message list for API (excluding sources which aren't used for chatbot)
      const messages = conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to get response' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: data.message.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      conversationHistory.push(assistantMessage);
      return assistantMessage;

    } catch (error) {
      // Remove the user message if request fails
      conversationHistory.pop();
      throw error;
    }
  },

  clearHistory(): void {
    conversationHistory = [];
  }
};
