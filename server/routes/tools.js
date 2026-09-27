const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Tool = require('../models/Tool');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ibraheem-tools',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 700, height: 100, crop: 'fit' }],
  },
});
const upload = multer({ storage });

// Helper: Generate slug from name
const generateSlug = (name) => {
  return `tool:${name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')}`;
};

// GET — public, get all tools
router.get('/', async (req, res) => {
  try {
    const tools = await Tool.find().sort({ category: 1, order: 1, createdAt: 1 });
    res.json(tools);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — public, get tools by category
router.get('/category/:category', async (req, res) => {
  try {
    const tools = await Tool.find({ category: req.params.category }).sort({ order: 1, createdAt: 1 });
    res.json(tools);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — public, get single tool by id
router.get('/single/:id', async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });
    res.json(tool);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST — admin, create new tool
router.post('/', adminAuth, upload.single('logo'), async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Tool name is required' });
    }

    const existingTool = await Tool.findOne({ name });
    if (existingTool) {
      return res.status(409).json({ message: 'Tool with this name already exists' });
    }

    const count = await Tool.countDocuments();
    const slug = generateSlug(name);

    const tool = await Tool.create({
      name,
      slug,
      description: description || '',
      category: category || 'Other',
      logo: req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : { url: null, publicId: null },
      order: count,
    });

    res.status(201).json(tool);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT — admin, update tool
router.put('/:id', adminAuth, upload.single('logo'), async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });

    if (typeof req.body.name === 'string' && req.body.name !== tool.name) {
      const existingTool = await Tool.findOne({ name: req.body.name });
      if (existingTool) {
        return res.status(409).json({ message: 'Tool with this name already exists' });
      }
      tool.name = req.body.name;
      tool.slug = generateSlug(req.body.name);
    }

    if (typeof req.body.description === 'string') tool.description = req.body.description;
    if (typeof req.body.category === 'string') tool.category = req.body.category;

    if (req.file) {
      if (tool.logo?.publicId) {
        await cloudinary.uploader.destroy(tool.logo.publicId);
      }
      tool.logo = { url: req.file.path, publicId: req.file.filename };
    }

    await tool.save();
    res.json(tool);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE — admin, delete tool
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const tool = await Tool.findById(req.params.id);
    if (!tool) return res.status(404).json({ message: 'Tool not found' });

    if (tool.logo?.publicId) {
      await cloudinary.uploader.destroy(tool.logo.publicId);
    }

    await tool.deleteOne();
    res.json({ message: 'Tool deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT — admin, reorder tools
router.put('/reorder/:id', adminAuth, async (req, res) => {
  try {
    const { targetId } = req.body;
    const tool1 = await Tool.findById(req.params.id);
    const tool2 = await Tool.findById(targetId);

    if (!tool1 || !tool2) {
      return res.status(404).json({ message: 'Tool not found' });
    }

    const tempOrder = tool1.order;
    tool1.order = tool2.order;
    tool2.order = tempOrder;

    await tool1.save();
    await tool2.save();

    res.json({ message: 'Tools reordered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
