import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useUser } from './UserContext';
import io from 'socket.io-client';

const FloatingChatIcon = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const { user } = useUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('new message', (message) => {
        if (selectedConnection && (message.sender === selectedConnection._id || message.recipient === selectedConnection._id)) {
          setMessages(prevMessages => [...prevMessages, message]);
        }
        fetchUnreadCount();
      });

      fetchConnections();
      fetchUnreadCount();

      return () => newSocket.disconnect();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConnection) {
      fetchMessages(selectedConnection._id);
    }
  }, [selectedConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/connections', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setConnections(user.role === 'student' ? response.data.tutors : response.data.students);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/unread-messages', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      const totalUnread = Object.values(response.data).reduce((a, b) => a + b, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  const fetchMessages = async (connectionId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/${connectionId}`, {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedConnection || !newMessage.trim()) return;

    try {
      await axios.post('http://localhost:3001/api/message', {
        recipientId: selectedConnection._id,
        content: newMessage
      }, {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setNewMessage('');
      fetchMessages(selectedConnection._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      fetchConnections();
      fetchUnreadCount();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={toggleChat}
      >
        <div className="relative">
          <div className="bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors">
            <MessageCircle size={24} />
          </div>
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
      </div>
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 bg-blue-500 text-white flex justify-between items-center">
            <h3 className="font-bold">Messages</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">&times;</button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {!selectedConnection ? (
              <div className="p-4">
                {connections.map(connection => (
                  <div
                    key={connection._id}
                    className="cursor-pointer p-3 hover:bg-gray-100 rounded-lg mb-2 transition-colors"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    {connection.username}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="p-3 bg-gray-100 border-b flex items-center">
                  <button onClick={() => setSelectedConnection(null)} className="mr-2 text-blue-500 hover:text-blue-600">&larr;</button>
                  <span className="font-bold">{selectedConnection.username}</span>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                  {messages.map(message => (
                    <div key={message._id} className={`mb-4 flex ${message.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3/4 p-3 rounded-lg ${message.sender === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-3 border-t">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type a message..."
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatIcon;