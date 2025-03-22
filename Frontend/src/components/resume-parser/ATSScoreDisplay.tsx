import { ATSScoreResult } from "@/services/ats-scorer.service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ATSScoreDisplayProps {
  scoreResult: ATSScoreResult;
}

export function ATSScoreDisplay({ scoreResult }: ATSScoreDisplayProps) {
  // Helper functions for color and label
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-amber-600";
    return "bg-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Average";
    return "Poor";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <CheckCircle className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="w-full my-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1">ATS Compatibility Score</CardTitle>
            <CardDescription>
              How well your resume performs with Applicant Tracking Systems
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(scoreResult.overallScore)}`}>
              {scoreResult.overallScore}%
            </div>
            <div className="text-sm text-muted-foreground">
              {getScoreLabel(scoreResult.overallScore)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall progress */}
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground mb-1">Overall ATS Compatibility</div>
          <Progress 
            value={scoreResult.overallScore} 
            className="h-2 w-full"
            style={{ 
              '--progress-background': getProgressColor(scoreResult.overallScore).replace('bg-', '')
            } as React.CSSProperties} 
          />
        </div>

        {/* Key recommendations */}
        {scoreResult.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Key Recommendations</h4>
            <ul className="space-y-2">
              {scoreResult.recommendations.slice(0, 3).map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Section scores */}
        <Accordion type="single" collapsible className="w-full">
          {/* Format section */}
          <AccordionItem value="format">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center gap-2">
                  {getScoreIcon(scoreResult.sections.format.score)}
                  <span>Format Score</span>
                </div>
                <Badge variant={scoreResult.sections.format.score >= 70 ? "default" : "outline"}>
                  {scoreResult.sections.format.score}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Progress 
                  value={scoreResult.sections.format.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.format.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                <div className="space-y-2">
                  {scoreResult.sections.format.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.includes("Missing") || item.includes("Inconsistent") ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Content section */}
          <AccordionItem value="content">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center gap-2">
                  {getScoreIcon(scoreResult.sections.content.score)}
                  <span>Content Score</span>
                </div>
                <Badge variant={scoreResult.sections.content.score >= 70 ? "default" : "outline"}>
                  {scoreResult.sections.content.score}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Progress 
                  value={scoreResult.sections.content.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.content.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                <div className="space-y-2">
                  {scoreResult.sections.content.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.includes("Use") || item.includes("Include") || item.includes("Keep") ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Keywords section */}
          <AccordionItem value="keywords">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center gap-2">
                  {getScoreIcon(scoreResult.sections.keywords.score)}
                  <span>Keywords Score</span>
                </div>
                <Badge variant={scoreResult.sections.keywords.score >= 70 ? "default" : "outline"}>
                  {scoreResult.sections.keywords.score}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Progress 
                  value={scoreResult.sections.keywords.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.keywords.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                <div className="space-y-2">
                  {scoreResult.sections.keywords.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.includes("lacks") || item.includes("could use more") ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Show detected keywords */}
                {scoreResult.sections.keywords.detectedKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Detected Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {scoreResult.sections.keywords.detectedKeywords.slice(0, 15).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {scoreResult.sections.keywords.detectedKeywords.length > 15 && (
                        <Badge variant="outline" className="text-xs">
                          +{scoreResult.sections.keywords.detectedKeywords.length - 15} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contact section */}
          <AccordionItem value="contact">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <div className="flex items-center gap-2">
                  {getScoreIcon(scoreResult.sections.contact.score)}
                  <span>Contact Info Score</span>
                </div>
                <Badge variant={scoreResult.sections.contact.score >= 70 ? "default" : "outline"}>
                  {scoreResult.sections.contact.score}%
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <Progress 
                  value={scoreResult.sections.contact.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.contact.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                <div className="space-y-2">
                  {scoreResult.sections.contact.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {item.includes("Missing") || item.includes("invalid") ? (
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* What is ATS? */}
        <div className="bg-muted p-4 rounded-md mt-4">
          <h4 className="font-medium mb-2">What is ATS?</h4>
          <p className="text-sm text-muted-foreground">
            Applicant Tracking Systems (ATS) are software used by companies to scan, organize, and filter job applications. 
            Over 75% of employers use ATS to screen resumes before a human reviews them. Optimizing your resume for ATS 
            increases the chances of getting past this initial screening and having your resume seen by a hiring manager.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 