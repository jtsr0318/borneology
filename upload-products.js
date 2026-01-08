// Script to upload products from CSV to database
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
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

async function uploadProductsFromCSV() {
  const csvPath = path.join(__dirname, 'sarawak_handicrafts.csv');
  const products = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Map CSV columns to product data
        const product = {
          name: row.Name || row.name || '',
          description: row.Storytelling || row.Storytelling || row.description || '',
          price: parseFloat(row['Price (RM)'] || row.price || row['Price (RM)'] || 0),
          category: mapCategory(row.Category || row.category || 'other'),
          image: row.Image_Link || row.image || row['Image_Link'] || 'placeholder.jpg',
          stock: 10, // Default stock
          sellerId: null, // Platform products, no specific seller
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (product.name && product.price > 0) {
          products.push(product);
        }
      })
      .on('end', async () => {
        console.log(`📦 Found ${products.length} products to upload`);
        
        if (products.length === 0) {
          console.log('❌ No valid products found in CSV');
          resolve();
          return;
        }
        
        try {
          // Upload products to Firestore
          const batch = db.batch();
          let count = 0;
          
          for (const product of products) {
            const productRef = db.collection('products').doc();
            batch.set(productRef, product);
            count++;
          }
          
          await batch.commit();
          console.log(`✅ Successfully uploaded ${count} products to database!`);
          resolve();
        } catch (error) {
          console.error('❌ Error uploading products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

function mapCategory(category) {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('textile') || categoryLower.includes('fabric') || categoryLower.includes('embroidery')) {
    return 'textile';
  } else if (categoryLower.includes('bag') || categoryLower.includes('basketry') || categoryLower.includes('basket')) {
    return 'bag';
  } else if (categoryLower.includes('wood') || categoryLower.includes('carving') || categoryLower.includes('lute') || categoryLower.includes('instrument')) {
    return 'wood';
  } else if (categoryLower.includes('bead') || categoryLower.includes('jewelry') || categoryLower.includes('accessories')) {
    return 'beads';
  } else if (categoryLower.includes('mat') || categoryLower.includes('decor') || categoryLower.includes('home')) {
    return 'other';
  } else if (categoryLower.includes('headwear') || categoryLower.includes('hat')) {
    return 'other';
  } else {
    return 'other';
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

