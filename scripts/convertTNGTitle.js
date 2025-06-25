const fs = require('fs');
const path = require('path');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');

// Source font and output directory
const fontFile = path.resolve(__dirname, '../temp-fonts/TNG_Title.ttf');
const outputDir = path.resolve(__dirname, '../tng-title-test');

// Font name (used for output files)
const fontName = 'TNG_Title';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Converting ${fontFile} to web formats...`);

// Read the TTF file
const ttfBuffer = fs.readFileSync(fontFile);

// Try/catch blocks for each conversion to handle potential errors
try {
  // Convert to WOFF
  const woffResult = ttf2woff(new Uint8Array(ttfBuffer));
  const woffOutputPath = path.join(outputDir, `${fontName}.woff`);
  fs.writeFileSync(woffOutputPath, Buffer.from(woffResult.buffer));
  console.log(`✓ Generated WOFF file: ${woffOutputPath}`);
} catch (error) {
  console.error(`✗ Failed to convert to WOFF: ${error}`);
}

try {
  // Convert to EOT
  const eotResult = ttf2eot(new Uint8Array(ttfBuffer));
  const eotOutputPath = path.join(outputDir, `${fontName}.eot`);
  fs.writeFileSync(eotOutputPath, Buffer.from(eotResult.buffer));
  console.log(`✓ Generated EOT file: ${eotOutputPath}`);
} catch (error) {
  console.error(`✗ Failed to convert to EOT: ${error}`);
}

// Copy TTF file to output directory
const ttfOutputPath = path.join(outputDir, `${fontName}.ttf`);
fs.copyFileSync(fontFile, ttfOutputPath);
console.log(`✓ Copied TTF file: ${ttfOutputPath}`);

// Generate CSS - will adapt based on which conversions succeeded
let cssContent = `@font-face {
  font-family: 'TNG Title';
  src: url('${fontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;

// Check if the files exist and update CSS accordingly
if (fs.existsSync(path.join(outputDir, `${fontName}.eot`))) {
  cssContent = `@font-face {
  font-family: 'TNG Title';
  src: url('${fontName}.eot');
  src: url('${fontName}.eot?#iefix') format('embedded-opentype'),
       ${fs.existsSync(path.join(outputDir, `${fontName}.woff`)) ? `url('${fontName}.woff') format('woff'),` : ''}
       url('${fontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;
}

const cssPath = path.join(outputDir, `${fontName}.css`);
fs.writeFileSync(cssPath, cssContent);
console.log(`✓ Generated CSS file: ${cssPath}`);

// Create simple HTML test page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TNG Title Font Test</title>
    <link rel="stylesheet" href="${fontName}.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
        }
        .sample {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .normal {
            font-size: 24px;
        }
        .tng-title-font {
            font-family: 'TNG Title', Arial, sans-serif;
            font-size: 24px;
        }
        .test-paragraph {
            margin-top: 15px;
        }
        #fontLoadStatus {
            margin: 20px 0;
            padding: 10px;
            background-color: #f8f8f8;
            border-left: 4px solid #ddd;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>TNG Title Font Test</h1>
    
    <div id="fontLoadStatus">Checking font loading status...</div>
    
    <div class="sample normal">
        <strong>Normal Arial:</strong>
        <div class="test-paragraph">The quick brown fox jumps over the lazy dog. 1234567890</div>
    </div>
    
    <div class="sample tng-title-font">
        <strong>TNG Title Font:</strong>
        <div class="test-paragraph">The quick brown fox jumps over the lazy dog. 1234567890</div>
    </div>

    <div class="sample tng-title-font">
        <strong>Sample Star Trek text:</strong>
        <div class="test-paragraph">STAR TREK</div>
        <div class="test-paragraph">THE NEXT GENERATION</div>
        <div class="test-paragraph">SEASON 1</div>
    </div>

    <script>
        // Font loading check
        document.fonts.ready.then(function() {
            console.log('Font loading complete');
            
            // Check if TNG Title font loaded
            const tngTitleLoaded = Array.from(document.fonts).some(font => 
                font.family.toLowerCase().includes('tng title') && font.status === 'loaded');
            
            const statusElem = document.getElementById('fontLoadStatus');
            
            if (tngTitleLoaded) {
                statusElem.textContent = '✅ SUCCESS: TNG Title font loaded successfully!';
                statusElem.style.borderLeftColor = 'green';
                statusElem.style.color = 'green';
            } else {
                statusElem.textContent = '❌ ERROR: TNG Title font failed to load';
                statusElem.style.borderLeftColor = 'red';
                statusElem.style.color = 'red';
                
                // Show font debugging info
                const debugInfo = document.createElement('div');
                debugInfo.style.marginTop = '10px';
                debugInfo.style.fontSize = '12px';
                
                let infoText = 'Loaded fonts:';
                Array.from(document.fonts).forEach(font => {
                    infoText += '\\n- ' + font.family + ' (' + font.status + ')';
                });
                
                debugInfo.textContent = infoText;
                statusElem.appendChild(debugInfo);
            }
        });
    </script>
</body>
</html>`;

const htmlPath = path.join(outputDir, 'index.html');
fs.writeFileSync(htmlPath, html);
console.log(`✓ Generated HTML test file: ${htmlPath}`);

console.log('Done! Open tng-title-test/index.html in your browser to test the TNG Title font.');
