import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const MessageList = ({ userId, userRole }) => {
  const [connections, setConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('new message', (message) => {
      if (selectedConnection && (message.sender === selectedConnection._id || message.recipient === selectedConnection._id)) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    fetchConnections();

    return () => newSocket.disconnect();
  }, [userId]);

  const fetchConnections = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/connections', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setConnections(userRole === 'student' ? response.data.tutors : response.data.students);
    } catch (error) {
      console.error('Error fetching connections:', error);
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

  const handleConnectionSelect = (connection) => {
    setSelectedConnection(connection);
    fetchMessages(connection._id);
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

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      <div className="w-1/3 border-r overflow-y-auto">
        <h3 className="text-lg font-semibold p-4 border-b">Connections</h3>
        {connections.map(connection => (
          <div
            key={connection._id}
            className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConnection?._id === connection._id ? 'bg-blue-100' : ''}`}
            onClick={() => handleConnectionSelect(connection)}
          >
            {connection.username}
          </div>
        ))}
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedConnection ? (
          <>
            <h3 className="text-lg font-semibold p-4 border-b">Chat with {selectedConnection.username}</h3>
            <div className="flex-grow overflow-y-auto p-4">
              {messages.map(message => (
                <div key={message._id} className={`mb-2 ${message.sender === userId ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${message.sender === userId ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="border-t p-4 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow border rounded-l-md p-2"
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a connection to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;