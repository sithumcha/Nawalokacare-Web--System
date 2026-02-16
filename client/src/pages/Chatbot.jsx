import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId'));
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  // Load chat history when chat opens
  useEffect(() => {
    if (isOpen && sessionId) {
      loadChatHistory();
    } else if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: 1,
          text: 'Hello! 👋 Welcome to MediCare Hospital. How can I help you today?',
          sender: 'bot',
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/history?sessionId=${sessionId}`);
      if (response.data.messages && response.data.messages.length > 0) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Sending to:', `${API_URL}/chatbot/chat`);
      
      const response = await axios.post(`${API_URL}/chatbot/chat`, {
        message: input,
        sessionId: sessionId
      });

      console.log('Response:', response.data);

      // Save session ID if new
      if (!sessionId && response.data.sessionId) {
        setSessionId(response.data.sessionId);
        localStorage.setItem('chatSessionId', response.data.sessionId);
      }

      // Add bot response to UI
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.message,
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble connecting.';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'bot',
        time: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 1,
      text: 'Hello! 👋 Welcome to MediCare Hospital. How can I help you today?',
      sender: 'bot',
      time: new Date().toLocaleTimeString()
    }]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '30px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          transition: 'transform 0.3s ease',
          zIndex: 9999
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '110px',
            right: '30px',
            width: '380px',
            height: '600px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'slideIn 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🏥
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>MediCare Assistant</h3>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                  {loading ? 'Typing...' : 'Online | AI Powered'}
                </p>
              </div>
            </div>
            <div>
              <button
                onClick={clearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '18px'
                }}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={toggleChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '5px'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  minWidth: '100px',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: msg.sender === 'user' ? '#667eea' : 'white',
                  color: msg.sender === 'user' ? 'white' : '#2d3748',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    {msg.text}
                  </p>
                  <p style={{
                    margin: '5px 0 0',
                    fontSize: '10px',
                    textAlign: 'right',
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : '#a0aec0'
                  }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '18px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <span style={{ animation: 'bounce 1s infinite' }}>●</span>
                    <span style={{ animation: 'bounce 1s infinite 0.2s' }}>●</span>
                    <span style={{ animation: 'bounce 1s infinite 0.4s' }}>●</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'flex',
              gap: '10px',
              backgroundColor: '#f7fafc',
              borderRadius: '30px',
              padding: '5px'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  cursor: (loading || !input.trim()) ? 'default' : 'pointer',
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;