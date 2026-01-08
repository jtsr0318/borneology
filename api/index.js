// Vercel serverless function entry point
const path = require('path');
const fs = require('fs');

// Set VERCEL environment variable BEFORE requiring server
process.env.VERCEL = '1';

// Adjust __dirname for Vercel serverless environment
// In Vercel, __dirname points to the api/ directory
const serverPath = path.join(__dirname, '..', 'server.js');

// Verify server.js exists
if (!fs.existsSync(serverPath)) {
  console.error('ERROR: server.js not found at:', serverPath);
  console.error('Current __dirname:', __dirname);
  console.error('Current process.cwd():', process.cwd());
}

// Require the server
const server = require(serverPath);

// Export the Express app for Vercel
module.exports = server;

