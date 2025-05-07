import { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: { email?: string; password?: string; phone?: string; token?: string }) => Promise<void>;
  signUp: (userData: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPhoneVerification, setPendingPhoneVerification] = useState<string | null>(null);

  const signIn = async ({ email, password, phone, token }: { 
    email?: string; 
    password?: string; 
    phone?: string;
    token?: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Handle token-based authentication
      if (token) {
        const userStr = await SecureStore.getItemAsync('currentUser');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          router.replace('/LanguageSelect');
          return;
        }
        throw new Error('Invalid token');
      }
      
      // Handle phone authentication
      if (phone) {
        // Store the phone for OTP verification later
        setPendingPhoneVerification(phone);
        // In a real app, you would send an OTP to this phone number
        console.log('OTP sent to', phone);
        return;
      }

      // Handle email/password authentication
      if (email && password) {
        const usersStr = await SecureStore.getItemAsync('users');
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Store user and set state
        await SecureStore.setItemAsync('currentUser', JSON.stringify(user));
        await SecureStore.setItemAsync('userId', user.id);
        await SecureStore.setItemAsync('userToken', 'dummy-token-' + user.id); // In a real app, this would be a JWT
        setUser(user);

        // Check if language is already selected
        const hasSelectedLanguage = await AsyncStorage.getItem('preferredLanguage');
        
        // Always redirect to language selection first, regardless of previous selection
        router.replace('/LanguageSelect');
      } else {
        throw new Error('Invalid credentials');
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (otp: string) => {
    try {
      setIsLoading(true);
      
      if (!pendingPhoneVerification) {
        throw new Error('No pending phone verification');
      }
      
      // In a real app, you would validate the OTP with a backend service
      // For demo purposes, we'll accept any 6-digit OTP
      if (otp.length !== 6) {
        throw new Error('Invalid OTP');
      }
      
      // Find user by phone number
      const usersStr = await SecureStore.getItemAsync('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => u.phone === pendingPhoneVerification);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Store user and set state
      await SecureStore.setItemAsync('currentUser', JSON.stringify(user));
      await SecureStore.setItemAsync('userId', user.id);
      await SecureStore.setItemAsync('userToken', 'dummy-token-' + user.id); // In a real app, this would be a JWT
      setUser(user);
      
      // Reset pending verification
      setPendingPhoneVerification(null);
      
      // Navigate to language selection
      router.replace('/LanguageSelect');
      
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({ name, email, phone, password }: { 
    name: string; 
    email: string; 
    phone: string; 
    password: string 
  }) => {
    try {
      setIsLoading(true);
      const usersStr = await SecureStore.getItemAsync('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];

      if (users.some(u => u.email === email)) {
        throw new Error('Email already registered');
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        password
      };

      users.push(newUser);
      await SecureStore.setItemAsync('users', JSON.stringify(users));
      
      // After signup, redirect to login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await SecureStore.deleteItemAsync('currentUser');
      await SecureStore.deleteItemAsync('userId');
      await SecureStore.deleteItemAsync('userToken');
      // Clear all preferences on signout
      await AsyncStorage.removeItem('preferredLanguage');
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      verifyOTP,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}; 