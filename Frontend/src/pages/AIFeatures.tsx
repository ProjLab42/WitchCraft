import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, FileText, Zap, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { aiAPI, GenerateResumeResponse } from "@/services/ai.service";
import { resumeAPI } from "@/services/api.service";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define Resume type
interface Resume {
  _id: string;
  title: string;
  data?: any;
  sections?: any;
}

export default function AIFeatures() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate');
  
  // Generate Resume state
  const [jobDescriptionForGenerate, setJobDescriptionForGenerate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<GenerateResumeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Tune Resume state
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescriptionForTune, setJobDescriptionForTune] = useState('');
  const [isTuning, setIsTuning] = useState(false);
  
  // Combined features state
  const [selectedResumeIdForCombined, setSelectedResumeIdForCombined] = useState('');
  const [jobDescriptionForCombined, setJobDescriptionForCombined] = useState('');
  const [isCombining, setIsCombining] = useState(false);
  
  // Resume list state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  
  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoadingResumes(true);
        const data = await resumeAPI.getResumes();
        setResumes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching resumes:', error);
        setResumes([]);
        toast({
          title: "Warning",
          description: "Could not load your resumes. You can still generate a new resume.",
          variant: "destructive"
        });
      } finally {
        setLoadingResumes(false);
      }
    };
    
    fetchResumes();
  }, []);
  
  // Handle generate resume
  const handleGenerateResume = async () => {
    if (!jobDescriptionForGenerate) {
      toast({
        title: "Input required",
        description: "Please enter a job description",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedResume(null);
      
      console.log('Generating resume for job description...');
      
      // Call the AI API to generate a resume
      const generatedData = await aiAPI.generateResumeFromProfile(jobDescriptionForGenerate);
      
      console.log('Resume generated. Response:', generatedData);
      
      // Check if there was an error
      if (generatedData.error) {
        throw new Error(generatedData.error);
      }
      
      // Validate the response
      if (!generatedData || !generatedData.resumeData) {
        throw new Error("Invalid response from AI service");
      }
      
      setGeneratedResume(generatedData);
      
      // Navigate to the editor with the generated resume data
      navigate('/editor', { 
        state: { 
          generatedResume: generatedData,
          isNewResume: true
        } 
      });
      
      toast({
        title: "Success!",
        description: "Resume generated successfully. You can now edit it in the editor.",
      });
      
    } catch (error: any) {
      console.error('Error generating resume:', error);
      
      // Special handling for network errors
      if (error.message === 'Network Error') {
        setError("Cannot connect to the server. Please check your internet connection or try again later.");
        toast({
          title: "Connection Error",
          description: "Cannot connect to the server. Please check if the backend server is running.",
          variant: "destructive"
        });
      } else {
        setError(error.message || "Failed to generate resume. Please try again.");
        toast({
          title: "Error",
          description: error.message || "Failed to generate resume. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Save generated resume to user account
  const saveGeneratedResume = async () => {
    if (!generatedResume) return;
    
    try {
      const resumeData = {
        title: `AI Generated Resume - ${new Date().toLocaleDateString()}`,
        data: {
          name: "", // This will be populated from user profile
          summary: generatedResume.resumeData.summary || "",
        },
        sections: generatedResume.resumeData.sections
      };
      
      const savedResume = await resumeAPI.createResume(resumeData);
      
      toast({
        title: "Resume saved!",
        description: "Your AI-generated resume has been saved to your account."
      });
      
      // Navigate to the editor to further customize the resume
      navigate(`/editor/${savedResume._id}`);
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error",
        description: "Failed to save the resume. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle tune resume
  const handleTuneResume = async () => {
    if (!selectedResumeId) {
      alert('Please select a resume');
      return;
    }
    
    if (!jobDescriptionForTune) {
      alert('Please enter a job description');
      return;
    }
    
    try {
      setIsTuning(true);
      // In a real implementation, this would call an API
      console.log('Tuning resume:', selectedResumeId);
      console.log('Based on job description:', jobDescriptionForTune);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Resume tuned successfully!');
    } catch (error) {
      console.error('Error tuning resume:', error);
      alert('Failed to tune resume. Please try again.');
    } finally {
      setIsTuning(false);
    }
  };
  
  // Handle combined operation
  const handleCombinedOperation = async () => {
    if (!selectedResumeIdForCombined && !jobDescriptionForCombined) {
      alert('Please select a resume and enter a job description');
      return;
    }
    
    try {
      setIsCombining(true);
      // In a real implementation, this would call an API
      console.log('Performing combined operation');
      console.log('Resume ID (optional):', selectedResumeIdForCombined);
      console.log('Job description:', jobDescriptionForCombined);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert('Operation completed successfully!');
    } catch (error) {
      console.error('Error in combined operation:', error);
      alert('Operation failed. Please try again.');
    } finally {
      setIsCombining(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Sparkles className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">AI Resume Tools</h1>
        </div>
        
        <p className="text-muted-foreground mb-8">
          Leverage the power of AI to create, optimize, and customize your resume for specific job opportunities.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate from Profile</TabsTrigger>
            <TabsTrigger value="tune">Tune Existing Resume</TabsTrigger>
            <TabsTrigger value="combined">Smart Resume Builder</TabsTrigger>
          </TabsList>
          
          {/* Generate Resume Tab */}
          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Resume from Your Profile</CardTitle>
                <CardDescription>
                  Our AI will create a tailored resume using information from your profile,
                  optimized specifically for the job you're applying to.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="job-description-generate">Job Description</Label>
                  <Textarea
                    id="job-description-generate"
                    placeholder="Paste the job description here..."
                    rows={6}
                    value={jobDescriptionForGenerate}
                    onChange={(e) => setJobDescriptionForGenerate(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('tune')}>
                  Use Existing Resume Instead
                </Button>
                <Button onClick={handleGenerateResume} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {generatedResume && generatedResume.resumeData && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Generated Resume</CardTitle>
                  <CardDescription>
                    Your AI-generated resume is ready! You can save it to your account and customize it further.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedResume.resumeData.summary && (
                    <div>
                      <h3 className="font-medium mb-2">Summary</h3>
                      <p className="text-sm">{generatedResume.resumeData.summary}</p>
                    </div>
                  )}
                  
                  {generatedResume.resumeData.sections?.experience?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Experience</h3>
                      <div className="space-y-3">
                        {generatedResume.resumeData.sections.experience.map((exp, index) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="font-medium">{exp.title} at {exp.company}</p>
                            <p className="text-sm text-muted-foreground">{exp.period}</p>
                            <p className="text-sm mt-1">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {generatedResume.resumeData.sections?.skills?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedResume.resumeData.sections.skills.map((skill, index) => (
                          <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                            {skill.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Projects Section */}
                  {generatedResume.resumeData.sections?.projects?.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Projects</h3>
                      <div className="space-y-3">
                        {generatedResume.resumeData.sections.projects.map((project, index) => (
                          <div key={index} className="border p-3 rounded-md">
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground">{project.period}</p>
                            <p className="text-sm mt-1">{project.description}</p>
                            {project.technologies && (
                              <p className="text-sm mt-1"><span className="font-medium">Technologies:</span> {project.technologies}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Sections */}
                  {generatedResume.resumeData.sections?.customSections && 
                   Object.keys(generatedResume.resumeData.sections.customSections).length > 0 && (
                    <div className="space-y-4">
                      {Object.entries(generatedResume.resumeData.sections.customSections).map(([key, items]) => (
                        <div key={key}>
                          <h3 className="font-medium mb-2">{key}</h3>
                          <div className="space-y-3">
                            {Array.isArray(items) && items.map((item, index) => (
                              <div key={index} className="border p-3 rounded-md">
                                {item.name && <p className="font-medium">{item.name}</p>}
                                {item.title && <p className="font-medium">{item.title}</p>}
                                {item.period && <p className="text-sm text-muted-foreground">{item.period}</p>}
                                {item.description && <p className="text-sm mt-1">{item.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Debug Section - for development only */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-4 border-t">
                      <h3 className="font-medium mb-2">Debug Info</h3>
                      <p className="text-xs text-muted-foreground">Available sections: {Object.keys(generatedResume.resumeData.sections).join(', ')}</p>
                      {generatedResume.resumeData.sections.projects && (
                        <p className="text-xs text-muted-foreground">
                          Projects count: {generatedResume.resumeData.sections.projects.length}
                        </p>
                      )}
                      {generatedResume.resumeData.sections.customSections && (
                        <p className="text-xs text-muted-foreground">
                          Custom sections: {Object.keys(generatedResume.resumeData.sections.customSections).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={saveGeneratedResume} className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Save Resume & Customize
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          {/* Tune Resume Tab */}
          <TabsContent value="tune">
            <Card>
              <CardHeader>
                <CardTitle>Tune Existing Resume</CardTitle>
                <CardDescription>
                  Select one of your existing resumes and our AI will optimize it for the specific job
                  description you provide, highlighting relevant skills and experiences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume-select">Select Resume</Label>
                  <Select
                    value={selectedResumeId}
                    onValueChange={setSelectedResumeId}
                    disabled={isTuning || loadingResumes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingResumes ? "Loading resumes..." : "Select a resume"} />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes && resumes.length > 0 ? (
                        resumes.map((resume) => (
                          <SelectItem key={resume._id} value={resume._id}>
                            {resume.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-resumes" disabled>
                          No resumes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job-description-tune">Job Description</Label>
                  <Textarea
                    id="job-description-tune"
                    placeholder="Paste the job description here"
                    className="min-h-[200px]"
                    value={jobDescriptionForTune}
                    onChange={(e) => setJobDescriptionForTune(e.target.value)}
                    disabled={isTuning}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleTuneResume} 
                  disabled={isTuning || !selectedResumeId || !jobDescriptionForTune}
                  className="w-full"
                >
                  {isTuning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tuning...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Tune Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Combined Features Tab */}
          <TabsContent value="combined">
            <Card>
              <CardHeader>
                <CardTitle>Smart Resume Builder</CardTitle>
                <CardDescription>
                  The ultimate AI resume tool that combines the best of both worlds. Optionally select an existing resume,
                  provide a job description, and our AI will either enhance your existing resume or create a new one based 
                  on your profile, whichever produces the best results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resume-select-combined">
                    Select Resume (Optional)
                  </Label>
                  <Select
                    value={selectedResumeIdForCombined}
                    onValueChange={setSelectedResumeIdForCombined}
                    disabled={isCombining || loadingResumes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingResumes ? "Loading resumes..." : "Select a resume or leave empty to create from profile"} />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes && resumes.length > 0 ? (
                        resumes.map((resume) => (
                          <SelectItem key={resume._id} value={resume._id}>
                            {resume.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-resumes" disabled>
                          No resumes available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    If you don't select a resume, one will be generated from your profile information.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="job-description-combined">Job Description</Label>
                  <Textarea
                    id="job-description-combined"
                    placeholder="Paste the job description here"
                    className="min-h-[200px]"
                    value={jobDescriptionForCombined}
                    onChange={(e) => setJobDescriptionForCombined(e.target.value)}
                    disabled={isCombining}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleCombinedOperation} 
                  disabled={isCombining || !jobDescriptionForCombined}
                  className="w-full"
                >
                  {isCombining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Smart Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
} 