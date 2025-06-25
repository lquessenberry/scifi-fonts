const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// Create fonts directory structure
const DOWNLOAD_DIR = path.resolve(__dirname, '../downloaded-fonts');
const FONTS_SECTIONS = ['title-fonts', 'text-fonts', 'alien-fonts'];

// Ensure directories exist
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

FONTS_SECTIONS.forEach(section => {
  const sectionPath = path.join(DOWNLOAD_DIR, section);
  if (!fs.existsSync(sectionPath)) {
    fs.mkdirSync(sectionPath, { recursive: true });
  }
});

// Define font URLs from Star Trek Minutiae
const fontUrls = {
  'title-fonts': [
    'https://www.st-minutiae.com/resources/fonts/DS9_Credits.zip',
    'https://www.st-minutiae.com/resources/fonts/DS9_Title.zip',
    'https://www.st-minutiae.com/resources/fonts/Final_Frontier.zip',
    'https://www.st-minutiae.com/resources/fonts/Jefferies.zip',
    'https://www.st-minutiae.com/resources/fonts/Montalban.zip',
    'https://www.st-minutiae.com/resources/fonts/Nova_Light_Ultra_Thin.zip',
    'https://www.st-minutiae.com/resources/fonts/Nova_Light_Ultra.zip',
    'https://www.st-minutiae.com/resources/fonts/TNG_Credits.zip',
    'https://www.st-minutiae.com/resources/fonts/TNG_Title.zip',
    'https://www.st-minutiae.com/resources/fonts/TOS_Title.zip',
    'https://www.st-minutiae.com/resources/fonts/Trek_Movie_1.zip',
    'https://www.st-minutiae.com/resources/fonts/Trek_Movie_2.zip'
  ],
  'text-fonts': [
    'https://www.st-minutiae.com/resources/fonts/Beijing.zip',
    'https://www.st-minutiae.com/resources/fonts/Context_Ultra_Condensed.zip',
    'https://www.st-minutiae.com/resources/fonts/Context_Ultra_Condensed_Bold.zip',
    'https://www.st-minutiae.com/resources/fonts/Federation.zip',
    'https://www.st-minutiae.com/resources/fonts/Federation_Wide.zip',
    'https://www.st-minutiae.com/resources/fonts/Starfleet_1.zip',
    'https://www.st-minutiae.com/resources/fonts/Starfleet_2.zip',
    'https://www.st-minutiae.com/resources/fonts/Trek_TNG_Monitors.zip',
    'https://www.st-minutiae.com/resources/fonts/Trekbats.zip'
  ],
  'alien-fonts': [
    'https://www.st-minutiae.com/resources/fonts/Bajoran.zip',
    'https://www.st-minutiae.com/resources/fonts/Borg.zip',
    'https://www.st-minutiae.com/resources/fonts/Cardassian.zip',
    'https://www.st-minutiae.com/resources/fonts/Dominion.zip',
    'https://www.st-minutiae.com/resources/fonts/Fabrini.zip',
    'https://www.st-minutiae.com/resources/fonts/Ferengi.zip',
    'https://www.st-minutiae.com/resources/fonts/Klingon.zip',
    'https://www.st-minutiae.com/resources/fonts/Romulan.zip',
    'https://www.st-minutiae.com/resources/fonts/Tholian.zip',
    'https://www.st-minutiae.com/resources/fonts/Trill.zip',
    'https://www.st-minutiae.com/resources/fonts/Vulcan.zip'
  ]
};

// Function to download a file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Function to extract a zip file
function extractZip(zipPath, extractDir) {
  return new Promise((resolve, reject) => {
    exec(`unzip -o "${zipPath}" -d "${extractDir}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Download and extract all fonts
async function downloadAndExtractFonts() {
  const total = Object.values(fontUrls).reduce((acc, arr) => acc + arr.length, 0);
  let completed = 0;

  for (const section of FONTS_SECTIONS) {
    const sectionPath = path.join(DOWNLOAD_DIR, section);
    
    console.log(`\n=== Downloading ${section} (${fontUrls[section].length} files) ===\n`);
    
    for (const url of fontUrls[section]) {
      const filename = url.split('/').pop();
      const zipPath = path.join(sectionPath, filename);
      const extractDir = path.join(sectionPath, filename.replace('.zip', ''));
      
      try {
        completed++;
        console.log(`[${completed}/${total}] Downloading ${filename}...`);
        await downloadFile(url, zipPath);
        
        // Create extraction directory
        if (!fs.existsSync(extractDir)) {
          fs.mkdirSync(extractDir, { recursive: true });
        }
        
        console.log(`Extracting ${filename}...`);
        await extractZip(zipPath, extractDir);
        console.log(`✓ Successfully downloaded and extracted ${filename}\n`);
      } catch (error) {
        console.error(`✗ Error processing ${filename}: ${error.message}\n`);
      }
    }
  }
  
  console.log('\nAll fonts downloaded and extracted successfully!');
  console.log(`Fonts are located in: ${DOWNLOAD_DIR}`);
}

// Run the download and extract process
downloadAndExtractFonts().catch(err => {
  console.error('An error occurred:', err);
});
