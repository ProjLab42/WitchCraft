/**
 * Migration script to read SVG files and store their content in the database
 * This script also ensures all templates defined in template.service.js are added to the database
 * 
 * This script does two things:
 * 1. Reads SVG files and stores their content in the database
 * 2. Adds any missing templates that are defined in template.service.js
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
const TemplateService = require('../services/template.service');

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

// Get default templates from template.service.js
function getDefaultTemplates() {
  // This function accesses the defaultTemplates array from TemplateService
  // but creates it manually here to avoid circular dependencies
  return [
    {
      id: "classic",
      name: "Classic Professional",
      description: "A traditional resume layout with a clean, formal design suitable for most professional settings",
      imageSrc: "/assets/templates/classic-resume-template.svg",
      thumbnail: "/assets/thumbnails/classic-resume-thumbnail.svg",
      category: "Professional",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Georgia, serif",
          body: "Arial, sans-serif"
        },
        fontSize: {
          name: "24px",
          sectionHeading: "18px",
          body: "14px"
        },
        layout: {
          headerAlignment: "left",
          sectionStyle: "underlined",
          useColumns: false
        },
        colors: {
          primary: "#333333", // Dark gray
          secondary: "#666666",
          accent: "#333333"  // Dark gray
        }
      },
      sections: {
        defaultOrder: ["experience", "education", "skills", "projects"]
      }
    },
    {
      id: "modern",
      name: "Modern Professional",
      description: "A contemporary design with a clean, minimalist look",
      imageSrc: "/assets/templates/modern-resume-template.svg",
      thumbnail: "/assets/thumbnails/modern-resume-thumbnail.svg",
      category: "Modern",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Helvetica, Arial, sans-serif",
          body: "Helvetica, Arial, sans-serif"
        },
        fontSize: {
          name: "26px",
          sectionHeading: "18px",
          body: "14px"
        },
        layout: {
          headerAlignment: "center",
          sectionStyle: "boxed",
          useColumns: false
        },
        colors: {
          primary: "#222222", // Very dark gray
          secondary: "#555555",
          accent: "#000000"  // Black
        }
      },
      sections: {
        defaultOrder: ["skills", "experience", "education", "projects"]
      }
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "A clean, minimalist design with ample white space and subtle styling",
      imageSrc: "/assets/templates/minimal-resume-template.svg",
      thumbnail: "/assets/thumbnails/minimal-resume-thumbnail.svg",
      category: "Simple",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Arial, sans-serif",
          body: "Arial, sans-serif"
        },
        fontSize: {
          name: "22px",
          sectionHeading: "16px", 
          body: "14px"
        },
        layout: {
          headerAlignment: "left",
          sectionStyle: "simple",
          useColumns: false
        },
        colors: {
          primary: "#333333", // Dark gray
          secondary: "#666666",
          accent: "#333333"  // Dark gray
        }
      },
      sections: {
        defaultOrder: ["experience", "education", "skills"]
      }
    },
    // NEW TEMPLATES
    {
      id: "executive",
      name: "Executive",
      description: "A premium, elegant template designed for senior professionals and executives",
      imageSrc: "/assets/templates/classic-resume-template.svg", // Reusing existing SVGs for now
      thumbnail: "/assets/thumbnails/classic-resume-thumbnail.svg", // Reusing existing SVGs for now
      category: "Professional",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Cambria, Georgia, serif",
          body: "Calibri, Arial, sans-serif"
        },
        fontSize: {
          name: "28px",
          sectionHeading: "20px",
          body: "14px"
        },
        layout: {
          headerAlignment: "center",
          sectionStyle: "underlined",
          useColumns: false
        },
        colors: {
          primary: "#000000", // Pure black
          secondary: "#333333",
          accent: "#555555"  // Gray
        }
      },
      sections: {
        defaultOrder: ["experience", "skills", "education", "projects"]
      }
    },
    {
      id: "creative-modern",
      name: "Creative Modern",
      description: "A clean, contemporary design ideal for creative professionals",
      imageSrc: "/assets/templates/modern-resume-template.svg", // Reusing existing SVGs for now
      thumbnail: "/assets/thumbnails/modern-resume-thumbnail.svg", // Reusing existing SVGs for now
      category: "Creative",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Montserrat, Helvetica, sans-serif",
          body: "Roboto, Arial, sans-serif"
        },
        fontSize: {
          name: "26px",
          sectionHeading: "18px",
          body: "14px"
        },
        layout: {
          headerAlignment: "right",
          sectionStyle: "boxed",
          useColumns: false
        },
        colors: {
          primary: "#222222", // Dark gray
          secondary: "#444444",
          accent: "#111111"  // Nearly black
        }
      },
      sections: {
        defaultOrder: ["skills", "experience", "projects", "education"]
      }
    },
    {
      id: "technical",
      name: "Technical",
      description: "Clean, structured layout optimized for technical roles with skills emphasis",
      imageSrc: "/assets/templates/minimal-resume-template.svg", // Reusing existing SVGs for now
      thumbnail: "/assets/thumbnails/minimal-resume-thumbnail.svg", // Reusing existing SVGs for now
      category: "Professional",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Consolas, monospace",
          body: "Segoe UI, sans-serif"
        },
        fontSize: {
          name: "22px",
          sectionHeading: "18px",
          body: "14px"
        },
        layout: {
          headerAlignment: "left",
          sectionStyle: "simple",
          useColumns: true // Uses column layout for skills
        },
        colors: {
          primary: "#111111", // Nearly black
          secondary: "#444444",
          accent: "#222222"  // Dark gray
        }
      },
      sections: {
        defaultOrder: ["skills", "experience", "projects", "education"]
      }
    },
    {
      id: "academic",
      name: "Academic",
      description: "Formal layout with emphasis on education and publications, ideal for academic positions",
      imageSrc: "/assets/templates/classic-resume-template.svg", // Reusing existing SVGs for now
      thumbnail: "/assets/thumbnails/classic-resume-thumbnail.svg", // Reusing existing SVGs for now
      category: "Academic",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Times New Roman, serif",
          body: "Garamond, serif"
        },
        fontSize: {
          name: "24px",
          sectionHeading: "20px",
          body: "14px"
        },
        layout: {
          headerAlignment: "left",
          sectionStyle: "underlined",
          useColumns: false
        },
        colors: {
          primary: "#000000", // Pure black
          secondary: "#333333",
          accent: "#555555"  // Gray
        }
      },
      sections: {
        defaultOrder: ["education", "experience", "skills", "projects"]
      }
    },
    {
      id: "modern-two-column",
      name: "Modern Two-Column",
      description: "Contemporary two-column layout with a clean sidebar for skills and contact information",
      imageSrc: "/assets/templates/modern-resume-template.svg", // Reusing existing SVGs for now
      thumbnail: "/assets/thumbnails/modern-resume-thumbnail.svg", // Reusing existing SVGs for now
      category: "Modern",
      version: "1.0.0",
      styles: {
        fontFamily: {
          heading: "Open Sans, sans-serif",
          body: "Lato, sans-serif"
        },
        fontSize: {
          name: "26px",
          sectionHeading: "18px",
          body: "14px"
        },
        layout: {
          headerAlignment: "center",
          sectionStyle: "simple",
          useColumns: true
        },
        colors: {
          primary: "#111111", // Nearly black
          secondary: "#444444",
          accent: "#222222"  // Dark gray
        }
      },
      sections: {
        defaultOrder: ["experience", "education", "skills", "projects"]
      }
    }
  ];
}

// Check if a template exists and update or create it
async function ensureTemplateExists(templateData) {
  try {
    // Check if template exists by ID
    let existingTemplate = await Template.findOne({ id: templateData.id });
    
    if (existingTemplate) {
      console.log(`Template ${templateData.id} already exists, updating...`);
      
      // Update all fields to ensure template is current
      for (const key in templateData) {
        if (key !== '_id') { // Don't overwrite MongoDB _id
          existingTemplate[key] = templateData[key];
        }
      }
      
      // Read SVG content if needed
      if (templateData.imageSrc) {
        const templateSvgContent = readSvgFile(templateData.imageSrc);
        if (templateSvgContent) {
          // Apply template-specific styles to the SVG
          const modifiedSvg = applyTemplateStylingToSvg(templateSvgContent, templateData.styles);
          existingTemplate.templateSvgContent = modifiedSvg;
        }
      }
      
      if (templateData.thumbnail) {
        const thumbnailSvgContent = readSvgFile(templateData.thumbnail);
        if (thumbnailSvgContent) {
          // Apply template-specific styles to the thumbnail
          const modifiedThumbnail = applyTemplateStylingToSvg(thumbnailSvgContent, templateData.styles);
          existingTemplate.thumbnailSvgContent = modifiedThumbnail;
        }
      }
      
      // Save the updated template
      await existingTemplate.save();
      return { action: 'updated', template: existingTemplate };
    } else {
      console.log(`Template ${templateData.id} doesn't exist, creating...`);
      
      // Read and style SVG content
      if (templateData.imageSrc) {
        const templateSvgContent = readSvgFile(templateData.imageSrc);
        if (templateSvgContent) {
          // Apply template-specific styles to the SVG
          const modifiedSvg = applyTemplateStylingToSvg(templateSvgContent, templateData.styles);
          templateData.templateSvgContent = modifiedSvg;
        }
      }
      
      if (templateData.thumbnail) {
        const thumbnailSvgContent = readSvgFile(templateData.thumbnail);
        if (thumbnailSvgContent) {
          // Apply template-specific styles to the thumbnail
          const modifiedThumbnail = applyTemplateStylingToSvg(thumbnailSvgContent, templateData.styles);
          templateData.thumbnailSvgContent = modifiedThumbnail;
        }
      }
      
      // Create new template
      const newTemplate = new Template(templateData);
      await newTemplate.save();
      return { action: 'created', template: newTemplate };
    }
  } catch (error) {
    console.error(`Error ensuring template ${templateData.id} exists:`, error);
    return { action: 'error', error: error.message };
  }
}

// Function to apply template styling to the SVG content
function applyTemplateStylingToSvg(svgContent, styles) {
  try {
    if (!svgContent || !styles) return svgContent;
    
    // Extract styling information
    const { fontFamily, colors, layout } = styles;
    
    // Apply styling to SVG
    let modifiedSvg = svgContent;
    
    // Don't replace all fill colors as it affects the entire template background
    // Instead, only target specific elements like text and headings
    
    // Set text colors for headings and content to use the template colors
    if (colors?.primary) {
      // Target only text elements' fill colors, not background/shape fills
      modifiedSvg = modifiedSvg.replace(/<text([^>]*?)fill="#[0-9a-fA-F]{6}"([^>]*)>/g, 
        `<text$1fill="${colors.primary}"$2>`);
    }
    
    // Set accent color only for specific elements that should be accented
    if (colors?.accent) {
      // Apply accent color to horizontal rules and section dividers
      modifiedSvg = modifiedSvg.replace(/<(line|rect)([^>]*?)stroke="#[0-9a-fA-F]{6}"([^>]*)>/g, 
        `<$1$2stroke="${colors.accent}"$3>`);
    }
    
    // Set font family for text elements
    if (fontFamily?.heading) {
      modifiedSvg = modifiedSvg.replace(/font-family="[^"]*"/g, `font-family="${fontFamily.heading}"`);
    }
    
    // ===== IMPROVED ALIGNMENT HANDLING =====
    // For all header alignments, make sure text stays within bounds and is properly aligned
    
    // Parse viewBox to get SVG dimensions
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const viewBoxValues = viewBoxMatch ? viewBoxMatch[1].split(' ').map(Number) : [0, 0, 300, 400];
    const svgWidth = viewBoxValues[2];
    
    // Safe margins and positions
    const leftMargin = 30;
    const rightMargin = svgWidth - 30;
    const centerX = svgWidth / 2;
    
    if (layout?.headerAlignment) {
      // Get text anchor value based on header alignment
      const textAnchor = 
        layout.headerAlignment === 'left' ? 'start' : 
        layout.headerAlignment === 'right' ? 'end' : 
        'middle';
      
      // Get consistent X position for all header elements
      const headerX = 
        layout.headerAlignment === 'left' ? leftMargin : 
        layout.headerAlignment === 'right' ? rightMargin : 
        centerX;
      
      // First identify all header text elements (those with y < 150)
      const headerElements = [];
      const headerRegex = /<text([^>]*)y="([^"]+)"([^>]*)>/g;
      let headerMatch;
      
      // Extract all header text elements (instead of modifying them directly)
      while ((headerMatch = headerRegex.exec(modifiedSvg)) !== null) {
        const y = parseInt(headerMatch[2], 10);
        if (y < 150) {
          headerElements.push({
            full: headerMatch[0],
            before: headerMatch[1],
            y: headerMatch[2],
            after: headerMatch[3],
            index: headerMatch.index,
            length: headerMatch[0].length
          });
        }
      }
      
      // Sort header elements by their position in the SVG (preserve ordering)
      headerElements.sort((a, b) => a.index - b.index);
      
      // Apply text-anchor and consistent x position to all header elements
      // Starting from the end to avoid messing up indices
      for (let i = headerElements.length - 1; i >= 0; i--) {
        const el = headerElements[i];
        
        // Create updated element with proper alignment and position
        let updatedElement;
        
        if (el.before.includes('text-anchor="') || el.after.includes('text-anchor="')) {
          // If text-anchor exists, update it
          updatedElement = el.full.replace(/text-anchor="[^"]*"/, `text-anchor="${textAnchor}"`);
        } else {
          // Otherwise add it
          updatedElement = `<text${el.before} text-anchor="${textAnchor}"${el.after}>`;
        }
        
        // Update x position consistently for all header elements
        if (updatedElement.includes('x="')) {
          updatedElement = updatedElement.replace(/x="[^"]*"/, `x="${headerX}"`);
        } else {
          // Add x attribute if missing
          updatedElement = updatedElement.replace(/<text/, `<text x="${headerX}"`);
        }
        
        // Replace the original element with updated one
        modifiedSvg = modifiedSvg.substring(0, el.index) + updatedElement + modifiedSvg.substring(el.index + el.length);
      }
    }
    
    // Remove any rect (boxes) around section headings for modern templates
    if (styles.layout?.sectionStyle === 'boxed') {
      // First, identify all section heading positions (y values) to accurately target the heading boxes
      const sectionHeadings = [];
      const headingRegex = /<text([^>]*)y="([^"]+)"([^>]*)>([^<]*(?:Experience|Skills|Projects|Education|Certifications)[^<]*)<\/text>/g;
      let headingMatch;
      
      while ((headingMatch = headingRegex.exec(modifiedSvg)) !== null) {
        const y = parseInt(headingMatch[2], 10);
        sectionHeadings.push(y);
      }
      
      // Remove rect elements that are likely heading backgrounds
      // More precisely target section heading boxes by checking their y position against known heading positions
      modifiedSvg = modifiedSvg.replace(/<rect([^>]*?)y="([^"]+)"([^>]*?)fill="[#0-9a-fA-F]+"([^>]*?)\/>/g, (match, before, yPos, middle, after) => {
        const rectY = parseInt(yPos, 10);
        
        // Keep main document background and decorative elements
        if (before.includes('width="300"') || before.includes('height="400"') || before.includes('height="5"')) {
          return match;
        }
        
        // Check if this rect is close to any section heading position
        const isNearHeading = sectionHeadings.some(headingY => Math.abs(rectY - headingY) < 20);
        
        // Remove if it's near a heading position - these are the heading boxes we want to remove
        if (isNearHeading) {
          return '';
        }
        
        // Keep other rect elements
        return match;
      });
      
      // Also handle potential rect elements that don't use the fill attribute directly
      modifiedSvg = modifiedSvg.replace(/<rect([^>]*?)y="([^"]+)"([^>]*?)style="[^"]*fill:[#0-9a-fA-F]+[^"]*"([^>]*?)\/>/g, (match, before, yPos, middle, after) => {
        const rectY = parseInt(yPos, 10);
        
        // Keep main document background and decorative elements
        if (before.includes('width="300"') || before.includes('height="400"') || before.includes('height="5"')) {
          return match;
        }
        
        // Check if this rect is close to any section heading position
        const isNearHeading = sectionHeadings.some(headingY => Math.abs(rectY - headingY) < 20);
        
        // Remove if it's near a heading position
        if (isNearHeading) {
          return '';
        }
        
        // Keep other rect elements
        return match;
      });
    }
    
    return modifiedSvg;
  } catch (error) {
    console.error('Error applying template styling to SVG:', error);
    return svgContent; // Return original on error
  }
}

// Main migration function
async function migrateTemplateSvgContent() {
  try {
    await connectToDatabase();
    
    // Get all templates
    const templates = await Template.find();
    console.log(`Found ${templates.length} templates in the database`);
    
    // Track migration statistics
    let updatedCount = 0;
    let createdCount = 0;
    let errorCount = 0;
    
    // Process each template for SVG content
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
        updatedCount++;
        console.log(`Saved template ${template.id}`);
      } else {
        console.log(`No SVG updates needed for template ${template.id}`);
      }
    }
    
    // Step 2: Ensure all default templates exist
    console.log('\nChecking for missing templates...');
    const defaultTemplates = getDefaultTemplates();
    
    for (const templateData of defaultTemplates) {
      const result = await ensureTemplateExists(templateData);
      
      if (result.action === 'created') {
        createdCount++;
      } else if (result.action === 'updated') {
        updatedCount++;
      } else {
        errorCount++;
      }
    }
    
    console.log('\nMigration complete!');
    console.log(`Successfully updated ${updatedCount} templates`);
    console.log(`Successfully created ${createdCount} templates`);
    console.log(`Errors: ${errorCount}`);
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    // Close database connection on error
    try {
      await mongoose.connection.close();
    } catch (e) {
      console.error('Failed to close database connection:', e);
    }
    process.exit(1);
  }
}

// Run the migration
migrateTemplateSvgContent();