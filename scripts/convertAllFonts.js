const fs = require('fs');
const path = require('path');
const ttf2eot = require('ttf2eot');
const { glob } = require('glob');

// Source and destination directories
const DOWNLOADED_FONTS_DIR = path.resolve(__dirname, '../downloaded-fonts');
const WEB_FONTS_DIR = path.resolve(__dirname, '../webfonts/startrek');
const SECTIONS = ['title-fonts', 'text-fonts', 'alien-fonts'];

// Create web fonts directory if it doesn't exist
if (!fs.existsSync(WEB_FONTS_DIR)) {
  fs.mkdirSync(WEB_FONTS_DIR, { recursive: true });
}

// CSS content
let cssContent = '/* Star Trek Web Fonts */\n\n';

// Process a single font file
async function processFont(ttfPath) {
  try {
    // Get font info
    const fontFileName = path.basename(ttfPath);
    const fontName = path.basename(ttfPath, '.ttf');
    const fontFamily = fontName.replace(/_/g, ' ');
    const section = path.relative(DOWNLOADED_FONTS_DIR, ttfPath).split(path.sep)[0];
    
    console.log(`Processing ${fontFileName} (${section})...`);
    
    // Ensure font is valid TTF
    if (!fontFileName.toLowerCase().endsWith('.ttf')) {
      console.log(`  ⚠️ Skipping non-TTF file: ${fontFileName}`);
      return null;
    }
    
    // Read the TTF file
    const ttfBuffer = fs.readFileSync(ttfPath);
    
    // Create output directory for this font
    const fontDir = path.join(WEB_FONTS_DIR, section, fontName);
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }
    
    // Copy TTF file
    const ttfOutputPath = path.join(fontDir, `${fontName}.ttf`);
    fs.copyFileSync(ttfPath, ttfOutputPath);
    console.log(`  ✓ Copied TTF file to ${ttfOutputPath}`);
    
    let conversionSucceeded = false;
    
    // Try to convert to EOT
    try {
      const eotResult = ttf2eot(new Uint8Array(ttfBuffer));
      const eotOutputPath = path.join(fontDir, `${fontName}.eot`);
      fs.writeFileSync(eotOutputPath, Buffer.from(eotResult.buffer));
      console.log(`  ✓ Generated EOT file: ${eotOutputPath}`);
      conversionSucceeded = true;
    } catch (error) {
      console.error(`  ✗ Failed to convert to EOT: ${error.message}`);
    }
    
    if (!conversionSucceeded) {
      console.log(`  ⚠️ No web format conversions succeeded for ${fontFileName}, font may not work in browsers`);
      return null;
    }
    
    // Generate CSS for this font
    const relativeFontPath = path.join('webfonts/startrek', section, fontName);
    const css = `/* ${fontFamily} - ${section} */
@font-face {
  font-family: '${fontFamily}';
  src: url('/${relativeFontPath}/${fontName}.eot');
  src: url('/${relativeFontPath}/${fontName}.eot?#iefix') format('embedded-opentype'),
       url('/${relativeFontPath}/${fontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}\n\n`;
    
    // Add to overall CSS
    cssContent += css;
    
    return {
      name: fontFamily,
      fileName: fontName,
      section: section,
      relativePath: relativeFontPath
    };
    
  } catch (error) {
    console.error(`  ✗ Error processing font ${ttfPath}: ${error.message}`);
    return null;
  }
}

// Process all fonts in all sections
async function convertAllFonts() {
  const results = {
    'title-fonts': [],
    'text-fonts': [],
    'alien-fonts': []
  };
  
  let totalProcessed = 0;
  let totalSuccess = 0;
  
  // Find all TTF files in downloaded fonts directories
  for (const section of SECTIONS) {
    const sectionDir = path.join(DOWNLOADED_FONTS_DIR, section);
    const ttfFiles = glob.sync(`${sectionDir}/**/*.ttf`);
    
    console.log(`\n=== Processing ${ttfFiles.length} fonts in ${section} ===\n`);
    
    for (const ttfFile of ttfFiles) {
      totalProcessed++;
      const result = await processFont(ttfFile);
      if (result) {
        results[section].push(result);
        totalSuccess++;
      }
    }
  }
  
  // Write CSS file with all @font-face declarations
  const cssPath = path.join(WEB_FONTS_DIR, 'startrek-fonts.css');
  fs.writeFileSync(cssPath, cssContent);
  console.log(`\n✓ Generated CSS file with all font declarations: ${cssPath}`);
  
  // Generate a fonts.json file with font metadata
  const fontsData = {
    sections: SECTIONS.map(section => ({
      name: section.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      id: section,
      fonts: results[section]
    }))
  };
  
  const jsonPath = path.join(WEB_FONTS_DIR, 'fonts.json');
  fs.writeFileSync(jsonPath, JSON.stringify(fontsData, null, 2));
  console.log(`✓ Generated font metadata JSON: ${jsonPath}`);
  
  console.log(`\n=== Conversion Complete ===`);
  console.log(`Total fonts processed: ${totalProcessed}`);
  console.log(`Successfully converted: ${totalSuccess}`);
  console.log(`Failed conversions: ${totalProcessed - totalSuccess}`);
  
  return fontsData;
}

// Main execution
convertAllFonts().catch(err => {
  console.error('Error in main process:', err);
});
