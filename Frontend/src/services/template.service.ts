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
  imageSrc?: string; // Optional now
  thumbnail?: string; // Optional now
  templateSvgContent?: string;
  thumbnailSvgContent?: string;
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
  thumbnailSvgContent?: string; // Only keep thumbnail SVG content
  category?: string;
  version: string;
  updatedAt: string;
}

// Fallback templates if API is not available
const defaultTemplates = [
  {
    id: "classic",
    name: "Classic Professional",
    version: "1.0.0"
  },
  {
    id: "modern",
    name: "Modern Professional",
    version: "1.0.0"
  },
  {
    id: "minimal",
    name: "Minimal",
    version: "1.0.0"
  },
  {
    id: "executive",
    name: "Executive",
    version: "1.0.0"
  },
  {
    id: "creative-modern",
    name: "Creative Modern",
    version: "1.0.0"
  },
  {
    id: "technical",
    name: "Technical",
    version: "1.0.0"
  },
  {
    id: "academic",
    name: "Academic",
    version: "1.0.0"
  },
  {
    id: "modern-two-column",
    name: "Modern Two-Column",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "modern": {
    _id: "modern",
    id: "modern",
    name: "Modern Professional",
    description: "A contemporary design with a clean, minimalist look",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "minimal": {
    _id: "minimal",
    id: "minimal",
    name: "Minimal",
    description: "A clean, minimalist design with ample white space and subtle styling",
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
  },
  // New template definitions
  "executive": {
    _id: "executive",
    id: "executive",
    name: "Executive",
    description: "A premium, elegant template designed for senior professionals and executives",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "creative-modern": {
    _id: "creative-modern",
    id: "creative-modern",
    name: "Creative Modern",
    description: "A clean, contemporary design ideal for creative professionals",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "technical": {
    _id: "technical",
    id: "technical",
    name: "Technical",
    description: "Clean, structured layout optimized for technical roles with skills emphasis",
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
        useColumns: true 
      },
      colors: {
        primary: "#111111", // Near black
        secondary: "#444444",
        accent: "#222222"
      }
    },
    sections: {
      defaultOrder: ["skills", "experience", "projects", "education"]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "academic": {
    _id: "academic",
    id: "academic",
    name: "Academic",
    description: "Formal layout with emphasis on education and publications, ideal for academic positions",
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
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  "modern-two-column": {
    _id: "modern-two-column",
    id: "modern-two-column",
    name: "Modern Two-Column",
    description: "Contemporary two-column layout with a clean sidebar for skills and contact information",
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
    // Don't pre-populate cache with default templates anymore
    // We'll fetch them from the API first and only use defaults as fallback
  }
  
  // Get all templates (metadata only with thumbnailSvgContent)
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
    // Check cache first, but with proper expiry check
    const now = Date.now();
    if (this.cachedTemplates.has(id) && (now - this.lastFetch < this.cacheExpiry)) {
      return this.cachedTemplates.get(id) as Template;
    }
    
    try {
      const response = await api.get<Template>(`/api/template/${id}`);
      // Store in cache with timestamp
      this.cachedTemplates.set(id, response.data);
      this.lastFetch = now;
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      
      // If template is in cache but expired, still use it rather than fallback
      if (this.cachedTemplates.has(id)) {
        console.log(`Using expired cached template for ${id}`);
        return this.cachedTemplates.get(id) as Template;
      }
      
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
    }
  }
}

// Create singleton instance
export const templateService = new TemplateService();