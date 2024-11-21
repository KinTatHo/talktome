import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "react-query";
import axios from "axios";
import {
  Mic,
  MicOff,
  Upload,
  Languages,
  MessageSquare,
  AlertCircle,
  Check,
  RefreshCw,
  Volume2,
  Clock,
  Sparkles,
  ChevronDown,
  Wand2,
  BookOpen,
  RotateCcw
} from "lucide-react";

// Loading overlay components
const TranscribingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-xl text-center">
      <RefreshCw className="w-8 h-8 text-[#8B4513] animate-spin mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-[#8B4513]">Transcribing Audio</h3>
      <p className="text-[#6B4423] mt-2">Please wait while we process your recording...</p>
    </div>
  </div>
);

const AIFeedbackLoadingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-xl text-center">
      <Wand2 className="w-8 h-8 text-[#8B4513] mx-auto mb-4 animate-pulse" />
      <h3 className="text-xl font-semibold text-[#8B4513]">Analyzing Your Speech</h3>
      <p className="text-[#6B4423] mt-2">Our AI tutor is preparing your feedback...</p>
    </div>
  </div>
);

const Practice = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [feedbackLanguage, setFeedbackLanguage] = useState("en-US");
  const [recognition, setRecognition] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [volume, setVolume] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = selectedLanguage;

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setTranscript(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        setError("Speech recognition error. Please try again.");
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError("Speech recognition is not supported in your browser.");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [selectedLanguage]);

  // Volume meter setup
  useEffect(() => {
    if (isListening) {
      const setupAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
          
          microphoneRef.current.connect(analyserRef.current);
          analyserRef.current.fftSize = 256;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const updateVolume = () => {
            if (isListening) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / bufferLength;
              setVolume(average);
              requestAnimationFrame(updateVolume);
            }
          };
          
          updateVolume();
        } catch (err) {
          console.error('Error accessing microphone:', err);
          setError('Unable to access microphone. Please check permissions.');
        }
      };

      setupAudio();

      return () => {
        if (microphoneRef.current) {
          microphoneRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };
    }
  }, [isListening]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Toggle recording
  const toggleListening = useCallback(() => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        setTranscript("");
        recognition.lang = selectedLanguage;
        recognition.start();
      }
      setIsListening(!isListening);
    }
  }, [isListening, recognition, selectedLanguage]);

  // File handling
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 25 * 1024 * 1024) { // 25MB limit
        setError("File size must be less than 25MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  // File transcription mutation
  const transcribeMutation = useMutation(
    async (audioFile) => {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", selectedLanguage);
      const response = await axios.post(
        "http://localhost:3001/api/transcribe",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "x-session-id": localStorage.getItem("sessionId")
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        setTranscript(data.transcript);
        setError("");
        setFile(null);
        // Reset file input
        const fileInput = document.getElementById('audio-upload');
        if (fileInput) fileInput.value = '';
      },
      onError: (error) => {
        console.error("Transcription error:", error);
        setError(
          error.response?.data?.error ||
          error.response?.data?.details ||
          error.message ||
          "An unknown error occurred during transcription"
        );
      },
    }
  );

  // Handle file upload
  const handleFileUpload = () => {
    if (file) {
      transcribeMutation.mutate(file);
    } else {
      setError("Please select a file first");
    }
  };

  // Get AI feedback mutation
  const getFeedbackMutation = useMutation(
    async ({ transcript, language, feedbackLanguage }) => {
      const response = await axios.post(
        'http://localhost:3001/api/get-feedback',
        { 
          transcript, 
          language, 
          feedbackLanguage 
        },
        {
          headers: {
            "x-session-id": localStorage.getItem("sessionId")
          }
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        setFeedback(data.feedback);
        setError("");
      },
      onError: (error) => {
        console.error('Feedback mutation failed:', error);
        setError('Failed to get feedback. Please try again.');
      }
    }
  );

  // Handle getting feedback
  const handleGetFeedback = () => {
    if (!transcript) {
      setError('Please provide some speech to get feedback on.');
      return;
    }
    getFeedbackMutation.mutate({ 
      transcript, 
      language: selectedLanguage, 
      feedbackLanguage 
    });
  };

  // Clear everything
  const handleReset = () => {
    setTranscript("");
    setFeedback(null);
    setError("");
    setFile(null);
    const fileInput = document.getElementById('audio-upload');
    if (fileInput) fileInput.value = '';
  };

  // Time formatting
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Language options
  const languageOptions = [
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "en-US", name: "English (US)" },
    { code: "es-ES", name: "Spanish (Spain)" },
    { code: "fr-FR", name: "French (France)" },
    { code: "de-DE", name: "German (Germany)" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] py-8 px-4">
      {/* Loading overlays */}
      {transcribeMutation.isLoading && <TranscribingOverlay />}
      {getFeedbackMutation.isLoading && <AIFeedbackLoadingOverlay />}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BookOpen className="w-16 h-16 text-[#8B4513] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-[#8B4513] mb-2">Practice Speaking</h1>
            <p className="text-[#6B4423]">Improve your language skills with instant AI feedback</p>
          </motion.div>
        </div>

        {/* Language Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-6 shadow-lg"
        >
          <div>
            <label className="block text-[#8B4513] font-medium mb-2">
              Practice Language
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#fff5d6] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none appearance-none text-[#8B4513]"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
            </div>
          </div>

          <div>
            <label className="block text-[#8B4513] font-medium mb-2">
              Feedback Language
            </label>
            <div className="relative">
              <select
                value={feedbackLanguage}
                onChange={(e) => setFeedbackLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#fff5d6] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none appearance-none text-[#8B4513]"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
            </div>
          </div>
        </motion.div>

        {/* Recording Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          {/* Volume Meter */}
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <div className="h-2 bg-[#fff5d6] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#8B4513]"
                  animate={{ width: `${(volume / 255) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </motion.div>
          )}

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
                isListening ? 'bg-red-500' : 'bg-[#8B4513]'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
              {isListening && (
                <motion.div
                  className="absolute -inset-2 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
            {isListening && (
              <div className="flex items-center text-[#8B4513]">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Transcript Display */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#8B4513] font-medium">Your Speech:</h3>
              {transcript && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center text-[#8B4513] hover:text-[#6B4423]"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </motion.button>
              )}
            </div>
            <motion.div
              layout
              className="bg-[#fff5d6] rounded-lg p-4 min-h-[100px]"
            >
              <p className="text-[#6B4423] whitespace-pre-line">
                {transcript || "Start speaking to see your words appear here..."}
              </p>
            </motion.div>
          </div>

          {/* File Upload */}
          <div className="mt-6">
            <div className="flex items-center space-x-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*,video/mp4"
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex-1 py-3 px-4 bg-[#fff5d6] text-[#8B4513] rounded-lg border-2 border-dashed border-[#DEB887] hover:bg-[#fff5d6]/70 cursor-pointer transition-colors text-center"
              >
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <span>{file ? file.name : "Upload audio file"}</span>
              </label>
              {file && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFileUpload}
                  disabled={transcribeMutation.isLoading}
                  className="py-3 px-6 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423] transition-colors disabled:opacity-50"
                >
                  {transcribeMutation.isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    "Transcribe"
                  )}
                </motion.button>
              )}
            </div>
            <p className="text-sm text-[#6B4423] mt-2">
              Supported formats: MP3, MP4, WAV, M4A, FLAC (max 25MB)
            </p>
          </div>
        </motion.div>

        {/* Feedback Section */}
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <button
                onClick={handleGetFeedback}
                disabled={!transcript || getFeedbackMutation.isLoading}
                className="w-full py-3 px-4 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {getFeedbackMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Analyzing your speech...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Get AI Feedback</span>
                  </>
                )}
              </button>

              {getFeedbackMutation.isSuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6"
                >
                  <h3 className="text-[#8B4513] font-medium mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    AI Tutor Feedback
                  </h3>
                  <div className="bg-[#fff5d6] rounded-lg p-4">
                    <p className="text-[#6B4423] whitespace-pre-line">
                      {getFeedbackMutation.data.feedback}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Practice;