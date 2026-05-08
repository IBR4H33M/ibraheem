const mongoose = require('mongoose');
require('dotenv').config();

// Helper function to generate slug from title
const generateSlug = (title) => {
  return `project:${title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')}`;
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ibraheem', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Migration function
const migrateProjectSlugs = async () => {
  try {
    const Project = require('./models/Project');
    
    // Find all projects without slugs
    const projectsWithoutSlugs = await Project.find({ 
      $or: [{ slug: null }, { slug: { $exists: false } }] 
    });
    
    console.log(`\nFound ${projectsWithoutSlugs.length} projects without slugs\n`);
    
    if (projectsWithoutSlugs.length === 0) {
      console.log('✓ All projects already have slugs!');
      return;
    }
    
    let updated = 0;
    let duplicates = 0;
    
    for (const project of projectsWithoutSlugs) {
      try {
        const slug = generateSlug(project.title);
        project.slug = slug;
        await project.save();
        console.log(`✓ [${++updated}] "${project.title}" → ${slug}`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠ [SKIP] "${project.title}" → Duplicate slug detected`);
          duplicates++;
        } else {
          console.error(`✗ [ERROR] "${project.title}" → ${error.message}`);
        }
      }
    }
    
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✓ Migration complete!`);
    console.log(`  • Updated: ${updated}`);
    console.log(`  • Duplicates/Skipped: ${duplicates}`);
    console.log(`${'─'.repeat(60)}\n`);
    
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migration
(async () => {
  console.log('\n🔄 Starting Project Slug Migration...\n');
  await connectDB();
  await migrateProjectSlugs();
  await mongoose.connection.close();
  console.log('✓ Database connection closed\n');
  process.exit(0);
})();
