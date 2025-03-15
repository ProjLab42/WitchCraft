import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { templateService, Template } from "@/services/template.service";
import { useNavigate } from "react-router-dom";

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load templates
    const allTemplates = templateService.getAllTemplates();
    setTemplates(allTemplates);
  }, []);
  
  // Get unique categories
  const categories = ["all", ...new Set(templates.map(template => template.category))];
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);
  
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
  };
  
  const handleContinue = () => {
    if (selectedTemplate) {
      navigate(`/editor?template=${selectedTemplate}`);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-3 text-3xl font-bold">Resume Templates</h1>
            <p className="text-muted-foreground">
              Choose a template that fits your style and professional needs. Each template has a unique design and layout.
            </p>
          </div>
          
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
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border mb-3">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105"
                    />
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
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {template.category}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 flex justify-end">
            <Button 
              onClick={handleContinue} 
              size="lg" 
              className="gap-2"
              disabled={!selectedTemplate}
            >
              <span>Continue with this template</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 