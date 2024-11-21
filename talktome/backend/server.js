const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
const uploadsDir = './uploads';

if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');


mongoose.connect('mongodb://localhost/talktome', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer configuration with file filter
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const fileFilter = function(req, file, cb) {
  // Allowed ext
  const filetypes = /flac|m4a|mp3|mp4|mpeg|mpga|oga|ogg|wav|webm/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
''
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Unsupported file format. Supported formats: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm');
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
}).single('audio');

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let users = [];
let sessions = {};

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password, role, learningLanguages, teachingLanguages } = req.body;

    console.log('Signup attempt:', { username, email, role, learningLanguages, teachingLanguages });

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.username);
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role,
      learningLanguages,
      teachingLanguages
    });

    await newUser.save();

    console.log('New user created:', newUser);

    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An error occurred during signup' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const sessionId = Math.random().toString(36).substr(2, 9);
    sessions[sessionId] = { username: user.username, role: user.role, id: user._id };

    res.json({ sessionId, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});


app.post('/api/logout', (req, res) => {
  const { sessionId } = req.body;
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    res.json({ message: 'Logged out successfully' });
  } else {
    res.status(400).json({ error: 'Invalid session' });
  }
});


// Simple middleware to check if user is logged in
const isAuthenticated = async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  console.log('Received session ID:', sessionId);

  if (!sessionId) {
    console.log('No session ID provided');
    return res.status(401).json({ error: 'No session ID provided' });
  }

  if (!sessions[sessionId]) {
    console.log('Invalid session ID');
    return res.status(401).json({ error: 'Invalid session' });
  }

  try {
    const user = await User.findOne({ username: sessions[sessionId].username });
    if (user) {
      console.log('User authenticated:', user.username);
      req.user = { id: user._id, ...sessions[sessionId] };
      next();
    } else {
      console.log('User not found in database');
      res.status(401).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error in isAuthenticated middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

app.get('/api/user', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'An error occurred while fetching user data' });
  }
});

app.get('/api/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/api/tutors', isAuthenticated, async (req, res) => {
  try {
    const { language } = req.query;
    console.log('Fetching tutors. Requested language:', language);

    let query = { $or: [{ role: 'tutor' }, { role: 'both' }] };
    if (language) {
      query.teachingLanguages = language;
    }

    const tutors = await User.find(query).select('-password');

    console.log('Tutor query:', query);
    console.log('Found tutors:', tutors);

    res.json(tutors);
  } catch (error) {
    console.error('Error in /api/tutors:', error);
    res.status(500).json({ error: 'An error occurred while fetching tutors' });
  }
});

app.get('/api/students', isAuthenticated, async (req, res) => {
  try {
    const { language } = req.query;
    console.log('Fetching students. Requested language:', language);

    let query = { $or: [{ role: 'student' }, { role: 'both' }] };
    if (language) {
      query.learningLanguages = language;
    }

    const students = await User.find(query).select('-password');

    console.log('Filtered students:', students);

    res.json(students);
  } catch (error) {
    console.error('Error in /api/students:', error);
    res.status(500).json({ error: 'An error occurred while fetching students' });
  }
});

