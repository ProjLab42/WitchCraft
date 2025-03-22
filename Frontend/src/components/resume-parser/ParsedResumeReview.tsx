import React from 'react';
import { useResumeParser } from './ResumeParserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight, ChevronDown, FileType } from 'lucide-react';
import { ParsingStatus } from '@/types/resume-parser';
import { ParsedPersonalInfoSection } from './sections/ParsedPersonalInfoSection';
import { ParsedExperienceSection } from './sections/ParsedExperienceSection';
import { ParsedEducationSection } from './sections/ParsedEducationSection';
import { ParsedSkillsSection } from './sections/ParsedSkillsSection';
import { ParsedProjectsSection } from './sections/ParsedProjectsSection';
import { ParsedCertificationsSection } from './sections/ParsedCertificationsSection';
import { ATSIndustryStandardDisplay } from './ATSIndustryStandardDisplay';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ParsedResumeReviewProps {
  onComplete: () => void;
}

export const ParsedResumeReview: React.FC<ParsedResumeReviewProps> = ({ onComplete }) => {
  const { 
    parsedResume, 
    parsingStatus, 
    selectAllItems, 
    deselectAllItems, 
    saveSelectedItems,
    atsScore,
    atsRawAnalysis
  } = useResumeParser();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('personal-info');
  const [saving, setSaving] = React.useState(false);
  const [showCompletionOptions, setShowCompletionOptions] = React.useState(false);
  
  // Handle save and complete
  const handleSaveAndComplete = async () => {
    setSaving(true);
    try {
      const success = await saveSelectedItems();
      if (success) {
        setShowCompletionOptions(true);
        toast.success('Resume data saved successfully!');
      }
    } catch (error) {
      console.error('Error saving items:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to save resume data. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'You need to be logged in to save resume data.';
        } else if (error.response?.status === 500) {
          if (error.response.data?.error?.includes('duplicate key error')) {
            errorMessage = 'Email already exists. Please use a different email.';
          } else {
            errorMessage = error.response.data?.message || 'Server error. Please try again later.';
          }
        } else if (!error.response) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle navigation after completion
  const handleNavigation = (destination: string) => {
    onComplete();
    if (destination === '/profile') {
      navigate(destination, { state: { fromResumeParser: true } });
    } else {
      navigate(destination);
    }
  };

  // Render loading state
  if (parsingStatus === ParsingStatus.UPLOADING || parsingStatus === ParsingStatus.PARSING) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Processing Your Resume</CardTitle>
          <CardDescription>
            {parsingStatus === ParsingStatus.UPLOADING 
              ? 'Uploading and analyzing document format...' 
              : 'Extracting content and evaluating ATS compatibility...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {parsingStatus === ParsingStatus.UPLOADING 
              ? 'Your file is being analyzed for ATS compatibility' 
              : 'Our AI is extracting information from your resume'}
          </p>
          {atsRawAnalysis && (
            <div className="mt-6 text-center">
              <p className="font-medium">Document format analysis complete!</p>
              <p className="text-sm text-muted-foreground">Now extracting resume content...</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (parsingStatus === ParsingStatus.ERROR) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Processing Error</CardTitle>
          <CardDescription>
            We encountered an error while processing your resume
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <p className="text-muted-foreground mb-6">
            Please try uploading your resume again or use a different file format
          </p>
          <Button onClick={onComplete}>Try Again</Button>
          
          {/* Show format analysis even if content parsing failed */}
          {atsRawAnalysis && (
            <div className="mt-6 w-full max-w-3xl">
              <p className="font-medium text-center mb-4">Document Format Analysis Results:</p>
              <ATSIndustryStandardDisplay analysisResult={atsRawAnalysis} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render when no data
  if (!parsedResume) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>No Resume Data</CardTitle>
          <CardDescription>
            No resume data is available for review
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            Please upload a resume to continue
          </p>
          <Button onClick={onComplete}>Back to Upload</Button>
          
          {/* Show format analysis even if content parsing failed */}
          {atsRawAnalysis && (
            <div className="mt-6 w-full max-w-3xl">
              <p className="font-medium text-center mb-4">Document Format Analysis Results:</p>
              <ATSIndustryStandardDisplay analysisResult={atsRawAnalysis} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render completion options
  if (showCompletionOptions) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Resume Data Saved!</CardTitle>
          <CardDescription>
            Your selected resume information has been added to your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
          <p className="text-muted-foreground mb-8">
            What would you like to do next?
          </p>
          <div className="flex flex-col gap-4 w-full max-w-md">
            <Button onClick={() => handleNavigation('/')}>
              Return to Home
            </Button>
            <Button onClick={() => handleNavigation('/profile')} variant="outline">
              View Your Profile
            </Button>
            <Button onClick={() => handleNavigation('/create')} variant="outline">
              Create a Resume
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate section counts
  const selectedCounts = {
    experience: parsedResume.experience.filter(item => item.selected).length,
    education: parsedResume.education.filter(item => item.selected).length,
    skills: parsedResume.skills.filter(item => item.selected).length,
    projects: parsedResume.projects.filter(item => item.selected).length,
    certifications: parsedResume.certifications.filter(item => item.selected).length
  };

  const totalCounts = {
    experience: parsedResume.experience.length,
    education: parsedResume.education.length,
    skills: parsedResume.skills.length,
    projects: parsedResume.projects.length,
    certifications: parsedResume.certifications.length
  };

  // Render review UI
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Review Parsed Resume</CardTitle>
            <CardDescription>
              Review and edit the information extracted from your resume
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectAllItems}
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={deselectAllItems}
            >
              Deselect All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* ATS Evaluation Section */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
              <TabsTrigger value="personal-info" className="relative">
                Personal Info
                {parsedResume.personalInfo.selected && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3" />
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="experience" className="relative">
                Experience
                {selectedCounts.experience > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {selectedCounts.experience}/{totalCounts.experience}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="education" className="relative">
                Education
                {selectedCounts.education > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {selectedCounts.education}/{totalCounts.education}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="skills" className="relative">
                Skills
                {selectedCounts.skills > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {selectedCounts.skills}/{totalCounts.skills}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="projects" className="relative">
                Projects
                {selectedCounts.projects > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {selectedCounts.projects}/{totalCounts.projects}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="certifications" className="relative">
                Certifications
                {selectedCounts.certifications > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2">
                    {selectedCounts.certifications}/{totalCounts.certifications}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="border rounded-md p-4 mb-4">
              <TabsContent value="personal-info" className="mt-0">
                <ParsedPersonalInfoSection />
              </TabsContent>
              <TabsContent value="experience" className="mt-0">
                <ParsedExperienceSection />
              </TabsContent>
              <TabsContent value="education" className="mt-0">
                <ParsedEducationSection />
              </TabsContent>
              <TabsContent value="skills" className="mt-0">
                <ParsedSkillsSection />
              </TabsContent>
              <TabsContent value="projects" className="mt-0">
                <ParsedProjectsSection />
              </TabsContent>
              <TabsContent value="certifications" className="mt-0">
                <ParsedCertificationsSection />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        {/* ATS Score section */}
        {parsedResume.personalInfo && (
          <div>
            <h3 className="font-semibold text-lg mb-4">ATS Compatibility Analysis</h3>
            {atsRawAnalysis && <ATSIndustryStandardDisplay analysisResult={atsRawAnalysis} />}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onComplete}>
          Cancel
        </Button>
        <Button 
          onClick={handleSaveAndComplete} 
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>Save Selected Items</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}; 