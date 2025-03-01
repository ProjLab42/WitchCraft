
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, FileText } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { toast } from "sonner";

export default function Editor() {
  const [showPreview, setShowPreview] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Sample form data
  const [formData, setFormData] = useState({
    name: "Jennifer Jobscan",
    jobTitle: "Product Manager",
    email: "jennifer@jobscan.co",
    phone: "(123) 456-7890",
    location: "Seattle, WA",
    linkedin: "linkedin.com/in/jenniferjobscan",
    summary: "Creative professional and collaborator with 15+ years experience devoted to product, 10+ as a Product Manager and Lead. In-depth knowledge of manufacturing processes, materials, applications, licensing with external partners and approval standards.",
    experiences: [
      {
        id: 1,
        company: "Fashion Forum, Milan",
        position: "Design Directory Consultant",
        startDate: "Feb 2018",
        endDate: "Present",
        description: "Reviewed design concepts, critiqued, and designed fashion based tier 1 headwear that elevated product and brand expression. Designed quick-to-market regionalized, premium, and mass product line for subsidiary brands under fashion umbrella."
      },
      {
        id: 2,
        company: "StyleMe Inc, New York, NY",
        position: "Assistant Manager (Design)",
        startDate: "Aug 2016",
        endDate: "Jan 2018",
        description: "Influenced accounts, vendors, and internal stakeholders to support lifestyle product with trend presentation, selling tools, product curating, and exclusives."
      }
    ],
    education: [
      {
        id: 1,
        school: "New York University",
        degree: "Bachelor",
        field: "Fine Arts Management",
        startDate: "Aug 2006",
        endDate: "Dec 2010"
      }
    ],
    skills: "Product Management, UX/UI Design, Project Management, Stakeholder Management, Agile Methodologies",
    languages: "English (Native), French (Intermediate), Italian (Basic)",
    certificates: ""
  });

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    toast.success(`Exporting resume as ${format.toUpperCase()}...`);
    // In a real implementation, this would call an API to generate the file
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex justify-end border-b px-6 py-3">
        <div className="flex gap-2">
          {!isDesktop && (
            <Button variant="outline" size="sm" onClick={togglePreview} className="gap-2">
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide Preview</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show Preview</span>
                </>
              )}
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleExport('docx')} className="gap-2">
            <FileText className="h-4 w-4" />
            <span>DOCX</span>
          </Button>
        </div>
      </div>
      
      <main className="flex-1 bg-muted/30">
        <div className="flex min-h-[calc(100vh-12rem)]">
          <div className="w-full lg:w-1/2 overflow-auto">
            <ResumeForm />
          </div>
          
          {(showPreview || isDesktop) && (
            <div className="hidden lg:block lg:w-1/2 p-8">
              <div className="sticky top-8 h-[calc(100vh-12rem)]">
                <ResumePreview formData={formData} />
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
