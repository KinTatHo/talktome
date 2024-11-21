import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  RadarLine,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Trophy,
  TrendingUp,
  Clock,
  Calendar,
  Languages,
  Brain,
  Star,
  Target,
  ChevronDown,
  MessageCircle,
  Mic,
  BookOpen
} from 'lucide-react';

const Progress = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Mock data
  const practiceData = [
    { date: 'Mon', minutes: 45, accuracy: 82, words: 450 },
    { date: 'Tue', minutes: 30, accuracy: 85, words: 380 },
    { date: 'Wed', minutes: 60, accuracy: 88, words: 520 },
    { date: 'Thu', minutes: 40, accuracy: 84, words: 410 },
    { date: 'Fri', minutes: 50, accuracy: 87, words: 480 },
    { date: 'Sat', minutes: 20, accuracy: 83, words: 320 },
    { date: 'Sun', minutes: 55, accuracy: 89, words: 490 }
  ];

  const skillsData = [
    { skill: 'Pronunciation', value: 85 },
    { skill: 'Grammar', value: 78 },
    { skill: 'Vocabulary', value: 82 },
    { skill: 'Fluency', value: 75 },
    { skill: 'Comprehension', value: 88 }
  ];

  const achievements = [
    { icon: Mic, title: 'Voice Master', description: '10 hours of speaking practice', progress: 80 },
    { icon: Brain, title: 'Grammar Guru', description: '500 sentences with perfect grammar', progress: 65 },
    { icon: Star, title: 'Vocabulary Victor', description: 'Learned 1000 new words', progress: 45 },
    { icon: Target, title: 'Accuracy Ace', description: '90% accuracy in pronunciation', progress: 90 }
  ];

  const languages = [
    { code: 'all', name: 'All Languages' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' }
  ];

  const timeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const stats = [
    { icon: Clock, label: 'Total Practice Time', value: '24h 35m' },
    { icon: MessageCircle, label: 'Words Spoken', value: '12,450' },
    { icon: TrendingUp, label: 'Average Accuracy', value: '85%' },
    { icon: Calendar, label: 'Practice Streak', value: '7 days' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="w-16 h-16 text-[#8B4513] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[#8B4513] mb-2">Your Learning Journey</h1>
            <p className="text-[#6B4423]">Track your progress and celebrate your achievements</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg shadow-md appearance-none text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
          </div>

          <div className="relative">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg shadow-md appearance-none text-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
            >
              {timeframes.map(timeframe => (
                <option key={timeframe.value} value={timeframe.value}>{timeframe.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#fff5d6] rounded-lg">
                  <stat.icon className="w-6 h-6 text-[#8B4513]" />
                </div>
                <div>
                  <p className="text-sm text-[#6B4423]">{stat.label}</p>
                  <p className="text-2xl font-bold text-[#8B4513]">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Practice Time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-[#8B4513] mb-6">Practice Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={practiceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#8B4513"
                    strokeWidth={2}
                    dot={{ fill: '#8B4513' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Skills Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-xl font-bold text-[#8B4513] mb-6">Skills Overview</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillsData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Skills"
                    dataKey="value"
                    stroke="#8B4513"
                    fill="#8B4513"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#8B4513] mb-6">Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={achievement.title} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-[#fff5d6] rounded-lg">
                    <achievement.icon className="w-6 h-6 text-[#8B4513]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#8B4513]">{achievement.title}</h4>
                    <p className="text-sm text-[#6B4423]">{achievement.description}</p>
                  </div>
                </div>
                <div className="h-2 bg-[#fff5d6] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#8B4513]"
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
                <p className="text-sm text-right text-[#6B4423]">{achievement.progress}%</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-xl font-bold text-[#8B4513] mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { icon: Mic, title: 'Speaking Practice', time: '2 hours ago', duration: '30 minutes', score: '85%' },
              { icon: BookOpen, title: 'Vocabulary Session', time: '5 hours ago', duration: '45 minutes', score: '92%' },
              { icon: MessageCircle, title: 'Conversation Practice', time: '1 day ago', duration: '60 minutes', score: '88%' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#fff5d6] rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg">
                    <activity.icon className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#8B4513]">{activity.title}</h4>
                    <p className="text-sm text-[#6B4423]">{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#8B4513]">{activity.duration}</p>
                  <p className="text-sm text-[#6B4423]">Score: {activity.score}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;