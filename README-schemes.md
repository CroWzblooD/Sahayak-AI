# Scheme Processing System

This system processes government scheme data from text files and converts them to a structured JSON format that can be used in the Sahayak-AI app.

## Directory Structure

- `/scheme`: Contains folders for central and state schemes, with text files for each scheme
- `/scripts/process-schemes.js`: Script to process all scheme files and generate JSON files
- `/data`: Output directory for JSON files
- `/services/schemeService.ts`: Service to load and manage scheme data in the app

## How It Works

1. Text files in the `/scheme` directory are processed by the script
2. The script extracts scheme information using heuristics and pattern matching
3. JSON files are generated in the `/data` directory
4. The app loads scheme data from these JSON files

## Running the Script

To process all scheme files and generate JSON files:

```bash
node scripts/process-schemes.js
```

This will:
1. Process all `.txt` files in the `/scheme` directory
2. Generate individual JSON files for each state/central folder
3. Generate a combined `all-schemes.json` file with all schemes

## JSON Format

Each scheme is converted to the following format:

```json
{
  "id": "scheme-id",
  "title": "Scheme Title",
  "description": "Short description",
  "longDescription": "Detailed description",
  "eligibility": "Eligibility criteria",
  "benefitAmount": "Benefits provided",
  "deadline": "Application deadline",
  "documents": ["Document 1", "Document 2"],
  "ministry": "Ministry or department",
  "emoji": "🌾",
  "color": "#E8F5E9",
  "category": "Agriculture",
  "isPopular": true,
  "schemeType": "central" | "state",
  "state": "State name" | null
}
```

## Using the Data in the App

The app uses the `schemeService` to load scheme data. The service:

1. Tries to load data from the cache
2. If no cache or cache is expired, loads data from JSON files
3. Provides filtered views by category, state, popularity, etc.

Use the `useSchemes` hook in your components:

```tsx
function MyComponent() {
  const { schemes, loading, error, selectedCategory, setSelectedCategory } = useSchemes();
  
  // Use schemes data in your UI
}
```

## Adding New Schemes

1. Add new text files to the appropriate folder in `/scheme`
2. Run the processing script to update the JSON files
3. The app will automatically use the updated data

## Customizing Categories

Edit the `categories` array in `services/schemeService.ts` to add or modify scheme categories.

## Performance Considerations

- The JSON files are cached in AsyncStorage to improve app performance
- Consider using a backend API for large datasets
- For very large datasets, consider pagination or on-demand loading 