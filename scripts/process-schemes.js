const fs = require('fs');
const path = require('path');

// Define categories and their associated emojis and colors
const categories = {
  'Agriculture': { emoji: '🌾', color: '#E8F5E9' },
  'Finance': { emoji: '💰', color: '#FFF3E0' },
  'Housing': { emoji: '🏠', color: '#E3F2FD' },
  'Women & Child': { emoji: '👧', color: '#F8BBD0' },
  'Employment': { emoji: '👷', color: '#E1BEE7' },
  'Healthcare': { emoji: '⚕️', color: '#E0F7FA' },
  'Entrepreneurship': { emoji: '🚀', color: '#FFECB3' },
  'Education': { emoji: '🎓', color: '#D1C4E9' },
  'Pension': { emoji: '👵🏽', color: '#FFCCBC' },
  'Welfare': { emoji: '🤲', color: '#C8E6C9' },
  'Transportation': { emoji: '🚌', color: '#BBDEFB' },
  'Infrastructure': { emoji: '🏗️', color: '#B3E5FC' },
  'Energy': { emoji: '⚡', color: '#FFECB3' },
  'Rural Development': { emoji: '🏘️', color: '#DCEDC8' },
  'Urban Development': { emoji: '🏙️', color: '#CFD8DC' },
  'Digital': { emoji: '💻', color: '#E0F2F1' },
  'Tourism': { emoji: '🏞️', color: '#F0F4C3' },
  'Other': { emoji: '📋', color: '#F5F5F5' }
};

// Base directory containing all scheme folders
const schemesDir = path.join(__dirname, '..', 'scheme');

// Output directory for JSON files
const outputDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to extract scheme information from text content
function extractSchemeInfo(text, fileName, stateOrCentral) {
  try {
    // Parse the text to extract necessary information
    const lines = text.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      console.warn(`Warning: No content found in ${fileName}`);
      return null;
    }
    
    // Try to extract various pieces of information
    let title = lines[0].trim();
    
    // Simple heuristic to extract title
    if (!title || title === "") {
      // If first line is empty, try the second line
      title = lines.length > 1 ? lines[1].trim() : 'Unknown Scheme';
    }
    
    // Remove any leading/trailing quotes or special characters
    title = title.replace(/^["'\s]+|["'\s]+$/g, '');
    
    // Extract description - use the next non-empty line after title
    let description = '';
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        description = lines[i].trim();
        break;
      }
    }
    
    // Analyze content for possible long description
    // Join remaining lines for long description, excluding any adsbygoogle or clearly non-relevant content
    let longDescription = lines.slice(1)
      .filter(line => 
        !line.includes('adsbygoogle') && 
        !line.includes('window.') &&
        !line.includes('SAVE AS PDF') &&
        !line.includes('Content Source') &&
        !line.includes('References') &&
        !line.includes('http') &&
        line.trim() !== ''
      )
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (longDescription.length < description.length) {
      longDescription = description;
    }
    
    // Extract other details using regex patterns
    const eligibilityPattern = /eligib[\w]*\s*:?\s*([^.]+)/i;
    const eligibilityMatch = text.match(eligibilityPattern);
    const eligibility = eligibilityMatch ? eligibilityMatch[1].trim() : 'Contact department for eligibility criteria';
    
    const benefitPattern = /(benefit|amount|assistance|support|aid|subsidy|grant)\s*:?\s*([^.]+)/i;
    const benefitMatch = text.match(benefitPattern);
    const benefitAmount = benefitMatch ? benefitMatch[2].trim() : 'Various benefits available';
    
    const deadlinePattern = /(deadline|last date|closing date|valid till|valid until)\s*:?\s*([^.]+)/i;
    const deadlineMatch = text.match(deadlinePattern);
    const deadline = deadlineMatch ? deadlineMatch[2].trim() : 'Ongoing';
    
    // Extract documents required
    const documentPattern = /(documents|document required|document needed|supporting documents)[^:]*:([^.]+)/i;
    const documentMatch = text.match(documentPattern);
    let documents = [];
    
    if (documentMatch && documentMatch[2]) {
      // Split by commas or bullet points
      const docList = documentMatch[2]
        .split(/[,•]/)
        .map(doc => doc.trim())
        .filter(doc => doc && doc.length > 2);
      
      documents = docList.length > 0 ? docList : ['Aadhaar Card', 'Other Identity Proof'];
    } else {
      // Default documents
      documents = ['Aadhaar Card', 'Other required documents as specified by the department'];
    }
    
    // Extract ministry/department
    const ministryPattern = /(ministry|department|dept)[^:]*:([^.]+)/i;
    const ministryMatch = text.match(ministryPattern);
    const ministry = ministryMatch ? ministryMatch[2].trim() : 
      (stateOrCentral === 'central' ? 'Government of India' : `Government of ${parseStateName(stateOrCentral)}`);
    
    // Determine category based on content keywords
    const category = determineCategory(title + ' ' + description + ' ' + longDescription);
    
    // Generate a unique ID based on file name
    const id = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    
    // Determine if this is a popular scheme (simplified logic - can be improved)
    // Popular if it has more complete information or contains certain keywords
    const isPopular = 
      (eligibility.length > 10 && benefitAmount.length > 5 && documents.length >= 2) ||
      title.toLowerCase().includes('pradhan mantri') ||
      title.toLowerCase().includes('pm ') ||
      title.toLowerCase().includes('flagship') ||
      title.toLowerCase().includes('national');
    
    // Create the scheme object in the required format
    return {
      id,
      title,
      description,
      longDescription: longDescription || description,
      eligibility,
      benefitAmount,
      deadline,
      documents,
      ministry,
      emoji: categories[category].emoji,
      color: categories[category].color,
      category,
      isPopular,
      schemeType: stateOrCentral === 'central' ? 'central' : 'state',
      state: stateOrCentral === 'central' ? null : parseStateName(stateOrCentral)
    };
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    // Return a minimal valid scheme object to avoid breaking the process
    return {
      id: fileName.replace(/\.[^/.]+$/, ""),
      title: `Scheme from ${fileName}`,
      description: 'Information unavailable',
      longDescription: 'The information for this scheme could not be processed correctly.',
      eligibility: 'Contact department for details',
      benefitAmount: 'Contact department for details',
      deadline: 'Contact department for details',
      documents: ['Contact department for required documents'],
      ministry: stateOrCentral === 'central' ? 'Government of India' : `Government of ${parseStateName(stateOrCentral)}`,
      emoji: '📋',
      color: '#F5F5F5',
      category: 'Other',
      isPopular: false,
      schemeType: stateOrCentral === 'central' ? 'central' : 'state',
      state: stateOrCentral === 'central' ? null : parseStateName(stateOrCentral)
    };
  }
}

