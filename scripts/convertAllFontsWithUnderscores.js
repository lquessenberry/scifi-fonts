const fs = require('fs');
const path = require('path');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// Configuration
const config = {
  fontDirs: [
    { 
      path: path.resolve(__dirname, '../fonts/trekerprise'), 
      outputDir: path.resolve(__dirname, '../webfonts/trekerprise'),
      categories: ['title-fonts', 'text-fonts', 'alien-fonts']
    },
    {
      path: path.resolve(__dirname, '../downloaded-fonts'),
      outputDir: path.resolve(__dirname, '../webfonts/startrek'),
      categories: ['title-fonts', 'text-fonts', 'alien-fonts']
    },
    {
      path: path.resolve(__dirname, '../fonts/sci-fi'),
      outputDir: path.resolve(__dirname, '../webfonts/sci-fi'), 
      categories: ['title-fonts', 'text-fonts', 'alien-fonts']
    }
  ],
  fontCategoryMapping: {
    // Trek Title fonts
    'TNG_Title': 'title-fonts',
    'DS9_Title': 'title-fonts',
    'TOS_Title': 'title-fonts',
    'DS9_Credits': 'title-fonts',
    'TNG_Credits': 'title-fonts',
    'Final_Frontier': 'title-fonts',
    'Galaxy': 'title-fonts',
    'Jefferies': 'title-fonts',
    'Montalban': 'title-fonts',
    'Nova_Light_Ultra': 'title-fonts',
    'Trek_Movie_1': 'title-fonts',
    'Trek_Movie_2': 'title-fonts',
    
    // Trek Text fonts
    'Federation': 'text-fonts',
    'Federation_Wide': 'text-fonts',
    'Starfleet_1': 'text-fonts',
    'Starfleet_2': 'text-fonts',
    'Trek_TNG_Monitors': 'text-fonts',
    'Context_Ultra_Condensed': 'text-fonts',
    'Beijing': 'text-fonts',
    'Trekbats': 'text-fonts',
    'Finalfrontier': 'text-fonts',
    
    // Trek Alien fonts
    'Klingon': 'alien-fonts',
    'Vulcan': 'alien-fonts',
    'Romulan': 'alien-fonts', 
    'Cardassian': 'alien-fonts',
    'Bajoran': 'alien-fonts',
    'Borg': 'alien-fonts',
    'Ferengi': 'alien-fonts',
    'Dominion': 'alien-fonts',
    'Trill': 'alien-fonts',
    'Tholian': 'alien-fonts',
    'Fabrini': 'alien-fonts',
    
    // New title fonts
    'WorldOfScifi': 'title-fonts',
    'EdgeOfTheGalaxyRegular': 'title-fonts',
    'EdgeOfTheGalaxyItalic': 'title-fonts',
    'EdgeOfTheGalaxyPoster': 'title-fonts',
    'EdgeOfTheGalaxyPosterItalic': 'title-fonts',
    'Probert': 'title-fonts',
    'ProbertItalic': 'title-fonts',
    'ProbertBold': 'title-fonts',
    'ProbertBoldItalic': 'title-fonts',
    'ProbertBlack': 'title-fonts',
    'ProbertBlackItalic': 'title-fonts',
    
    // New text fonts
    'Airborne': 'text-fonts',
    'AirbornePilot': 'text-fonts',
    'AirborneIi': 'text-fonts',
    'AirborneIiPilot': 'text-fonts',
    'DilithiumPixelsNbpRegular': 'text-fonts',
    'Okuda': 'text-fonts',
    'OkudaBold': 'text-fonts',
    'OkudaItalic': 'text-fonts',
    'OkudaBoldItalic': 'text-fonts',
    'Straczynski': 'text-fonts',
    'StraczynskiBold': 'text-fonts',
    'StraczynskiItalic': 'text-fonts',
    'StraczynskiBoldItalic': 'text-fonts',
    'Square_721_Condensed_BT': 'text-fonts',
    'Venetian_301_BT': 'text-fonts',
    'Star_Trek_BT': 'text-fonts',
    'Star_Trek_Film_BT': 'text-fonts',
    'Star_Trek_Pi_BT': 'text-fonts',
    'Starfleet_Bold_Extended_BT': 'text-fonts',
    
    // New alien fonts
    'Kahless': 'alien-fonts',
    'KahlessPro': 'alien-fonts',
    'KahlessShadow': 'alien-fonts',
    'Tellarite': 'alien-fonts'
  }
};

// Helper functions
function cleanFontName(name) {
  // Remove file extension
  let cleanName = name.replace(/\.(ttf|otf|TTF|OTF)$/, '');
  
  // Replace spaces with underscores
  cleanName = cleanName.replace(/ /g, '_');
  
  // Handle special characters
  cleanName = cleanName.replace(/[^\w\d_-]/g, '');
  
  return cleanName;
}

function getDisplayName(fontName) {
  // Format font name for display (replace underscores with spaces)
  return fontName.replace(/_/g, ' ');
}

function getFontCategory(fontName) {
  // Check if font name is in our mapping
  for (const [key, category] of Object.entries(config.fontCategoryMapping)) {
    if (fontName.includes(key)) {
      return category;
    }
  }
  
  // Default to text-fonts if not found
  return 'text-fonts';
}

async function createDirectories(baseDir, categories) {
  // Create the base output directory
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  
  // Create category subdirectories
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }
}

