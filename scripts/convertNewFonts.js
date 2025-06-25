const fs = require('fs');
const path = require('path');
const ttf2eot = require('ttf2eot');
const { mkdirp } = require('mkdirp');

// Define source and destination directories
const sourceDirs = [
  path.resolve(__dirname, '../fonts/sci-fi'),
  path.resolve(__dirname, '../fonts/trekerprise')
];

const webfontsDir = path.resolve(__dirname, '../webfonts');

// Group fonts by family for better organization
const fontFamilies = {
  'sci-fi': ['WorldOfScifi'],
  'trekerprise': [
    'Airborne', 'AirborneIi', 'AirbornePilot', 'AirborneIiPilot',
    'DilithiumPixelsNbpRegular',
    'EdgeOfTheGalaxy', 'EdgeOfTheGalaxyItalic', 'EdgeOfTheGalaxyPoster', 'EdgeOfTheGalaxyPosterItalic',
    'Kahless', 'KahlessPro', 'KahlessShadow',
    'Okuda', 'OkudaBold', 'OkudaBoldItalic', 'OkudaItalic',
    'Probert', 'ProbertBlack', 'ProbertBlackItalic', 'ProbertBold', 'ProbertBoldItalic', 'ProbertItalic',
    'Straczynski', 'StraczynskiBold', 'StraczynskiBoldItalic', 'StraczynskiItalic',
    'Tellarite'
  ]
};

// Define destination categories for new fonts to integrate with our showcase
const fontCategories = {
  'sci-fi': 'sci-fi-fonts',
  'Airborne': 'text-fonts',
  'DilithiumPixels': 'text-fonts',
  'EdgeOfTheGalaxy': 'title-fonts',
  'Kahless': 'alien-fonts',
  'Okuda': 'text-fonts',
  'Probert': 'title-fonts',
  'Straczynski': 'text-fonts',
  'Tellarite': 'alien-fonts',
  'WorldOfScifi': 'title-fonts'
};

// Function to get font category based on name
function getFontCategory(fontName) {
  for (const [prefix, category] of Object.entries(fontCategories)) {
    if (fontName.startsWith(prefix)) {
      return category;
    }
  }
  // Default to text-fonts if no match
  return 'text-fonts';
}

// Function to convert TTF to EOT
function ttfToEot(ttfBuffer) {
  const ttf = new Uint8Array(ttfBuffer);
  const eot = ttf2eot(ttf);
  return Buffer.from(eot.buffer);
}

// Function to process a single font file
async function processFont(sourceFile) {
  try {
    // Read source file info
    const fileName = path.basename(sourceFile);
    const dirName = path.dirname(sourceFile);
    const fileExt = path.extname(sourceFile).toLowerCase();
    
    // Only process TTF and OTF files
    if (fileExt !== '.ttf' && fileExt !== '.otf') {
      return;
    }

    // Determine font family and create destination folder structure
    let fontFamily = '';
    let sourceDir = '';
    
    if (dirName.includes('sci-fi')) {
      sourceDir = 'sci-fi';
    } else if (dirName.includes('trekerprise')) {
      sourceDir = 'trekerprise';
    } else {
      return; // Skip if not in our target directories
    }
    
    // Find the family name for this font
    let fontBaseName = path.basename(fileName, fileExt);
    
    // Remove any suffixes with hyphens (common in downloaded fonts)
    if (fontBaseName.includes('-')) {
      fontBaseName = fontBaseName.split('-')[0];
    }
    
    // Get font category (title, text, alien)
    const category = getFontCategory(fontBaseName);
    
    // Create clean font name without special characters for filesystem
    const cleanFontName = fontBaseName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Create destination directory
    const destDir = path.join(webfontsDir, sourceDir, category, cleanFontName);
    await fs.promises.mkdir(destDir, { recursive: true });
    
    console.log(`Processing: ${fileName}`);
    console.log(`  Category: ${category}`);
    console.log(`  Destination: ${destDir}`);
    
    // Read the font file
    const fontData = fs.readFileSync(sourceFile);
    
    // Copy the TTF/OTF file as-is
    const destTtf = path.join(destDir, `${cleanFontName}.ttf`);
    fs.writeFileSync(destTtf, fontData);
    console.log(`  Created TTF: ${destTtf}`);
    
    // Convert to EOT
    try {
      const eotData = ttfToEot(fontData);
      const destEot = path.join(destDir, `${cleanFontName}.eot`);
      fs.writeFileSync(destEot, eotData);
      console.log(`  Created EOT: ${destEot}`);
    } catch (eotError) {
      console.error(`  Error creating EOT for ${fileName}: ${eotError.message}`);
    }
    
    return {
      name: fontBaseName,
      cleanName: cleanFontName,
      category,
      sourceDir
    };
  } catch (err) {
    console.error(`Error processing ${sourceFile}:`, err);
    return null;
  }
}

// Main function to process all fonts
async function processAllFonts() {
  try {
    // Create record of processed fonts to update showcase
    const processedFonts = {
      'sci-fi-fonts': [],
      'title-fonts': [],
      'text-fonts': [],
      'alien-fonts': []
    };
    
    // Process each source directory
    for (const sourceDir of sourceDirs) {
      try {
        const files = fs.readdirSync(sourceDir);
        
        for (const file of files) {
          const filePath = path.join(sourceDir, file);
          
          // Check if it's a font file and not a directory
          const stats = fs.statSync(filePath);
          if (!stats.isDirectory()) {
            const result = await processFont(filePath);
            if (result) {
              processedFonts[result.category].push({
                name: result.name,
                cleanName: result.cleanName,
                sourceDir: result.sourceDir
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error processing directory ${sourceDir}:`, err);
      }
    }
    
    // Save the font data for the showcase
    const fontDataFile = path.join(webfontsDir, 'new-fonts.json');
    fs.writeFileSync(fontDataFile, JSON.stringify(processedFonts, null, 2));
    console.log(`\nSaved font data to ${fontDataFile}`);
    console.log(`Total fonts processed: ${Object.values(processedFonts).flat().length}`);
    
    // Generate CSS for all fonts
    let cssContent = '';
    
    for (const [category, fonts] of Object.entries(processedFonts)) {
      for (const font of fonts) {
        const fontFamily = font.name.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capitals
        const fontPath = `/${font.sourceDir}/${category}/${font.cleanName}`;
        
        cssContent += `@font-face {
  font-family: '${fontFamily}';
  src: url('../webfonts${fontPath}/${font.cleanName}.eot');
  src: url('../webfonts${fontPath}/${font.cleanName}.eot?#iefix') format('embedded-opentype'),
       url('../webfonts${fontPath}/${font.cleanName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
`;
      }
    }
    
    // Save CSS file
    const cssFile = path.join(webfontsDir, 'new-fonts.css');
    fs.writeFileSync(cssFile, cssContent);
    console.log(`Generated CSS file at ${cssFile}`);
    
    console.log('\nConversion complete! Now update your showcase to include these new fonts.');
  } catch (err) {
    console.error('Error in main process:', err);
  }
}

// Run the main process
processAllFonts();
