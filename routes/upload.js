const express = require('express');
const multer = require('multer');
const path = require('path');
const Image = require('../models/Image');
const authenticate = require('../middleware/auth'); // Kimlik doğrulama middleware'i
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});



const upload = multer({ 
  storage,
 // limits: { fileSize: 5 * 4096 * 4096 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Upload rotasına kimlik doğrulama middleware'i ekleyin
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const newImage = new Image({
      filename: req.file.filename,
      filePath: req.file.path,
      uploadedBy: req.user.username
    });

    await newImage.save();

    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      image: newImage 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
});

module.exports = (app) => {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
};
module.exports = router;
