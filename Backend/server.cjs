const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;
const mongoose = require('mongoose');

// Middleware
app.use(cors());
app.use(express.json());

// Create media/uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'media', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'));
    }
  }
});

// Serve uploaded files
app.use('/media', express.static(path.join(process.cwd(), 'media')));

// MongoDB connection string
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('✅ Mongoose connected successfully to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Mongoose connection error:', error);
  });

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose is connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
});

const user = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
});

const User = mongoose.model('User', user);

// Property Schema for Real Estate
const propertySchema = new mongoose.Schema({
    location: String,
    sq_ft: Number,
    age: Number,
    furnishing: String,
    amenities_count: Number,
    bedrooms: Number,
    bathrooms: Number,
    predicted_price: Number,
    actual_price: Number,
    createdAt: { type: Date, default: Date.now }
});

const Property = mongoose.model('Property', propertySchema);

// Seller Schema with all prediction fields
const sellerSchema = new mongoose.Schema({
    sellerName: String,
    phoneNumber: String,
    email: String,
    landAddress: String,
    city: String,
    state: String,
    pincode: String,
    landAge: Number,
    landArea: Number, // sq_ft
    propertyType: String,
    price: Number,
    description: String,
    // Prediction fields
    location: String, // For ML prediction
    sq_ft: Number,
    age: Number,
    furnishing: String,
    amenities_count: Number,
    bedrooms: Number,
    bathrooms: Number,
    // File uploads
    images: [String], // Array of image file paths
    documents: [String], // Array of PDF/document file paths
    createdAt: { type: Date, default: Date.now }
});

const Seller = mongoose.model('Seller', sellerSchema);

// Buyer Schema
const buyerSchema = new mongoose.Schema({
    mobileNumber: String,
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Buyer = mongoose.model('Buyer', buyerSchema);
const isDbConnected = () => mongoose.connection.readyState === 1;

// Temporary in-memory fallback so app flows still work when DB is offline.
const buyerOtpStore = new Map();

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/save-user', (req, res) => {
    const { name, email, age } = req.body;

    const user = new User({ name, email, age });
    user.save()
        .then(() => res.status(200).json({ status: 200, message: 'User saved successfully' }))
        .catch((err) => {
            console.error('Error saving user:', err);
            res.status(500).json({ status: 500, message: 'Error saving user' });
        });
});

// Real Estate Property Endpoints
app.post('/predict-price', async (req, res) => {
    try {
        const { location, sq_ft, age, furnishing, amenities_count, bedrooms, bathrooms } = req.body;

        // Call ML service for prediction
        const mlResponse = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                location,
                sq_ft,
                age,
                furnishing,
                amenities_count,
                bedrooms,
                bathrooms
            })
        });

        if (!mlResponse.ok) {
            const error = await mlResponse.json();
            return res.status(mlResponse.status).json(error);
        }

        const prediction = await mlResponse.json();

        // Save prediction only if DB is connected; do not block core prediction flow.
        let propertyId = null;
        let warning = null;

        if (mongoose.connection.readyState === 1) {
            try {
                const property = new Property({
                    location,
                    sq_ft,
                    age,
                    furnishing,
                    amenities_count,
                    bedrooms,
                    bathrooms,
                    predicted_price: prediction.predicted_price
                });
                await property.save();
                propertyId = property._id;
            } catch (dbError) {
                console.error('Prediction generated but failed to save property:', dbError);
                warning = 'Prediction generated, but failed to save to database';
            }
        } else {
            warning = 'Prediction generated, but database is offline';
        }

        res.status(200).json({
            status: 200,
            ...prediction,
            property_id: propertyId,
            warning
        });
    } catch (error) {
        console.error('Error predicting price:', error);
        res.status(500).json({
            status: 500,
            error: 'Error predicting price',
            message: error.message
        });
    }
});

app.get('/properties', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ status: 200, properties });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ status: 500, error: 'Error fetching properties' });
    }
});

app.get('/ml-service/health', async (req, res) => {
    try {
        const response = await fetch('http://localhost:5001/health');
        
        if (!response.ok) {
            throw new Error(`ML service returned status ${response.status}`);
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('ML service health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'ML service not available',
            error: error.message,
            model_loaded: false
        });
    }
});

