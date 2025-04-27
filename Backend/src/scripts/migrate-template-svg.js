/**
 * Migration script to read SVG files and store their content in the database
 * 
 * This script reads the SVG files referenced by imageSrc and thumbnail fields
 * in the template documents and stores their content in the templateSvgContent
 * and thumbnailSvgContent fields.
 * 
 * Usage: 
 * cd Backend
 * node src/scripts/migrate-template-svg.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Template model
const Template = require('../models/template.model');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Read SVG file content
function readSvgFile(relativePath) {
  try {
    // Resolve the path relative to the public directory
    // Adjust this path based on your project structure
    const publicDir = path.resolve(__dirname, '../../../Frontend/public');
    const filePath = path.join(publicDir, relativePath);
    
    console.log(`Reading file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error reading SVG file ${relativePath}:`, error);
    return null;
  }
}

// Main migration function
async function migrateTemplateSvgContent() {
  try {
    await connectToDatabase();
    
    // Get all templates
    const templates = await Template.find();
    console.log(`Found ${templates.length} templates to migrate`);
    
    // Track migration statistics
    let successCount = 0;
    let errorCount = 0;
    
    // Process each template
    for (const template of templates) {
      console.log(`Processing template: ${template.id}`);
      let updated = false;
      
      // Read and update template SVG content if not already present
      if (template.imageSrc && !template.templateSvgContent) {
        const templateSvgContent = readSvgFile(template.imageSrc);
        if (templateSvgContent) {
          template.templateSvgContent = templateSvgContent;
          updated = true;
          console.log(`Added template SVG content for ${template.id}`);
        } else {
          console.error(`Failed to read template SVG for ${template.id}`);
          errorCount++;
        }
      }
      
      // Read and update thumbnail SVG content if not already present
      if (template.thumbnail && !template.thumbnailSvgContent) {
        const thumbnailSvgContent = readSvgFile(template.thumbnail);
        if (thumbnailSvgContent) {
          template.thumbnailSvgContent = thumbnailSvgContent;
          updated = true;
          console.log(`Added thumbnail SVG content for ${template.id}`);
        } else {
          console.error(`Failed to read thumbnail SVG for ${template.id}`);
          errorCount++;
        }
      }
      
      // Save the updated template
      if (updated) {
        await template.save();
        successCount++;
        console.log(`Saved template ${template.id}`);
      } else {
        console.log(`No updates needed for template ${template.id}`);
      }
    }
    
    console.log('\nMigration complete!');
    console.log(`Successfully migrated ${successCount} templates`);
    console.log(`Errors: ${errorCount}`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    // Close database connection on error
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateTemplateSvgContent();