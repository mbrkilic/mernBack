const express = require('express');
const router = express.Router();
const multer = require('multer');
const Image = require('../models/Image'); // Image modeli
const fs = require('fs').promises; // fs.promises kullan
const path = require('path');

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Dosyaların kaydedileceği klasör
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Dosya adını benzersiz yap
  },
});

const upload = multer({ storage });

// Dosya yükleme endpoint'i
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { filename } = req.file; // Yüklenen dosya bilgileri
    const newImage = new Image({
      filename,
      path: `uploads/${filename}`, // Dosya yolu
      uploadedBy: req.user?.username || 'anonymous', // Kullanıcı bilgisi (JWT yoksa varsayılan)
    });

    await newImage.save(); // MongoDB'ye kaydet
    res.json({ msg: 'Image uploaded successfully', image: newImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Tüm görselleri getiren endpoint
router.get('/', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Görsel silme endpoint'i
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Silinecek ID:", id); // Debugging için log ekledik

    const image = await Image.findById(id);
    if (!image) {
      console.log("Hata: Görsel bulunamadı.");
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Dosyayı sistemden sil
    await fs.unlink(path.join(__dirname, '..', image.path));

    // Veritabanından kaydı kaldır
    await Image.findByIdAndDelete(id);

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    console.error("Hata:", err);
    res.status(500).json({ msg: 'Server error' });
  }
});





module.exports = router;
