const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const Knowledge = require('../models/Knowledge');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const createSampleKnowledge = async () => {
  try {
    console.log('Connecting to database...'.yellow);
    
    // Check if there are any knowledge articles
    const knowledgeCount = await Knowledge.countDocuments();
    
    if (knowledgeCount > 0) {
      console.log(`${knowledgeCount} knowledge articles already exist. No need to create sample.`.yellow);
      process.exit();
    }
    
    // Find an admin user to be the author
    const adminUser = await User.findOne({ role: { $in: ['admin', 'enterprise_admin', 'editor'] } });
    
    if (!adminUser) {
      console.log('No admin or editor user found to be the author. Please create one first.'.red);
      process.exit(1);
    }
    
    // Create a sample knowledge article
    const sampleArticle = {
      title: 'Welcome to the Knowledge Base',
      content: `# Welcome to the Knowledge Base

This is a sample article to help you get started with the Knowledge Base.

## What is the Knowledge Base?

The Knowledge Base is a repository of articles that contain information about your organization's products, services, and processes. It's a great way to share knowledge and help users find answers to their questions.

## How to use the Knowledge Base

1. Browse articles by category
2. Search for specific topics
3. Create new articles (if you have permission)
4. Vote on articles to help others find the most useful content

## Next Steps

If you're an editor or administrator, try creating a new article by clicking the "Create Article" button above.`,
      category: 'how-to',
      tags: ['welcome', 'getting-started', 'knowledge-base'],
      status: 'published',
      visibility: 'public',
      author: adminUser._id
    };
    
    await Knowledge.create(sampleArticle);
    
    console.log('Sample knowledge article created successfully!'.green);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Run the function
createSampleKnowledge();
