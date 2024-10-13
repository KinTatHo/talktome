const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const fs = require('fs');
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
app.use(cors());

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
        { role: "system", content: `You are an expert language tutor for ${language}. Your task is to provide specific, constructive feedback on the following text. Focus on these areas:

        1. Structure: Evaluate the overall organization of ideas and sentences. Comment on coherence and flow.
        2. Grammar: Identify and explain any grammatical errors. Provide corrections and explanations.
        3. Vocabulary: Assess the range and appropriateness of vocabulary used. Suggest improvements or alternatives where applicable.
        4. Tone: Comment on the tone and register of the language. Is it appropriate for the context?

        Provide your feedback in a clear, organized manner. Do not repeat the original text. Instead, offer specific examples and suggestions for improvement. Be encouraging but thorough in your assessment.` },
        { role: "system", content: `Remember to provide your feedback STRICTLY in ${feedbackLanguage}.` },
        { role: "user", content: transcript }
      ],
    });
    res.json({ feedback: completion.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while getting feedback' });
  }
});

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
const io = socketIo(server);

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
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

app.get('/api/connections', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('tutors', 'username email teachingLanguages')
      .populate('students', 'username email learningLanguages');

    const connections = {
      tutors: user.tutors,
      students: user.students
    };

    res.json(connections);
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
    console.log('Fetching unread messages for user:', userId);

    const unreadMessages = await Message.aggregate([
      {
        $match: {
          recipient: mongoose.Types.ObjectId(userId),
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

    console.log('Unread messages aggregation result:', unreadMessages);

    const unreadCounts = {};
    unreadMessages.forEach(item => {
      unreadCounts[item._id.toString()] = item.count;
    });

    console.log('Unread counts:', unreadCounts);
    res.json(unreadCounts);
  } catch (error) {
    console.error('Error fetching unread message counts:', error);
    res.status(500).json({ error: 'An error occurred while fetching unread message counts' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));