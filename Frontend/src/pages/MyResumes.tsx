import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
// Replace placeholder with actual import
import { resumeAPI } from '@/services/api.service'; 
import { templateService, TemplateMetadata } from "@/services/template.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, ArrowLeft, ImageOff, Trash2, Edit, Download } from 'lucide-react';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
// Import for dialog
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast"; // Import toast
import { Input } from "@/components/ui/input"; // Import Input for rename
import { Label } from "@/components/ui/label"; // Import Label for rename

interface ResumeStub {
  _id: string;
  title: string;
  updatedAt: string;
  templateId?: string;
}

interface DeleteDialogState {
  isOpen: boolean;
  resumeId: string;
  resumeTitle: string;
}

interface RenameDialogState {
  isOpen: boolean;
  resumeId: string;
  currentTitle: string;
  newTitle: string;
}

const MyResumes: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // For refetching after delete
  const [templateMetadatas, setTemplateMetadatas] = useState<TemplateMetadata[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    resumeId: "",
    resumeTitle: ""
  });
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    isOpen: false,
    resumeId: "",
    currentTitle: "",
    newTitle: ""
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);

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
    // Navigate using query parameter
    navigate(`/editor?resumeId=${id}`);
  };
  
  const handleCreateNew = () => {
    navigate('/editor');
  };
  
  // Handle opening delete confirmation
  const handleOpenDeleteDialog = (e: React.MouseEvent, resume: ResumeStub) => {
    e.stopPropagation(); // Prevent card click from triggering
    setDeleteDialog({
      isOpen: true,
      resumeId: resume._id,
      resumeTitle: resume.title
    });
  };
  
  // Handle opening rename dialog
  const handleOpenRenameDialog = (e: React.MouseEvent, resume: ResumeStub) => {
    e.stopPropagation();
    setRenameDialog({
      isOpen: true,
      resumeId: resume._id,
      currentTitle: resume.title,
      newTitle: resume.title
    });
  };
  
  // Handle delete resume
  const handleDeleteResume = async () => {
    try {
      setIsDeleting(true);
      await resumeAPI.deleteResume(deleteDialog.resumeId);
      
      // Close dialog
      setDeleteDialog({ isOpen: false, resumeId: "", resumeTitle: "" });
      
      // Refetch resumes to update the list
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      
      // Show success message
      toast({
        title: "Resume deleted",
        description: `"${deleteDialog.resumeTitle}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle rename resume
  const handleRenameResume = async () => {
    // Validate new title
    if (!renameDialog.newTitle.trim()) {
      toast({
        title: "Error",
        description: "Resume title cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsRenaming(true);
      
      // First get the full resume data
      const resumeData = await resumeAPI.getResumeById(renameDialog.resumeId);
      
      // Update only the title
      const updatedData = {
        title: renameDialog.newTitle,
        template: resumeData.template,
        data: resumeData.data,
        sections: resumeData.sections
      };
      
      // Call the API to update
      await resumeAPI.updateResume(renameDialog.resumeId, updatedData);
      
      // Close dialog
      setRenameDialog({
        isOpen: false,
        resumeId: "",
        currentTitle: "",
        newTitle: ""
      });
      
      // Refetch resumes to update the list
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      
      // Show success message
      toast({
        title: "Resume renamed",
        description: `Resume has been renamed to "${renameDialog.newTitle}".`,
      });
    } catch (error) {
      console.error('Error renaming resume:', error);
      toast({
        title: "Error",
        description: "Failed to rename resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRenaming(false);
    }
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
              // Find the template metadata for this resume
              const template = templateMetadatas.find(t => t.id === resume.templateId);
              
              return (
                <Card 
                  key={resume._id} 
                  className="overflow-hidden transition-all hover:shadow-md flex flex-col"
                >
                  <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg truncate mr-2" title={resume.title}>{resume.title}</CardTitle>
                      <div className="flex space-x-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => handleOpenRenameDialog(e, resume)}
                          title="Rename resume"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => handleOpenDeleteDialog(e, resume)}
                          title="Delete resume"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="mt-1 text-xs"> 
                      Last updated: {new Date(resume.updatedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-4 pb-2 flex-grow flex flex-col justify-end"> 
                  </CardContent>
                  
                  <CardFooter className="border-t bg-muted/10 p-2 gap-1 justify-end"> 
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center"
                      onClick={() => handleSelectResume(resume._id)}
                    >
                       Open
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
          if (!open) setDeleteDialog(prev => ({ ...prev, isOpen: false }));
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Resume</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{deleteDialog.resumeTitle}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="outline" disabled={isDeleting}>Cancel</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={handleDeleteResume} 
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Resume"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Rename Dialog */}
        <Dialog open={renameDialog.isOpen} onOpenChange={(open) => {
          if (!open) setRenameDialog(prev => ({ ...prev, isOpen: false }));
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Resume</DialogTitle>
              <DialogDescription>
                Change the name of your resume. This name will be used when exporting to PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="resume-title" className="mb-2 block">Resume Title</Label>
              <Input 
                id="resume-title" 
                value={renameDialog.newTitle} 
                onChange={(e) => setRenameDialog(prev => ({ ...prev, newTitle: e.target.value }))}
                placeholder="Enter resume title" 
                className="mb-4"
                autoFocus
              />
            </div>
            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button variant="outline" disabled={isRenaming}>Cancel</Button>
              </DialogClose>
              <Button 
                variant="default" 
                onClick={handleRenameResume} 
                disabled={isRenaming}
              >
                {isRenaming ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyResumes; 