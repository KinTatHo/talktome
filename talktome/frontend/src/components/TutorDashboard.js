import React from "react";
import { Link } from "react-router-dom";
import MessageList from "./MessageList";
import UserInfo from "./UserInfo";
import StudentList from "./StudentList";
import { useUser } from "./UserContext";

const TutorDashboard = () => {
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">
                  Talk To Me - Tutor Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/schedule"
                className="text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Schedule
              </Link>
              <Link
                to="/students"
                className="text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Students
              </Link>
              <Link
                to="/earnings"
                className="text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              >
                Earnings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <UserInfo />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Upcoming Sessions
                </h3>
                {/* Add upcoming sessions content here */}
                <p className="mt-2 text-sm text-gray-500">You have no upcoming sessions scheduled.</p>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Feedback
                </h3>
                {/* Add recent feedback content here */}
                <p className="mt-2 text-sm text-gray-500">No recent feedback available.</p>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Find Students
              </h3>
              <StudentList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorDashboard;