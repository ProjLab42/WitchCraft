import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resumeAPI, ApiResumeData } from '@/services/api.service';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { Loader2, AlertCircle, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// A4 dimensions in mm (approximate for styling)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const ResumePreviewPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();

  const { 
    data: resumeData, 
    isLoading, 
    error 
  } = useQuery<ApiResumeData, Error>({
    queryKey: ['publicResume', resumeId],
    queryFn: () => resumeAPI.getPublicResumeById(resumeId!),
    enabled: !!resumeId,
    retry: false,
  });

  if (isLoading) {
    return (
      // Keep loading centered on a basic page
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      // Keep error centered
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Preview</h2>
        <p className="text-muted-foreground mb-4 text-center">
          {error?.message || 'Could not load the resume data. It might be deleted or the link is invalid.'}
        </p>
        {/* Button hidden on print via CSS */}
        <Button variant="outline" onClick={() => window.close()} className="no-print">
          Close Tab
        </Button>
      </div>
    );
  }

  // Log the raw sections data received from API
  console.log("Raw API resumeData.sections:", resumeData.sections);

  // Construct formData with correct mapping
  const formDataForPreview = {
    ...(resumeData.data),
    // Map experience array
    experiences: resumeData.sections?.experience?.map(exp => {
      return {
        ...exp, // Pass through all original fields including description and bulletPoints
        position: exp.title, // Map title to position
        // Ensure required fields are present even if not in ...exp (though they should be)
        company: exp.company,
        period: exp.period,
      };
    }),
    // Map education array, ensuring year and description are included
    education: resumeData.sections?.education?.map(edu => ({
      ...edu,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      year: edu.year, // Use year from model
      description: edu.description,
      bulletPoints: edu.bulletPoints, // Explicitly include bulletPoints
    })),
    // Format skills array to string
    skills: resumeData.sections?.skills?.map(skill => skill.name).join(', ') || undefined,
    // Map projects array, ensuring all relevant fields are included
    projects: resumeData.sections?.projects?.map(proj => ({
      ...proj, // Pass through all original fields including description and bulletPoints
      // Map specific fields if needed, ensure bulletPoints comes through
      name: proj.name,
      role: proj.role,
      period: proj.period,
      url: proj.url,
      github: proj.github,
    })),
    // Pass the full certifications array instead of joining names
    certifications: resumeData.sections?.certifications?.map(cert => ({
      ...cert // Pass all fields from the API response
    })) || undefined, // Changed from certificates to certifications
  };

  // Log the final mapped data being passed to ResumePreview
  console.log("Mapped formDataForPreview:", formDataForPreview);

  // Get sectionOrder from resumeData, provide default if missing
  const sectionOrder = resumeData.sectionOrder && resumeData.sectionOrder.length > 0
    ? resumeData.sectionOrder
    : ['experience', 'education', 'skills', 'projects', 'certifications']; // Default order

  // --- Function to copy link --- 
  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link: ', err);
      toast.error('Failed to copy link.');
    }
  };

  return (
    // Main container: Use white background to match page, remove print:bg-white as it's default now
    <div className="preview-page-container bg-white">
      {/* Action Buttons */}
      <div className="fixed top-4 right-4 no-print flex gap-2"> 
        {/* Share Button */}
        <Button variant="outline" onClick={handleShareLink}> 
          <Share2 className="mr-2 h-4 w-4" />
          Share Link
        </Button>
        {/* Download/Print Button */}
        <Button onClick={() => window.print()}> 
          <Printer className="mr-2 h-4 w-4" />
          Download / Print
        </Button>
      </div>

      {/* A4 Page container: Remove shadow and explicit bg-white, keep dimensions and centering */}
      <div 
        className="a4-page mx-auto my-4 print:shadow-none print:m-0" // Removed bg-white, shadow-lg
        style={{
          width: `${A4_WIDTH_MM}mm`, 
          minHeight: `${A4_HEIGHT_MM}mm`,
          boxSizing: 'border-box',
        }}
      >
        {/* ResumePreview already has p-8 for internal padding */}
        <ResumePreview formData={formDataForPreview} sectionOrder={sectionOrder} />
      </div>

      {/* Add CSS for print styling using standard style tag */}
      <style>
        {`
          @media print {
            body, .preview-page-container {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important; 
            }
            .a4-page {
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              width: 100% !important;
              min-height: 100% !important;
              page-break-after: always !important; 
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ResumePreviewPage; 