import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
// Replace placeholder with actual import
import { resumeAPI } from '@/services/api.service'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, ArrowLeft } from 'lucide-react';

interface ResumeStub {
  _id: string;
  title: string;
  updatedAt: string;
}

const MyResumes: React.FC = () => {
  const navigate = useNavigate();
  // Use the imported resumeAPI.getResumes
  const { data: resumes, isLoading, error, refetch } = useQuery<ResumeStub[], Error>({
    queryKey: ['userResumes'],
    // Ensure resumeAPI.getResumes is correctly typed in api.service.ts to return Promise<ResumeStub[]>
    queryFn: resumeAPI.getResumes, 
  });

  const handleSelectResume = (id: string) => {
    navigate(`/editor?resumeId=${id}`);
  };
  
  const handleCreateNew = () => {
    navigate('/editor');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 rounded-md hover:bg-accent text-sm inline-flex items-center">
             <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
          </Link>
          <h1 className="text-3xl font-bold">My Resumes</h1>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-10 w-full" />
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
          {Array.isArray(resumes) && resumes.map((resume) => (
            <Card 
              key={resume._id} 
              className="hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
              onClick={() => handleSelectResume(resume._id)}
            >
              <CardHeader>
                <CardTitle className="text-lg truncate" title={resume.title}>{resume.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
                 <Button variant="outline" size="sm" className="w-full">Open</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResumes; 