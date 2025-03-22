import React, { useState } from 'react';
import { ATSSectionDefinitions, ATSScoreExplanations, RawATSAnalysisResult } from '@/services/ats-industry-standard.service';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, AlertTriangle, FileText, Info, Layout, Type, Database, 
  CheckCircle, AlertCircle, Clock, Award, Target, Zap, FileTerminal, 
  BookText, Sparkles, Brain
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ATSIndustryStandardDisplayProps {
  analysisResult: RawATSAnalysisResult;
}

export const ATSIndustryStandardDisplay: React.FC<ATSIndustryStandardDisplayProps> = ({ analysisResult }) => {
  const [showExplanations, setShowExplanations] = useState(false);
  
  // Helper functions for styling based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500 text-white";
    if (score >= 60) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Average";
    return "Poor";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <CheckCircle className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  const getCompatibilityIcon = (compatibility: 'high' | 'medium' | 'low') => {
    switch (compatibility) {
      case 'high':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getFeedbackIcon = (feedback: string) => {
    // Specific issue phrases that should always show warning triangles
    const specificIssues = [
      "Headers detected",
      "Some bullet points appear too brief",
      "Limited skills keywords detected",
      "Some special characters detected",
      "Document tracking/revision marks detected",
      "Complex section breaks detected",
      "headers detected",
      "bullet points appear too brief",
      "skills keywords detected",
      "special characters detected",
      "tracking/revision marks detected",
      "section breaks detected"
    ];
    
    // Check for specific issues first
    if (specificIssues.some(issue => feedback.includes(issue))) {
      return <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    }

    // More comprehensive check for negative feedback
    const negativePhrases = [
      "missing", "invalid", "lacks", "could use more", "use", "include", "inconsistent", 
      "poor", "improve", "avoid", "reduce", "remove", "consider", "should", "fix", 
      "error", "too many", "too few", "excessive", "insufficient", "problem", 
      "issue", "detected", "warning", "not recommended", "unclear", "confusing", 
      "complex", "difficult", "hard to", "challenging", "ineffective"
    ];
    
    // Check if feedback contains any negative phrases
    const isNegative = negativePhrases.some(phrase => 
      feedback.toLowerCase().includes(phrase)
    );
    
    // Special case adjustments
    const isPositive = 
      feedback.toLowerCase().includes("excellent") || 
      feedback.toLowerCase().includes("good use of") ||
      feedback.toLowerCase().includes("well-organized") || 
      feedback.toLowerCase().includes("clear") ||
      feedback.toLowerCase().includes("properly") ||
      feedback.toLowerCase().includes("effective") ||
      (feedback.toLowerCase().includes("detected") && 
       !feedback.toLowerCase().includes("issue") && 
       !feedback.toLowerCase().includes("header") && 
       !feedback.toLowerCase().includes("footer") &&
       !feedback.toLowerCase().includes("character") &&
       !feedback.toLowerCase().includes("tracking") &&
       !feedback.toLowerCase().includes("break")) ||
      feedback.toLowerCase().includes("all essential");
    
    // Final determination, with specific positive phrases overriding negative ones
    if (isNegative && !isPositive) {
      return <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />;
  };

  // Helper function to render feedback items in a consistent style
  const renderFeedbackItems = (items: string[]) => {
    // Filter out duplicate items
    const uniqueItems = [...new Set(items)];
    
    return (
      <div className="space-y-2 mt-3">
        {uniqueItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
            {getFeedbackIcon(item)}
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to render explanation box for a section
  const renderExplanation = (section: keyof typeof ATSSectionDefinitions) => {
    if (!showExplanations) return null;
    
    const definition = ATSSectionDefinitions[section];
    
    return (
      <div className="bg-slate-50 p-3 rounded-lg mt-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Info className="h-4 w-4 text-blue-500" />
          <h4 className="font-semibold text-sm">{definition.title}</h4>
        </div>
        <p className="text-xs mb-2">{definition.description}</p>
        <div className="text-xs font-medium text-blue-700 mb-1">Importance: {definition.importance}</div>
        <div className="text-xs font-medium mb-1">Best Practices:</div>
        <ul className="list-disc pl-4 text-xs space-y-1">
          {definition.bestPractices.map((practice, idx) => (
            <li key={idx}>{practice}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Get recommendation priority style
  const getRecommendationPriority = (recommendation: string) => {
    const lowercaseRec = recommendation.toLowerCase();
    
    if (lowercaseRec.includes("convert") || lowercaseRec.includes("restructure") || 
        lowercaseRec.includes("replace table") || lowercaseRec.includes("critical")) {
      return {
        badge: "Critical",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <Zap className="h-4 w-4 text-red-600 mr-1" />
      };
    }
    
    if (lowercaseRec.includes("improve") || lowercaseRec.includes("enhance") || 
        lowercaseRec.includes("move") || lowercaseRec.includes("simplify") ||
        lowercaseRec.includes("reduce") || lowercaseRec.includes("high")) {
      return {
        badge: "High",
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
      };
    }
    
    if (lowercaseRec.includes("consider") || lowercaseRec.includes("update") || 
        lowercaseRec.includes("ensure") || lowercaseRec.includes("medium")) {
      return {
        badge: "Medium",
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <Info className="h-4 w-4 text-blue-600 mr-1" />
      };
    }
    
    return {
      badge: "Tip",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <Info className="h-4 w-4 text-green-600 mr-1" />
    };
  };

  return (
    <Card className="w-full my-6 shadow-md border-t-4" style={{ borderTopColor: getProgressColor(analysisResult.overall).replace('bg-', '') }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              ATS Compatibility Score
            </CardTitle>
            <CardDescription>
              How well your resume performs with industry-standard Applicant Tracking Systems
            </CardDescription>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className={`text-3xl font-bold ${getScoreColor(analysisResult.overall)}`}>
              {analysisResult.overall}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(analysisResult.overall)}
              {analysisResult.scanTime && (
                <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap inline-flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {analysisResult.scanTime}s scan time
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall progress */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground mb-1">Overall ATS Compatibility</div>
          <Progress 
            value={analysisResult.overall} 
            className="h-2.5 w-full"
            indicatorClassName={getProgressColor(analysisResult.overall)}
          />
        </div>

        {/* Industry match if available */}
        {analysisResult.keywords && analysisResult.keywords.industryDetected !== "Mixed/Unclear" && (
          <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <div className="font-medium text-sm">Industry Relevance: {analysisResult.keywords.industryDetected}</div>
              <div className="text-sm text-muted-foreground">
                {analysisResult.keywords.keywordDensity > 0 && 
                  `Your resume has a ${analysisResult.keywords.keywordDensity.toFixed(1)}% relevant keyword density`}
              </div>
            </div>
          </div>
        )}

        {/* Key recommendations */}
        {analysisResult.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <Zap className="h-4 w-4 mr-1.5" />
              Key Recommendations
            </h4>
            <ul className="space-y-3">
              {analysisResult.recommendations.slice(0, 3).map((rec, i) => {
                const priority = getRecommendationPriority(rec);
                
                return (
                  <li key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    {priority.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                          {priority.badge}
                        </span>
                      </div>
                      <span className="text-sm">{rec}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Toggle explanations */}
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExplanations(!showExplanations)}
            className="text-xs"
          >
            {showExplanations ? "Hide ATS Information" : "What is ATS?"}
          </Button>
        </div>

        {showExplanations && (
          <div className="bg-slate-50 p-4 rounded-lg mt-3 mb-6 border">
            <h4 className="font-semibold mb-2">Understanding Applicant Tracking Systems (ATS)</h4>
            <p className="text-sm mb-3">
              Applicant Tracking Systems are software applications used by employers to manage job applications 
              and filter resumes. These systems scan resumes for keywords, formatting, and content relevant to 
              the job position before they reach human recruiters.
            </p>
            <h5 className="font-medium text-sm mb-1">Why ATS Compatibility Matters:</h5>
            <ul className="list-disc pl-5 text-sm space-y-1 mb-3">
              <li>75% of resumes are rejected by ATS before a human ever sees them</li>
              <li>Large companies use ATS for nearly 99% of Fortune 500 job applications</li>
              <li>Even small and mid-sized employers increasingly rely on ATS</li>
            </ul>
            <p className="text-sm">
              Our ATS analysis provides detailed feedback on how to optimize your resume for these systems, 
              increasing your chances of getting past the initial screening and landing an interview.
            </p>
          </div>
        )}

        {/* Section tabs */}
        <Tabs defaultValue="format" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="format" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Format</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-1">
              <Layout className="w-4 h-4" />
              <span>Structure</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1">
              <FileTerminal className="w-4 h-4" />
              <span>Content</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              <span>Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="readability" className="flex items-center gap-1">
              <BookText className="w-4 h-4" />
              <span>Readability</span>
            </TabsTrigger>
            <TabsTrigger value="metadata" className="flex items-center gap-1">
              <Database className="w-4 h-4" />
              <span>Metadata</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Format Tab */}
          <TabsContent value="format">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.fileFormat.score)}
                  <h3 className="font-medium">Format Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.fileFormat.score)}>
                  {analysisResult.fileFormat.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.fileFormat.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.fileFormat.score)}
              />
              
              {renderExplanation('format')}
              
              <div className="mb-3">
                <span className="font-semibold text-sm">Detected Format:</span> {analysisResult.fileFormat.detectedFormat}
                {analysisResult.fileFormat.isRecommendedFormat ? (
                  <Badge className="ml-2 bg-green-500">Recommended</Badge>
                ) : (
                  <Badge className="ml-2 bg-amber-500">Not Ideal</Badge>
                )}
              </div>
              
              {renderFeedbackItems(analysisResult.fileFormat.feedback)}
            </div>
          </TabsContent>
          
          {/* Structure Tab */}
          <TabsContent value="structure">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.documentStructure.score)}
                  <h3 className="font-medium">Structure Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.documentStructure.score)}>
                  {analysisResult.documentStructure.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.documentStructure.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.documentStructure.score)}
              />
              
              {renderExplanation('readability')}
              
              <div className="mb-3">
                <span className="font-semibold text-sm">Layout:</span> {analysisResult.documentStructure.columnLayout === 'single' ? 'Single Column' : 'Multiple Columns'}
                {analysisResult.documentStructure.columnLayout === 'single' ? (
                  <Badge className="ml-2 bg-green-500">Optimal</Badge>
                ) : (
                  <Badge className="ml-2 bg-red-500">ATS Issue</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <span>
                  <span className="font-semibold">Tables:</span> {analysisResult.documentStructure.hasTables ? (
                    <Badge className="ml-1 bg-red-500">Detected</Badge>
                  ) : (
                    <Badge className="ml-1 bg-green-500">None Detected</Badge>
                  )}
                </span>
                <span>
                  <span className="font-semibold">Headers:</span> {analysisResult.documentStructure.hasHeaders ? (
                    <Badge className="ml-1 bg-amber-500">Detected</Badge>
                  ) : (
                    <Badge className="ml-1 bg-green-500">None Detected</Badge>
                  )}
                </span>
                <span>
                  <span className="font-semibold">Footers:</span> {analysisResult.documentStructure.hasFooters ? (
                    <Badge className="ml-1 bg-amber-500">Detected</Badge>
                  ) : (
                    <Badge className="ml-1 bg-green-500">None Detected</Badge>
                  )}
                </span>
              </div>
              
              {renderFeedbackItems(analysisResult.documentStructure.feedback)}
            </div>
          </TabsContent>
          
          {/* Content Tab */}
          <TabsContent value="content">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.contentQuality.score)}
                  <h3 className="font-medium">Content Quality Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.contentQuality.score)}>
                  {analysisResult.contentQuality.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.contentQuality.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.contentQuality.score)}
              />
              
              {renderExplanation('content')}
              
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <span>
                  <span className="font-semibold">Bullet Points:</span> {analysisResult.contentQuality.hasBulletPoints ? (
                    <Badge className="ml-1 bg-green-500">Yes</Badge>
                  ) : (
                    <Badge className="ml-1 bg-red-500">No</Badge>
                  )}
                </span>
                <span>
                  <span className="font-semibold">Action Verbs:</span> {analysisResult.contentQuality.hasActionVerbs ? (
                    <Badge className="ml-1 bg-green-500">Yes</Badge>
                  ) : (
                    <Badge className="ml-1 bg-red-500">No</Badge>
                  )}
                </span>
                <span>
                  <span className="font-semibold">Metrics:</span> {analysisResult.contentQuality.hasQuantifiableResults ? (
                    <Badge className="ml-1 bg-green-500">Yes</Badge>
                  ) : (
                    <Badge className="ml-1 bg-red-500">No</Badge>
                  )}
                </span>
              </div>
              
              {analysisResult.contentQuality.detectedSections.length > 0 && (
                <div className="mb-3">
                  <span className="font-semibold text-sm">Detected Sections:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.contentQuality.detectedSections.map((section, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-100">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {renderFeedbackItems(analysisResult.contentQuality.feedback)}
            </div>
          </TabsContent>
          
          {/* Keywords Tab */}
          <TabsContent value="keywords">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.keywords.score)}
                  <h3 className="font-medium">Keyword Optimization Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.keywords.score)}>
                  {analysisResult.keywords.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.keywords.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.keywords.score)}
              />
              
              {renderExplanation('keywords')}
              
              <div className="mb-3">
                <span className="font-semibold text-sm">Industry Detection:</span> {analysisResult.keywords.industryDetected}
                {analysisResult.keywords.industryDetected !== "Mixed/Unclear" ? (
                  <Badge className="ml-2 bg-green-500">Identified</Badge>
                ) : (
                  <Badge className="ml-2 bg-amber-500">Unclear</Badge>
                )}
              </div>
              
              <div className="mb-3">
                <span className="font-semibold text-sm">Keyword Density:</span> {analysisResult.keywords.keywordDensity.toFixed(1)}%
                {analysisResult.keywords.keywordDensity >= 3 ? (
                  <Badge className="ml-2 bg-green-500">Excellent</Badge>
                ) : analysisResult.keywords.keywordDensity >= 1.5 ? (
                  <Badge className="ml-2 bg-amber-500">Average</Badge>
                ) : (
                  <Badge className="ml-2 bg-red-500">Low</Badge>
                )}
              </div>
              
              {analysisResult.keywords.detectedKeywords.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-sm">Detected Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.keywords.detectedKeywords.slice(0, 15).map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-100">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {analysisResult.keywords.industryKeywords.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-sm">Recommended Industry Keywords:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.keywords.industryKeywords
                      .filter(kw => !analysisResult.keywords.detectedKeywords.some(
                        dk => dk.toLowerCase().includes(kw.toLowerCase())
                      ))
                      .slice(0, 10)
                      .map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="border-dashed border-amber-300 bg-amber-50">
                          {keyword}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              
              {renderFeedbackItems(analysisResult.keywords.feedback)}
            </div>
          </TabsContent>
          
          {/* Readability Tab */}
          <TabsContent value="readability">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.textContent.score)}
                  <h3 className="font-medium">Readability Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.textContent.score)}>
                  {analysisResult.textContent.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.textContent.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.textContent.score)}
              />
              
              {renderExplanation('readability')}
              
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <span>
                  <span className="font-semibold">Font Types:</span> {analysisResult.textContent.fontCount}
                  {analysisResult.textContent.fontCount <= 3 ? (
                    <Badge className="ml-1 bg-green-500">Good</Badge>
                  ) : (
                    <Badge className="ml-1 bg-amber-500">Too Many</Badge>
                  )}
                </span>
                <span>
                  <span className="font-semibold">Special Chars:</span> {analysisResult.textContent.specialCharacterCount}
                  {analysisResult.textContent.specialCharacterCount <= 3 ? (
                    <Badge className="ml-1 bg-green-500">Good</Badge>
                  ) : (
                    <Badge className="ml-1 bg-amber-500">High</Badge>
                  )}
                </span>
              </div>
              
              {analysisResult.textContent.formattingIssues.length > 0 && (
                <div className="mb-3">
                  <span className="font-semibold text-sm">Formatting Issues:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {analysisResult.textContent.formattingIssues.map((issue, idx) => (
                      <Badge key={idx} variant="outline" className="bg-slate-100 text-amber-700">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {renderFeedbackItems(analysisResult.textContent.feedback)}
            </div>
          </TabsContent>
          
          {/* Metadata Tab */}
          <TabsContent value="metadata">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  {getScoreIcon(analysisResult.metadata.score)}
                  <h3 className="font-medium">Metadata Score</h3>
                </div>
                <Badge className={getBadgeColor(analysisResult.metadata.score)}>
                  {analysisResult.metadata.score}%
                </Badge>
              </div>
              
              <Progress 
                value={analysisResult.metadata.score}
                className="h-2 mb-4"
                indicatorClassName={getProgressColor(analysisResult.metadata.score)}
              />
              
              <div className="mb-3">
                <span className="font-semibold text-sm">Proper Metadata:</span> {analysisResult.metadata.hasProperMetadata ? (
                  <Badge className="ml-1 bg-green-500">Yes</Badge>
                ) : (
                  <Badge className="ml-1 bg-amber-500">No</Badge>
                )}
              </div>
              
              {analysisResult.metadata.issues.length > 0 && (
                <div className="mb-3">
                  <span className="font-semibold text-sm">Metadata Issues:</span>
                  <ul className="list-disc pl-5 mt-1">
                    {analysisResult.metadata.issues.map((issue, idx) => (
                      <li key={idx} className="text-sm text-amber-700">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {renderFeedbackItems(analysisResult.metadata.feedback)}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Pro Tips section with replaced content */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tips" className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2 font-medium">
                <Brain className="h-5 w-5 text-primary" />
                <span>ATS Pro Tips</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                <p className="text-sm mb-2">
                  Follow these best practices to maximize your resume's compatibility with Applicant Tracking Systems:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li>Use a clean, single-column layout for optimal ATS compatibility</li>
                  <li>Submit in PDF or DOCX format (avoid scanned documents)</li>
                  <li>Include a skills section with relevant technical and soft skills</li>
                  <li>Match keywords from the job description where appropriate</li>
                  <li>Use standard section headings (Experience, Education, Skills, etc.)</li>
                  <li>Avoid text in headers, footers, or graphics that may be missed</li>
                  <li>Use standard fonts like Arial, Calibri, or Times New Roman</li>
                  <li>Keep formatting simple - avoid tables, columns, and excessive styling</li>
                  <li>Ensure proper spelling and grammar throughout your resume</li>
                  <li>Use bullet points to highlight achievements and responsibilities</li>
                  <li>Include measurable results and quantifiable achievements where possible</li>
                  <li>Don't use images, icons, or graphics that ATS systems can't read</li>
                  <li>Use conventional file naming (FirstName_LastName_Resume.pdf)</li>
                  <li>Test your resume with multiple ATS systems before submitting</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ATSIndustryStandardDisplay; 