app.post('/api/get-feedback', async (req, res) => {
  try {
    const { transcript, language, feedbackLanguage } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are an expert language tutor specializing in ${language}. Your task is to analyze the SENTENCE STRUCTURE, GRAMMAR, and VOCABULARY of the following text, ignoring any transcription errors or pronunciation issues. 

          Focus ONLY on these areas:

          1. Sentence Structure Analysis:
             - Evaluate how ideas are connected within sentences
             - Identify any run-on sentences or fragments
             - Suggest better ways to combine or separate ideas
             - Comment on sentence variety and complexity

          2. Grammar Focus:
             - Identify grammatical patterns that need improvement
             - Point out incorrect verb tenses or agreement issues
             - Highlight problems with articles, prepositions, or conjunctions
             - Provide correct grammatical alternatives

          3. Vocabulary Enhancement:
             - Suggest more sophisticated or appropriate word choices
             - Identify overused words and provide alternatives
             - Point out informal words that could be replaced with formal ones
             - Recommend idiomatic expressions where appropriate

          Format your feedback as follows:
          - Sentence Structure: [Your analysis]
          - Grammar Patterns: [Your analysis]
          - Vocabulary Suggestions: [Your analysis]
          - Example Improvements: [Provide 2-3 revised sentences as examples]

          Important:
          - IGNORE any spelling mistakes or transcription errors
          - DO NOT comment on pronunciation or accent
          - Focus ONLY on how ideas are structured and expressed
          - Be encouraging while providing constructive feedback
          - Provide specific examples for improvement`
        },
        { 
          role: "system", 
          content: `Provide your feedback in ${feedbackLanguage}.` 
        },
        { 
          role: "user", 
          content: transcript 
        }
      ],
    });
    res.json({ feedback: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while getting feedback' });
  }
});;

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const ISO6391 = require('iso-639-1');

function convertLanguageCode(code) {
  // Extract the first part of the code (e.g., 'en' from 'en-US')
  const baseCode = code.split('-')[0].toLowerCase();
  
  // Validate if it's a valid ISO 639-1 code
  if (ISO6391.validate(baseCode)) {
    return baseCode;
  } else {
    console.warn(`Invalid language code: ${code}. Defaulting to English.`);
    return 'en';
  }
}

app.post('/api/transcribe', (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.toString() });
    }
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file);
    console.log('File path:', req.file.path);
    console.log('File size:', req.file.size);
    console.log('File mime type:', req.file.mimetype);

    try {
      console.log('Attempting to transcribe file...');
      console.log('Language:', req.body.language);
      const language = convertLanguageCode(req.body.language || 'en');

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
        language: language,
        response_format: "verbose_json",
        timestamp_granularities: ["segment"]
      });

      console.log('Transcription successful');
      console.log('Transcription result:', transcription);

      // Post-process the transcription to separate speakers
      const processedTranscript = processTranscription(transcription.segments);

      fs.unlinkSync(req.file.path); // Delete the temporary file
      res.json({ transcript: processedTranscript });
    } catch (error) {
      console.error('Transcription error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('OpenAI API response:', error.response.data);
      }
      res.status(500).json({ 
        error: 'An error occurred while transcribing the audio',
        details: error.message,
        openAIError: error.response ? error.response.data : null
      });
    }
  });
});

function processTranscription(segments) {
  let processedTranscript = [];
  let currentSpeaker = "Speaker 1";

  segments.forEach((segment, index) => {
    if (index > 0) {
      const pauseDuration = segment.start - segments[index - 1].end;
      if (pauseDuration > 1.5) { // Assume speaker change if pause is longer than 1.5 seconds
        currentSpeaker = currentSpeaker === "Speaker 1" ? "Speaker 2" : "Speaker 1";
      }
    }
    processedTranscript.push(`${currentSpeaker}: ${segment.text}`);
  });

  return processedTranscript.join('\n');
}

app.put('/api/user/update', isAuthenticated, (req, res) => {
  const { username, email, learningLanguages, teachingLanguages } = req.body;
  const user = users.find(u => u.username === req.user.username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user information
  user.username = username;
  user.email = email;
  user.learningLanguages = learningLanguages;
  user.teachingLanguages = teachingLanguages;

  // Update the session info if username has changed
  if (username !== req.user.username) {
    const sessionId = Object.keys(sessions).find(key => sessions[key].username === req.user.username);
    if (sessionId) {
      sessions[sessionId].username = username;
    }
  }

  res.json({
    username: user.username,
    email: user.email,
    role: user.role,
    learningLanguages: user.learningLanguages,
    teachingLanguages: user.teachingLanguages
  });
});

// Define Mongoose schemas
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  content: String,
  read: { type: Boolean, default: false, index: true },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  learningLanguages: [String],
  teachingLanguages: [String],
  tutors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

MessageSchema.index({ recipient: 1, read: 1 });

const Message = mongoose.model('Message', MessageSchema);
const User = mongoose.model('User', UserSchema);

const connectionExists = async (studentId, tutorId) => {
  const student = await User.findById(studentId);
  return student.tutors.includes(tutorId);
};


// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle joining a call room
  socket.on('joinCall', ({ callId, userId }) => {
    console.log(`User ${userId} joining call room ${callId}`);
    socket.join(callId);
    io.to(callId).emit('userJoined', { userId });
  });

  // Handle leaving a call room
  socket.on('leaveCall', ({ callId, userId }) => {
    console.log(`User ${userId} leaving call room ${callId}`);
    socket.leave(callId);
    io.to(callId).emit('userLeft', { userId });
  });

  // Handle call signals (for WebRTC)
  socket.on('callSignal', ({ callId, signal, userId }) => {
    console.log(`Received call signal from ${userId} in room ${callId}`);
    io.to(callId).emit('callSignal', { signal, userId });
  });

  // Handle messaging during call
  socket.on('callMessage', ({ callId, message, userId }) => {
    console.log(`Message in call ${callId} from ${userId}: ${message}`);
    io.to(callId).emit('callMessage', { message, userId });
  });

  // Handle general user presence
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined general room`);
    socket.join(userId);
    io.emit('userOnline', userId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    io.emit('userOffline', socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Add error handling for the Socket.IO server
io.engine.on("connection_error", (err) => {
  console.log('Connection error:', err.req);
  console.log('Error code:', err.code);
  console.log('Error message:', err.message);
  console.log('Error context:', err.context);
});

// New API endpoints
app.post('/api/connect', isAuthenticated, async (req, res) => {
  try {
    const { tutorId, studentId } = req.body;
    const currentUserId = req.user.id;

    let tutor, student;

    if (tutorId) {
      // Student is initiating the connection
      tutor = await User.findById(tutorId);
      student = await User.findById(currentUserId);
    } else if (studentId) {
      // Tutor is initiating the connection
      tutor = await User.findById(currentUserId);
      student = await User.findById(studentId);
    } else {
      return res.status(400).json({ error: 'Missing tutorId or studentId' });
    }

    if (!tutor || !student) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if connection already exists
    if (student.tutors.includes(tutor._id) || tutor.students.includes(student._id)) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    // Update the connections
    student.tutors.push(tutor._id);
    tutor.students.push(student._id);

    await Promise.all([student.save(), tutor.save()]);

    res.json({ message: 'Connection established successfully' });
  } catch (error) {
    console.error('Error in /api/connect:', error);
    res.status(500).json({ error: 'An error occurred while establishing connection' });
  }
});

// In server.js, modify the connections endpoint
app.get('/api/connections', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('tutors', 'username email teachingLanguages')
      .populate('students', 'username email learningLanguages');

    // Return just the tutors array if the user is a student
    if (user.role === 'student') {
      return res.json(user.tutors || []);
    }
    
    // Return just the students array if the user is a tutor
    if (user.role === 'tutor') {
      return res.json(user.students || []);
    }

    // For users with role 'both', return both arrays
    if (user.role === 'both') {
      return res.json({
        tutors: user.tutors || [],
        students: user.students || []
      });
    }

    return res.json([]);
  } catch (error) {
    console.error('Error in /api/connections:', error);
    res.status(500).json({ error: 'An error occurred while fetching connections' });
  }
});

app.post('/api/message', isAuthenticated, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content
    });

    await message.save();

    io.to(recipientId).emit('new message', message);

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while sending the message' });
  }
});

