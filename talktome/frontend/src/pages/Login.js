import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../components/UserContext';
import { Loader2, LogIn, BookOpen } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await login(username, password);
      localStorage.setItem('sessionId', response.sessionId);
      
      const userResponse = await axios.get('http://localhost:3001/api/user', {
        headers: { 'x-session-id': response.sessionId }
      });
      setUser(userResponse.data);
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Login failed. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <div className="bg-white w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-[#8B4513]" />
          </div>
          <h2 className="text-3xl font-bold text-[#8B4513] mb-2">Welcome Back!</h2>
          <p className="text-[#6B4423]">Continue your language learning journey</p>
        </div>

        <motion.div
          className="bg-white rounded-xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#8B4513] mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors placeholder-[#B8860B]/50"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#8B4513] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors placeholder-[#B8860B]/50"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423] transition-colors flex items-center justify-center font-medium shadow-md ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="mr-2" size={18} />
                  Sign In
                </>
              )}
            </motion.button>

            <div className="text-center mt-6">
              <p className="text-[#6B4423]">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-[#8B4513] hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        <motion.div
          className="mt-8 text-center text-[#6B4423] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-[#8B4513] hover:underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-[#8B4513] hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;