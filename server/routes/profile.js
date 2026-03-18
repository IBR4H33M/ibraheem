const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ibraheem-profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'fill' }],
  },
});
const upload = multer({ storage });

let profileData = {
  imageUrl: null,
  publicId: null,
};

router.get('/', async (req, res) => {
  res.json(profileData);
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (profileData.publicId) {
      await cloudinary.uploader.destroy(profileData.publicId);
    }
    profileData = {
      imageUrl: req.file.path,
      publicId: req.file.filename,
    };
    res.json(profileData);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
