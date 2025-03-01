
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateFile(selectedFile);
    }
  };

  const validateFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF and DOCX files are supported");
      return;
    }
    
    if (selectedFile.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }
    
    setFile(selectedFile);
    toast.success(`File "${selectedFile.name}" selected`);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      validateFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Resume uploaded and parsed successfully!");
      navigate("/editor");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-3xl">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Upload Your Resume</h1>
            <p className="text-muted-foreground">
              Upload your existing resume and we'll parse the information automatically
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Choose a file to upload</CardTitle>
              <CardDescription>
                We accept PDF and DOCX files up to 5MB in size
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-medium">Drag & Drop</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Drop your resume file here, or click to browse
                </p>
                
                <div className="relative">
                  <Input
                    id="resumeFile"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                  />
                  <Button asChild variant="outline">
                    <Label htmlFor="resumeFile" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </Label>
                  </Button>
                </div>
              </div>
              
              {file && (
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center rounded-lg border bg-muted/20 p-4 text-sm">
                <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  We'll extract information like your work history, education, and skills 
                  automatically. You'll be able to review and edit before finalizing.
                </span>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? "Processing..." : "Upload and Continue"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