// Function to determine category based on text content
function determineCategory(text) {
  text = text.toLowerCase();
  
  // Define keywords for each category
  const categoryKeywords = {
    'Agriculture': ['agriculture', 'farm', 'farmer', 'crop', 'irrigation', 'seeds', 'fertilizer', 'kisan'],
    'Finance': ['finance', 'loan', 'credit', 'bank', 'financial', 'insurance', 'money', 'fund', 'subsidy', 'economic', 'fiscal'],
    'Housing': ['housing', 'home', 'house', 'shelter', 'residential', 'dwelling', 'accommodation', 'awas'],
    'Women & Child': ['women', 'woman', 'girl', 'child', 'children', 'mother', 'maternity', 'female', 'daughter'],
    'Employment': ['employment', 'job', 'career', 'work', 'worker', 'labour', 'labor', 'wage', 'salary', 'nrega', 'mgnrega'],
    'Healthcare': ['health', 'medical', 'hospital', 'doctor', 'treatment', 'disease', 'patient', 'medicine', 'healthcare', 'ayushman'],
    'Entrepreneurship': ['entrepreneur', 'startup', 'business', 'enterprise', 'msme', 'industry', 'self-employed', 'venture'],
    'Education': ['education', 'school', 'college', 'university', 'student', 'scholarship', 'learning', 'academic', 'educational'],
    'Pension': ['pension', 'retirement', 'elderly', 'senior citizen', 'old age'],
    'Welfare': ['welfare', 'social security', 'benefit', 'beneficiary', 'poverty', 'poor', 'bpl', 'disadvantaged', 'marginalized'],
    'Transportation': ['transport', 'vehicle', 'road', 'bus', 'train', 'metro', 'mobility'],
    'Infrastructure': ['infrastructure', 'construction', 'building', 'facility', 'structure', 'development'],
    'Energy': ['energy', 'power', 'electricity', 'solar', 'renewable', 'gas', 'fuel', 'ujjwala'],
    'Rural Development': ['rural', 'village', 'gram', 'panchayat'],
    'Urban Development': ['urban', 'city', 'municipal', 'metropolitan', 'town', 'smart city'],
    'Digital': ['digital', 'technology', 'tech', 'online', 'internet', 'computer', 'mobile', 'broadband', 'it'],
    'Tourism': ['tourism', 'tourist', 'travel', 'hotel', 'hospitality']
  };
  
  // Count matches for each category
  const matches = {};
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    matches[category] = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches[category] += 1;
      }
    }
  }
  
  // Find the category with the most matches
  let bestCategory = 'Other';
  let maxMatches = 0;
  
  for (const [category, count] of Object.entries(matches)) {
    if (count > maxMatches) {
      maxMatches = count;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

// Function to parse state name from folder name
function parseStateName(stateFolderName) {
  // Convert hyphenated folder names to proper names
  const stateNameMap = {
    'andhra-pradesh': 'Andhra Pradesh',
    'arunachal-pradesh': 'Arunachal Pradesh',
    'assam': 'Assam',
    'bihar': 'Bihar',
    'chhattisgarh': 'Chhattisgarh',
    'goa': 'Goa',
    'gujarat': 'Gujarat',
    'haryana': 'Haryana',
    'himachal-pradesh': 'Himachal Pradesh',
    'jammu-kashmir': 'Jammu & Kashmir',
    'jharkhand': 'Jharkhand',
    'karnataka': 'Karnataka',
    'kerala': 'Kerala',
    'madhya-pradesh': 'Madhya Pradesh',
    'maharashtra': 'Maharashtra',
    'manipur': 'Manipur',
    'meghalaya': 'Meghalaya',
    'mizoram': 'Mizoram',
    'nagaland': 'Nagaland',
    'odisha': 'Odisha',
    'punjab': 'Punjab',
    'rajasthan': 'Rajasthan',
    'sikkim': 'Sikkim',
    'tamilnadu': 'Tamil Nadu',
    'telangana': 'Telangana',
    'tripura': 'Tripura',
    'uttar-pradesh': 'Uttar Pradesh',
    'uttarakhand': 'Uttarakhand',
    'west-bengal': 'West Bengal',
    'delhi': 'Delhi',
    'chandigarh': 'Chandigarh'
  };
  
  return stateNameMap[stateFolderName] || stateFolderName;
}

// Process all scheme directories
async function processAllSchemes() {
  console.log('Starting scheme processing...');
  
  try {
    // Check if scheme directory exists
    if (!fs.existsSync(schemesDir)) {
      console.error(`Error: Schemes directory not found at ${schemesDir}`);
      console.log('Please create the directory structure: /scheme/central, /scheme/state-name');
      return;
    }
    
    // Get all directories inside the schemes folder
    const dirs = fs.readdirSync(schemesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (dirs.length === 0) {
      console.error('Error: No state or central directories found in the scheme folder.');
      return;
    }
    
    const allSchemes = [];
    
    // Process each directory
    for (const dir of dirs) {
      console.log(`Processing ${dir} schemes...`);
      const dirPath = path.join(schemesDir, dir);
      
      // Get all text files in the directory
      const files = fs.readdirSync(dirPath)
        .filter(file => file.endsWith('.txt'));
      
      if (files.length === 0) {
        console.warn(`Warning: No text files found in ${dir} directory.`);
        continue;
      }
      
      const schemeType = dir === 'central' ? 'central' : dir;
      let processedCount = 0;
      let errorCount = 0;
      
      // Process each file
      for (const file of files) {
        try {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          const schemeInfo = extractSchemeInfo(content, file, schemeType);
          if (schemeInfo) {
            allSchemes.push(schemeInfo);
            processedCount++;
          } else {
            errorCount++;
          }
        } catch (fileError) {
          console.error(`Error processing file ${file} in ${dir}:`, fileError);
          errorCount++;
        }
      }
      
      // Save schemes for this directory to a separate JSON file
      const outputPath = path.join(outputDir, `${dir}-schemes.json`);
      const dirSchemes = allSchemes.filter(scheme => 
        (dir === 'central' && scheme.schemeType === 'central') || 
        (dir !== 'central' && scheme.state === parseStateName(dir))
      );
      
      try {
        fs.writeFileSync(outputPath, JSON.stringify(dirSchemes, null, 2));
        console.log(`Saved ${dirSchemes.length} schemes to ${outputPath}`);
      } catch (writeError) {
        console.error(`Error writing ${dir} schemes to file:`, writeError);
      }
      
      console.log(`${dir}: Processed ${processedCount} schemes, encountered ${errorCount} errors`);
    }
    
    // Save all schemes to a single JSON file
    const allSchemesPath = path.join(outputDir, 'all-schemes.json');
    
    try {
      fs.writeFileSync(allSchemesPath, JSON.stringify(allSchemes, null, 2));
      console.log(`\nSaved ${allSchemes.length} total schemes to ${allSchemesPath}`);
      
      // Print some statistics
      const centralSchemes = allSchemes.filter(s => s.schemeType === 'central').length;
      const stateSchemes = allSchemes.filter(s => s.schemeType === 'state').length;
      const popularSchemes = allSchemes.filter(s => s.isPopular).length;
      
      console.log('\nScheme Statistics:');
      console.log(`- Central Schemes: ${centralSchemes}`);
      console.log(`- State Schemes: ${stateSchemes}`);
      console.log(`- Popular Schemes: ${popularSchemes}`);
      
      console.log('\nScheme Processing Completed Successfully!');
    } catch (writeError) {
      console.error('Error writing all schemes to file:', writeError);
    }
  } catch (error) {
    console.error('Fatal error during scheme processing:', error);
    process.exit(1);
  }
}

// Execute the processing function
processAllSchemes().catch(err => {
  console.error('Error processing schemes:', err);
  process.exit(1);
}); 