import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="text-center">
    <h2 className="text-3xl font-bold mb-4">Welcome to Talk To Me</h2>
    <p className="text-xl mb-6">Improve your language skills with AI-powered tutoring</p>
    <Link to="/practice" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
      Start Practicing
    </Link>
  </div>
);

export default Home;