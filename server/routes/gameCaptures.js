const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const GameCapture = require('../models/GameCapture');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ibraheem-game-captures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 1080, crop: 'fill' }],
  },
});
const upload = multer({ storage });

// GET — public
router.get('/', async (req, res) => {
  try {
    const captures = await GameCapture.find().sort({ order: 1, createdAt: 1 });
    res.json(captures);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST — admin, add capture
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const count = await GameCapture.countDocuments();
    const capture = await GameCapture.create({
      gameName: req.body.gameName,
      image: req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : { url: null, publicId: null },
      order: count,
    });
    res.status(201).json(capture);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE — admin, remove capture + destroy Cloudinary image
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const capture = await GameCapture.findById(req.params.id);
    if (!capture) return res.status(404).json({ message: 'Not found' });
    if (capture.image?.publicId) {
      await cloudinary.uploader.destroy(capture.image.publicId);
    }
    await capture.deleteOne();
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
