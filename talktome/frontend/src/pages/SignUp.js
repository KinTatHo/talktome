import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { TermsAndConditions } from "../components/constants/TermsAndConditions";
import { useUser } from "../components/UserContext";
import { Check, BookOpen, ChevronDown, Loader2 } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);
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

      const loginResponse = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });

      localStorage.setItem("sessionId", loginResponse.data.sessionId);

      const userResponse = await axios.get("http://localhost:3001/api/user", {
        headers: { "x-session-id": loginResponse.data.sessionId },
      });
      setUser(userResponse.data);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const LanguageCheckbox = ({ language, isSelected, onChange }) => (
    <motion.label
      className={`flex items-center p-3 rounded-lg cursor-pointer border-2 transition-colors ${
        isSelected 
          ? 'border-[#8B4513] bg-[#fff5d6]' 
          : 'border-[#DEB887] hover:border-[#8B4513] bg-white'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onChange}
        className="hidden"
      />
      <motion.div
        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
          isSelected ? 'border-[#8B4513]' : 'border-[#DEB887]'
        }`}
        initial={false}
        animate={isSelected ? { backgroundColor: "#8B4513" } : { backgroundColor: "transparent" }}
      >
        {isSelected && <Check size={14} className="text-white" />}
      </motion.div>
      <span className="text-[#6B4423]">{language}</span>
    </motion.label>
  );

  const nextStep = () => {
    if (currentStep === 1 && (!username || !email || !password)) {
      setError("Please fill in all fields");
      return;
    }
    if (currentStep === 2 && !role) {
      setError("Please select a role");
      return;
    }
    setError("");
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="bg-white w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <BookOpen className="w-10 h-10 text-[#8B4513]" />
          </div>
          <h2 className="text-3xl font-bold text-[#8B4513] mb-2">Join LinguaMates</h2>
          <p className="text-[#6B4423]">Start your language learning journey today</p>
        </div>

        <motion.div
          className="bg-white rounded-xl p-8 shadow-xl"
          initial={false}
          animate={{ height: "auto" }}
        >
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`flex items-center ${step !== 3 ? "flex-1" : ""}`}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? "bg-[#8B4513]" : "bg-[#DEB887]"
                  }`}
                  animate={{
                    scale: currentStep === step ? 1.1 : 1,
                  }}
                >
                  <span className="text-white">
                    {step}
                  </span>
                </motion.div>
                {step !== 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step ? "bg-[#8B4513]" : "bg-[#DEB887]"
                    }`}
                  />
                )}
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#8B4513] mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors placeholder-[#B8860B]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8B4513] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors placeholder-[#B8860B]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8B4513] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors placeholder-[#B8860B]/50"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#8B4513] mb-1">
                      I want to
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none transition-colors appearance-none"
                      >
                        <option value="">Select your role</option>
                        <option value="student">Learn languages</option>
                        <option value="tutor">Teach languages</option>
                        <option value="both">Both learn and teach</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {(role === "student" || role === "both") && (
                    <div>
                      <h3 className="text-[#8B4513] text-lg mb-3">Languages you want to learn:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {languageOptions.map((lang) => (
                          <LanguageCheckbox
                            key={`learn-${lang}`}
                            language={lang}
                            isSelected={learningLanguages.includes(lang)}
                            onChange={() => {
                              setLearningLanguages(prev =>
                                prev.includes(lang)
                                  ? prev.filter(l => l !== lang)
                                  : [...prev, lang]
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(role === "tutor" || role === "both") && (
                    <div>
                      <h3 className="text-[#8B4513] text-lg mb-3">Languages you can teach:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {languageOptions.map((lang) => (
                          <LanguageCheckbox
                            key={`teach-${lang}`}
                            language={lang}
                            isSelected={teachingLanguages.includes(lang)}
                            onChange={() => {
                              setTeachingLanguages(prev =>
                                prev.includes(lang)
                                  ? prev.filter(l => l !== lang)
                                  : [...prev, lang]
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center space-x-3 text-[#6B4423]">
                      <input
                        type="checkbox"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-[#8B4513] rounded border-[#DEB887]"
                      />
                      <span>
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTerms(!showTerms)}
                          className="text-[#8B4513] underline hover:text-[#6B4423]"
                        >
                          Terms and Conditions
                        </button>
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-red-100/80 border border-red-400 text-red-700 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="mt-6 flex justify-between">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 border-2 border-[#8B4513] text-[#8B4513] rounded-lg hover:bg-[#fff5d6] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              )}
              
              <motion.button
                type={currentStep === 3 ? "submit" : "button"}
                onClick={currentStep === 3 ? undefined : nextStep}
                disabled={isLoading}
                className={`px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423] transition-colors ml-auto shadow-md ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Signing Up...
                  </div>
                ) : currentStep === 3 ? (
                  "Create Account"
                ) : (
                  "Next"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {showTerms && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-xl p-8 shadow-xl"
          ><TermsAndConditions />
          </motion.div>
        )}
        
        <motion.div
          className="mt-6 text-center text-[#6B4423] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-[#8B4513] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUp;