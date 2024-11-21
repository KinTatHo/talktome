import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, X } from 'lucide-react';
import axios from 'axios';

const BookingModal = ({ tutor, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableTimes = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00', '19:00', '20:00'
  ];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/bookings', {
        tutorId: tutor._id,
        date: selectedDate,
        time: selectedTime
      }, {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });

      onClose();
      // Show success notification
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-[#fff5d6]">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#8B4513]">Book a Session</h3>
                <button
                  onClick={onClose}
                  className="text-[#8B4513] hover:text-[#6B4423]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[#6B4423] mt-2">
                Schedule a lesson with {tutor.username}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-[#fff5d6] rounded-lg border-2 border-[#DEB887] focus:border-[#8B4513] focus:outline-none"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8B4513] w-5 h-5" />
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-2">
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <motion.button
                      key={time}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTime(time)}
                      className={`p-2 rounded-lg text-sm font-medium ${
                        selectedTime === time
                          ? 'bg-[#8B4513] text-white'
                          : 'bg-[#fff5d6] text-[#8B4513] hover:bg-[#DEB887]'
                      }`}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Session Details */}
              <div className="bg-[#fff5d6] p-4 rounded-lg">
                <h4 className="font-medium text-[#8B4513] mb-2">Session Details</h4>
                <div className="space-y-2 text-[#6B4423]">
                  <p>Duration: 1 hour</p>
                  <p>Language: {tutor.teachingLanguages?.[0]}</p>
                  <p>Rate: $25/hour</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border-2 border-[#8B4513] text-[#8B4513] rounded-lg hover:bg-[#fff5d6]"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Clock className="animate-spin w-5 h-5 mr-2" />
                      Booking...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
