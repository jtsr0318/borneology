// Script to update product images in database based on uploaded files
// Run this after uploading images using upload-product-images.html
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
const uploadsDir = path.join(__dirname, 'uploads');

// Function to sanitize product name for matching
function sanitizeForMatch(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get all uploaded images
function getUploadedImages() {
  if (!fs.existsSync(uploadsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(uploadsDir);
  const images = files
    .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
    .map(file => ({
      filename: file,
      sanitizedName: file.replace(/\.[^/.]+$/, '').toLowerCase()
    }));
  
  return images;
}

// Match products with images
async function updateProductImages() {
  try {
    console.log('📦 Fetching products from database...');
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Found ${products.length} products`);
    
    console.log('\n🖼️  Scanning uploaded images...');
    const uploadedImages = getUploadedImages();
    console.log(`📸 Found ${uploadedImages.length} images in uploads/ folder`);
    
    if (uploadedImages.length === 0) {
      console.log('\n⚠️  No images found in uploads/ folder.');
      console.log('   Please upload images first using upload-product-images.html');
      process.exit(0);
    }
    
    console.log('\n🔄 Matching products with images...\n');
    
    const batch = db.batch();
    let updated = 0;
    let notFound = [];
    
    for (const product of products) {
      const productNameSanitized = sanitizeForMatch(product.name);
      
      // Try to find matching image
      const matchingImage = uploadedImages.find(img => {
        const imgName = img.sanitizedName;
        // Check if product name matches image name (or vice versa)
        return imgName.includes(productNameSanitized) || 
               productNameSanitized.includes(imgName) ||
               imgName === productNameSanitized;
      });
      
      if (matchingImage) {
        const imagePath = `/uploads/${matchingImage.filename}`;
        const productRef = db.collection('products').doc(product.id);
        batch.update(productRef, { image: imagePath });
        console.log(`✅ ${product.name} → ${matchingImage.filename}`);
        updated++;
      } else {
        console.log(`⚠️  ${product.name} → No matching image found`);
        notFound.push(product.name);
      }
    }
    
    if (updated > 0) {
      await batch.commit();
      console.log(`\n🎉 Successfully updated ${updated} products!`);
    } else {
      console.log('\n⚠️  No products were updated.');
    }
    
    if (notFound.length > 0) {
      console.log(`\n📝 Products without matching images (${notFound.length}):`);
      notFound.forEach(name => console.log(`   - ${name}`));
      console.log('\n💡 Tip: Make sure image filenames match product names');
    }
    
    console.log('\n✅ Update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
}

// Run
updateProductImages();

