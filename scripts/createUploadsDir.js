// scripts/createUploadsDir.js
const fs = require('fs');
const path = require('path');

const uploadsPath = process.env.UPLOADS_PATH || '/mnt/data/uploads';

function ensureUploadsDirectory() {
  if (!fs.existsSync(uploadsPath)) {
    console.log(`Creating uploads directory at ${uploadsPath}...`);
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`Uploads directory created at ${uploadsPath}`);
  } else {
    console.log(`Uploads directory already exists at ${uploadsPath}`);
  }
}

ensureUploadsDirectory();
