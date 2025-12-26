import React from 'react';

const Message = ({ message, sender, timestamp }) => {
  const isUser = sender === 'USER';
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="message-content">
        <div className="message-header">
          <span className="sender-name">
            {isUser ? 'You' : 'AI Support Agent'}
          </span>
          <span className="message-time">
            {formatTime(timestamp)}
          </span>
        </div>
        <div className="message-text">{message}</div>
      </div>
    </div>
  );
};

export default Message;