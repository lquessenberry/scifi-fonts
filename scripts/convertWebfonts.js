const fs = require('fs');
const path = require('path');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');

// Define source and destination paths
const fontDir = path.resolve(__dirname, '../fonts/trekerprise');
const outputDir = path.resolve(__dirname, '../webfonts/trekerprise');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get list of TTF files
const ttfFiles = fs.readdirSync(fontDir)
  .filter(file => file.toLowerCase().endsWith('.ttf'))
  .map(file => path.join(fontDir, file));

console.log('Found TTF files:', ttfFiles);

// Process each TTF file
async function processFonts() {
  const fontCssBlocks = [];
  
  for (const ttfFile of ttfFiles) {
    const fontBaseName = path.basename(ttfFile);
    const fontName = path.basename(ttfFile, '.TTF').replace(/ /g, '_');
    
    console.log(`Processing ${fontName} from ${ttfFile}`);
    
    try {
      // Read the TTF file
      const ttfBuffer = fs.readFileSync(ttfFile);
      
      // Convert to WOFF
      const woffResult = ttf2woff(new Uint8Array(ttfBuffer));
      const woffOutputPath = path.join(outputDir, `${fontName}.woff`);
      fs.writeFileSync(woffOutputPath, Buffer.from(woffResult.buffer));
      console.log(`Generated WOFF file: ${woffOutputPath}`);
      
      // Convert to EOT
      const eotResult = ttf2eot(new Uint8Array(ttfBuffer));
      const eotOutputPath = path.join(outputDir, `${fontName}.eot`);
      fs.writeFileSync(eotOutputPath, Buffer.from(eotResult.buffer));
      console.log(`Generated EOT file: ${eotOutputPath}`);
      
      // Copy TTF file to output directory
      const ttfOutputPath = path.join(outputDir, `${fontName}.ttf`);
      fs.copyFileSync(ttfFile, ttfOutputPath);
      console.log(`Copied TTF file: ${ttfOutputPath}`);
      
      // Create CSS block for this font
      const cssBlock = generateFontCss(fontName, fontBaseName.replace('.TTF', ''));
      fontCssBlocks.push(cssBlock);
      
      // Write individual CSS file
      const cssPath = path.join(outputDir, `${fontName}.css`);
      fs.writeFileSync(cssPath, cssBlock);
      console.log(`Generated CSS file: ${cssPath}`);
      
    } catch (error) {
      console.error(`Error processing ${fontName}:`, error);
    }
  }
  
  // Create a combined CSS file with all fonts
  if (fontCssBlocks.length > 0) {
    const combinedCSS = fontCssBlocks.join('\n\n');
    fs.writeFileSync(path.join(outputDir, 'trekerprise-fonts.css'), combinedCSS);
    console.log('Generated combined CSS file');
  }
}

// Function to generate CSS for a font
function generateFontCss(fontFileName, fontDisplayName) {
  return `@font-face {
  font-family: '${fontDisplayName}';
  src: url('${fontFileName}.eot');
  src: url('${fontFileName}.eot?#iefix') format('embedded-opentype'),
       url('${fontFileName}.woff') format('woff'),
       url('${fontFileName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;
}

processFonts().catch(console.error);
