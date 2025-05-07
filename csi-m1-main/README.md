# Sahayak AI

Sahayak AI is your AI-powered assistant for navigating Indian government schemes, policies, and citizen services.

## Features

- AI-powered chat assistant for government scheme information
- User authentication with email, phone/OTP, and biometric login
- Document storage and management
- Government scheme discovery and personalized recommendations
- Multi-language support

## Project Structure

The project is divided into two main parts:

### Frontend

- React Native mobile application built with Expo
- Tamagui UI components
- Authentication with multiple methods (email/password, phone/OTP, biometric)

### Backend

- Node.js Express server
- MongoDB database for user data
- Authentication using JWT

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- Expo Go app for testing on device

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backEnd
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontEnd
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Expo development server:
   ```
   npm start
   ```

4. Scan the QR code with Expo Go app on your device or run in a simulator/emulator

## Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

### Frontend
- Configuration is managed through app.json and the Expo environment system

## License

This project is licensed under the ISC License 