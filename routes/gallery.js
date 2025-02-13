const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const authenticate = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Tüm görselleri getir
router.get('/', async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Görsel silme (sadece admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ 
        success: false, 
        message: 'Image not found' 
      });
    }

    // Dosyayı fiziksel olarak sil
    const filePath = path.join(__dirname, '..', image.filePath);
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.error('File delete error:', unlinkError);
      // Dosya zaten silinmiş olabilir, devam et
    }

    // Veritabanından sil
    await Image.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;