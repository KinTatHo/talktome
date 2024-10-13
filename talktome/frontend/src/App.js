import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider, useUser } from "./components/UserContext";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Practice from "./pages/Practice";
import Progress from "./pages/Progress";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import StudentDashboard from "./components/StudentDashboard";
import TutorDashboard from "./components/TutorDashboard";
import CombinedDashboard from "./components/CombinedDashboard";
import TutorList from "./components/TutorList";
import Profile from "./pages/Profile";
import FloatingChatIcon from "./components/FloatingChatIcon";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { user } = useUser();

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/practice"
              element={
                <PrivateRoute>
                  <Practice />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <PrivateRoute>
                  <Progress />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  {user?.role === "student" ? (
                    <StudentDashboard />
                  ) : user?.role === "tutor" ? (
                    <TutorDashboard />
                  ) : (
                    <CombinedDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/find-tutor"
              element={
                <PrivateRoute>
                  <TutorList />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
        <FloatingChatIcon />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
