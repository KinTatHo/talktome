import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  MessageCircle, 
  Trophy, 
  Users, 
  ArrowRight, 
  Globe, 
  Sparkles,
  BarChart,
  Calendar,
  Target,
  Clock
} from 'lucide-react';
import { useUser } from '../components/UserContext';

const FeatureCard = ({ icon: Icon, title, description, link }) => (
  <motion.div
    className="bg-white p-6 rounded-lg shadow-lg"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
  >
    <Icon className="w-12 h-12 text-[#8B4513] mb-4" />
    <h3 className="text-xl font-bold text-[#8B4513] mb-2">{title}</h3>
    <p className="text-[#6B4423] mb-4">{description}</p>
    {link && (
      <Link
        to={link}
        className="inline-flex items-center text-[#8B4513] hover:text-[#6B4423] font-medium"
      >
        Get Started <ArrowRight className="ml-1 w-4 h-4" />
      </Link>
    )}
  </motion.div>
);

const QuickActionCard = ({ icon: Icon, title, description, link }) => (
  <Link to={link}>
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg text-center hover:bg-[#fff5d6] transition-colors"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="bg-[#fff5d6] w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-[#8B4513]" />
      </div>
      <h3 className="text-lg font-bold text-[#8B4513] mb-2">{title}</h3>
      <p className="text-sm text-[#6B4423]">{description}</p>
    </motion.div>
  </Link>
);

const Home = () => {
  const { user } = useUser();

  const LoggedOutView = () => (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-white w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-lg">
              <BookOpen className="w-12 h-12 text-[#8B4513]" />
            </div>
          </motion.div>
          <h1 className="text-5xl font-bold mb-6 text-[#8B4513]">Welcome to LinguaMates</h1>
          <p className="text-xl mb-8 text-[#6B4423]">
            Master any language through personalized AI-powered tutoring and 
            connect with language partners worldwide
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-[#8B4513] text-white font-bold hover:bg-[#6B4423] transition-colors shadow-md"
            >
              Get Started Free <ArrowRight className="ml-2" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 rounded-lg border-2 border-[#8B4513] text-[#8B4513] font-bold hover:bg-[#8B4513] hover:text-white transition-colors"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          className="text-3xl font-bold text-center mb-12 text-[#8B4513]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Why Choose LinguaMates?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={MessageCircle}
            title="AI Conversation"
            description="Practice speaking with our advanced AI tutors anytime, anywhere"
          />
          <FeatureCard
            icon={Users}
            title="Language Partners"
            description="Connect with native speakers and fellow learners worldwide"
          />
          <FeatureCard
            icon={Globe}
            title="Custom Lessons"
            description="Personalized learning plans adapted to your goals and level"
          />
          <FeatureCard
            icon={Trophy}
            title="Track Progress"
            description="Monitor your improvement with detailed analytics and achievements"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          className="bg-white rounded-xl p-12 text-center max-w-3xl mx-auto shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="w-12 h-12 text-[#8B4513] mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-6 text-[#8B4513]">Ready to Start Your Language Journey?</h2>
          <p className="text-xl text-[#6B4423] mb-8">
            Join thousands of learners who are achieving their language goals with LinguaMates
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 rounded-lg bg-[#8B4513] text-white font-bold hover:bg-[#6B4423] transition-colors shadow-md"
          >
            Get Started Free <ArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </section>
    </>
  );

  const LoggedInView = () => (
    <div className="container mx-auto px-4 py-12">
      {/* Welcome Back Section */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-[#8B4513] mb-4">
          Welcome Back, {user.username}!
        </h1>
        <p className="text-[#6B4423] text-lg">
          Continue your language learning journey
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {user.role === 'student' || user.role === 'both' ? (
          <>
            <QuickActionCard
              icon={MessageCircle}
              title="Practice Speaking"
              description="Start an AI-powered conversation"
              link="/practice"
            />
            <QuickActionCard
              icon={BarChart}
              title="View Progress"
              description="Check your learning statistics"
              link="/progress"
            />
            <QuickActionCard
              icon={Users}
              title="Find Tutors"
              description="Connect with language experts"
              link="/find-tutor"
            />
            <QuickActionCard
              icon={Target}
              title="Set Goals"
              description="Update your learning objectives"
              link="/goals"
            />
          </>
        ) : (
          <>
            <QuickActionCard
              icon={Calendar}
              title="Schedule"
              description="Manage your teaching sessions"
              link="/schedule"
            />
            <QuickActionCard
              icon={Users}
              title="Students"
              description="View your student list"
              link="/students"
            />
            <QuickActionCard
              icon={BookOpen}
              title="Materials"
              description="Access teaching resources"
              link="/materials"
            />
            <QuickActionCard
              icon={Clock}
              title="Upcoming"
              description="View scheduled sessions"
              link="/upcoming"
            />
          </>
        )}
      </div>

      {/* Recent Activity or Stats */}
      <motion.div
        className="bg-white rounded-xl p-8 shadow-xl mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-[#8B4513] mb-6">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Add recent activity items or stats here */}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0]">
      {user ? <LoggedInView /> : <LoggedOutView />}
    </div>
  );
};

export default Home;