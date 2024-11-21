import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  MessageSquare, 
  Volume2,
  VolumeX,
  Users,
  Languages,
  Clock,
  Calendar,
  Shield
} from 'lucide-react';

const CallPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [tutor, setTutor] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // WebRTC and Socket.IO refs
  const socket = useRef();
  const peerConnection = useRef();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const localStreamRef = useRef();
  const remoteStreamRef = useRef();

  // Initialize Socket.IO connection
  useEffect(() => {
    socket.current = io('http://localhost:3001', {
      withCredentials: true
    });

    socket.current.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socket.current.on('error', (error) => {
      console.error('Socket error:', error);
      setError('Connection error. Please try again.');
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  // Fetch tutor details
  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/tutors/${tutorId}`, {
          headers: { 'x-session-id': localStorage.getItem('sessionId') }
        });
        setTutor(response.data);
      } catch (error) {
        setError('Failed to load tutor details');
      }
    };

    fetchTutorDetails();
  }, [tutorId]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Initialize WebRTC
  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: !isMuted
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create and configure peer connection
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream
      });

      peer.on('signal', data => {
        socket.current.emit('callSignal', {
          signal: data,
          tutorId: tutorId
        });
      });

      peer.on('stream', stream => {
        remoteStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peer.on('error', err => {
        console.error('Peer connection error:', err);
        setError('Call connection failed. Please try again.');
        endCall();
      });

      peerConnection.current = peer;
      setIsCallActive(true);

    } catch (err) {
      console.error('WebRTC initialization error:', err);
      setError('Failed to access camera/microphone. Please check permissions.');
    }
  };

  // Start call
  const startCall = async () => {
    setIsConnecting(true);
    try {
      await initializeWebRTC();
      socket.current.emit('joinCall', { tutorId });
    } catch (err) {
      setError('Failed to start call. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.destroy();
    }
    if (socket.current) {
      socket.current.emit('leaveCall', { tutorId });
    }

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    peerConnection.current = null;
    
    setIsCallActive(false);
    setCallDuration(0);
  };

  // Toggle audio
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePracticeMode = () => {
    setIsPracticeMode(!isPracticeMode);
    if (!isPracticeMode) {
      navigate(`/practice?callMode=true&tutorId=${tutorId}`);
    }
  };

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-[#8B4513] animate-pulse" />
          <span className="text-[#8B4513] font-medium">Loading tutor details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff5d6] to-[#ffe4a0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video/Call Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
                {isCallActive ? (
                  <div className="relative w-full h-full">
                    {/* Main video feed */}
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Self video feed */}
                    <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <Users className="w-24 h-24 text-white/50 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white">Ready to start your lesson?</h3>
                      {error && (
                        <p className="mt-2 text-red-400 text-sm">{error}</p>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 bg-[#1a1a1a]">
                <div className="flex justify-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-[#8B4513]'}`}
                    disabled={!isCallActive}
                  >
                    {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVideo}
                    className={`p-4 rounded-full ${!isVideoOn ? 'bg-red-500' : 'bg-[#8B4513]'}`}
                    disabled={!isCallActive}
                  >
                    {isVideoOn ? <Video className="text-white" /> : <VideoOff className="text-white" />}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleSpeaker}
                    className={`p-4 rounded-full ${!isSpeakerOn ? 'bg-red-500' : 'bg-[#8B4513]'}`}
                    disabled={!isCallActive}
                  >
                    {isSpeakerOn ? <Volume2 className="text-white" /> : <VolumeX className="text-white" />}
                  </motion.button>

                  {isCallActive ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={endCall}
                      className="p-4 rounded-full bg-red-500"
                    >
                      <Phone className="text-white transform rotate-225" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCall}
                      disabled={isConnecting}
                      className="p-4 rounded-full bg-green-500"
                    >
                      {isConnecting ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white" />
                      ) : (
                        <Phone className="text-white" />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tutor Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#8B4513] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {tutor.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#8B4513]">{tutor.username}</h3>
                  <p className="text-[#6B4423]">Professional Language Tutor</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-[#6B4423]">
                  <Languages className="w-5 h-5 mr-2 text-[#8B4513]" />
                  <span>Teaching: {tutor.teachingLanguages?.join(", ")}</span>
                </div>
                {isCallActive && (
                  <div className="flex items-center text-[#6B4423]">
                    <Clock className="w-5 h-5 mr-2 text-[#8B4513]" />
                    <span>Duration: {formatDuration(callDuration)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Practice Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={togglePracticeMode}
              disabled={!isCallActive}
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 ${
                isPracticeMode 
                  ? 'bg-green-500 text-white' 
                  : 'bg-[#8B4513] text-white'
              } ${!isCallActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>{isPracticeMode ? 'Exit Practice Mode' : 'Enter Practice Mode'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallPage;