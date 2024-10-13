# Talk To Me: AI-Powered Language Learning App

## Overview

Talk To Me is an innovative language learning application that leverages AI technology to provide real-time speech recognition, transcription, and personalized feedback. It's designed to help users practice and improve their language skills through interactive speaking exercises and AI-driven tutoring.

## Features

- Real-time speech recognition for multiple languages
- Audio file upload and transcription using OpenAI's Whisper model
- AI-powered feedback on speech content, focusing on structure, grammar, vocabulary, and tone
- Support for practicing in one language and receiving feedback in another
- User-friendly interface built with React and styled with Tailwind CSS

## Technologies Used

- Frontend: React, Tailwind CSS, React Query
- Backend: Node.js, Express
- APIs: OpenAI API (GPT-3.5 Turbo for feedback, Whisper for transcription)
- Speech Recognition: Web Speech API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (usually comes with Node.js)
- An OpenAI API key

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/talk-to-me.git
   cd talk-to-me
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   ```
   Create a `.env` file in the backend directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

4. Start the backend server:
   ```
   cd ../backend
   node server.js
   ```

5. In a new terminal, start the frontend development server:
   ```
   cd ../frontend
   npm start
   ```
6. In a new terminal, start the MongoDB server:
   ```
   cd ../backend
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

7. Open your browser and navigate to `http://localhost:3000` to use the app.

## Usage

1. Select your practice language from the dropdown menu.
2. Choose the language you want to receive feedback in.
3. Click the "Start Listening" button and begin speaking in your chosen practice language.
4. Alternatively, upload an audio file for transcription.
5. Once you have a transcript, click "Get AI Feedback" to receive personalized feedback on your speech.

## Project Structure

```
talk-to-me/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── Practice.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- OpenAI for providing the GPT-3.5 Turbo and Whisper models
- The React and Tailwind CSS communities for their excellent documentation and tools

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

---

Happy language learning with Talk To Me!