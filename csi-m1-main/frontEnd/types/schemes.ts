import schemesData from './../data/schemesData.json';
import type { SchemeCategory, Scheme } from '@/types/schemes';

const ITEMS_PER_PAGE = 10;

export async function fetchSchemeCategories() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return schemesData.categories as SchemeCategory[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchSchemesByCategory(categoryId: string) {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const category = schemesData.categories.find(cat => cat.id === categoryId);
    return {
      schemes: category?.schemes || [],
      lastDoc: null
    };
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return { schemes: [], lastDoc: null };
  }
}

export async function searchSchemes(searchTerm: string) {
  try {
    const term = searchTerm.toLowerCase();
    const results: Scheme[] = [];
    
    schemesData.categories.forEach(category => {
      category.schemes.forEach(scheme => {
        if (scheme.name.toLowerCase().includes(term) || 
            scheme.description.toLowerCase().includes(term)) {
          results.push(scheme);
        }
      });
    });
    
    return results;
  } catch (error) {
    console.error('Error searching schemes:', error);
    return [];
  }
} 