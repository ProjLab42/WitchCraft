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
import { CheckCircle, AlertCircle, Info, Clock, Award, Target, Zap } from "lucide-react";
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

  const getFeedbackIcon = (feedback: string) => {
    if (feedback.includes("Missing") || feedback.includes("invalid") || 
        feedback.includes("lacks") || feedback.includes("could use more") ||
        feedback.includes("Use") || feedback.includes("Include") || 
        feedback.includes("Inconsistent") || feedback.toLowerCase().includes("poor") ||
        feedback.toLowerCase().includes("improve")) {
      return <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />;
  };

  // Determine if a recommendation is high, medium, or low priority
  const getRecommendationPriority = (recommendation: string) => {
    if (recommendation.includes("Critical priority")) {
      return {
        badge: "Critical",
        color: "bg-red-100 text-red-800",
        icon: <Zap className="h-4 w-4 text-red-600 mr-1" />
      };
    } 
    if (recommendation.includes("High priority")) {
      return {
        badge: "High",
        color: "bg-amber-100 text-amber-800",
        icon: <AlertCircle className="h-4 w-4 text-amber-600 mr-1" />
      };
    }
    if (recommendation.includes("Medium priority")) {
      return {
        badge: "Medium",
        color: "bg-blue-100 text-blue-800", 
        icon: <Info className="h-4 w-4 text-blue-600 mr-1" />
      };
    }
    return {
      badge: "Tip",
      color: "bg-green-100 text-green-800",
      icon: <Info className="h-4 w-4 text-green-600 mr-1" />
    };
  };

  return (
    <Card className="w-full my-6 shadow-md border-t-4" style={{ borderTopColor: getProgressColor(scoreResult.overallScore).replace('bg-', '#') }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl mb-1 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              ATS Compatibility Score
            </CardTitle>
            <CardDescription>
              How well your resume performs with Applicant Tracking Systems
            </CardDescription>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className={`text-3xl font-bold ${getScoreColor(scoreResult.overallScore)}`}>
              {scoreResult.overallScore}%
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {getScoreLabel(scoreResult.overallScore)}
              {scoreResult.timeToScan && (
                <span className="ml-2 flex items-center text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                  <Clock className="h-3 w-3 mr-1" />
                  {scoreResult.timeToScan}s scan time
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
            value={scoreResult.overallScore} 
            className="h-2.5 w-full"
            style={{ 
              '--progress-background': getProgressColor(scoreResult.overallScore).replace('bg-', '')
            } as React.CSSProperties} 
          />
        </div>

        {/* Industry match if available */}
        {scoreResult.industryMatchScore && (
          <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
            <Target className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Industry Relevance</div>
              <div className="text-sm text-muted-foreground">
                Your resume is {scoreResult.industryMatchScore}% relevant to your target industry
              </div>
            </div>
          </div>
        )}

        {/* Key recommendations */}
        {scoreResult.recommendations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center">
              <Zap className="h-4 w-4 mr-1.5" />
              Key Recommendations
            </h4>
            <ul className="space-y-3">
              {scoreResult.recommendations.slice(0, 3).map((rec, i) => {
                const priority = getRecommendationPriority(rec);
                const cleanRec = rec.replace(/^(Critical priority|High priority|Medium priority|Fine-tuning): /, '');
                
                return (
                  <li key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
                    {priority.icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                          {priority.badge}
                        </span>
                      </div>
                      <span className="text-sm">{cleanRec}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Section scores */}
        <Accordion type="single" collapsible className="w-full">
          {/* Format section */}
          <AccordionItem value="format" className="border rounded-lg px-1 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
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
              <div className="space-y-4 pt-2 pb-2">
                <Progress 
                  value={scoreResult.sections.format.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.format.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                
                {/* Explanation */}
                {scoreResult.sections.format.explanation && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    {scoreResult.sections.format.explanation}
                  </div>
                )}
                
                <div className="space-y-2">
                  {scoreResult.sections.format.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
                      {getFeedbackIcon(item)}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Content section */}
          <AccordionItem value="content" className="border rounded-lg px-1 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
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
              <div className="space-y-4 pt-2 pb-2">
                <Progress 
                  value={scoreResult.sections.content.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.content.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                
                {/* Explanation */}
                {scoreResult.sections.content.explanation && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    {scoreResult.sections.content.explanation}
                  </div>
                )}
                
                <div className="space-y-2">
                  {scoreResult.sections.content.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
                      {getFeedbackIcon(item)}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Keywords section */}
          <AccordionItem value="keywords" className="border rounded-lg px-1 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
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
              <div className="space-y-4 pt-2 pb-2">
                <Progress 
                  value={scoreResult.sections.keywords.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.keywords.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                
                {/* Explanation */}
                {scoreResult.sections.keywords.explanation && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    {scoreResult.sections.keywords.explanation}
                  </div>
                )}
                
                {/* Industry relevance if available */}
                {scoreResult.sections.keywords.industryRelevance > 0 && (
                  <div className="bg-slate-50 p-3 rounded-lg flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Industry Relevance</span>
                        <span className="text-sm font-medium">{scoreResult.sections.keywords.industryRelevance}%</span>
                      </div>
                      <Progress 
                        value={scoreResult.sections.keywords.industryRelevance} 
                        className="h-1.5 w-full"
                        style={{ 
                          '--progress-background': getProgressColor(scoreResult.sections.keywords.industryRelevance).replace('bg-', '')
                        } as React.CSSProperties} 
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {scoreResult.sections.keywords.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
                      {getFeedbackIcon(item)}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Show detected keywords */}
                {scoreResult.sections.keywords.foundKeywords && scoreResult.sections.keywords.foundKeywords.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Detected Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {scoreResult.sections.keywords.foundKeywords.slice(0, 15).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {scoreResult.sections.keywords.foundKeywords.length > 15 && (
                        <Badge variant="outline" className="text-xs">
                          +{scoreResult.sections.keywords.foundKeywords.length - 15} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show missing keywords */}
                {scoreResult.sections.keywords.missingKeywords && scoreResult.sections.keywords.missingKeywords.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Recommended Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {scoreResult.sections.keywords.missingKeywords.slice(0, 10).map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Contact section */}
          <AccordionItem value="contact" className="border rounded-lg px-1 mb-2">
            <AccordionTrigger className="hover:no-underline py-3">
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
              <div className="space-y-4 pt-2 pb-2">
                <Progress 
                  value={scoreResult.sections.contact.score} 
                  className="h-2 w-full"
                  style={{ 
                    '--progress-background': getProgressColor(scoreResult.sections.contact.score).replace('bg-', '')
                  } as React.CSSProperties} 
                />
                
                {/* Explanation */}
                {scoreResult.sections.contact.explanation && (
                  <div className="bg-slate-50 p-3 rounded-lg text-sm">
                    {scoreResult.sections.contact.explanation}
                  </div>
                )}
                
                <div className="space-y-2">
                  {scoreResult.sections.contact.feedback.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
                      {getFeedbackIcon(item)}
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          {/* Readability section if available */}
          {scoreResult.sections.readability && (
            <AccordionItem value="readability" className="border rounded-lg px-1 mb-2">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-2">
                    {getScoreIcon(scoreResult.sections.readability.score)}
                    <span>Readability Score</span>
                  </div>
                  <Badge variant={scoreResult.sections.readability.score >= 70 ? "default" : "outline"}>
                    {scoreResult.sections.readability.score}%
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2 pb-2">
                  <Progress 
                    value={scoreResult.sections.readability.score} 
                    className="h-2 w-full"
                    style={{ 
                      '--progress-background': getProgressColor(scoreResult.sections.readability.score).replace('bg-', '')
                    } as React.CSSProperties} 
                  />
                  
                  {/* Explanation */}
                  {scoreResult.sections.readability.explanation && (
                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                      {scoreResult.sections.readability.explanation}
                    </div>
                  )}
                  
                  {/* Readability statistics */}
                  {scoreResult.sections.readability.statistics && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-xs text-muted-foreground">Avg. Sentence Length</div>
                        <div className="font-medium">{scoreResult.sections.readability.statistics.averageSentenceLength.toFixed(1)} words</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-xs text-muted-foreground">Flesch Reading Ease</div>
                        <div className="font-medium">{scoreResult.sections.readability.statistics.fleschReadabilityScore.toFixed(1)}</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-xs text-muted-foreground">Passive Voice</div>
                        <div className="font-medium">{scoreResult.sections.readability.statistics.passiveVoiceCount} instances</div>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <div className="text-xs text-muted-foreground">Complex Words</div>
                        <div className="font-medium">{scoreResult.sections.readability.statistics.complexWordCount} words</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {scoreResult.sections.readability.feedback.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded-md">
                        {getFeedbackIcon(item)}
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* ATS Compatibility Tips */}
        {scoreResult.atsCompatibilityTips && scoreResult.atsCompatibilityTips.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-md mt-4">
            <h4 className="font-medium mb-2 text-blue-800">Pro Tips</h4>
            <ul className="space-y-2">
              {scoreResult.atsCompatibilityTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What is ATS? */}
        <div className="bg-slate-50 p-4 rounded-md mt-4">
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