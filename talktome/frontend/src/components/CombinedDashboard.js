import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  TrendingUp,
  MessageSquare,
  BookOpen,
  DollarSign,
  ChevronDown,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Bell,
  Settings,
  User
} from 'lucide-react';
import axios from 'axios';
import { useUser } from './UserContext';

// Reusable components
const StatCard = ({ icon: Icon, label, value, trend, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-lg cursor-pointer"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-[#fff5d6] rounded-lg">
          <Icon className="w-6 h-6 text-[#8B4513]" />
        </div>
        <div>
          <p className="text-sm text-[#6B4423]">{label}</p>
          <p className="text-2xl font-bold text-[#8B4513]">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  </motion.div>
);

const SessionCard = ({ session }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-4 rounded-lg shadow-md border-l-4 border-[#8B4513]"
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium text-[#8B4513]">{session.title}</h4>
        <p className="text-sm text-[#6B4423]">{session.student}</p>
      </div>
      <div className="text-right">
        <p className="text-[#8B4513] font-medium">{session.time}</p>
        <p className="text-sm text-[#6B4423]">{session.duration}</p>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-[#8B4513]" />
        <span className="text-sm text-[#6B4423]">{session.starts_in}</span>
      </div>
      <Link
        to={`/call/${session.id}`}
        className="px-4 py-1 bg-[#8B4513] text-white rounded-full text-sm hover:bg-[#6B4423] transition-colors"
      >
        Join Call
      </Link>
    </div>
  </motion.div>
);

const CombinedDashboard = () => {
  const [activeRole, setActiveRole] = useState('student');
  const { user } = useUser();
  const [stats, setStats] = useState({
    student: null,
    tutor: null
  });
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch stats based on active role
    const fetchStats = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/stats/${activeRole}`, {
          headers: { 'x-session-id': localStorage.getItem('sessionId') }
        });
        setStats(prev => ({ ...prev, [activeRole]: response.data }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [activeRole]);

  const studentStats = [
    { icon: Clock, label: 'Practice Hours', value: '24.5', trend: 12 },
    { icon: Star, label: 'Average Score', value: '85%', trend: 5 },
    { icon: BookOpen, label: 'Lessons Completed', value: '42', trend: 8 },
    { icon: MessageSquare, label: 'Active Tutors', value: '3', trend: 0 }
  ];

  const tutorStats = [
    { icon: Users, label: 'Active Students', value: '12', trend: 15 },
    { icon: Clock, label: 'Teaching Hours', value: '56.5', trend: 20 },
    { icon: DollarSign, label: 'Earnings', value: '$840', trend: 25 },
    { icon: Star, label: 'Rating', value: '4.9', trend: 3 }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: 'English Conversation',
      student: 'Sarah Johnson',
      time: '2:00 PM',
      duration: '45 min',
      starts_in: 'Starts in 30 min'
    },
    {
      id: 2,
      title: 'Spanish Grammar',
      student: 'Mike Chen',
      time: '3:30 PM',
      duration: '60 min',
      starts_in: 'Starts in 2 hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0]">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#8B4513] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="text-xl font-bold text-[#8B4513]">inguaMates</span>
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex space-x-2 bg-[#fff5d6] rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveRole('student')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRole === 'student'
                      ? 'bg-[#8B4513] text-white'
                      : 'text-[#8B4513] hover:bg-[#8B4513]/10'
                  }`}
                >
                  Student View
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveRole('tutor')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRole === 'tutor'
                      ? 'bg-[#8B4513] text-white'
                      : 'text-[#8B4513] hover:bg-[#8B4513]/10'
                  }`}
                >
                  Tutor View
                </motion.button>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-[#8B4513] hover:bg-[#fff5d6] rounded-lg"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-[#8B4513] hover:bg-[#fff5d6] rounded-lg"
                >
                  <Settings className="w-6 h-6" />
                </motion.button>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 p-2 text-[#8B4513] hover:bg-[#fff5d6] rounded-lg cursor-pointer"
                >
                  <div className="w-8 h-8 bg-[#8B4513] rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{user?.username}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeRole === 'student' ? studentStats : tutorStats).map((stat, index) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#8B4513]">Upcoming Sessions</h2>
                  <Link
                    to="/schedule"
                    className="text-[#8B4513] hover:text-[#6B4423] text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {[
                    { icon: MessageSquare, title: 'Conversation Practice', time: '2 hours ago', description: 'Completed a 30-minute session with Sarah' },
                    { icon: Star, title: 'Achievement Unlocked', time: '5 hours ago', description: 'Reached 10 hours of practice' },
                    { icon: BookOpen, title: 'Vocabulary Session', time: '1 day ago', description: 'Learned 20 new words' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="p-2 bg-[#fff5d6] rounded-lg">
                        <activity.icon className="w-5 h-5 text-[#8B4513]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#8B4513]">{activity.title}</h3>
                        <p className="text-sm text-[#6B4423]">{activity.description}</p>
                        <p className="text-xs text-[#6B4423] mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: MessageSquare, label: 'Practice', link: '/practice' },
                    { icon: Calendar, label: 'Schedule', link: '/schedule' },
                    { icon: Users, label: activeRole === 'student' ? 'Find Tutor' : 'My Students', link: activeRole === 'student' ? '/find-tutor' : '/students' },
                    { icon: TrendingUp, label: 'Progress', link: '/progress' }
                  ].map((action) => (
                    <Link
                      key={action.label}
                      to={action.link}
                      className="p-4 bg-[#fff5d6] rounded-lg text-center hover:bg-[#8B4513] hover:text-white transition-colors group"
                    >
                      <action.icon className="w-6 h-6 mx-auto mb-2 text-[#8B4513] group-hover:text-white" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Notifications</h2>
                <div className="space-y-4">
                  {[
                    { type: 'success', message: 'New session scheduled for tomorrow' },
                    { type: 'info', message: 'Complete your profile to unlock more features' },
                    { type: 'warning', message: 'You have an upcoming session in 2 hours' }
                  ].map((notification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg flex items-start space-x-3 ${
                        notification.type === 'success' ? 'bg-green-50 text-green-800' :
                        notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                        'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                         notification.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                         <Bell className="w-5 h-5" />}
                      </div>
                      <p className="text-sm">{notification.message}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Weekly Goals</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Practice Hours', current: 4, target: 5 },
                    { label: 'Vocabulary Words', current: 45, target: 50 },
                    { label: 'Grammar Exercises', current: 8, target: 10 }
                  ].map((goal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B4423]">{goal.label}</span>
                        <span className="text-[#8B4513] font-medium">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="h-2 bg-[#fff5d6] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#8B4513]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CombinedDashboard;