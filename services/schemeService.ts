import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Fallback storage for when AsyncStorage is not available
const memoryCache: Record<string, string> = {};

// Helper function to safely use AsyncStorage with fallback to memory cache
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Try AsyncStorage first
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`AsyncStorage getItem failed for key "${key}":`, error);
      // Fall back to memory cache
      return memoryCache[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<boolean> => {
    try {
      // Try AsyncStorage first
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`AsyncStorage setItem failed for key "${key}":`, error);
      // Fall back to memory cache
      memoryCache[key] = value;
      return true;
    }
  },
  removeItem: async (key: string): Promise<boolean> => {
    try {
      // Try AsyncStorage first
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`AsyncStorage removeItem failed for key "${key}":`, error);
      // Fall back to memory cache
      delete memoryCache[key];
      return true;
    }
  }
};

export interface SchemeData {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  eligibility: string;
  benefitAmount: string;
  deadline: string;
  documents: string[];
  ministry: string;
  emoji: string;
  color: string;
  category: string;
  isPopular: boolean;
  schemeType: 'central' | 'state';
  state: string | null;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

// Define the base categories
export const categories: Category[] = [
  { id: 'all', name: 'All', emoji: '🔍', color: '#E0E0E0' },
  { id: 'agriculture', name: 'Agriculture', emoji: '🌾', color: '#E8F5E9' },
  { id: 'finance', name: 'Finance', emoji: '💰', color: '#FFF3E0' },
  { id: 'housing', name: 'Housing', emoji: '🏠', color: '#E3F2FD' },
  { id: 'women-child', name: 'Women & Child', emoji: '👧', color: '#F8BBD0' },
  { id: 'employment', name: 'Employment', emoji: '👷', color: '#E1BEE7' },
  { id: 'healthcare', name: 'Healthcare', emoji: '⚕️', color: '#E0F7FA' },
  { id: 'entrepreneurship', name: 'Entrepreneurship', emoji: '🚀', color: '#FFECB3' },
  { id: 'education', name: 'Education', emoji: '🎓', color: '#D1C4E9' },
  { id: 'pension', name: 'Pension', emoji: '👵🏽', color: '#FFCCBC' },
  { id: 'welfare', name: 'Welfare', emoji: '🤲', color: '#C8E6C9' },
  { id: 'transportation', name: 'Transportation', emoji: '🚌', color: '#BBDEFB' },
  { id: 'infrastructure', name: 'Infrastructure', emoji: '🏗️', color: '#B3E5FC' },
  { id: 'energy', name: 'Energy', emoji: '⚡', color: '#FFECB3' },
  { id: 'rural-development', name: 'Rural Development', emoji: '🏘️', color: '#DCEDC8' },
  { id: 'urban-development', name: 'Urban Development', emoji: '🏙️', color: '#CFD8DC' },
  { id: 'digital', name: 'Digital', emoji: '💻', color: '#E0F2F1' },
  { id: 'tourism', name: 'Tourism', emoji: '🏞️', color: '#F0F4C3' },
  { id: 'other', name: 'Other', emoji: '📋', color: '#F5F5F5' },
];

// Mock data for initial use - this will be replaced with actual data from API/files
const initialSchemes: SchemeData[] = [
  {
    id: 'pm-kisan',
    title: 'PM Kisan Samman Nidhi',
    description: 'Direct income support for farmers',
    longDescription: 'Provides financial assistance of ₹6,000 per year to all land-holding farmer families in the country, paid in installments of ₹2,000 every four months.',
    eligibility: 'All landholder farmer families with cultivable land',
    benefitAmount: '₹6,000 per year',
    deadline: '31st December 2023',
    documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    emoji: '🌾',
    color: '#E8F5E9',
    category: 'Agriculture',
    isPopular: true,
    schemeType: 'central',
    state: null
  },
  // More schemes would be here in the actual implementation
];

// Cache keys
const SCHEMES_CACHE_KEY = 'cached_schemes_data';
const CACHE_TIMESTAMP_KEY = 'schemes_cache_timestamp';
const CACHE_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const schemeService = {
  // Get all schemes - try to load from cache first, then fallback to initial data
  getAllSchemes: async (): Promise<SchemeData[]> => {
    try {
      // Check if we have cached data and if it's still valid
      const cachedTimestampStr = await safeStorage.getItem(CACHE_TIMESTAMP_KEY);
      const cachedTimestamp = cachedTimestampStr ? parseInt(cachedTimestampStr) : 0;
      const now = Date.now();
      
      if (now - cachedTimestamp < CACHE_VALIDITY) {
        const cachedData = await safeStorage.getItem(SCHEMES_CACHE_KEY);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      }
      
      // If we're here, we need to fetch fresh data
      const schemes = await fetchSchemes();
      
      // Cache the data
      await safeStorage.setItem(SCHEMES_CACHE_KEY, JSON.stringify(schemes));
      await safeStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
      
      return schemes;
    } catch (error) {
      console.error('Error loading schemes:', error);
      // Fallback to initial data if everything fails
      return initialSchemes;
    }
  },
  
  // Get schemes by state
  getSchemesByState: async (state: string): Promise<SchemeData[]> => {
    const allSchemes = await schemeService.getAllSchemes();
    return allSchemes.filter(scheme => 
      scheme.state === state || 
      (state === 'All India' && scheme.schemeType === 'central')
    );
  },
  
  // Get schemes by category
  getSchemesByCategory: async (category: string): Promise<SchemeData[]> => {
    const allSchemes = await schemeService.getAllSchemes();
    if (category === 'all') {
      return allSchemes;
    }
    return allSchemes.filter(scheme => 
      scheme.category.toLowerCase() === category.replace(/-/g, ' ')
    );
  },
  
  // Get popular schemes
  getPopularSchemes: async (): Promise<SchemeData[]> => {
    const allSchemes = await schemeService.getAllSchemes();
    return allSchemes.filter(scheme => scheme.isPopular);
  },
  
  // Search schemes
  searchSchemes: async (query: string): Promise<SchemeData[]> => {
    const allSchemes = await schemeService.getAllSchemes();
    const lowerCaseQuery = query.toLowerCase();
    
    return allSchemes.filter(scheme => 
      scheme.title.toLowerCase().includes(lowerCaseQuery) ||
      scheme.description.toLowerCase().includes(lowerCaseQuery) ||
      scheme.category.toLowerCase().includes(lowerCaseQuery) ||
      scheme.ministry.toLowerCase().includes(lowerCaseQuery) ||
      scheme.eligibility.toLowerCase().includes(lowerCaseQuery)
    );
  }
};

// Hook to use schemes in components with pagination
export function useSchemes(initialCategory = 'all', pageSize = 10) {
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [allSchemes, setAllSchemes] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Calculate total pages and paginated data
  const updatePagination = (data: SchemeData[], page: number) => {
    const total = Math.ceil(data.length / pageSize);
    setTotalPages(total || 1);
    
    // If current page is out of bounds after filter, reset to page 1
    const safeCurrentPage = page > total ? 1 : page;
    if (safeCurrentPage !== page) {
      setCurrentPage(safeCurrentPage);
    }
    
    // Get paginated data slice
    const startIndex = (safeCurrentPage - 1) * pageSize;
    const paginatedData = data.slice(startIndex, startIndex + pageSize);
    setSchemes(paginatedData);
  };
  
  useEffect(() => {
    const loadSchemes = async () => {
      try {
        setLoading(true);
        const data = await schemeService.getSchemesByCategory(selectedCategory);
        setAllSchemes(data);
        updatePagination(data, currentPage);
        setError(null);
      } catch (err) {
        setError('Failed to load schemes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSchemes();
  }, [selectedCategory]);
  
  // Update pagination when page changes
  useEffect(() => {
    updatePagination(allSchemes, currentPage);
  }, [currentPage]);
  
  return { 
    schemes, 
    loading, 
    error, 
    selectedCategory, 
    setSelectedCategory,
    currentPage,
    setCurrentPage,
    totalPages,
    totalSchemes: allSchemes.length
  };
}

// Function to fetch schemes - more resilient to missing files
async function fetchSchemes(): Promise<SchemeData[]> {
  try {
    // First, try to import the JSON data directly
    try {
      // For a real app, this would be a fetch:
      // const response = await fetch('https://your-api.com/schemes');
      // const data = await response.json();
      
      let allSchemesJson;
      try {
        allSchemesJson = require('../data/all-schemes.json');
      } catch (requireError) {
        console.warn('Could not require all-schemes.json, trying to load central schemes');
        try {
          // Try to load at least central schemes if all-schemes fails
          allSchemesJson = require('../data/central-schemes.json');
        } catch (centralError) {
          // If both fail, throw to use fallback data
          throw new Error('Could not load any scheme data files');
        }
      }
      
      if (allSchemesJson && Array.isArray(allSchemesJson) && allSchemesJson.length > 0) {
        console.log(`Loaded ${allSchemesJson.length} schemes from JSON file`);
        return allSchemesJson;
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn('Could not import schemes JSON file:', errorMsg);
      // Continue to fallback
    }
    
    // If we get here, use the mock data
    console.warn('Using initial mock scheme data as fallback');
    return initialSchemes;
  } catch (error) {
    console.error('Error loading schemes:', error);
    return initialSchemes;
  }
}

// For easily finding category details
export function getCategoryById(categoryId: string): Category {
  return categories.find(c => c.id === categoryId) || categories[0];
} 