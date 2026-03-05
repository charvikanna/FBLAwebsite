const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

const configurePassport = require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const envPath = path.resolve(__dirname, '../.env');
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.warn(`⚠️  Could not load .env from ${envPath}. Falling back to process environment.`);
} else {
  console.log(`✅ Environment variables loaded from ${envPath}`);
}

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL'
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const expectedCallback = 'http://localhost:5001/api/auth/google/callback';
  if (process.env.GOOGLE_CALLBACK_URL !== expectedCallback) {
    console.warn(
      `⚠️  GOOGLE_CALLBACK_URL is "${process.env.GOOGLE_CALLBACK_URL}". ` +
      `For local Google OAuth, set it to "${expectedCallback}" and mirror it in Google Console.`
    );
  }
}

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

async function startServer() {
  try {
    validateEnv();
    await connectMongoDB();

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(passport.initialize());

    configurePassport(passport);
    console.log('✅ Authentication ready');

    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'ok', message: 'Server running' });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api', userRoutes);

    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found.' });
    });

    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error.' });
    });

    const PORT = Number(process.env.PORT) || 5001;

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();
