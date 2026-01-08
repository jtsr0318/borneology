const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// For Vercel, use process.cwd() instead of __dirname
const baseDir = process.env.VERCEL ? process.cwd() : __dirname;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(baseDir, 'uploads');
if (fs.existsSync && !fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create uploads directory:', err.message);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and PDF files for seller documents
    const allowedExts = /jpeg|jpg|png|gif|webp|pdf/;
    const allowedMimes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimes.test(file.mimetype) || file.mimetype === 'application/pdf';
    
    if (extname && (mimetype || file.mimetype === 'application/pdf')) {
      return cb(null, true);
    } else {
      cb(new Error(`File type not allowed! Only images (JPEG, PNG, GIF) and PDF files are allowed. You uploaded: ${file.mimetype}`));
    }
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images) - MUST be before routes
// In Vercel, use baseDir (process.cwd() or __dirname)
console.log('Setting up static file serving from:', baseDir);
console.log('process.cwd():', process.cwd());
console.log('__dirname:', __dirname);
console.log('VERCEL env:', process.env.VERCEL);

// For Vercel, try multiple paths
const staticPaths = process.env.VERCEL ? [
  process.cwd(),
  path.join(process.cwd(), '..'),
  __dirname
] : [baseDir];

staticPaths.forEach((staticPath, index) => {
  console.log(`Setting up static path ${index + 1}:`, staticPath);
  app.use(express.static(staticPath, {
    index: false,
    dotfiles: 'ignore',
    etag: true,
    lastModified: true,
    maxAge: '1d',
    setHeaders: (res, filePath) => {
      // Set correct MIME types to prevent text/html errors
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.js') {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (ext === '.css') {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
    }
  }));
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir, {
  etag: true,
  lastModified: true,
  maxAge: '7d'
}));

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
    console.log('⚠️  Firebase not configured. Using mock data mode.');
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

