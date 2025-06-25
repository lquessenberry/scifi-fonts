const fs = require('fs');
const path = require('path');
const ttf2woff = require('ttf2woff');
const ttf2eot = require('ttf2eot');

// Single font to convert
const fontFile = path.resolve(__dirname, '../fonts/trekerprise/Star Trek BT.TTF');
const outputDir = path.resolve(__dirname, '../single-test');

// Font name without extension (used for output files)
const fontName = 'StarTrekBT';
const fontDisplayName = 'Star Trek BT';

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Converting ${fontFile} to web formats...`);

// Read the TTF file
const ttfBuffer = fs.readFileSync(fontFile);

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
fs.copyFileSync(fontFile, ttfOutputPath);
console.log(`Copied TTF file: ${ttfOutputPath}`);

// Generate CSS
const css = `@font-face {
  font-family: '${fontDisplayName}';
  src: url('${fontName}.eot');
  src: url('${fontName}.eot?#iefix') format('embedded-opentype'),
       url('${fontName}.woff') format('woff'),
       url('${fontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}`;

const cssPath = path.join(outputDir, `${fontName}.css`);
fs.writeFileSync(cssPath, css);
console.log(`Generated CSS file: ${cssPath}`);

// Create simple HTML test page
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Single Font Test</title>
    <link rel="stylesheet" href="${fontName}.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
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
        .trek-font {
            font-family: '${fontDisplayName}', Arial, sans-serif;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <h1>Single Font Test: ${fontDisplayName}</h1>
    
    <div class="sample normal">
        This is normal Arial text.
    </div>
    
    <div class="sample trek-font">
        This should use ${fontDisplayName}.
    </div>

    <script>
        // Font loading check
        document.fonts.ready.then(function() {
            console.log('Fonts ready');
            document.body.appendChild(document.createTextNode('Fonts loaded!'));
        });
    </script>
</body>
</html>`;

const htmlPath = path.join(outputDir, 'index.html');
fs.writeFileSync(htmlPath, html);
console.log(`Generated HTML test file: ${htmlPath}`);

console.log('Done! Open single-test/index.html in your browser to test the font.');
