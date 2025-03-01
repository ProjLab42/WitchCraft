
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileText, Plus, Download, Edit, Trash, Upload } from "lucide-react";
import { toast } from "sonner";

// Sample resume data
const resumes = [
  {
    id: 1,
    title: "Software Engineer Resume",
    lastUpdated: "2 days ago",
    template: "Modern Professional",
    jobMatches: 8
  },
  {
    id: 2,
    title: "UX Designer Resume",
    lastUpdated: "1 week ago",
    template: "Creative Professional",
    jobMatches: 5
  },
  {
    id: 3,
    title: "Product Manager Resume",
    lastUpdated: "1 month ago",
    template: "Executive",
    jobMatches: 3
  }
];

export default function Dashboard() {
  const handleDelete = (id: number) => {
    toast.success(`Resume ${id} deleted successfully`);
    // In a real implementation, this would call an API to delete the resume
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Resumes</h1>
              <p className="text-muted-foreground">
                Manage and create your professional resumes
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/upload">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </Link>
              </Button>
              
              <Button asChild className="gap-2">
                <Link to="/create">
                  <Plus className="h-4 w-4" />
                  <span>New Resume</span>
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="animate-fade-in overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle>{resume.title}</CardTitle>
                  <CardDescription>
                    Last updated: {resume.lastUpdated}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template:</span>
                      <span>{resume.template}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job Matches:</span>
                      <span className="font-medium text-primary">{resume.jobMatches}</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t bg-muted/10 p-3 gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/editor">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={() => toast.success("Resume downloaded!")}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(resume.id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
