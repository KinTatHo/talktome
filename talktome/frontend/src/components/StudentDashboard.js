import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MessageList from './MessageList';
import UserInfo from './UserInfo';
import { useUser } from './UserContext';
import { 
  BookOpen, 
  CircleUser, 
  Clock, 
  Calendar, 
  TrendingUp, 
  MessageCircle,
  Award,
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';

const DashboardCard = ({ title, icon: Icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md overflow-hidden"
  >
    <div className="p-6">
      <div className="flex items-center mb-4">
        <Icon className="w-6 h-6 text-[#8B4513] mr-3" />
        <h3 className="text-lg font-semibold text-[#8B4513]">{title}</h3>
      </div>
      {children}
    </div>
  </motion.div>
);

const UpcomingSession = ({ time, tutor, language, status }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center justify-between p-4 border-b border-[#DEB887]/20 last:border-0"
  >
    <div className="flex items-center space-x-4">
      <div className="bg-[#fff5d6] p-2 rounded-lg">
        <Calendar className="w-5 h-5 text-[#8B4513]" />
      </div>
      <div>
        <p className="font-medium text-[#6B4423]">{time}</p>
        <p className="text-sm text-[#8B4513]">{tutor} - {language}</p>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-sm ${
      status === 'Confirmed' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {status}
    </span>
  </motion.div>
);

const ProgressItem = ({ language, progress, level }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="mb-4 last:mb-0"
  >
    <div className="flex justify-between mb-2">
      <span className="text-[#6B4423] font-medium">{language}</span>
      <span className="text-[#8B4513]">Level {level}</span>
    </div>
    <div className="h-2 bg-[#DEB887]/20 rounded-full">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-[#8B4513] rounded-full"
      />
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, link }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center p-4 bg-[#fff5d6] rounded-xl"
    >
      <Icon className="w-8 h-8 text-[#8B4513] mb-2" />
      <span className="text-sm font-medium text-[#6B4423] text-center">{title}</span>
    </motion.div>
  </Link>
);

const StudentDashboard = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 text-[#8B4513] animate-spin" />
          <span className="text-[#8B4513] font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-64 space-y-4"
          >
            <UserInfo />
            <nav className="bg-white rounded-xl p-4 shadow-md">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'overview' ? 'bg-[#fff5d6] text-[#8B4513]' : 'text-[#6B4423] hover:bg-[#fff5d6]/50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'progress' ? 'bg-[#fff5d6] text-[#8B4513]' : 'text-[#6B4423] hover:bg-[#fff5d6]/50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Progress</span>
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  activeTab === 'messages' ? 'bg-[#fff5d6] text-[#8B4513]' : 'text-[#6B4423] hover:bg-[#fff5d6]/50'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </button>
            </nav>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              <QuickAction icon={MessageCircle} title="Start Practice" link="/practice" />
              <QuickAction icon={CircleUser} title="Find Tutor" link="/find-tutor" />
              <QuickAction icon={Calendar} title="Schedule Session" link="/schedule" />
              <QuickAction icon={Award} title="View Progress" link="/progress" />
            </motion.div>

            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <DashboardCard title="Upcoming Sessions" icon={Clock}>
                <UpcomingSession 
                  time="Today, 3:00 PM"
                  tutor="Sarah Johnson"
                  language="Spanish"
                  status="Confirmed"
                />
                <UpcomingSession 
                  time="Tomorrow, 2:30 PM"
                  tutor="Michael Chen"
                  language="French"
                  status="Pending"
                />
              </DashboardCard>

              <DashboardCard title="Language Progress" icon={TrendingUp}>
                <ProgressItem 
                  language="Spanish" 
                  progress={75}
                  level="B1"
                />
                <ProgressItem 
                  language="French" 
                  progress={45}
                  level="A2"
                />
              </DashboardCard>

              <DashboardCard title="Recent Activity" icon={Clock}>
                <div className="space-y-4">
                  <div className="flex items-center text-[#6B4423]">
                    <div className="w-2 h-2 bg-[#8B4513] rounded-full mr-3" />
                    <p>Completed Spanish conversation practice</p>
                  </div>
                  <div className="flex items-center text-[#6B4423]">
                    <div className="w-2 h-2 bg-[#8B4513] rounded-full mr-3" />
                    <p>Scheduled new session with tutor</p>
                  </div>
                  <div className="flex items-center text-[#6B4423]">
                    <div className="w-2 h-2 bg-[#8B4513] rounded-full mr-3" />
                    <p>Achieved Level A2 in French</p>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Study Streak" icon={Award}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#8B4513] mb-2">7 Days</div>
                  <p className="text-[#6B4423]">Keep up the great work!</p>
                  <div className="flex justify-center space-x-2 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div
                        key={day}
                        className="w-8 h-8 rounded-full bg-[#fff5d6] flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-[#8B4513]" />
                      </div>
                    ))}
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;