// Main processing function
async function processFont(ttfPath, outputBaseDir) {
  try {
    const originalFontName = path.basename(ttfPath);
    const cleanedName = cleanFontName(originalFontName);
    const fontCategory = getFontCategory(cleanedName);
    const fontDir = path.join(outputBaseDir, fontCategory, cleanedName);
    
    // Create font directory
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }
    
    console.log(`Processing ${originalFontName} → ${cleanedName} (${fontCategory})`);
    
    // Read the TTF file
    const ttfBuffer = fs.readFileSync(ttfPath);
    
    // Output paths
    const ttfOutputPath = path.join(fontDir, `${cleanedName}.ttf`);
    const eotOutputPath = path.join(fontDir, `${cleanedName}.eot`);
    const woffOutputPath = path.join(fontDir, `${cleanedName}.woff`);
    
    // Copy TTF file
    fs.copyFileSync(ttfPath, ttfOutputPath);
    console.log(`Copied TTF file: ${ttfOutputPath}`);
    
    // Convert to WOFF
    try {
      const woffResult = ttf2woff(new Uint8Array(ttfBuffer));
      fs.writeFileSync(woffOutputPath, Buffer.from(woffResult.buffer));
      console.log(`Generated WOFF file: ${woffOutputPath}`);
    } catch (e) {
      console.error(`WOFF conversion failed for ${cleanedName}: ${e.message}`);
    }
    
    // Convert to EOT
    try {
      const eotResult = ttf2eot(new Uint8Array(ttfBuffer));
      fs.writeFileSync(eotOutputPath, Buffer.from(eotResult.buffer));
      console.log(`Generated EOT file: ${eotOutputPath}`);
    } catch (e) {
      console.error(`EOT conversion failed for ${cleanedName}: ${e.message}`);
    }
    
    return {
      originalName: originalFontName,
      name: cleanedName,
      category: fontCategory,
      displayName: getDisplayName(cleanedName),
      paths: {
        ttf: ttfOutputPath,
        eot: eotOutputPath,
        woff: woffOutputPath,
      }
    };
  } catch (error) {
    console.error(`Error processing font ${ttfPath}:`, error);
    return null;
  }
}

// CSS generation
function generateCssForFont(fontInfo, outputBaseDir) {
  const relativeTtfPath = fontInfo.paths.ttf.replace(outputBaseDir, '');
  const relativeEotPath = fontInfo.paths.eot.replace(outputBaseDir, '');
  const relativeWoffPath = fontInfo.paths.woff.replace(outputBaseDir, '');
  
  return `@font-face {
  font-family: '${fontInfo.displayName}';
  src: url('${relativeEotPath}');
  src: url('${relativeEotPath}?#iefix') format('embedded-opentype'),
       url('${relativeWoffPath}') format('woff'),
       url('${relativeTtfPath}') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}\n`;
}

function generateCssFile(fontInfos, outputDir, cssFilename) {
  const cssBlocks = fontInfos.map(fontInfo => generateCssForFont(fontInfo, outputDir));
  const cssContent = cssBlocks.join('\n');
  const cssPath = path.join(outputDir, cssFilename);
  fs.writeFileSync(cssPath, cssContent);
  console.log(`Generated CSS file: ${cssPath}`);
  return cssPath;
}

function generateFontJson(fontInfos) {
  const fontList = {};
  
  // Group fonts by category
  fontInfos.forEach(font => {
    if (!fontList[font.category]) {
      fontList[font.category] = [];
    }
    fontList[font.category].push(font.name);
  });
  
  return fontList;
}

// Main execution
async function main() {
  try {
    console.log('Starting font conversion process...');
    const allFontInfos = [];
    
    // Process each configured font directory
    for (const dirConfig of config.fontDirs) {
      console.log(`\nProcessing directory: ${dirConfig.path}`);
      
      // Create output directories
      await createDirectories(dirConfig.outputDir, dirConfig.categories);
      
      // Find TTF files
      const files = fs.readdirSync(dirConfig.path, { withFileTypes: true });
      const ttfFiles = files
        .filter(file => file.isFile() && /\.(ttf|otf|TTF|OTF)$/i.test(file.name))
        .map(file => path.join(dirConfig.path, file.name));
      
      console.log(`Found ${ttfFiles.length} font files in ${dirConfig.path}`);
      
      // Process each font
      const fontInfos = [];
      for (const ttfFile of ttfFiles) {
        const fontInfo = await processFont(ttfFile, dirConfig.outputDir);
        if (fontInfo) fontInfos.push(fontInfo);
      }
      
      // Generate CSS and JSON for this directory
      if (fontInfos.length > 0) {
        const cssFilename = path.basename(dirConfig.path) + '-fonts.css';
        generateCssFile(fontInfos, dirConfig.outputDir, cssFilename);
        
        const jsonFilename = path.basename(dirConfig.path) + '-fonts.json';
        const jsonPath = path.join(dirConfig.outputDir, jsonFilename);
        fs.writeFileSync(jsonPath, JSON.stringify(generateFontJson(fontInfos), null, 2));
        console.log(`Generated JSON file: ${jsonPath}`);
        
        allFontInfos.push(...fontInfos);
      }
    }
    
    // Generate combined CSS and JSON for all fonts
    const combinedCssPath = path.resolve(__dirname, '../webfonts/all-fonts.css');
    fs.writeFileSync(combinedCssPath, 
      allFontInfos.map(fontInfo => generateCssForFont(fontInfo, path.resolve(__dirname, '..'))).join('\n')
    );
    console.log(`Generated combined CSS file: ${combinedCssPath}`);
    
    const combinedJsonPath = path.resolve(__dirname, '../webfonts/all-fonts.json');
    fs.writeFileSync(combinedJsonPath, JSON.stringify(generateFontJson(allFontInfos), null, 2));
    console.log(`Generated combined JSON file: ${combinedJsonPath}`);
    
    console.log('\nFont conversion completed successfully!');
    
  } catch (error) {
    console.error('Error during font conversion:', error);
    process.exit(1);
  }
}

// Run the main function
main();
