const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  filename: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  uploadedBy: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Image', ImageSchema);