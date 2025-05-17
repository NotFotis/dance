// src/middlewares/create-uploads-dir.js

const fs = require('fs');
const path = require('path');

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const uploadsPath = process.env.UPLOADS_PATH || '/mnt/data/uploads';

    try {
      if (!fs.existsSync(uploadsPath)) {
        console.log(`Creating uploads directory at ${uploadsPath}...`);
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log(`Uploads directory created at ${uploadsPath}`);
      }
    } catch (err) {
      console.error(`Failed to create uploads directory: ${err.message}`);
    }

    await next();
  };
};
