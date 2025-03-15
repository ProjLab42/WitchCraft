const Template = require('../models/template.model');

class TemplateService {
  // Get all active templates (metadata only)
  async getAllTemplates() {
    try {
      return await Template.find({ isActive: true })
        .select('id name imageSrc thumbnail category version updatedAt')
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
                accent: "#2563eb"
              }
            },
            sections: {
              defaultOrder: ["experience", "education", "skills", "projects"]
            }
          },
          {
            id: "modern",
            name: "Modern Professional",
            description: "A contemporary design with a blue accent color and skills section first",
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
                primary: "#333333",
                secondary: "#666666",
                accent: "#2563eb"
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
          }
        ];
        
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