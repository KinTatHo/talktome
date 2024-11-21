import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Upload,
  X,
  FileAudio,
  Globe2,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
} from "lucide-react";

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB in bytes

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [detailedError, setDetailedError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      console.log("Dropped file:", droppedFile); // Debug log

      // Check if it's an audio file or MP4
      if (
        droppedFile.type.startsWith("audio/") ||
        droppedFile.type === "video/mp4"
      ) {
        if (droppedFile.size <= MAX_FILE_SIZE) {
          setFile(droppedFile);
        } else {
          setError(
            `File is too large. Maximum size is 25 MB. Your file is ${(
              droppedFile.size /
              (1024 * 1024)
            ).toFixed(2)} MB.`
          );
        }
      } else {
        setError(
          `Invalid file type. Please upload an audio file or MP4. Selected file type: ${droppedFile.type}`
        );
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("language", language);

    try {
      setIsUploading(true);
      setError("");
      setDetailedError("");
      setTranscript("");

      const response = await axios.post(
        "http://localhost:3001/api/transcribe",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-session-id": localStorage.getItem("sessionId"),
          },
        }
      );

      setTranscript(response.data.transcript);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error.response?.data?.error || "An error occurred during upload"
      );
      setDetailedError(JSON.stringify(error.response?.data, null, 2));
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "nl", name: "Dutch" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-[#8B4513] mb-2">
            Audio Language
          </label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-[#fff5d6] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none appearance-none text-[#8B4513]"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <Globe2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513]" />
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-[#8B4513] bg-[#fff5d6]/50"
              : "border-[#DEB887] hover:border-[#8B4513]"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="audio/*,video/mp4"
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div
                className={`${
                  isDragging ? "bg-[#8B4513]" : "bg-[#fff5d6]"
                } p-4 rounded-full transition-colors`}
              >
                <Upload
                  className={`w-8 h-8 ${
                    isDragging ? "text-white" : "text-[#8B4513]"
                  }`}
                />
              </div>
            </div>

            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <FileAudio className="w-5 h-5 text-[#8B4513]" />
                <span className="text-[#8B4513] font-medium">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-1 hover:bg-red-100 rounded-full"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <p className="text-[#8B4513] font-medium">
                  {isDragging
                    ? "Drop the file here"
                    : "Drag and drop your audio file here, or click to browse"}
                </p>
                <p className="text-sm text-[#6B4423]">
                  Supports: MP3, WAV, M4A, MP4, and other audio formats (up to
                  25MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={!file || isUploading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
            !file || isUploading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-[#8B4513] hover:bg-[#6B4423]"
          } text-white font-medium transition-colors`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Transcribing...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload and Transcribe</span>
            </>
          )}
        </motion.button>
      </form>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {detailedError && (
                <pre className="mt-2 text-sm whitespace-pre-wrap break-all">
                  {detailedError}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#fff5d6] p-6 rounded-lg"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Check className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-[#8B4513]">Transcript:</h3>
            </div>
            <p className="text-[#6B4423] whitespace-pre-wrap">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
