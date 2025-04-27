import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { templateService, TemplateMetadata } from "@/services/template.service";

export default function Create() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  
  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getAllTemplates();
        
        // Verify we got valid data
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
          setError(null);
        } else {
          console.error('Empty or invalid template data received:', data);
          setError('No templates are available. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // If template is provided in URL, set it as selected
  useEffect(() => {
    if (templateParam) {
      setSelectedTemplate(templateParam);
    }
  }, [templateParam]);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      // Navigate to editor with the selected template
      navigate(`/editor?template=${selectedTemplate}`);
    } else {
      toast.error("Please select a template to continue");
    }
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
            <span>Continue</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div className="max-w-2xl">
              <h1 className="mb-3 text-3xl font-bold">Choose a Template</h1>
              <p className="text-muted-foreground">
                Select a template to get started. You can always change it later.
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            </Link>
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
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  id={template.id}
                  name={template.name}
                  thumbnailSvgContent={template.thumbnailSvgContent}
                  selected={selectedTemplate === template.id}
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 flex justify-end">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="gap-2"
              disabled={!selectedTemplate}
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
