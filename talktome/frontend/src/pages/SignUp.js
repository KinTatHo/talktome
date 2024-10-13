import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TermsAndConditions } from "../components/constants/TermsAndConditions";
import { useUser } from "../components/UserContext";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [learningLanguages, setLearningLanguages] = useState([]);
  const [teachingLanguages, setTeachingLanguages] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();

  const { setUser } = useUser();

  const languageOptions = ["English", "Spanish", "French", "German", "Chinese"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeToTerms) {
      setError("You must agree to the Terms and Conditions to sign up.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/api/signup", {
        username,
        email,
        password,
        role,
        learningLanguages,
        teachingLanguages,
      });
      console.log("Signup successful:", response.data);

      // Log the user in immediately after signup
      const loginResponse = await axios.post(
        "http://localhost:3001/api/login",
        {
          username,
          password,
        }
      );

      localStorage.setItem("sessionId", loginResponse.data.sessionId);

      // Fetch user data and set it in the context
      const userResponse = await axios.get("http://localhost:3001/api/user", {
        headers: { "x-session-id": loginResponse.data.sessionId },
      });
      setUser(userResponse.data);

      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
      setError(
        error.response?.data?.message || "An error occurred during signup"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = (language, type) => {
    if (type === "learning") {
      setLearningLanguages((prev) =>
        prev.includes(language)
          ? prev.filter((lang) => lang !== language)
          : [...prev, language]
      );
    } else {
      setTeachingLanguages((prev) =>
        prev.includes(language)
          ? prev.filter((lang) => lang !== language)
          : [...prev, language]
      );
    }
  };

  const LanguageCheckboxes = ({ languages, setLanguages, type }) => (
    <div className="space-y-2">
      {languageOptions.map((lang) => (
        <label key={`${type}-${lang}`} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={languages.includes(lang)}
            onChange={() => handleLanguageChange(lang, type)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span>{lang}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="both">Both</option>
          </select>
        </div>

        {(role === "student" || role === "both") && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Languages you want to learn:
            </label>
            <LanguageCheckboxes
              languages={learningLanguages}
              setLanguages={setLearningLanguages}
              type="learning"
            />
          </div>
        )}

        {(role === "tutor" || role === "both") && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Languages you want to teach:
            </label>
            <LanguageCheckboxes
              languages={teachingLanguages}
              setLanguages={setTeachingLanguages}
              type="teaching"
            />
          </div>
        )}

        <div className="mt-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="text-blue-600 underline focus:outline-none"
              >
                Terms and Conditions
              </button>
            </span>
          </label>
        </div>

        {showTerms && <TermsAndConditions />}

        <button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className={`w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isLoading || !agreeToTerms ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing Up...
            </div>
          ) : (
            "Sign Up"
          )}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default SignUp;
