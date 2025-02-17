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
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (userData: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      
      // First check user credentials
      const usersStr = await SecureStore.getItemAsync('users');
      const users: User[] = usersStr ? JSON.parse(usersStr) : [];
      
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Store user and set state
      await SecureStore.setItemAsync('currentUser', JSON.stringify(user));
      setUser(user);

      // Check if language is already selected
      const hasSelectedLanguage = await AsyncStorage.getItem('preferredLanguage');
      
      // Always redirect to language selection first, regardless of previous selection
      router.replace('/LanguageSelect');

    } catch (error) {
      console.error('Login error:', error);
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