// Script to download images from CSV links and upload products with local images
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      })
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// Function to download image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    if (!url || !url.startsWith('http')) {
      console.log(`⚠️  Skipping invalid URL: ${url}`);
      resolve(null);
      return;
    }

    const filepath = path.join(uploadsDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Image already exists: ${filename}`);
      resolve(`/uploads/${filename}`);
      return;
    }

    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        return downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        console.log(`⚠️  Failed to download ${url}: Status ${response.statusCode}`);
        resolve(null);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve(`/uploads/${filename}`);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      console.log(`⚠️  Error downloading ${url}:`, err.message);
      resolve(null);
    });
  });
}

// Function to map category
function mapCategory(csvCategory) {
  if (!csvCategory) return 'other';
  
  const categoryLower = csvCategory.toLowerCase();
  
  if (categoryLower.includes('textile') || categoryLower.includes('fabric') || categoryLower.includes('embroidery') || categoryLower.includes('handwoven')) {
    return 'textile';
  } else if (categoryLower.includes('bag') || categoryLower.includes('basketry') || categoryLower.includes('basket')) {
    return 'bag';
  } else if (categoryLower.includes('wood') || categoryLower.includes('carving') || categoryLower.includes('lute') || categoryLower.includes('instrument')) {
    return 'wood';
  } else if (categoryLower.includes('bead') || categoryLower.includes('jewelry') || categoryLower.includes('accessories')) {
    return 'beads';
  } else {
    return 'other';
  }
}

// Function to sanitize filename
function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 100);
}

// Read and parse CSV
async function processProducts() {
  const csvPath = path.join(__dirname, 'sarawak_handicrafts.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log('📋 Total lines:', lines.length);
  
  const products = [];
  
  // Parse CSV
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 4) {
      const name = values[0] || '';
      const description = values[1] || '';
      const price = parseFloat(values[2]) || 0;
      const category = values[3] || 'other';
      const imageLink = values[4] || '';
      
      if (name && price > 0) {
        products.push({
          name,
          description,
          price,
          category: mapCategory(category),
          imageLink
        });
      }
    }
  }
  
  console.log(`📦 Found ${products.length} products to process\n`);
  
  // Download images and prepare products
  const productsWithImages = [];
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n📥 Processing ${i + 1}/${products.length}: ${product.name}`);
    
    let imagePath = 'hornbill.jpg';
    
    if (product.imageLink && product.imageLink.trim()) {
      // Generate filename from product name
      const filename = `${sanitizeFilename(product.name)}.jpg`;
      const downloadedPath = await downloadImage(product.imageLink, filename);
      
      if (downloadedPath) {
        imagePath = downloadedPath;
      } else {
        console.log(`⚠️  Using placeholder for ${product.name}`);
      }
    }
    
    productsWithImages.push({
      ...product,
      image: imagePath
    });
  }
  
  // Upload to Firestore
  console.log(`\n📤 Uploading ${productsWithImages.length} products to database...`);
  
  try {
    const batch = db.batch();
    let count = 0;
    
    for (const product of productsWithImages) {
      const productRef = db.collection('products').doc();
      batch.set(productRef, {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: 10,
        sellerId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
    }
    
    await batch.commit();
    console.log(`\n🎉 Successfully uploaded ${count} products to database!`);
    console.log('📊 Products are now visible in the shop.');
    console.log('🖼️  Images saved to uploads/ folder');
  } catch (error) {
    console.error('❌ Error uploading products:', error);
    throw error;
  }
}

// Run
processProducts()
  .then(() => {
    console.log('\n✅ Process complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Process failed:', error);
    process.exit(1);
  });

