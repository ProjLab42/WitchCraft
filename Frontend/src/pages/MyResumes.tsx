import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
// Replace placeholder with actual import
import { resumeAPI } from '@/services/api.service'; 
import { templateService, TemplateMetadata } from "@/services/template.service";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, ArrowLeft, ImageOff } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface ResumeStub {
  _id: string;
  title: string;
  updatedAt: string;
  templateId?: string;
}

const MyResumes: React.FC = () => {
  const navigate = useNavigate();
  const [templateMetadatas, setTemplateMetadatas] = useState<TemplateMetadata[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // Fetch all resume stubs
  const { 
    data: resumes, 
    isLoading: isLoadingResumes, 
    error: errorResumes, 
    refetch 
  } = useQuery<ResumeStub[], Error>({
    queryKey: ['userResumes'],
    queryFn: resumeAPI.getResumes, 
  });

  // Fetch all template metadatas once on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const allTemplates = await templateService.getAllTemplates();
        setTemplateMetadatas(allTemplates);
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Handle error maybe show a toast? For now, just log it.
      } finally {
        setLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleSelectResume = (id: string) => {
    navigate(`/editor/${id}`);
  };
  
  const handleCreateNew = () => {
    navigate('/editor');
  };
  
  // Combine loading states
  const isLoading = isLoadingResumes || loadingTemplates;
  const error = errorResumes;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Resumes</h1>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </CardHeader>
                <CardContent className="pt-2">
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load your resumes: {error.message}
              <Button variant="secondary" size="sm" onClick={() => refetch()} className="ml-4">
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && resumes && resumes.length === 0 && (
          <div className="text-center py-10 border rounded-lg shadow-sm bg-card text-card-foreground">
             <h2 className="text-xl font-semibold mb-2">No Resumes Yet!</h2>
             <p className="text-muted-foreground mb-4">Click "Create New" to start building your first resume.</p>
             <Button onClick={handleCreateNew}>
               <PlusCircle className="mr-2 h-4 w-4" /> Create New Resume
             </Button>
           </div>
        )}

        {!isLoading && !error && resumes && resumes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.isArray(resumes) && resumes.map((resume) => {
              const template = templateMetadatas.find(t => t.id === resume.templateId);
              const previewSrc = template?.thumbnail || template?.imageSrc;
              
              return (
                <Card 
                  key={resume._id} 
                  className="hover:shadow-lg transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate" title={resume.title}>{resume.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between pt-0">
                    <div className="w-full aspect-[16/10] bg-muted rounded-sm overflow-hidden mb-3 border">
                      {previewSrc ? (
                        <img 
                          src={previewSrc} 
                          alt={`${template?.name || 'Resume'} preview`} 
                          className="w-full h-full object-cover object-top" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageOff size={32}/>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full" 
                        onClick={() => handleSelectResume(resume._id)}
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MyResumes; 