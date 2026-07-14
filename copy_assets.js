const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\679d510d-3119-4f9e-99c4-4d2df1b9d951\\forgegym_logo_1784022630170.png";

// Detect actual format from magic bytes
let ext = '.png';
try {
  const header = fs.readFileSync(src).slice(0, 12);
  const magic = header.slice(0, 4).toString('ascii');
  const webpMagic = header.slice(8, 12).toString('ascii');
  
  if (magic === 'RIFF' && webpMagic === 'WEBP') {
    console.log("[Detect] Detected WebP format from file signature.");
    ext = '.webp';
  } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    console.log("[Detect] Detected genuine PNG format from file signature.");
    ext = '.png';
  } else if (header[0] === 0xFF && header[1] === 0xD8) {
    console.log("[Detect] Detected JPEG format from file signature.");
    ext = '.jpg';
  } else {
    console.log("[Detect] Unknown header signature, assuming WebP.");
    ext = '.webp';
  }
} catch (e) {
  console.warn("[Detect] Could not read source signature, defaulting to .webp:", e.message);
  ext = '.webp';
}

const jsDestDir = path.join(__dirname, 'assets', 'images');
const jsDest = path.join(jsDestDir, 'logo' + ext);

const androidDestDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'drawable');
const androidDest = path.join(androidDestDir, 'logo' + ext);

// Helper to remove files if they exist (to clear outdated format files)
const cleanOldFiles = (dir, currentExt) => {
  const extensions = ['.png', '.webp', '.jpg'];
  extensions.forEach(e => {
    if (e !== currentExt) {
      const file = path.join(dir, 'logo' + e);
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`[Clean] Removed old logo file: ${file}`);
        } catch (err) {
          console.warn(`[Clean] Failed to remove ${file}:`, err.message);
        }
      }
    }
  });
};

try {
  // 1. Copy to JS assets
  if (!fs.existsSync(jsDestDir)) {
    fs.mkdirSync(jsDestDir, { recursive: true });
  }
  cleanOldFiles(jsDestDir, ext);
  fs.copyFileSync(src, jsDest);
  console.log(`[Copy] Successfully copied logo to: ${jsDest}`);

  // 2. Copy to Android drawables
  if (fs.existsSync(androidDestDir)) {
    cleanOldFiles(androidDestDir, ext);
    fs.copyFileSync(src, androidDest);
    console.log(`[Copy] Successfully copied logo to: ${androidDest}`);
  } else {
    console.log("[Android] Drawable folder not found. Skipping drawable copy.");
  }
} catch (err) {
  console.error("Asset copy failed:", err);
}