// Seller Endpoints
app.post('/api/seller/register', upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 5 }
]), async (req, res) => {
    try {
        const sellerData = req.body;
        
        // Add file paths to seller data
        if (req.files) {
            if (req.files.images) {
                sellerData.images = req.files.images.map(file => `/media/uploads/${file.filename}`);
            }
            if (req.files.documents) {
                sellerData.documents = req.files.documents.map(file => `/media/uploads/${file.filename}`);
            }
        }
        
        // Map landArea to sq_ft for prediction
        if (sellerData.landArea) {
            sellerData.sq_ft = sellerData.landArea;
        }
        if (sellerData.landAge) {
            sellerData.age = sellerData.landAge;
        }
        
        const seller = new Seller(sellerData);
        await seller.save();
        res.status(200).json({ 
            status: 200, 
            message: 'Property listed successfully',
            sellerId: seller._id 
        });
    } catch (error) {
        console.error('Error saving seller:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error listing property',
            error: error.message 
        });
    }
});

// Get seller's own listings by phone number
app.get('/api/seller/my-listings/:phoneNumber', async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const listings = await Seller.find({ phoneNumber }).sort({ createdAt: -1 });
        res.status(200).json({ status: 200, listings });
    } catch (error) {
        console.error('Error fetching seller listings:', error);
        res.status(500).json({ status: 500, error: 'Error fetching listings' });
    }
});

// Get single listing by ID
app.get('/api/seller/listing/:id', async (req, res) => {
    try {
        const listing = await Seller.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ status: 404, message: 'Listing not found' });
        }
        res.status(200).json({ status: 200, listing });
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ status: 500, error: 'Error fetching listing' });
    }
});

app.get('/api/seller/properties', async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(200).json({
                status: 200,
                properties: [],
                warning: 'Database offline. No saved properties available.'
            });
        }

        const properties = await Seller.find().sort({ createdAt: -1 });
        res.status(200).json({ status: 200, properties });
    } catch (error) {
        console.error('Error fetching seller properties:', error);
        res.status(500).json({ status: 500, error: 'Error fetching properties' });
    }
});

// Get property details for buyer
app.get('/api/buyer/property/:id', async (req, res) => {
    try {
        const property = await Seller.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ status: 404, message: 'Property not found' });
        }
        res.status(200).json({ status: 200, property });
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ status: 500, error: 'Error fetching property' });
    }
});

// Buyer Endpoints
app.post('/api/buyer/login', async (req, res) => {
    try {
        const { mobileNumber } = req.body;
        const otp = '123456';
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        if (isDbConnected()) {
            // Find or create buyer
            let buyer = await Buyer.findOne({ mobileNumber });
            if (buyer) {
                buyer.otp = otp;
                buyer.otpExpiry = otpExpiry;
                buyer.isVerified = false;
                await buyer.save();
            } else {
                buyer = new Buyer({
                    mobileNumber,
                    otp,
                    otpExpiry,
                    isVerified: false
                });
                await buyer.save();
            }
        } else {
            buyerOtpStore.set(mobileNumber, {
                mobileNumber,
                otp,
                otpExpiry,
                isVerified: false
            });
        }
        
        // In production, send OTP via SMS
        console.log(`OTP for ${mobileNumber}: ${otp}`);
        
        res.status(200).json({ 
            status: 200, 
            message: 'OTP sent successfully',
            // For demo purposes, include OTP in response
            otp: otp 
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error sending OTP',
            error: error.message 
        });
    }
});

app.post('/api/buyer/verify-otp', async (req, res) => {
    try {
        const { mobileNumber, otp } = req.body;
        let buyer;

        if (isDbConnected()) {
            buyer = await Buyer.findOne({ mobileNumber });
        } else {
            buyer = buyerOtpStore.get(mobileNumber);
        }
        
        if (!buyer) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Mobile number not found' 
            });
        }
        
        if (buyer.otp !== otp) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Invalid OTP' 
            });
        }
        
        if (new Date() > buyer.otpExpiry) {
            return res.status(400).json({ 
                status: 400, 
                message: 'OTP expired' 
            });
        }
        
        if (isDbConnected()) {
            buyer.isVerified = true;
            buyer.otp = null;
            await buyer.save();
        } else {
            buyerOtpStore.set(mobileNumber, {
                ...buyer,
                isVerified: true,
                otp: null
            });
        }
        
        res.status(200).json({ 
            status: 200, 
            message: 'OTP verified successfully',
            user: {
                mobileNumber: buyer.mobileNumber,
                isVerified: true
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error verifying OTP',
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});