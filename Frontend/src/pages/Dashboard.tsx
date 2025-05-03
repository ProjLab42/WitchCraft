import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Plus, Download, Edit, Trash, Upload, PlusCircle, Sparkles, Trash2, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeAPI } from '@/services/api.service';
import { TemplateMetadata, templateService } from "@/services/template.service";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface matching the data returned by resumeAPI.getResumes
interface ResumeStub {
  _id: string;
  title: string;
  updatedAt: string;
  template?: string; // Optional template ID
}

// Add state interfaces from MyResumes
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

export default function Dashboard() {
  // Add hooks and state from MyResumes
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Fetch all resume stubs using react-query
  const { 
    data: allResumes, 
    isLoading: isLoadingResumes, 
    error: errorResumes 
  } = useQuery<ResumeStub[], Error>({
    queryKey: ['userResumes'], // Use the same key as MyResumes for caching
    queryFn: resumeAPI.getResumes, 
  });

  // TODO: Optionally fetch template metadata if needed for display
  // const { data: templates, isLoading: isLoadingTemplates } = useQuery<TemplateMetadata[]>(...);

  // Process data: sort by date and get the latest 3
  const latestResumes = allResumes
    ?.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    ?.slice(0, 3) || [];

  // Combined loading state (consider template loading if added)
  const isLoading = isLoadingResumes; // || isLoadingTemplates;
  const error = errorResumes; // Combine errors if needed

  // --- Add handlers from MyResumes ---
  
  const handleSelectResume = (id: string) => {
    // Navigate using query parameter
    navigate(`/editor?resumeId=${id}`); 
  };
  
  // Handle opening delete confirmation
  const handleOpenDeleteDialog = (e: React.MouseEvent, resume: ResumeStub) => {
    e.stopPropagation(); 
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
      setDeleteDialog({ isOpen: false, resumeId: "", resumeTitle: "" });
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      // Use toast object format
      toast({
        title: "Resume deleted",
        description: `"${deleteDialog.resumeTitle}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      // Use toast object format
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
    if (!renameDialog.newTitle.trim()) {
      // Use toast object format
      toast({
        title: "Error",
        description: "Resume title cannot be empty.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsRenaming(true);
      const resumeData = await resumeAPI.getResumeById(renameDialog.resumeId);
      const updatedData = {
        title: renameDialog.newTitle,
        template: resumeData.template,
        data: resumeData.data,
        sections: resumeData.sections
      };
      await resumeAPI.updateResume(renameDialog.resumeId, updatedData);
      
      setRenameDialog({ isOpen: false, resumeId: "", currentTitle: "", newTitle: "" });
      queryClient.invalidateQueries({ queryKey: ['userResumes'] });
      // Use toast object format
      toast({
        title: "Resume renamed",
        description: `Resume has been renamed to "${renameDialog.newTitle}".`,
      });
    } catch (error) {
      console.error('Error renaming resume:', error);
      // Use toast object format
      toast({
        title: "Error",
        description: "Failed to rename resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRenaming(false);
    }
  };
  
  // --- End Handlers from MyResumes ---

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
                <Link to="/templates">
                  <Plus className="h-4 w-4" />
                  <span>New Resume</span>
                </Link>
              </Button>
            </div>
          </div>
          
          {/* AI Features Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI Resume Tools
              </CardTitle>
              <CardDescription>
                Use AI to generate tailored resumes based on your profile and job descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Our AI can analyze job descriptions and create optimized resumes that highlight your
                most relevant skills and experiences, increasing your chances of getting interviews.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link to="/ai-features">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI Resume Builder
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent Resumes Section Title + View All Link */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recent Resumes</h2>
            <Button variant="link" asChild className="text-primary">
              <Link to="/my-resumes">View All</Link>
            </Button>
          </div>
          
          {/* Loading State */}
          {isLoading && (
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="bg-muted/30 pb-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                  <CardFooter className="border-t bg-muted/10 p-3 gap-2">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-8 w-1/4" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error Loading Resumes</AlertTitle>
              <AlertDescription>
                Could not load recent resumes. Please try again later.
                {/* Optionally add a retry button here */}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Display Latest Resumes - USE MyResumes CARD STRUCTURE */}
          {!isLoading && !error && latestResumes.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestResumes.map((resume) => (
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
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.open(`/preview/${resume._id}`, '_blank'); 
                          }}
                          title="Preview resume"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => handleOpenRenameDialog(e, resume)} // Use dashboard handler
                          title="Rename resume"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={(e) => handleOpenDeleteDialog(e, resume)} // Use dashboard handler
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
                  
                  <CardContent className="pt-4 pb-2 flex-grow flex flex-col justify-end" /> 
                  
                  <CardFooter className="border-t bg-muted/10 p-2 gap-1 justify-end"> 
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-center" 
                      onClick={() => handleSelectResume(resume._id)} // Use dashboard handler
                    >
                       Open
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State (if no resumes exist at all) */}
          {!isLoading && !error && latestResumes.length === 0 && (
            <div className="text-center py-10 border rounded-lg shadow-sm bg-card text-card-foreground">
              <h2 className="text-xl font-semibold mb-2">No Resumes Yet!</h2>
              <p className="text-muted-foreground mb-4">Create your first resume to see it here.</p>
              <Button asChild>
                 <Link to="/templates">
                   <PlusCircle className="mr-2 h-4 w-4" /> Create New Resume
                 </Link>
               </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Add Dialogs from MyResumes */}
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
              onClick={handleDeleteResume} // Use dashboard handler
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
              onClick={handleRenameResume} // Use dashboard handler
              disabled={isRenaming}
            >
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
