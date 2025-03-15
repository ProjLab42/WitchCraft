import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { templateService } from "@/services/template.service";

// Sample template data
const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    imageSrc: "/assets/templates/classic-resume-template.svg",
  },
  {
    id: "modern",
    name: "Modern Professional",
    imageSrc: "/assets/templates/modern-resume-template.svg",
  },
  {
    id: "student",
    name: "Modern Student",
    imageSrc: "/assets/templates/student-resume-template.svg",
  },
  {
    id: "creative",
    name: "Creative Professional",
    imageSrc: "/assets/templates/creative-resume-template.svg",
  },
  {
    id: "executive",
    name: "Executive",
    imageSrc: "/assets/templates/executive-resume-template.svg",
  },
  {
    id: "minimal",
    name: "Minimal",
    imageSrc: "/assets/templates/minimal-resume-template.svg",
  },
];

export default function Create() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template');
  
  // Get templates from the service
  const templates = templateService.getAllTemplates();
  
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
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-3 text-3xl font-bold">Choose a Template</h1>
            <p className="text-muted-foreground">
              Select a template to get started. You can always change it later.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                imageSrc={template.thumbnail}
                selected={selectedTemplate === template.id}
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>
          
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
