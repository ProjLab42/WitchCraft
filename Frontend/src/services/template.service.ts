import axios from 'axios';
import api from '../services/api';

// Template style interface
export interface TemplateStyles {
  fontFamily: {
    heading: string;
    body: string;
  };
  fontSize: {
    name: string;
    sectionHeading: string;
    body: string;
  };
  layout: {
    headerAlignment: 'left' | 'center' | 'right';
    sectionStyle: 'underlined' | 'boxed' | 'simple';
    useColumns: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Template interface
export interface Template {
  _id: string; // MongoDB ID
  id: string;  // Template unique identifier
  name: string;
  description?: string;
  imageSrc: string;
  thumbnail?: string;
  category?: string;
  version: string;
  styles: TemplateStyles;
  sections: {
    defaultOrder: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Template metadata (summary)
export interface TemplateMetadata {
  _id: string;
  id: string;
  name: string;
  imageSrc: string;
  thumbnail?: string;
  category?: string;
  version: string;
  updatedAt: string;
}

// Fallback templates if API is not available
const defaultTemplates = [
  {
    id: "classic",
    name: "Classic Professional",
    imageSrc: "/assets/templates/classic-resume-template.svg",
    thumbnail: "/assets/thumbnails/classic-resume-thumbnail.svg",
    version: "1.0.0"
  },
  {
    id: "modern",
    name: "Modern Professional",
    imageSrc: "/assets/templates/modern-resume-template.svg",
    thumbnail: "/assets/thumbnails/modern-resume-thumbnail.svg",
    version: "1.0.0"
  },
  {
    id: "minimal",
    name: "Minimal",
    imageSrc: "/assets/templates/minimal-resume-template.svg",
    thumbnail: "/assets/thumbnails/minimal-resume-thumbnail.svg",
    version: "1.0.0"
  }
] as TemplateMetadata[];

// Default template definitions for fallback when API fails
const defaultTemplateDefinitions: Record<string, Template> = {
  "classic": {
    _id: "classic",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "modern": {
    _id: "modern",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "minimal": {
    _id: "minimal",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

class TemplateService {
  private cachedTemplates: Map<string, Template> = new Map();
  private cachedMetadata: TemplateMetadata[] | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;
  
  constructor() {
    // Pre-populate cache with default templates
    Object.values(defaultTemplateDefinitions).forEach(template => {
      this.cachedTemplates.set(template.id, template);
    });
  }
  
  // Get all templates (metadata only)
  async getAllTemplates(): Promise<TemplateMetadata[]> {
    // Check if we have a fresh cache
    const now = Date.now();
    if (this.cachedMetadata && (now - this.lastFetch < this.cacheExpiry)) {
      return this.cachedMetadata;
    }
    
    try {
      const response = await api.get<TemplateMetadata[]>('/api/template');
      this.cachedMetadata = response.data;
      this.lastFetch = now;
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return default templates if API fails
      return defaultTemplates;
    }
  }
  
  // Get template by ID with caching
  async getTemplateById(id: string): Promise<Template> {
    // Check cache first
    if (this.cachedTemplates.has(id)) {
      return this.cachedTemplates.get(id) as Template;
    }
    
    try {
      const response = await api.get<Template>(`/api/template/${id}`);
      // Store in cache
      this.cachedTemplates.set(id, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      
      // Return fallback template if available
      if (defaultTemplateDefinitions[id]) {
        console.log(`Using fallback template for ${id}`);
        return defaultTemplateDefinitions[id];
      }
      
      // Otherwise return the first default template
      const fallbackId = Object.keys(defaultTemplateDefinitions)[0];
      console.log(`Using first available fallback template: ${fallbackId}`);
      return defaultTemplateDefinitions[fallbackId];
    }
  }
  
  // Clear cache for a specific template or all templates
  clearCache(id?: string) {
    if (id) {
      this.cachedTemplates.delete(id);
    } else {
      this.cachedTemplates.clear();
      this.cachedMetadata = null;
      
      // Re-add default templates to cache
      Object.values(defaultTemplateDefinitions).forEach(template => {
        this.cachedTemplates.set(template.id, template);
      });
    }
  }
}

// Create singleton instance
export const templateService = new TemplateService(); 