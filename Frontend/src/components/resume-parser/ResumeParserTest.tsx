import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { testResumeParserConnection, parseResumeFile } from '@/services/resume-parser.service';
import { ParsedResume } from '@/types/resume-parser';

/**
 * Component to test the resume parser functionality
 */
export const ResumeParserTest: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await testResumeParserConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Error checking connection:', error);
        setConnectionStatus('disconnected');
      }
    };

    checkConnection();
  }, []);

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Handle file upload and parsing
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setParsedData(null);
      setIsMockData(false);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsUploading(false);
      setIsParsing(true);

      // Get original file name for comparison
      const originalFileName = file.name;

      // Parse the resume
      const startTime = Date.now();
      const data = await parseResumeFile(file);
      const endTime = Date.now();
      
      // Check if we got mock data (by checking if parsing was too fast or if the name matches mockUser)
      const parsingTime = endTime - startTime;
      const isMock = parsingTime < 500 || data.personalInfo.name === 'John Doe';
      
      setIsMockData(isMock);
      setParsedData(data);
    } catch (error) {
      console.error('Error uploading and parsing resume:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Resume Parser Test</CardTitle>
        <CardDescription>
          Test the resume parser functionality to ensure it's working correctly
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Connection Status</h3>
          {connectionStatus === 'checking' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <AlertTitle>Checking connection...</AlertTitle>
              <AlertDescription>
                Verifying connection to the resume parser service
              </AlertDescription>
            </Alert>
          )}
          {connectionStatus === 'connected' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <AlertTitle className="text-green-700">Connected</AlertTitle>
              <AlertDescription className="text-green-600">
                Successfully connected to the resume parser service
              </AlertDescription>
            </Alert>
          )}
          {connectionStatus === 'disconnected' && (
            <Alert className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
              <AlertTitle className="text-red-700">Disconnected</AlertTitle>
              <AlertDescription className="text-red-600">
                Could not connect to the resume parser service. The test will use mock data.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="resume-file" className="block mb-2">
            Select a resume file (PDF or DOCX)
          </Label>
          <div className="flex gap-2">
            <Input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              disabled={isUploading || isParsing}
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || isParsing}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing
                </>
              ) : (
                'Upload & Parse'
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
            <AlertTitle className="text-red-700">Error</AlertTitle>
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {/* Parsed Data */}
        {parsedData && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Parsing Results</h3>
            
            {isMockData && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <AlertTitle className="text-amber-700">Using Mock Data</AlertTitle>
                <AlertDescription className="text-amber-600">
                  The parser is using mock data instead of actually parsing your resume.
                  This could be because the backend service is not available or there was an error.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border p-4 space-y-4">
              <div>
                <h4 className="font-medium">Personal Information</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p>{parsedData.personalInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <p>{parsedData.personalInfo.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Title:</span>
                    <p>{parsedData.personalInfo.title}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Sections</h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Experience:</span>
                    <p>{parsedData.experience.length} items</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Education:</span>
                    <p>{parsedData.education.length} items</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Skills:</span>
                    <p>{parsedData.skills.length} items</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Projects:</span>
                    <p>{parsedData.projects.length} items</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Sample Data</h4>
                <div className="mt-2 space-y-2">
                  {parsedData.experience.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">First Experience:</span>
                      <p className="text-sm">{parsedData.experience[0].company} - {parsedData.experience[0].title}</p>
                    </div>
                  )}
                  {parsedData.skills.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">First Skill:</span>
                      <p className="text-sm">{parsedData.skills[0].name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          <FileText className="inline-block mr-1 h-4 w-4" />
          {file ? `Selected file: ${file.name}` : 'No file selected'}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ResumeParserTest; 