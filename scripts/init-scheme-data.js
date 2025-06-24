const fs = require('fs');
const path = require('path');

// Define paths
const dataDir = path.join(__dirname, '..', 'data');
const allSchemesPath = path.join(dataDir, 'all-schemes.json');

// Sample data with basic schemes
const sampleData = [
  {
    "id": "pm-kisan",
    "title": "PM Kisan Samman Nidhi",
    "description": "Direct income support for farmers",
    "longDescription": "Provides financial assistance of ₹6,000 per year to all land-holding farmer families in the country, paid in installments of ₹2,000 every four months.",
    "eligibility": "All landholder farmer families with cultivable land",
    "benefitAmount": "₹6,000 per year",
    "deadline": "Ongoing",
    "documents": ["Aadhaar Card", "Land Records", "Bank Account Details"],
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "emoji": "🌾",
    "color": "#E8F5E9",
    "category": "Agriculture",
    "isPopular": true,
    "schemeType": "central",
    "state": null
  },
  {
    "id": "ayushman-bharat",
    "title": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    "description": "Health insurance coverage for poor and vulnerable families",
    "longDescription": "Provides health insurance coverage of ₹5 lakh per family per year for secondary and tertiary hospitalization to poor and vulnerable families identified based on SECC database.",
    "eligibility": "Poor and vulnerable families as per SECC database",
    "benefitAmount": "₹5 lakh coverage per family per year",
    "deadline": "Ongoing",
    "documents": ["Aadhaar Card", "Ration Card", "Income Certificate"],
    "ministry": "Ministry of Health and Family Welfare",
    "emoji": "⚕️",
    "color": "#E0F7FA",
    "category": "Healthcare",
    "isPopular": true,
    "schemeType": "central",
    "state": null
  },
  {
    "id": "pmay",
    "title": "Pradhan Mantri Awas Yojana",
    "description": "Housing for all by 2024",
    "longDescription": "Provides financial assistance for construction of pucca houses for eligible rural and urban households. Aims to achieve 'Housing for All' by 2024.",
    "eligibility": "EWS and LIG households with annual income below ₹3 lakh",
    "benefitAmount": "Up to ₹2.5 lakh subsidy",
    "deadline": "31st March 2024",
    "documents": ["Aadhaar Card", "Income Certificate", "Land Documents"],
    "ministry": "Ministry of Housing and Urban Affairs",
    "emoji": "🏠",
    "color": "#E3F2FD",
    "category": "Housing",
    "isPopular": true,
    "schemeType": "central",
    "state": null
  }
];

// Function to initialize data
async function initializeData() {
  console.log('Initializing scheme data...');
  
  try {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      console.log(`Creating data directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create all-schemes.json with sample data
    console.log(`Creating sample data file: ${allSchemesPath}`);
    fs.writeFileSync(allSchemesPath, JSON.stringify(sampleData, null, 2));
    
    console.log('Scheme data initialization complete!');
    console.log(`Created ${sampleData.length} sample schemes`);
    console.log('\nNext steps:');
    console.log('1. Run the full processing script when ready:');
    console.log('   node scripts/process-schemes.js');
    console.log('2. Validate the generated data:');
    console.log('   node scripts/validate-schemes.js');
    
  } catch (error) {
    console.error('Error initializing scheme data:', error);
  }
}

// Run the initialization
initializeData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 