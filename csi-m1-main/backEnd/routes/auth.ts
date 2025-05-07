import { Router } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// MongoDB Connection using environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Sahayak-AI:Crow%406083@sahayak-ai.4tcbz.mongodb.net/?retryWrites=true&w=majority&appName=Sahayak-AI';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected in auth routes'))
  .catch(err => console.error('MongoDB connection error in auth routes:', err));

const router = Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: 'User not found'
      });
    }

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'invalid_credentials',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        biometricEnabled: user.biometricEnabled
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'An error occurred during login'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'user_exists',
        message: 'User already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Send response
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        biometricEnabled: user.biometricEnabled
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'An error occurred during registration'
    });
  }
});

// Enable biometric route
router.post('/enable-biometric', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
        message: 'User not found'
      });
    }

    user.biometricEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: 'Biometric authentication enabled'
    });

  } catch (error) {
    console.error('Biometric enable error:', error);
    res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'An error occurred while enabling biometric'
    });
  }
});

export default router; 