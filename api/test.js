// Simple test endpoint for Vercel
module.exports = (req, res) => {
  res.json({ 
    message: 'Vercel serverless function is working!',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};

