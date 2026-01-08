// Script to upload products from CSV to Firebase
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
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

// Function to map category from CSV to our categories
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
  } else if (categoryLower.includes('mat') || categoryLower.includes('decor') || categoryLower.includes('home') || categoryLower.includes('headwear') || categoryLower.includes('hat')) {
    return 'other';
  } else {
    return 'other';
  }
}

// Read and parse CSV
async function uploadProductsFromCSV() {
  const csvPath = path.join(__dirname, 'sarawak_handicrafts.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    process.exit(1);
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  console.log('📋 CSV Headers:', headers);
  console.log('📋 Total lines:', lines.length);
  
  const products = [];
  
  // Parse CSV (simple parser, handles quoted fields)
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
    values.push(current.trim()); // Last value
    
    if (values.length >= 4) {
      const name = values[0] || '';
      const description = values[1] || '';
      const price = parseFloat(values[2]) || 0;
      const category = values[3] || 'other';
      const imageLink = values[4] || '';
      
      if (name && price > 0) {
        products.push({
          name: name,
          description: description,
          price: price,
          category: mapCategory(category),
          image: imageLink || 'placeholder.jpg',
          stock: 10, // Default stock
          sellerId: null, // Platform products
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  }
  
  console.log(`📦 Found ${products.length} valid products to upload`);
  
  if (products.length === 0) {
    console.log('❌ No valid products found in CSV');
    return;
  }
  
  try {
    // Upload products in batches (Firestore limit: 500 per batch)
    const batchSize = 500;
    let uploaded = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = db.batch();
      const batchProducts = products.slice(i, i + batchSize);
      
      for (const product of batchProducts) {
        const productRef = db.collection('products').doc();
        batch.set(productRef, product);
      }
      
      await batch.commit();
      uploaded += batchProducts.length;
      console.log(`✅ Uploaded batch: ${uploaded}/${products.length} products`);
    }
    
    console.log(`\n🎉 Successfully uploaded ${uploaded} products to database!`);
    console.log('📊 Products are now visible in the shop.');
  } catch (error) {
    console.error('❌ Error uploading products:', error);
    throw error;
  }
}

// Run upload
uploadProductsFromCSV()
  .then(() => {
    console.log('✅ Upload complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  });