// ========== USER AUTHENTICATION ==========

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'buyer' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (db) {
      // Check if user exists
      const userRef = db.collection('users').where('email', '==', email);
      const snapshot = await userRef.get();
      
      if (!snapshot.empty) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user (in production, hash password with bcrypt)
      const userData = {
        email,
        password, // In production, hash this!
        name,
        role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        avatar: null
      };

      const docRef = await db.collection('users').add(userData);
      res.json({ success: true, userId: docRef.id, message: 'User registered successfully' });
    } else {
      // Mock response for development
      res.json({ success: true, userId: 'mock-user-123', message: 'User registered (mock mode)' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (db) {
      const userRef = db.collection('users').where('email', '==', email);
      const snapshot = await userRef.get();
      
      if (snapshot.empty) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      // In production, compare hashed password
      if (userData.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({
        success: true,
        userId: userDoc.id,
        user: {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role || 'buyer', // Ensure role is always set
          avatar: userData.avatar || null, // Ensure null if not set
          sellerVerificationStatus: userData.sellerVerificationStatus || 'not_applied',
          isVerifiedSeller: userData.isVerifiedSeller || false
        }
      });
    } else {
      // Mock response
      res.json({
        success: true,
        userId: 'mock-user-123',
        user: { id: 'mock-user-123', email, name: 'Test User', role: 'buyer' }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ========== USER PROFILE ==========

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const doc = await db.collection('users').doc(userId).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = doc.data();
      // Don't send password
      delete userData.password;
      res.json({ id: doc.id, ...userData });
    } else {
      res.json({ id: userId, name: 'Test User', email: 'test@example.com', role: 'buyer' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, language, currency, shippingAddress } = req.body;
    
    if (db) {
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (language) updateData.language = language;
      if (currency) updateData.currency = currency;
      if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      await db.collection('users').doc(userId).update(updateData);
      res.json({ success: true, message: 'Profile updated' });
    } else {
      res.json({ success: true, message: 'Profile updated (mock)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
app.post('/api/users/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    if (db) {
      await db.collection('users').doc(userId).update({
        avatar: avatarUrl,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, avatar: avatarUrl });
    } else {
      res.json({ success: true, avatar: avatarUrl });
    }
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// ========== PRODUCTS ==========

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('products').get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(products);
    } else {
      // Mock products
      res.json([
        { id: 'text001', name: 'Pua Kumbu Textile', price: 175, image: 'pua-kumbu.jpg', category: 'textile' },
        { id: 'bag001', name: 'Rattan Handwoven Bag', price: 85, image: 'rattan-bag.jpg', category: 'bag' },
        { id: 'wood001', name: 'Borneo Wood Carving', price: 120, image: 'wood-carving.jpg', category: 'wood' },
        { id: 'bead001', name: 'Beaded Necklace', price: 35, image: 'beaded-necklace.jpg', category: 'beads' }
      ]);
    }
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (db) {
      const doc = await db.collection('products').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ id: doc.id, ...doc.data() });
    } else {
      res.json({ id, name: 'Product', price: 100, image: 'product.jpg' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (verified seller/admin only)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, stock, sellerId } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    if (db) {
      // Verify seller is verified (unless admin)
      if (sellerId) {
        const userDoc = await db.collection('users').doc(sellerId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.role !== 'admin' && (!userData.isVerifiedSeller || userData.role !== 'seller')) {
            return res.status(403).json({ error: 'Only verified sellers can create products' });
          }
        }
      }

      const productData = {
        name,
        price: parseFloat(price),
        category,
        description: description || '',
        stock: stock ? parseInt(stock) : 0,
        sellerId: sellerId || null,
        image: req.file ? `/uploads/${req.file.filename}` : req.body.image || 'hornbill.jpg',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('products').add(productData);
      res.json({ success: true, productId: docRef.id, message: 'Product created' });
    } else {
      res.json({ success: true, productId: 'mock-product-123', message: 'Product created (mock)' });
    }
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (seller/admin only)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, stock } = req.body;
    
    if (db) {
      const updateData = {};
      if (name) updateData.name = name;
      if (price) updateData.price = parseFloat(price);
      if (category) updateData.category = category;
      if (description !== undefined) updateData.description = description;
      if (stock !== undefined) updateData.stock = parseInt(stock);
      if (req.file) updateData.image = `/uploads/${req.file.filename}`;
      updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      await db.collection('products').doc(id).update(updateData);
      res.json({ success: true, message: 'Product updated' });
    } else {
      res.json({ success: true, message: 'Product updated (mock)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (seller/admin only)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (db) {
      await db.collection('products').doc(id).delete();
      res.json({ success: true, message: 'Product deleted' });
    } else {
      res.json({ success: true, message: 'Product deleted (mock)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ========== CART ==========

// Get user's cart
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const snapshot = await db.collection('cart').where('userId', '==', userId).get();
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(items);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    if (db) {
      // Check if item already in cart
      const existing = await db.collection('cart')
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .get();

      if (!existing.empty) {
        // Update quantity
        const doc = existing.docs[0];
        const currentQty = doc.data().quantity || 1;
        await doc.ref.update({ quantity: currentQty + quantity });
        res.json({ success: true, message: 'Cart updated' });
      } else {
        // Get product details
        const productDoc = await db.collection('products').doc(productId).get();
        if (!productDoc.exists) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const product = productDoc.data();
        
        // Add to cart
        await db.collection('cart').add({
          userId,
          productId,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image,
          quantity,
          addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: 'Item added to cart' });
      }
    } else {
      res.json({ success: true, message: 'Item added to cart (mock)' });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
app.put('/api/cart/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (db) {
      await db.collection('cart').doc(itemId).update({ quantity });
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
app.delete('/api/cart/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    if (db) {
      await db.collection('cart').doc(itemId).delete();
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// ========== WISHLIST ==========

// Get user's wishlist
app.get('/api/wishlist/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const snapshot = await db.collection('wishlist').where('userId', '==', userId).get();
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(items);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ error: 'userId and productId are required' });
    }

    if (db) {
      // Check if already in wishlist
      const existing = await db.collection('wishlist')
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .get();

      if (!existing.empty) {
        return res.status(400).json({ error: 'Item already in wishlist' });
      }

      // Get product details
      const productDoc = await db.collection('products').doc(productId).get();
      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const product = productDoc.data();
      
      await db.collection('wishlist').add({
        userId,
        productId,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
        addedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, message: 'Item added to wishlist' });
    } else {
      res.json({ success: true, message: 'Item added to wishlist (mock)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
app.delete('/api/wishlist/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    if (db) {
      await db.collection('wishlist').doc(itemId).delete();
      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// ========== ORDERS ==========

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, total, shippingAddress } = req.body;
    
    if (!userId || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (db) {
      const orderId = 'BOR-' + Math.floor(1000 + Math.random() * 9000);
      
      const orderData = {
        orderId,
        userId,
        items,
        total,
        shippingAddress,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('orders').add(orderData);
      
      // Clear user's cart
      const cartSnapshot = await db.collection('cart').where('userId', '==', userId).get();
      const batch = db.batch();
      cartSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      res.json({ success: true, orderId, orderRef: docRef.id });
    } else {
      const orderId = 'BOR-' + Math.floor(1000 + Math.random() * 9000);
      res.json({ success: true, orderId, message: 'Order created (mock)' });
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const snapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (db) {
      const snapshot = await db.collection('orders').where('orderId', '==', orderId).get();
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const order = snapshot.docs[0];
      res.json({ id: order.id, ...order.data() });
    } else {
      // Mock tracking data
      const mockData = {
        "BOR-1024": { status: "delivered", statusText: "Delivered" },
        "BOR-2042": { status: "shipped", statusText: "In Transit" },
        "BOR-3105": { status: "processing", statusText: "Processing" }
      };
      const data = mockData[orderId] || { status: "pending", statusText: "Pending" };
      res.json({ orderId, ...data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (seller/admin only)
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (db) {
      // Find order by orderId field
      const snapshot = await db.collection('orders').where('orderId', '==', orderId).get();
      if (snapshot.empty) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderDoc = snapshot.docs[0];
      await orderDoc.ref.update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, message: 'Order status updated' });
    } else {
      res.json({ success: true, message: 'Order status updated (mock)' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ========== SELLER VERIFICATION ==========

// Apply to become a seller
app.post('/api/seller/apply', upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'identityDocument', maxCount: 1 },
  { name: 'taxDocument', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 },
  { name: 'additionalDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📋 Seller application received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const { userId } = req.body;
    
    if (!userId) {
      console.error('❌ User ID missing');
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if files are uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      console.error('❌ No files uploaded');
      return res.status(400).json({ error: 'Please upload all required documents' });
    }

    // Validate required files
    const requiredFiles = ['businessLicense', 'identityDocument', 'taxDocument', 'portfolio'];
    const missingFiles = requiredFiles.filter(fileName => !req.files[fileName]);
    
    if (missingFiles.length > 0) {
      console.error('❌ Missing required files:', missingFiles);
      return res.status(400).json({ error: `Missing required documents: ${missingFiles.join(', ')}` });
    }

    if (db) {
      const documents = {};
      if (req.files.businessLicense) documents.businessLicense = `/uploads/${req.files.businessLicense[0].filename}`;
      if (req.files.identityDocument) documents.identityDocument = `/uploads/${req.files.identityDocument[0].filename}`;
      if (req.files.taxDocument) documents.taxDocument = `/uploads/${req.files.taxDocument[0].filename}`;
      if (req.files.portfolio) documents.portfolio = `/uploads/${req.files.portfolio[0].filename}`;
      if (req.files.additionalDocument) documents.additionalDocument = `/uploads/${req.files.additionalDocument[0].filename}`;

      console.log('📄 Documents to save:', Object.keys(documents));

      // Update user with seller application
      await db.collection('users').doc(userId).update({
        role: 'seller', // Set role to seller
        sellerVerificationStatus: 'pending',
        sellerApplicationDocuments: documents,
        sellerApplicationDate: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ User updated in database');

      // Create seller application record
      const applicationRef = await db.collection('sellerApplications').add({
        userId,
        status: 'pending',
        documents,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null
      });

      console.log('✅ Seller application created:', applicationRef.id);
      console.log('✅ Application submitted successfully');

      res.json({ success: true, message: 'Seller application submitted successfully' });
    } else {
      console.log('⚠️  No database connection - using mock response');
      res.json({ success: true, message: 'Seller application submitted (mock)' });
    }
  } catch (error) {
    console.error('❌ Seller application error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle multer errors specifically
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum size is 5MB per file.' });
      } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: `Unexpected file field: ${error.field}` });
      } else {
        return res.status(400).json({ error: `File upload error: ${error.message}` });
      }
    }
    
    // Handle other errors
    if (error.message && error.message.includes('File type not allowed')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message || 'Failed to submit seller application. Please try again.' });
  }
});

// Get seller application status
app.get('/api/seller/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = userDoc.data();
      res.json({
        status: userData.sellerVerificationStatus || 'not_applied',
        isVerifiedSeller: userData.isVerifiedSeller || false,
        applicationDate: userData.sellerApplicationDate
      });
    } else {
      res.json({ status: 'not_applied', isVerifiedSeller: false });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch seller status' });
  }
});

// ========== ADMIN FUNCTIONS ==========

// Get all seller applications (admin only) - returns all statuses, filters pending by default
app.get('/api/admin/seller-applications', async (req, res) => {
  try {
    const { status } = req.query; // Optional filter: ?status=pending
    if (db) {
      let query = db.collection('sellerApplications');
      
      if (status && status !== 'all') {
        query = query.where('status', '==', status);
      }
      // If no status filter, show all applications (not just pending)
      // This allows admin to see all: pending, approved, rejected
      
      // Get all applications (don't use orderBy with where clause to avoid index requirement)
      const snapshot = await query.get();
      
      console.log(`📋 Found ${snapshot.docs.length} seller applications in database`);
      
      const applications = await Promise.all(snapshot.docs.map(async (doc) => {
        const appData = doc.data();
        const userDoc = await db.collection('users').doc(appData.userId).get();
        if (!userDoc.exists) {
          return null;
        }
        const userData = userDoc.data();
        
        // Convert Firestore Timestamp to Date if needed
        let submittedAt = appData.submittedAt;
        if (submittedAt && submittedAt.toDate) {
          submittedAt = submittedAt.toDate();
        }
        let reviewedAt = appData.reviewedAt || null;
        if (reviewedAt && reviewedAt.toDate) {
          reviewedAt = reviewedAt.toDate();
        }
        
        return {
          id: doc.id,
          userId: appData.userId,
          userName: userData.name || 'Unknown User',
          userEmail: userData.email || 'No email',
          documents: appData.documents || {},
          submittedAt: submittedAt,
          reviewedAt: reviewedAt,
          reviewedBy: appData.reviewedBy || null,
          status: appData.status || 'pending'
        };
      }));
      
      // Filter out null values (users that might have been deleted)
      const validApps = applications.filter(app => app !== null);
      
      // Sort by submittedAt (newest first) if available
      validApps.sort((a, b) => {
        if (!a.submittedAt || !b.submittedAt) return 0;
        const dateA = a.submittedAt instanceof Date ? a.submittedAt : new Date(a.submittedAt);
        const dateB = b.submittedAt instanceof Date ? b.submittedAt : new Date(b.submittedAt);
        return dateB - dateA;
      });
      
      console.log(`📋 Returning ${validApps.length} seller applications`);
      res.json(validApps);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Approve or reject seller application (admin only)
app.post('/api/admin/seller-applications/:applicationId/review', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, adminUserId } = req.body; // action: 'approve' or 'reject'
    
    if (!action || !adminUserId) {
      return res.status(400).json({ error: 'Action and admin user ID are required' });
    }

    if (db) {
      const appDoc = await db.collection('sellerApplications').doc(applicationId).get();
      if (!appDoc.exists) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const appData = appDoc.data();
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Update application
      await db.collection('sellerApplications').doc(applicationId).update({
        status: newStatus,
        reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
        reviewedBy: adminUserId
      });

      // Update user
      const updateData = {
        sellerVerificationStatus: newStatus,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (action === 'approve') {
        updateData.role = 'seller';
        updateData.isVerifiedSeller = true;
        updateData.sellerVerifiedAt = admin.firestore.FieldValue.serverTimestamp();
      }

      await db.collection('users').doc(appData.userId).update(updateData);

      res.json({ success: true, message: `Application ${newStatus} successfully` });
    } else {
      res.json({ success: true, message: `Application ${action}d (mock)` });
    }
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({ error: 'Failed to review application' });
  }
});

// Create admin account (one-time setup)
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (db) {
      // Check if admin already exists
      const adminCheck = await db.collection('users').where('role', '==', 'admin').get();
      if (!adminCheck.empty) {
        return res.status(400).json({ error: 'Admin account already exists' });
      }

      // Check if user exists
      const userCheck = await db.collection('users').where('email', '==', email).get();
      if (!userCheck.empty) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Create admin account
      const adminData = {
        email,
        password, // In production, hash this!
        name,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        avatar: null,
        isVerifiedSeller: true // Admin can do everything
      };

      const docRef = await db.collection('users').add(adminData);
      res.json({ success: true, userId: docRef.id, message: 'Admin account created successfully' });
    } else {
      res.json({ success: true, userId: 'mock-admin-123', message: 'Admin created (mock)' });
    }
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('users').get();
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        password: undefined // Don't send password
      }));
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all orders (admin only)
app.get('/api/admin/orders', async (req, res) => {
  try {
    if (db) {
      const snapshot = await db.collection('orders')
        .orderBy('createdAt', 'desc')
        .get();
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (db) {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const userData = userDoc.data();
      if (userData.role === 'admin') {
        return res.status(403).json({ error: 'Cannot delete admin account' });
      }
      await db.collection('users').doc(userId).delete();
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.json({ success: true, message: 'User deleted (mock)' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Social login - handle OAuth callback
app.post('/api/auth/social', async (req, res) => {
  try {
    const { provider, idToken, accessToken, email, name, photoURL } = req.body;
    
    if (!provider || !email || !name) {
      return res.status(400).json({ error: 'Provider, email, and name are required' });
    }

    if (db) {
      // Check if user exists by email
      const userQuery = await db.collection('users').where('email', '==', email).get();
      
      let userId;
      if (!userQuery.empty) {
        // User exists, update login info
        const userDoc = userQuery.docs[0];
        userId = userDoc.id;
        await userDoc.ref.update({
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          avatar: photoURL || userDoc.data().avatar
        });
      } else {
        // Create new user
        const userData = {
          email,
          name,
          role: 'buyer',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          avatar: photoURL || null,
          socialProvider: provider,
          socialId: idToken ? idToken.split('.')[0] : null
        };
        const docRef = await db.collection('users').add(userData);
        userId = docRef.id;
      }

      const userDoc = await db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      res.json({
        success: true,
        userId,
        user: {
          id: userId,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar || null,
          isVerifiedSeller: userData.isVerifiedSeller || false
        }
      });
    } else {
      res.json({
        success: true,
        userId: 'mock-social-user-123',
        user: { id: 'mock-social-user-123', email, name, role: 'buyer' }
      });
    }
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ error: 'Social login failed' });
  }
});

// ========== ADMIN: UPLOAD PRODUCT IMAGES ==========
// Upload multiple product images with custom names
app.post('/api/admin/upload-product-images', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const names = Array.isArray(req.body.names) ? req.body.names : [req.body.names];
    const uploaded = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const productName = names[i] || file.originalname.replace(/\.[^/.]+$/, '');
      
      // Sanitize product name for filename
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);
      
      // Get original extension
      const ext = path.extname(file.originalname) || '.jpg';
      const newFilename = `${sanitizedName}${ext}`;
      const newPath = path.join(uploadsDir, newFilename);
      
      // Rename file
      fs.renameSync(file.path, newPath);
      
      uploaded.push({
        original: file.originalname,
        renamed: newFilename,
        path: `/uploads/${newFilename}`
      });
    }

    res.json({
      success: true,
      uploaded: uploaded,
      message: `Successfully uploaded ${uploaded.length} image(s)`
    });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ error: 'Failed to upload images: ' + error.message });
  }
});

// ========== SERVE STATIC FILES ==========
// CRITICAL: Static file middleware MUST be before all routes
// Static files are already set up above, so we just need to serve HTML

// Serve HTML files - must be after API routes but static files are already handled
app.get('/', (req, res, next) => {
  // Check if this is actually a static file request that was routed here
  const url = req.url;
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt', '.map', '.webp'];
  if (staticExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return next(); // Let express.static handle it
  }
  
  try {
    // For Vercel, use process.cwd() instead of __dirname
    const baseDir = process.env.VERCEL ? process.cwd() : __dirname;
    const indexPath = path.join(baseDir, 'index.html');
    
    console.log('Serving index.html from:', indexPath);
    console.log('process.cwd():', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('VERCEL env:', process.env.VERCEL);
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        console.error('Attempted path:', indexPath);
        // Try alternative paths for Vercel
        const altPaths = [
          path.join(process.cwd(), 'index.html'),
          path.join(__dirname, 'index.html'),
          path.join(process.cwd(), '..', 'index.html')
        ];
        
        let tried = 0;
        const tryNext = () => {
          if (tried >= altPaths.length) {
            res.status(500).send(`Error loading page. Tried: ${indexPath}`);
            return;
          }
          const altPath = altPaths[tried++];
          console.log('Trying alternative path:', altPath);
          res.sendFile(altPath, (altErr) => {
            if (altErr) {
              tryNext();
            }
          });
        };
        tryNext();
      }
    });
  } catch (error) {
    console.error('Fatal error in / route:', error);
    res.status(500).send('Server error: ' + error.message);
  }
});

// Serve HTML pages - exclude static file extensions
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  
  // IMPORTANT: Skip if it's a static file (CSS, JS, images, etc.)
  // This allows express.static to handle these files
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.xml', '.txt', '.map', '.webp'];
  
  // Check if it's a static file
  const isStaticFile = staticExtensions.some(ext => page.toLowerCase().endsWith(ext));
  
  if (isStaticFile) {
    // Let express.static handle it - don't interfere
    return next();
  }
  
  // Skip API routes
  if (page.startsWith('api/') || page === 'api') {
    return next();
  }
  
  // Skip uploads
  if (page.startsWith('uploads/')) {
    return next();
  }
  
  // Serve HTML files
  const validPages = ['index.html', 'shop.html', 'wishlist.html', 'checkout.html', 
                      'profile.html', 'contact.html', 'login.html', 'track-order.html', 
                      'product-rattan-bag.html', 'product-detail.html', 'seller-dashboard.html', 'seller-application.html',
                      'admin-dashboard.html', 'upload-product-images.html', 
                      'seller-tutorial.html', 'test-firebase.html', 'test-admin-access.html'];
  
  if (validPages.includes(page) || page.endsWith('.html')) {
    // For Vercel, use process.cwd() instead of __dirname
    const baseDir = process.env.VERCEL ? process.cwd() : __dirname;
    const filePath = path.join(baseDir, page);
    
    // Try to send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error sending ${page}:`, err);
        // Try alternative path for Vercel
        if (process.env.VERCEL) {
          const altPath = path.join(process.cwd(), page);
          res.sendFile(altPath, (altErr) => {
            if (altErr) {
              console.error(`File not found: ${page}`, altErr);
              res.status(404).send('Page not found');
            }
          });
        } else {
          res.status(404).send('Page not found');
        }
      }
    });
  } else {
    // Let express.static handle other files
    next();
  }
});

// Export for Vercel serverless functions
module.exports = app;

// Only listen on port if running locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 API endpoints available at http://localhost:${PORT}/api`);
    if (!db) {
      console.log('⚠️  Running in mock mode - configure Firebase for full functionality');
    }
  });
}

