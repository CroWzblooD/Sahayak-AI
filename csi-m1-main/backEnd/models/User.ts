import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the interface for User document
export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  biometricEnabled: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  biometricEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(password: string) {
  return bcrypt.compare(password, this.password);
};

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema); 