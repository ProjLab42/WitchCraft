import React, { useState } from 'react';
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

export default function AIFeatures() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generate');
  
  // Generate Resume state
  const [jobDescriptionForGenerate, setJobDescriptionForGenerate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Tune Resume state
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescriptionForTune, setJobDescriptionForTune] = useState('');
  const [isTuning, setIsTuning] = useState(false);
  
  // Combined features state
  const [selectedResumeIdForCombined, setSelectedResumeIdForCombined] = useState('');
  const [jobDescriptionForCombined, setJobDescriptionForCombined] = useState('');
  const [isCombining, setIsCombining] = useState(false);
  
  // Mock resumes data (to be replaced with real API data)
  const mockResumes = [
    { _id: '1', title: 'Software Engineer Resume' },
    { _id: '2', title: 'Product Manager Resume' },
    { _id: '3', title: 'UX Designer Resume' },
  ];
  
  // Handle generate resume
  const handleGenerateResume = async () => {
    if (!jobDescriptionForGenerate) {
      alert('Please enter a job description');
      return;
    }
    
    try {
      setIsGenerating(true);
      // In a real implementation, this would call an API
      console.log('Generating resume based on job description:', jobDescriptionForGenerate);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Resume generated successfully!');
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsGenerating(false);
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
                <div className="space-y-2">
                  <Label htmlFor="job-description-generate">Job Description</Label>
                  <Textarea
                    id="job-description-generate"
                    placeholder="Paste the job description here to help the AI tailor your resume"
                    className="min-h-[200px]"
                    value={jobDescriptionForGenerate}
                    onChange={(e) => setJobDescriptionForGenerate(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateResume} 
                  disabled={isGenerating || !jobDescriptionForGenerate}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Resume
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
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
                    disabled={isTuning}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResumes.map((resume) => (
                        <SelectItem key={resume._id} value={resume._id}>
                          {resume.title}
                        </SelectItem>
                      ))}
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
                    disabled={isCombining}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume or leave empty to create from profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockResumes.map((resume) => (
                        <SelectItem key={resume._id} value={resume._id}>
                          {resume.title}
                        </SelectItem>
                      ))}
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