import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if AsyncStorage is working properly
const checkAsyncStorage = async (): Promise<boolean> => {
  const TEST_KEY = 'ASYNC_STORAGE_TEST';
  const TEST_VALUE = 'OK';
  
  try {
    // Try writing to AsyncStorage
    await AsyncStorage.setItem(TEST_KEY, TEST_VALUE);
    
    // Try reading from AsyncStorage
    const value = await AsyncStorage.getItem(TEST_KEY);
    
    // Clean up
    await AsyncStorage.removeItem(TEST_KEY);
    
    // If we got back what we put in, it's working
    return value === TEST_VALUE;
  } catch (error) {
    console.error('AsyncStorage is not working properly:', error);
    return false;
  }
};

// Initialize AsyncStorage (call this early in app startup)
export const initAsyncStorage = async (): Promise<void> => {
  const isWorking = await checkAsyncStorage();
  if (!isWorking) {
    console.warn('AsyncStorage is not working properly. Using in-memory fallback.');
    // App will use in-memory fallback instead
  } else {
    console.log('AsyncStorage is working properly.');
  }
};

export default {
  initAsyncStorage,
  checkAsyncStorage
}; 