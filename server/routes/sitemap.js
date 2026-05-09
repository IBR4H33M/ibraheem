const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// Dynamic sitemap route
router.get('/', async (req, res) => {
  try {
    // Static pages
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'weekly' },
      { path: '/about', priority: 0.8, changefreq: 'weekly' },
      { path: '/contact', priority: 0.8, changefreq: 'weekly' },
      { path: '/techspace', priority: 0.9, changefreq: 'weekly' },
      { path: '/gaming', priority: 0.8, changefreq: 'weekly' },
      { path: '/fandom', priority: 0.8, changefreq: 'weekly' },
      { path: '/techspace/Sentiment-Analysis-of-Product-Reviews', priority: 0.8, changefreq: 'weekly' },
      { path: '/techspace/StudentPerformancePredictor', priority: 0.8, changefreq: 'weekly' },
    ];

    // Get all projects with slugs
    const projects = await Project.find({ slug: { $exists: true, $ne: null } }).sort({ createdAt: -1 });
    
    // Build project URLs
    const projectPages = projects.map(project => ({
      path: `/techspace/${project.slug}`,
      priority: 0.75,
      changefreq: 'monthly',
      lastmod: project.createdAt.toISOString().split('T')[0]
    }));

    // Combine all pages
    const allPages = [...staticPages, ...projectPages];

    // Generate XML
    const baseUrl = 'https://ibraheemibnanwar.me';
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    allPages.forEach(page => {
      xmlContent += '  <url>\n';
      xmlContent += `    <loc>${baseUrl}${page.path}</loc>\n`;
      if (page.lastmod) {
        xmlContent += `    <lastmod>${page.lastmod}</lastmod>\n`;
      }
      xmlContent += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xmlContent += `    <priority>${page.priority}</priority>\n`;
      xmlContent += '  </url>\n';
    });

    xmlContent += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(xmlContent);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
