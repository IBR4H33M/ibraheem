const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const adminAuth = require('../middleware/adminAuth');
const Profile = require('../models/Profile');

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

router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne({ key: 'main' });
    res.json({
      imageUrl: profile?.image?.url || null,
      publicId: profile?.image?.publicId || null,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    let profile = await Profile.findOne({ key: 'main' });
    if (!profile) {
      profile = await Profile.create({ key: 'main' });
    }

    if (profile.image?.publicId) {
      await cloudinary.uploader.destroy(profile.image.publicId);
    }

    profile.image = {
      url: req.file ? req.file.path : null,
      publicId: req.file ? req.file.filename : null,
    };
    await profile.save();

    res.json({
      imageUrl: profile.image.url,
      publicId: profile.image.publicId,
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
