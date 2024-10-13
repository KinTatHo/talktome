import React, { useState } from 'react';
import StudentDashboard from './StudentDashboard';
import TutorDashboard from './TutorDashboard';

const CombinedDashboard = () => {
  const [activeRole, setActiveRole] = useState('student');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Talk To Me - Combined Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveRole('student')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeRole === 'student' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Student View
              </button>
              <button
                onClick={() => setActiveRole('tutor')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeRole === 'tutor' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tutor View
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeRole === 'student' ? <StudentDashboard /> : <TutorDashboard />}
      </main>
    </div>
  );
};

export default CombinedDashboard;