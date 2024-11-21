import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Settings,
  FileText,
  Award,
  ChevronDown,
  Trophy
} from 'lucide-react';

const TutorDashboard = () => {
  const { user } = useUser();
  const [earnings, setEarnings] = useState(null);
  const [students, setStudents] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [earningsRes, studentsRes, sessionsRes, statsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/tutor/earnings'),
          axios.get('http://localhost:3001/api/tutor/students'),
          axios.get('http://localhost:3001/api/tutor/sessions'),
          axios.get('http://localhost:3001/api/tutor/stats')
        ].map(promise => promise.catch(error => ({ error }))));

        if (earningsRes.data) setEarnings(earningsRes.data);
        if (studentsRes.data) setStudents(studentsRes.data);
        if (sessionsRes.data) setUpcomingSessions(sessionsRes.data);
        if (statsRes.data) setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0]">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={DollarSign}
              label="Total Earnings"
              value="$2,450"
              trend={15}
            />
            <StatCard
              icon={Clock}
              label="Teaching Hours"
              value="156"
              trend={8}
            />
            <StatCard
              icon={Users}
              label="Active Students"
              value="24"
              trend={12}
            />
            <StatCard
              icon={Star}
              label="Rating"
              value="4.9"
              trend={5}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Schedule and Sessions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Calendar Overview */}
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
                    View Calendar →
                  </Link>
                </div>
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </motion.div>

              {/* Student Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Student Progress</h2>
                <div className="space-y-6">
                  {students.slice(0, 3).map(student => (
                    <div key={student.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-[#fff5d6] rounded-full flex items-center justify-center">
                            <span className="text-[#8B4513] font-medium">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-[#8B4513]">{student.name}</h4>
                            <p className="text-sm text-[#6B4423]">{student.level}</p>
                          </div>
                        </div>
                        <Link
                          to={`/students/${student.id}`}
                          className="text-[#8B4513] hover:text-[#6B4423] text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                      <div className="h-2 bg-[#fff5d6] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#8B4513]"
                          initial={{ width: 0 }}
                          animate={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats and Quick Actions */}
            <div className="space-y-6">
              {/* Earnings Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Earnings Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className="bg-[#fff5d6] text-[#8B4513] rounded-lg px-3 py-2"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                    <Link
                      to="/earnings"
                      className="text-[#8B4513] hover:text-[#6B4423] text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#fff5d6] p-4 rounded-lg">
                      <p className="text-sm text-[#6B4423]">Total Earned</p>
                      <p className="text-xl font-bold text-[#8B4513]">$840</p>
                    </div>
                    <div className="bg-[#fff5d6] p-4 rounded-lg">
                      <p className="text-sm text-[#6B4423]">Pending</p>
                      <p className="text-xl font-bold text-[#8B4513]">$120</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Calendar, label: 'Schedule', link: '/schedule' },
                    { icon: Users, label: 'Students', link: '/students' },
                    { icon: FileText, label: 'Materials', link: '/materials' },
                    { icon: Settings, label: 'Settings', link: '/settings' }
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

              {/* Recent Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Recent Reviews</h2>
                <div className="space-y-4">
                  {[
                    { student: 'Sarah J.', rating: 5, comment: 'Excellent tutor! Very patient and knowledgeable.' },
                    { student: 'Mike C.', rating: 5, comment: 'Great at explaining complex grammar concepts.' },
                    { student: 'Emma W.', rating: 4, comment: 'Very helpful with pronunciation.' }
                  ].map((review, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-[#fff5d6] p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-[#8B4513]">{review.student}</span>
                        <div className="flex">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-500 fill-current"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#6B4423]">{review.comment}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Teaching Resources */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <h2 className="text-xl font-bold text-[#8B4513] mb-6">Teaching Resources</h2>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen, title: 'Lesson Plans', count: 15 },
                    { icon: FileText, title: 'Worksheets', count: 24 },
                    { icon: MessageSquare, title: 'Conversation Topics', count: 30 }
                  ].map((resource, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-3 bg-[#fff5d6] rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <resource.icon className="w-5 h-5 text-[#8B4513]" />
                        <span className="text-[#8B4513]">{resource.title}</span>
                      </div>
                      <span className="text-sm text-[#6B4423]">{resource.count}</span>
                    </motion.div>
                  ))}
                  <Link
                    to="/resources"
                    className="block text-center text-[#8B4513] hover:text-[#6B4423] text-sm mt-4"
                  >
                    View All Resources →
                  </Link>
                </div>
              </motion.div>

              {/* Achievement Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#8B4513]">Achievements</h2>
                  <span className="text-sm text-[#6B4423]">5/12 Earned</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Award, title: 'Super Tutor', earned: true },
                    { icon: Clock, title: '100 Hours', earned: true },
                    { icon: Users, title: '50 Students', earned: true },
                    { icon: Star, title: 'Top Rated', earned: true },
                    { icon: MessageSquare, title: 'Conversation Master', earned: true },
                    { icon: Trophy, title: 'Language Expert', earned: false }
                  ].map((badge, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 rounded-lg text-center ${
                        badge.earned ? 'bg-[#fff5d6]' : 'bg-gray-100'
                      }`}
                    >
                      <badge.icon
                        className={`w-6 h-6 mx-auto mb-2 ${
                          badge.earned ? 'text-[#8B4513]' : 'text-gray-400'
                        }`}
                      />
                      <span className={`text-xs ${
                        badge.earned ? 'text-[#8B4513]' : 'text-gray-400'
                      }`}>
                        {badge.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Teaching Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#8B4513] mb-6">Teaching Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Engaging Students',
                  description: 'Learn effective techniques to keep students motivated and participative during lessons.',
                  link: '/tips/engagement'
                },
                {
                  title: 'Assessment Strategies',
                  description: 'Discover various ways to assess student progress and provide constructive feedback.',
                  link: '/tips/assessment'
                },
                {
                  title: 'Cultural Awareness',
                  description: 'Understanding and incorporating cultural context in language teaching.',
                  link: '/tips/culture'
                }
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#fff5d6] p-6 rounded-lg"
                >
                  <h3 className="font-medium text-[#8B4513] mb-2">{tip.title}</h3>
                  <p className="text-sm text-[#6B4423] mb-4">{tip.description}</p>
                  <Link
                    to={tip.link}
                    className="text-[#8B4513] hover:text-[#6B4423] text-sm inline-flex items-center"
                  >
                    Learn More
                    <ChevronDown className="w-4 h-4 ml-1 transform -rotate-90" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;