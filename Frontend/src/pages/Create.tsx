import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TemplateCard } from "@/components/resume/TemplateCard";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Sample template data
const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    imageSrc: "/assets/templates/classic-resume-template.png",
  },
  {
    id: "modern",
    name: "Modern Professional",
    imageSrc: "/assets/templates/modern-resume-template.png",
  },
  {
    id: "student",
    name: "Modern Student",
    imageSrc: "/assets/templates/student-resume-template.png",
  },
  {
    id: "creative",
    name: "Creative Professional",
    imageSrc: "/assets/templates/creative-resume-template.png",
  },
  {
    id: "executive",
    name: "Executive",
    imageSrc: "/assets/templates/executive-resume-template.png",
  },
  {
    id: "minimal",
    name: "Minimal",
    imageSrc: "/assets/templates/minimal-resume-template.png",
  },
];

export default function Create() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      toast.success(`Template "${selectedTemplate}" selected!`);
      navigate("/editor");
    } else {
      toast.error("Please select a template to continue");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <h1 className="mb-3 text-3xl font-bold">Choose a template</h1>
            <p className="text-muted-foreground">
              Select a template to start with. Don't worry, you can change it later.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                imageSrc={template.imageSrc}
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
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