app.get('/api/messages', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    }).sort({ timestamp: -1 }).limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
});

app.get('/api/messages/:recipientId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientId = req.params.recipientId;
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId }
      ]
    }).sort({ timestamp: 1 }).limit(50);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching messages' });
  }
});

app.get('/api/check-users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    console.log('All users in database:', users);
    res.json(users);
  } catch (error) {
    console.error('Error checking users:', error);
    res.status(500).json({ error: 'An error occurred while checking users' });
  }
});

app.get('/api/unread-messages', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadMessages = await Message.aggregate([
      {
        $match: {
          recipient: new mongoose.Types.ObjectId(userId),
          read: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadCounts = {};
    unreadMessages.forEach(item => {
      unreadCounts[item._id.toString()] = item.count;
    });

    res.json(unreadCounts);
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    res.status(500).json({ error: 'An error occurred while fetching unread message counts' });
  }
});

app.post('/api/mark-messages-read', isAuthenticated, async (req, res) => {
  try {
    const { senderId } = req.body;
    const recipientId = req.user.id;

    await Message.updateMany(
      { 
        sender: new mongoose.Types.ObjectId(senderId),
        recipient: new mongoose.Types.ObjectId(recipientId),
        read: false
      },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read successfully' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'An error occurred while marking messages as read' });
  }
});

const BookingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  language: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Booking endpoints
app.post('/api/bookings', isAuthenticated, async (req, res) => {
  try {
    const { tutorId, date, time, language } = req.body;
    const studentId = req.user.id;

    // Check if slot is available
    const existingBooking = await Booking.findOne({
      tutorId,
      date,
      time,
      status: 'scheduled'
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    const booking = new Booking({
      studentId,
      tutorId,
      date,
      time,
      language
    });

    await booking.save();

    // Could add notification/email to tutor here

    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'student') {
      query = { studentId: userId };
    } else if (userRole === 'tutor') {
      query = { tutorId: userId };
    } else {
      query = { $or: [{ studentId: userId }, { tutorId: userId }] };
    }

    const bookings = await Booking.find(query)
      .populate('tutorId', 'username')
      .populate('studentId', 'username')
      .sort({ date: 1, time: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.put('/api/bookings/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.IO server is ready for connections`);
});

// Make sure you export your server (add this at the end)
module.exports = { app, server, io };