import React, { useState, useEffect, useRef } from 'react';
import Message from './Message';
import chatService from '../services/chatService';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history if sessionId exists
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      loadHistory(savedSessionId);
    }
  }, []);

  const loadHistory = async (convId) => {
    try {
      const history = await chatService.getHistory(convId);
      const formattedMessages = history.map(msg => ({
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp
      }));
      setMessages(formattedMessages);
      setSessionId(convId);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to UI immediately
    const newUserMessage = {
      text: userMessage,
      sender: 'USER',
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage, sessionId);
      
      if (response.success) {
        // Save session ID
        if (!sessionId && response.sessionId) {
          setSessionId(response.sessionId);
          localStorage.setItem('chatSessionId', response.sessionId);
        }

        // Add AI message to UI
        const aiMessage = {
          text: response.reply,
          sender: 'AI',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setError(response.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('chatSessionId');
    setError(null);
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="header-content">
          <h2>TechStore Support</h2>
          <p className="status">
            <span className="status-dot"></span>
            Online
          </p>
        </div>
        <button className="new-chat-btn" onClick={handleNewChat} title="Start new chat">
          New Chat
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h3>👋 Welcome to TechStore Support!</h3>
            <p>How can we help you today?</p>
            <div className="quick-questions">
              <button onClick={() => setInputMessage("What's your return policy?")}>
                Return Policy
              </button>
              <button onClick={() => setInputMessage("Do you ship internationally?")}>
                Shipping Info
              </button>
              <button onClick={() => setInputMessage("What are your support hours?")}>
                Support Hours
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <Message
            key={index}
            message={msg.text}
            sender={msg.sender}
            timestamp={msg.timestamp}
          />
        ))}

        {isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Agent is typing...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="chat-input"
          disabled={isLoading}
          maxLength={2000}
        />
        <button
          type="submit"
          className="send-button"
          disabled={!inputMessage.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWidget;