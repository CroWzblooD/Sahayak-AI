const fs = require('fs');
const path = require('path');

// Path to JSON data
const dataDir = path.join(__dirname, '..', 'data');
const allSchemesPath = path.join(dataDir, 'all-schemes.json');

// Validation criteria
const minTitleLength = 5;
const minDescriptionLength = 10;
const requiredFields = [
  'id', 'title', 'description', 'longDescription', 'emoji', 
  'color', 'category', 'isPopular', 'schemeType'
];

// Function to validate a scheme
function validateScheme(scheme, index) {
  const issues = [];
  
  // Check required fields
  for (const field of requiredFields) {
    if (scheme[field] === undefined || scheme[field] === null) {
      issues.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate field lengths and content
  if (scheme.title && scheme.title.length < minTitleLength) {
    issues.push(`Title too short (${scheme.title.length} chars): "${scheme.title}"`);
  }
  
  if (scheme.description && scheme.description.length < minDescriptionLength) {
    issues.push(`Description too short (${scheme.description.length} chars)`);
  }
  
  // Validate category (should be one of the predefined categories)
  const validCategories = [
    'Agriculture', 'Finance', 'Housing', 'Women & Child', 
    'Employment', 'Healthcare', 'Entrepreneurship', 'Education',
    'Pension', 'Welfare', 'Transportation', 'Infrastructure',
    'Energy', 'Rural Development', 'Urban Development', 'Digital',
    'Tourism', 'Other'
  ];
  
  if (scheme.category && !validCategories.includes(scheme.category)) {
    issues.push(`Invalid category: "${scheme.category}"`);
  }
  
  // Validate schemeType
  if (scheme.schemeType && !['central', 'state'].includes(scheme.schemeType)) {
    issues.push(`Invalid schemeType: "${scheme.schemeType}"`);
  }
  
  // State consistency check
  if (scheme.schemeType === 'central' && scheme.state !== null) {
    issues.push(`Central scheme should have null state, got: "${scheme.state}"`);
  }
  
  if (scheme.schemeType === 'state' && !scheme.state) {
    issues.push(`State scheme should have non-null state`);
  }
  
  // Return validation result
  return {
    id: scheme.id || `scheme_${index}`,
    title: scheme.title || 'Unknown Scheme',
    issues,
    isValid: issues.length === 0
  };
}

// Main validation function
async function validateSchemes() {
  console.log('Validating scheme data...\n');
  
  try {
    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      console.error(`Data directory not found: ${dataDir}`);
      return;
    }
    
    // Check if all-schemes.json exists
    if (!fs.existsSync(allSchemesPath)) {
      console.error(`All schemes JSON file not found: ${allSchemesPath}`);
      return;
    }
    
    // Read and parse the JSON file
    const schemasRaw = fs.readFileSync(allSchemesPath, 'utf8');
    const schemas = JSON.parse(schemasRaw);
    
    if (!Array.isArray(schemas)) {
      console.error('Invalid JSON format: expected an array');
      return;
    }
    
    console.log(`Found ${schemas.length} schemes`);
    
    // Validate each scheme
    const validationResults = schemas.map(validateScheme);
    
    // Calculate statistics
    const validSchemes = validationResults.filter(result => result.isValid);
    const invalidSchemes = validationResults.filter(result => !result.isValid);
    
    console.log(`\nValidation Summary:`);
    console.log(`- Total schemes: ${schemas.length}`);
    console.log(`- Valid schemes: ${validSchemes.length}`);
    console.log(`- Invalid schemes: ${invalidSchemes.length}`);
    
    // Show schemes by category
    const categoryCounts = {};
    schemas.forEach(scheme => {
      const category = scheme.category || 'Unknown';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log('\nSchemes by Category:');
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`- ${category}: ${count}`);
      });
    
    // Show schemes by type
    const centralSchemes = schemas.filter(s => s.schemeType === 'central');
    const stateSchemes = schemas.filter(s => s.schemeType === 'state');
    
    console.log('\nSchemes by Type:');
    console.log(`- Central: ${centralSchemes.length}`);
    console.log(`- State: ${stateSchemes.length}`);
    
    // Show schemes by state (for state schemes)
    if (stateSchemes.length > 0) {
      const stateCounts = {};
      stateSchemes.forEach(scheme => {
        const state = scheme.state || 'Unknown';
        stateCounts[state] = (stateCounts[state] || 0) + 1;
      });
      
      console.log('\nState Schemes by State:');
      Object.entries(stateCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([state, count]) => {
          console.log(`- ${state}: ${count}`);
        });
    }
    
    // Show popular schemes
    const popularSchemes = schemas.filter(s => s.isPopular);
    console.log(`\nPopular Schemes: ${popularSchemes.length}`);
    
    // Show issues in invalid schemes
    if (invalidSchemes.length > 0) {
      console.log('\nIssues Found:');
      invalidSchemes.forEach(result => {
        console.log(`\n${result.title} (${result.id}):`);
        result.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      });
    }
    
    console.log('\nValidation completed!');
  } catch (error) {
    console.error('Error validating schemes:', error);
  }
}

// Run the validation
validateSchemes().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 