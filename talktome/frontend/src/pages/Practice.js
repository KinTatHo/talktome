import React, { useState, useEffect, useCallback } from "react";
import { TranscribingOverlay } from "../components/TranscribingOverlay";
import { useMutation } from "react-query";
import axios from "axios";

const Practice = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [feedbackLanguage, setFeedbackLanguage] = useState("en-US");
  const [recognition, setRecognition] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  console.log('Current state:', { isListening, transcript, selectedLanguage, feedbackLanguage });

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
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.error("Speech recognition not supported");
    }
  }, [selectedLanguage]);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const transcribeMutation = useMutation(
    async (audioFile) => {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("language", selectedLanguage);
      const response = await axios.post(
        "http://localhost:3001/api/transcribe",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        setTranscript(data.transcript);
        setError("");
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

  const handleFileUpload = () => {
    if (file) {
      transcribeMutation.mutate(file);
    } else {
      setError("Please select a file first");
    }
  };


  const getFeedbackMutation = useMutation(
    async ({ transcript, language, feedbackLanguage }) => {
      console.log('Sending feedback request:', { transcript, language, feedbackLanguage });
      try {
        const response = await axios.post('http://localhost:3001/api/get-feedback', { 
          transcript, 
          language, 
          feedbackLanguage 
        });
        console.log('Received feedback response:', response);
        return response.data;
      } catch (error) {
        console.error('Error in getFeedbackMutation:', error);
        throw error;
      }
    },
    {
      onSuccess: (data) => {
        console.log('Feedback mutation succeeded:', data);
      },
      onError: (error) => {
        console.error('Feedback mutation failed:', error);
        setError('Failed to get feedback. Please try again.');
      }
    }
  );

  const handleGetFeedback = () => {
    console.log('handleGetFeedback called');
    if (!transcript) {
      console.log('No transcript available');
      setError('Please provide some speech to get feedback on.');
      return;
    }
    console.log('Calling getFeedbackMutation');
    getFeedbackMutation.mutate({ 
      transcript, 
      language: selectedLanguage, 
      feedbackLanguage 
    });
  };


  return (
    <div className="space-y-6">
      {transcribeMutation.isLoading && <TranscribingOverlay />}
      <h2 className="text-3xl font-bold">Practice Your Speaking</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="practice-language"
            className="block text-sm font-medium text-gray-700"
          >
            Practice Language
          </label>
          <select
            id="practice-language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish (Spain)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="feedback-language"
            className="block text-sm font-medium text-gray-700"
          >
            Feedback Language
          </label>
          <select
            id="feedback-language"
            value={feedbackLanguage}
            onChange={(e) => setFeedbackLanguage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          >
            <option value="zh-CN">Chinese (Simplified)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Spanish (Spain)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <p className="font-bold mb-2">Your Speech:</p>
        <p>
          {transcript ||
            "Start speaking or upload an audio file to see the transcript..."}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={toggleListening}
          className={`flex-1 py-2 px-4 rounded font-bold ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>

        <input
          type="file"
          onChange={handleFileChange}
          accept="audio/*,video/mp4"
          className="flex-1"
        />

        <button
          onClick={handleFileUpload}
          disabled={!file || transcribeMutation.isLoading}
          className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {transcribeMutation.isLoading ? "Transcribing..." : "Transcribe File"}
        </button>
      </div>

      <button
        onClick={handleGetFeedback}
        disabled={!transcript || getFeedbackMutation.isLoading}
        className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getFeedbackMutation.isLoading
          ? "Getting Feedback..."
          : "Get AI Feedback"}
      </button>

      {error && (
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {getFeedbackMutation.isSuccess && (
        <div className="bg-blue-100 p-4 rounded">
          <p className="font-bold mb-2">AI Tutor Feedback:</p>
          <p>{getFeedbackMutation.data.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default Practice;
