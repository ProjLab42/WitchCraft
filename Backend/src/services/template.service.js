const Template = require('../models/template.model');

class TemplateService {
  // Get all active templates with just thumbnail SVG content for previews
  async getAllTemplates() {
    try {
      return await Template.find({ isActive: true })
        .select('id name thumbnailSvgContent category version updatedAt')
        .lean();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }
  
  // Get template by ID with full details
  async getTemplateById(id) {
    try {
      const template = await Template.findOne({ id, isActive: true }).lean();
      if (!template) {
        throw new Error('Template not found');
      }
      return template;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  }
  
  // Create a new template
  async createTemplate(templateData) {
    try {
      const template = new Template(templateData);
      await template.validate(); // Ensure it meets the schema requirements
      return await template.save();
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }
  
  // Update an existing template
  async updateTemplate(id, templateData) {
    try {
      const template = await Template.findOneAndUpdate(
        { id },
        templateData,
        { new: true, runValidators: true }
      );
      
      if (!template) {
        throw new Error('Template not found');
      }
      
      return template;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  }
  
  // Soft delete a template
  async deleteTemplate(id) {
    try {
      const result = await Template.findOneAndUpdate(
        { id },
        { isActive: false },
        { new: true }
      );
      
      if (!result) {
        throw new Error('Template not found');
      }
      
      return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  }
  
  // Initialize default templates if none exist
  async initializeDefaultTemplates() {
    try {
      const count = await Template.countDocuments();
      if (count === 0) {
        console.log('No templates found, initializing defaults...');
        
        // Add default templates
        const defaultTemplates = [
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
                primary: "#333333",
                secondary: "#666666",
                accent: "#333333"
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
                primary: "#222222",
                secondary: "#555555",
                accent: "#000000"
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
                primary: "#333333",
                secondary: "#666666",
                accent: "#333333"
              }
            },
            sections: {
              defaultOrder: ["experience", "education", "skills"]
            }
          },
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
                primary: "#000000", // Black
                secondary: "#333333",
                accent: "#555555"
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
                accent: "#111111"
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
                primary: "#111111", // Near black
                secondary: "#444444",
                accent: "#222222"
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
                accent: "#555555"
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
                primary: "#111111", // Near black
                secondary: "#444444",
                accent: "#222222"
              }
            },
            sections: {
              defaultOrder: ["experience", "education", "skills", "projects"]
            }
          }
        ];
        
        // Read SVG files and add their content
        for (const template of defaultTemplates) {
          try {
            const fs = require('fs');
            const path = require('path');
            
            // Read template SVG
            const templateSvgPath = path.join(__dirname, '../../../Frontend/public', template.imageSrc);
            if (fs.existsSync(templateSvgPath)) {
              template.templateSvgContent = fs.readFileSync(templateSvgPath, 'utf8');
            }
            
            // Read thumbnail SVG
            const thumbnailSvgPath = path.join(__dirname, '../../../Frontend/public', template.thumbnail);
            if (fs.existsSync(thumbnailSvgPath)) {
              template.thumbnailSvgContent = fs.readFileSync(thumbnailSvgPath, 'utf8');
            }
          } catch (error) {
            console.error(`Error reading SVG files for template ${template.id}:`, error);
          }
        }
        
        await Template.insertMany(defaultTemplates);
        console.log('Default templates initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService();