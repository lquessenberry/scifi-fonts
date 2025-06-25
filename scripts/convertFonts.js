const fs = require('fs');
const path = require('path');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');

// Configuration
const fontDirs = [
  path.join(__dirname, '../fonts/trekerprise')
  // Add more theme directories as they're created
];
const outputBaseDir = path.join(__dirname, '../webfonts');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputBaseDir)) {
  fs.mkdirSync(outputBaseDir, { recursive: true });
}

// Process each font directory
fontDirs.forEach(fontDir => {
  // Get the theme name from the directory path
  const themeName = path.basename(fontDir);
  console.log(`Processing ${themeName} fonts...`);
  
  // Create theme output directory
  const outputDir = path.join(outputBaseDir, themeName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all TTF files in the directory
  const ttfFiles = fs.readdirSync(fontDir).filter(file => file.toLowerCase().endsWith('.ttf'));
  
  // Process each TTF file
  ttfFiles.forEach(ttfFile => {
    const ttfPath = path.join(fontDir, ttfFile);
    const fontName = path.basename(ttfFile, '.TTF').replace(/\s+/g, '_');
    const baseName = fontName.replace(/\.TTF$/i, '');
    
    console.log(`Converting ${ttfFile}...`);
    
    try {
      // Read TTF file
      const ttfBuffer = fs.readFileSync(ttfPath);
      
      // Convert to WOFF
      const woffBuffer = Buffer.from(ttf2woff(new Uint8Array(ttfBuffer)).buffer);
      fs.writeFileSync(path.join(outputDir, `${baseName}.woff`), woffBuffer);
      console.log(`Generated ${baseName}.woff`);
      
      // Copy original TTF to output directory
      fs.copyFileSync(ttfPath, path.join(outputDir, ttfFile));
      console.log(`Copied ${ttfFile} to webfonts directory`);
      
      // Convert to EOT
      const eotBuffer = Buffer.from(ttf2eot(new Uint8Array(ttfBuffer)).buffer);
      fs.writeFileSync(path.join(outputDir, `${baseName}.eot`), eotBuffer);
      console.log(`Generated ${baseName}.eot`);
      
    } catch (err) {
      console.error(`Error converting ${ttfFile}: ${err.message}`);
    }
  });
});

console.log('Font conversion complete!');
