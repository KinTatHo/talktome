import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { AlertPopup } from '../components/AlertPopup';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [learningLanguages, setLearningLanguages] = useState([]);
    const [teachingLanguages, setTeachingLanguages] = useState([]);
    const [error, setError] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const navigate = useNavigate();
  
    const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        setUsername(userData.username);
        setEmail(userData.email);
        setLearningLanguages(userData.learningLanguages || []);
        setTeachingLanguages(userData.teachingLanguages || []);
      }
    }, []);
  
    const handleLanguageChange = (language, type) => {
      if (type === 'learning') {
        setLearningLanguages(prev => 
          prev.includes(language) ? prev.filter(lang => lang !== language) : [...prev, language]
        );
      } else {
        setTeachingLanguages(prev => 
          prev.includes(language) ? prev.filter(lang => lang !== language) : [...prev, language]
        );
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.put('http://localhost:3001/api/user/update', {
          username,
          email,
          learningLanguages,
          teachingLanguages
        }, {
          headers: { 'x-session-id': localStorage.getItem('sessionId') }
        });
  
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Open the success popup
        setIsPopupOpen(true);
      } catch (error) {
        setError('Failed to update profile. Please try again.');
      }
    };
  
    const handleClosePopup = () => {
      setIsPopupOpen(false);
      // Redirect to home page
      navigate('/');
    };
  
    if (!user) return <div>Loading...</div>;
  
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">User Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="email" className="block mb-1">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1">Learning Languages</label>
            <div className="space-y-2">
              {languageOptions.map(lang => (
                <label key={`learn-${lang}`} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={learningLanguages.includes(lang)}
                    onChange={() => handleLanguageChange(lang, 'learning')}
                    className="mr-2"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-1">Teaching Languages</label>
            <div className="space-y-2">
              {languageOptions.map(lang => (
                <label key={`teach-${lang}`} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={teachingLanguages.includes(lang)}
                    onChange={() => handleLanguageChange(lang, 'teaching')}
                    className="mr-2"
                  />
                  {lang}
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
            Update Profile
          </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        
        <AlertPopup 
          isOpen={isPopupOpen} 
          onClose={handleClosePopup}
          message="Profile updated successfully!"
        />
      </div>
    );
  };
  
  export default Profile;