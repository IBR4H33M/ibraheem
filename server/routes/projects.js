const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Project   = require('../models/Project');
const adminAuth = require('../middleware/adminAuth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'ibraheem-projects',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [{ width: 600, height: 450, crop: 'fill' }],
  },
});
const upload = multer({ storage });

// GET — public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 });
    res.json(projects);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST — admin
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const count   = await Project.countDocuments();
    const project = await Project.create({
      title:        req.body.title,
      description:  req.body.description || '', // legacy fallback
      introduction: req.body.introduction || '',
      background:   req.body.background || '',
      datasetTitle: req.body.datasetTitle || '',
      datasetUrl:   req.body.datasetUrl || '',
      techStack:    req.body.techStack || '',
      myRole:       req.body.myRole || '',
      url:          req.body.url || '',
      githubUrl:    req.body.githubUrl || '',
      customButtonText: req.body.customButtonText || '',
      customButtonUrl: req.body.customButtonUrl || '',
      image: req.file
        ? { url: req.file.path, publicId: req.file.filename }
        : { url: null, publicId: null },
      order: count,
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT — admin
router.put('/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });

    if (typeof req.body.title === 'string') project.title = req.body.title;
    if (typeof req.body.description === 'string') project.description = req.body.description;
    if (typeof req.body.introduction === 'string') project.introduction = req.body.introduction;
    if (typeof req.body.background === 'string') project.background = req.body.background;
    if (typeof req.body.datasetTitle === 'string') project.datasetTitle = req.body.datasetTitle;
    if (typeof req.body.datasetUrl === 'string') project.datasetUrl = req.body.datasetUrl;
    if (typeof req.body.techStack === 'string') project.techStack = req.body.techStack;
    if (typeof req.body.myRole === 'string') project.myRole = req.body.myRole;
    if (typeof req.body.url === 'string') project.url = req.body.url;
    if (typeof req.body.githubUrl === 'string') project.githubUrl = req.body.githubUrl;
    if (typeof req.body.customButtonText === 'string') project.customButtonText = req.body.customButtonText;
    if (typeof req.body.customButtonUrl === 'string') project.customButtonUrl = req.body.customButtonUrl;

    if (req.file) {
      if (project.image?.publicId) {
        await cloudinary.uploader.destroy(project.image.publicId);
      }
      project.image = { url: req.file.path, publicId: req.file.filename };
    }

    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE — admin
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Not found' });
    if (project.image?.publicId) {
      await cloudinary.uploader.destroy(project.image.publicId);
    }
    await project.deleteOne();
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
