import React, { useState } from 'react';
import axios from 'axios';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('en'); // Default to English
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [detailedError, setDetailedError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is 25 MB. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB.`);
      setFile(null);
    } else {
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('language', language);

    try {
      setError('');
      setDetailedError('');
      setTranscript('');
      console.log('Sending file:', file);
      console.log('Language:', language);
      const response = await axios.post('http://localhost:3001/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Response:', response.data);
      setTranscript(response.data.transcript);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'An error occurred during upload');
      setDetailedError(JSON.stringify(error.response?.data, null, 2));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept="audio/*,video/mp4"
            className="flex-1"
          />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="nl">Dutch</option>
            <option value="ru">Russian</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="zh">Chinese</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Upload and Transcribe
        </button>
      </form>
      {error && (
        <div className="text-red-500">
          <p>{error}</p>
          {detailedError && (
            <pre className="whitespace-pre-wrap break-all bg-red-100 p-2 rounded-md">
              {detailedError}
            </pre>
          )}
        </div>
      )}
      {transcript && (
        <div className="bg-green-100 p-4 rounded-md">
          <h3 className="font-bold mb-2">Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;