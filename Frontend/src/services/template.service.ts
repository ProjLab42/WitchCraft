import templates from '../data/templates.json';

export interface TemplateStyle {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lineColor: string;
  headerStyle: string;
  accentHeight?: string;
  sectionTitleSize: string;
  sectionTitleWeight: string;
  sectionOrder: string[];
  gradientColors?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  styles: TemplateStyle;
}

class TemplateService {
  private templates: Template[];

  constructor() {
    this.templates = templates as Template[];
  }

  getAllTemplates(): Template[] {
    return this.templates;
  }

  getTemplateById(id: string): Template | undefined {
    return this.templates.find(template => template.id === id);
  }

  getTemplatesByCategory(category: string): Template[] {
    return this.templates.filter(template => template.category === category);
  }

  // This method would be used if we were fetching from an API
  async fetchTemplatesFromAPI(): Promise<Template[]> {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      return this.templates; // Fallback to local templates
    }
  }
}

export const templateService = new TemplateService(); 