import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/user', {
          headers: { 'x-session-id': localStorage.getItem('sessionId') }
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to fetch user information');
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div>Loading user information...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return null;

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold">Welcome, {user.username}!</h2>
      {/* <p>Role: {user.role}</p>
      {user.learningLanguages && (
        <p>Learning: {user.learningLanguages.join(', ')}</p>
      )}
      {user.teachingLanguages && (
        <p>Teaching: {user.teachingLanguages.join(', ')}</p>
      )} */}
    </div>
  );
};

export default UserInfo;