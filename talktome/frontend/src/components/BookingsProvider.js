import React, { createContext, useContext, useState } from 'react';

const BookingsContext = createContext();

export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/bookings', {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBooking = async (booking) => {
    try {
      const response = await axios.post('http://localhost:3001/api/bookings', booking, {
        headers: { 'x-session-id': localStorage.getItem('sessionId') }
      });
      setBookings(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error adding booking:', error);
      throw error;
    }
  };

  return (
    <BookingsContext.Provider value={{ bookings, loading, fetchBookings, addBooking }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => useContext(BookingsContext);

// Create a BookingsList component to display upcoming sessions
const BookingsList = () => {
  const { bookings, loading, fetchBookings } = useBookings();

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Clock className="animate-spin w-6 h-6 text-[#8B4513] mr-2" />
        <span className="text-[#8B4513]">Loading bookings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <motion.div
          key={booking._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-[#8B4513]">{booking.tutorName}</h3>
              <p className="text-[#6B4423]">{booking.language} Lesson</p>
            </div>
            <div className="text-right">
              <p className="text-[#8B4513] font-medium">{new Date(booking.date).toLocaleDateString()}</p>
              <p className="text-[#6B4423]">{booking.time}</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/call/${booking.tutorId}`)}
              className="flex-1 py-2 px-4 bg-[#8B4513] text-white rounded-lg hover:bg-[#6B4423]"
            >
              Join Call
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2 px-4 border-2 border-[#8B4513] text-[#8B4513] rounded-lg hover:bg-[#fff5d6]"
            >
              Reschedule
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Update TutorCard component to include booking functionality
const TutorCard = ({ tutor }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);

  return (
    <>
      {/* Existing TutorCard content */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowBookingModal(true)}
        className="flex-1 border-2 border-[#8B4513] text-[#8B4513] px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
      >
        <Calendar className="w-4 h-4" />
        <span>Book Session</span>
      </motion.button>

      <BookingModal 
        tutor={tutor}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};