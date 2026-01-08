// Vercel serverless function entry point
const path = require('path');

// Adjust __dirname for Vercel serverless environment
// In Vercel, __dirname points to the api/ directory
const serverPath = path.join(__dirname, '..', 'server.js');

// Set VERCEL environment variable so server.js knows it's running on Vercel
process.env.VERCEL = '1';

// Require the server
const server = require(serverPath);

// Export the Express app for Vercel
module.exports = server;

