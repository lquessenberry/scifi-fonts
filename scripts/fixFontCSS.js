const fs = require('fs');
const path = require('path');

// Path to the generated CSS file
const cssFilePath = path.resolve(__dirname, '../webfonts/all-fonts.css');

// List of known problematic fonts that have OTS parsing errors
const problematicFonts = [
  'Star_Trek_BT',
  'Star_Trek_Film_BT',
  'Star_Trek_Pi_BT',
  'Starfleet_Bold_Extended_BT'
];

// Read the CSS file
let cssContent = fs.readFileSync(cssFilePath, 'utf8');

console.log('Fixing CSS for problematic fonts...');

// For each problematic font, adjust its CSS to prioritize WOFF/EOT over TTF
problematicFonts.forEach(fontName => {
  const fontRegex = new RegExp(`@font-face\\s*{[^}]*font-family:\\s*['\"]${fontName.replace(/_/g, ' ')}['\"][^}]*}`, 'g');
  const match = cssContent.match(fontRegex);
  
  if (match) {
    console.log(`Found CSS for ${fontName}, adjusting format priorities...`);
    
    // Original CSS block
    const originalCss = match[0];
    
    // Check if it has the problematic format ordering
    if (originalCss.includes('format(\'truetype\')') && 
        (originalCss.includes('format(\'woff\')') || originalCss.includes('format(\'embedded-opentype\')'))
    ){
      // Create a modified version that prioritizes WOFF and EOT over TTF
      let modifiedCss = originalCss.replace(
        /src:\s*url\(['"]([^'"]+)\.eot['"]\);/,
        (match, pathPrefix) => {
          return `src: url('${pathPrefix}.eot'); src: url('${pathPrefix}.eot?#iefix') format('embedded-opentype'), url('${pathPrefix}.woff') format('woff');`;
        }
      );
      
      // Replace the original CSS with the modified version
      cssContent = cssContent.replace(originalCss, modifiedCss);
      console.log(`Modified CSS for ${fontName} to prioritize WOFF and EOT formats`);
    } else {
      console.log(`${fontName} already has appropriate format ordering or is missing some formats`);
    }
  } else {
    console.log(`Could not find CSS for ${fontName}`);
  }
});

// Add a note at the top of the CSS file
const cssNote = '/* Modified font CSS with adjusted format priorities for browser compatibility */\n';
cssContent = cssNote + cssContent;

// Write the modified CSS back to the file
fs.writeFileSync(cssFilePath, cssContent, 'utf8');
console.log(`Updated CSS file at: ${cssFilePath}`);

console.log('Font CSS fix completed.');
