// Vercel serverless function entry point
const path = require('path');

// Adjust __dirname for Vercel serverless environment
const serverPath = path.join(__dirname, '..', 'server.js');
const server = require(serverPath);

// Export the Express app for Vercel
module.exports = server;

