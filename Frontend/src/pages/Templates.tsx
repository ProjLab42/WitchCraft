import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { templateService, Template, TemplateMetadata } from "@/services/template.service";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function Templates() {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load templates
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await templateService.getAllTemplates();
        setTemplates(allTemplates);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Get unique categories
  const categories = ["all", ...new Set(templates.filter(template => template.category).map(template => template.category))];
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(template => {
        // Special case for Modern Professional to appear in both tabs
        if (template.name === "Modern Professional") {
          return selectedCategory === "Modern" || selectedCategory === "Professional";
        }
        return template.category === selectedCategory;
      });
  
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
  };
  
  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(`/editor?template=${selectedTemplate}`);
    } else {
      toast.error("Please select a template to continue");
    }
  };
  
  // Helper function to get template description
  const getTemplateDescription = (template: TemplateMetadata) => {
    // TemplateMetadata doesn't have description property, so we use only our predefined descriptions
    
    // Fallback descriptions based on template name
    const descriptions: Record<string, string> = {
      "Classic Professional": "Traditional layout with formal styling for corporate settings",
      "Modern Professional": "Contemporary design with clean layout and professional appearance",
      "Modern Student": "Optimized for students with focus on education and projects",
      "Creative Professional": "Distinctive design for creative industries with visual appeal",
      "Executive": "Sophisticated layout emphasizing leadership and achievements",
      "Minimal": "Clean, simple design with focus on content over styling",
      "ATS-Optimized": "Formatted specifically for easy parsing by Applicant Tracking Systems",
      "Technical": "Structured to highlight technical skills and programming expertise",
      "Graduate": "Designed for recent graduates entering the professional workforce",
      "Chronological": "Traditional timeline-based format showing career progression",
      "Functional": "Skills-focused format that emphasizes capabilities over work history",
      "Combination": "Blends chronological and functional styles for versatile presentation"
    };
    
    return descriptions[template.name] || "Professional resume template";
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      {/* Fixed Continue Button - always visible */}
      <div className="sticky top-16 z-50 py-3 px-4 bg-background/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container flex justify-between items-center">
          <div className="text-sm font-medium">
            {selectedTemplate ? (
              <span>Selected: <span className="text-primary">{templates.find(t => t.id === selectedTemplate)?.name}</span></span>
            ) : (
              <span className="text-muted-foreground">Please select a template</span>
            )}
          </div>
          <Button 
            onClick={handleContinue} 
            size="sm" 
            className="gap-2"
            disabled={!selectedTemplate}
          >
            <span>Continue with this template</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-3 text-3xl font-bold">Resume Templates</h1>
            <p className="text-muted-foreground">
              Choose a template that fits your style and professional needs. Each template has a unique design and layout.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Loading templates...</p>
            </div>
          ) : error ? (
            <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
              {error}
            </div>
          ) : (
            <>
              <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
                <TabsList>
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.id ? 'border-primary ring-2 ring-primary ring-opacity-50' : ''}`}
                    onClick={() => handleSelectTemplate(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {getTemplateDescription(template)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border mb-3">
                        {template.thumbnailSvgContent ? (
                          <div 
                            className="h-full w-full transition-transform duration-300 hover:scale-105 svg-container"
                            dangerouslySetInnerHTML={{ __html: template.thumbnailSvgContent }} 
                          />
                        ) : (
                          <img
                            src={template.thumbnail || template.imageSrc}
                            alt={template.name}
                            className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105"
                          />
                        )}
                        {selectedTemplate === template.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <div className="rounded-full bg-primary p-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {template.category && (
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            {template.category}
                          </span>
                          {/* For Modern Professional, show both categories */}
                          {template.name === "Modern Professional" && template.category === "Modern" && (
                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              Professional
                            </span>
                          )}
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}