import axios from 'axios';

const API_BASE_URL = 'https://ai-chat-backend-1-zn1e.onrender.com/api/chat/message/api/chat';

const chatService = {
  sendMessage: async (message, sessionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/message`, {
        message,
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  getHistory: async (conversationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  }
};

export default chatService;