const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp'); // You need to install: npm install sharp

/**
 * Download image from URL
 * @param {string} url - URL of the image to download
 * @param {string} outputPath - Output file path
 * @returns {Promise<string>} - Path of the saved file
 */
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist yet
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Select HTTP or HTTPS client based on URL
    const client = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(outputPath);
    
    client.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        fs.unlink(outputPath, () => {
          downloadImage(response.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        });
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {}); // Delete partial file on error
      reject(err);
    });
  });
}

/**
 * Optimize image
 * @param {string} inputPath - Input image path
 * @param {string} outputPath - Output file path
 * @param {Object} options - Options
 * @param {number} [options.width] - Target width
 * @param {number} [options.height] - Target height
 * @param {number} [options.quality=80] - JPEG/WebP quality (1-100)
 * @returns {Promise<string>} - Path of the saved optimized file
 */
async function optimizeImage(inputPath, outputPath, options = {}) {
  const { width, height, quality = 80 } = options;
  
  // Create directory if it doesn't exist yet
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  try {
    let image = sharp(inputPath);
    
    // Resize if width or height is specified
    if (width || height) {
      image = image.resize({
        width,
        height,
        fit: 'inside', // Maintain aspect ratio
        withoutEnlargement: true // Don't enlarge if image is smaller than target size
      });
    }
    
    // Determine file type based on extension
    const ext = path.extname(outputPath).toLowerCase();
    
    if (ext === '.jpg' || ext === '.jpeg') {
      image = image.jpeg({ quality });
    } else if (ext === '.png') {
      image = image.png({ quality: quality / 100 * 9 }); // PNG quality is 0-9
    } else if (ext === '.webp') {
      image = image.webp({ quality });
    } else if (ext === '.avif') {
      image = image.avif({ quality });
    }
    
    await image.toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error(`Error during optimization: ${error.message}`);
    throw error;
  }
}

module.exports = {
  downloadImage,
  optimizeImage
}; 