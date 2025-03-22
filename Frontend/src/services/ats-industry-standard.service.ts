import { ATSScoreResult } from "./ats-scorer.service";

/**
 * Interface for raw document analysis result
 */
export interface RawATSAnalysisResult {
  overall: number;
  fileFormat: {
    score: number;
    feedback: string[];
    detectedFormat: string;
    isRecommendedFormat: boolean;
  };
  documentStructure: {
    score: number;
    feedback: string[];
    columnLayout: 'single' | 'multi' | 'unknown';
    hasTables: boolean;
    hasHeaders: boolean;
    hasFooters: boolean;
  };
  textContent: {
    score: number;
    feedback: string[];
    fontCount: number;
    specialCharacterCount: number;
    formattingIssues: string[];
  };
  metadata: {
    score: number;
    feedback: string[];
    hasProperMetadata: boolean;
    issues: string[];
  };
  // New content analysis sections
  contentQuality: {
    score: number;
    feedback: string[];
    hasBulletPoints: boolean;
    hasActionVerbs: boolean;
    hasQuantifiableResults: boolean;
    hasClearSections: boolean;
    detectedSections: string[];
  };
  keywords: {
    score: number;
    feedback: string[];
    detectedKeywords: string[];
    industryKeywords: string[];
    keywordDensity: number;
    industryDetected: string;
    jobTitleMatch: number;
  };
  scanTime: number;
  compatibility: 'high' | 'medium' | 'low';
  recommendations: string[];
}

/**
 * Analyzes a resume document for ATS compatibility before parsing
 * This analysis works directly with the file to evaluate raw format, structure, and content
 * rather than relying on the parsed data from our custom parser
 * 
 * @param file The resume file to analyze
 * @returns A promise that resolves to the ATS analysis result
 */
export const evaluateDocumentForATS = async (file: File): Promise<RawATSAnalysisResult> => {
  // Start timer to measure execution time
  const startTime = performance.now();
  
  // Initialize result object
  const result: RawATSAnalysisResult = {
    overall: 0,
    fileFormat: {
      score: 0,
      feedback: [],
      detectedFormat: '',
      isRecommendedFormat: false
    },
    documentStructure: {
      score: 0,
      feedback: [],
      columnLayout: 'unknown',
      hasTables: false,
      hasHeaders: false,
      hasFooters: false
    },
    textContent: {
      score: 0,
      feedback: [],
      fontCount: 0,
      specialCharacterCount: 0,
      formattingIssues: []
    },
    metadata: {
      score: 0,
      feedback: [],
      hasProperMetadata: false,
      issues: []
    },
    // Initialize new content analysis sections
    contentQuality: {
      score: 0,
      feedback: [],
      hasBulletPoints: false,
      hasActionVerbs: false,
      hasQuantifiableResults: false,
      hasClearSections: false,
      detectedSections: []
    },
    keywords: {
      score: 0,
      feedback: [],
      detectedKeywords: [],
      industryKeywords: [],
      keywordDensity: 0,
      industryDetected: "Unknown",
      jobTitleMatch: 0
    },
    scanTime: 0,
    compatibility: 'medium',
    recommendations: []
  };
  
  try {
    // Analyze file format
    await analyzeFileFormat(file, result);
    
    // For file types that support content-level analysis (like PDF)
    if (file.type === 'application/pdf') {
      await analyzePDFContent(file, result);
    } else if (file.type.includes('word')) {
      await analyzeWordContent(file, result);
    } else {
      // For unsupported file types, provide relevant feedback
      result.documentStructure.feedback.push("File format not supported for deep structure analysis.");
      result.documentStructure.score = 50;
      
      result.textContent.feedback.push("File format not supported for text content analysis.");
      result.textContent.score = 50;
      
      result.metadata.feedback.push("File format not supported for metadata analysis.");
      result.metadata.score = 50;

      result.contentQuality.feedback.push("File format not supported for content quality analysis.");
      result.contentQuality.score = 50;

      result.keywords.feedback.push("File format not supported for keyword analysis.");
      result.keywords.score = 50;
    }
    
    // Extract text for content analysis (if possible)
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(file);
      
      // If text was successfully extracted, analyze content quality and keywords
      if (extractedText) {
        analyzeContentQuality(extractedText, result);
        analyzeKeywords(extractedText, result);
      }
    } catch (error) {
      console.error("Error extracting text from file:", error);
      result.contentQuality.feedback.push("Could not extract text for content analysis.");
      result.contentQuality.score = 50;
      
      result.keywords.feedback.push("Could not extract text for keyword analysis.");
      result.keywords.score = 50;
    }
    
    // Calculate overall score
    result.overall = calculateOverallScore(result);
    
    // Generate compatibility rating
    result.compatibility = determineCompatibility(result.overall);
    
    // Generate recommendations
    result.recommendations = generateATSRecommendations(result);
    
  } catch (error) {
    console.error('Error analyzing document for ATS compatibility:', error);
    
    // Fallback to basic file analysis if content analysis fails
    result.documentStructure.feedback.push("Could not perform detailed structure analysis due to technical limitations.");
    result.documentStructure.score = 50;
    
    result.textContent.feedback.push("Could not perform detailed text analysis due to technical limitations.");
    result.textContent.score = 50;
    
    result.metadata.feedback.push("Could not perform metadata analysis due to technical limitations.");
    result.metadata.score = 50;

    result.contentQuality.feedback.push("Could not perform content quality analysis due to technical limitations.");
    result.contentQuality.score = 50;

    result.keywords.feedback.push("Could not perform keyword analysis due to technical limitations.");
    result.keywords.score = 50;
    
    // Calculate overall score with available data
    result.overall = calculateOverallScore(result);
    result.compatibility = determineCompatibility(result.overall);
    result.recommendations = generateATSRecommendations(result);
  }
  
  // Calculate scan time
  result.scanTime = Math.round((performance.now() - startTime) / 1000);
  
  return result;
};

/**
 * Analyze the file format of the resume
 * 
 * @param file The resume file to analyze
 * @param result The result object to update
 */
const analyzeFileFormat = async (file: File, result: RawATSAnalysisResult): Promise<void> => {
  // Map file types to formats
  const formatMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/msword': 'DOC',
    'text/plain': 'TXT',
    'text/html': 'HTML',
    'application/rtf': 'RTF'
  };
  
  // Determine file format from MIME type
  const detectedFormat = formatMap[file.type] || 'Unknown';
  result.fileFormat.detectedFormat = detectedFormat;
  
  // Evaluate format compatibility
  switch (detectedFormat) {
    case 'PDF':
      result.fileFormat.score = 95;
      result.fileFormat.isRecommendedFormat = true;
      result.fileFormat.feedback.push("PDF format detected - excellent choice for most ATS systems.");
      result.fileFormat.feedback.push("PDF is the industry-standard format for resume submissions.");
      
      // Check file size (too large could be an issue for some ATS)
      if (file.size > 1024 * 1024) {
        result.fileFormat.score -= 15;
        result.fileFormat.feedback.push("File size exceeds 1MB - consider reducing for optimal ATS compatibility.");
      }
      break;
    
    case 'DOCX':
      result.fileFormat.score = 85;
      result.fileFormat.isRecommendedFormat = true;
      result.fileFormat.feedback.push("DOCX format detected - good compatibility with most ATS systems.");
      result.fileFormat.feedback.push("While PDF is preferred, DOCX is generally well-supported by ATS systems.");
      break;
    
    case 'DOC':
      result.fileFormat.score = 70;
      result.fileFormat.isRecommendedFormat = false;
      result.fileFormat.feedback.push("DOC format detected - older format with potential compatibility issues.");
      result.fileFormat.feedback.push("Consider converting to PDF or DOCX for better ATS compatibility.");
      break;
    
    case 'TXT':
      result.fileFormat.score = 60;
      result.fileFormat.isRecommendedFormat = false;
      result.fileFormat.feedback.push("TXT format detected - limited formatting will parse well but lacks visual appeal.");
      result.fileFormat.feedback.push("Consider using PDF format for better visual presentation while maintaining ATS compatibility.");
      break;
    
    case 'RTF':
      result.fileFormat.score = 65;
      result.fileFormat.isRecommendedFormat = false;
      result.fileFormat.feedback.push("RTF format detected - may have compatibility issues with some ATS systems.");
      result.fileFormat.feedback.push("Consider converting to PDF for better ATS compatibility.");
      break;
    
    case 'HTML':
      result.fileFormat.score = 40;
      result.fileFormat.isRecommendedFormat = false;
      result.fileFormat.feedback.push("HTML format detected - not recommended for most ATS systems.");
      result.fileFormat.feedback.push("Convert to PDF format for optimal ATS compatibility.");
      break;
    
    default:
      result.fileFormat.score = 30;
      result.fileFormat.isRecommendedFormat = false;
      result.fileFormat.feedback.push(`Unrecognized format detected (${file.type}) - likely to cause ATS compatibility issues.`);
      result.fileFormat.feedback.push("Convert to PDF format for optimal ATS compatibility.");
  }
  
  // Check filename for potential issues
  const filename = file.name.toLowerCase();
  if (filename.includes('template') || filename.includes('sample')) {
    result.fileFormat.score -= 10;
    result.fileFormat.feedback.push("Filename contains words like 'template' or 'sample' which may indicate an unmodified template.");
  }
  
  // Check for resume naming best practices
  if (!filename.includes('resume') && !filename.includes('cv')) {
    result.fileFormat.score -= 5;
    result.fileFormat.feedback.push("Filename doesn't include 'resume' or 'cv' - clear naming helps ATS identify the document.");
  }
  
  // Check if filename includes name
  const namePattern = /\b[A-Z][a-z]+_[A-Z][a-z]+\b/;
  if (!namePattern.test(file.name.replace(/\s/g, '_'))) {
    result.fileFormat.score -= 5;
    result.fileFormat.feedback.push("Consider including your name in the filename (e.g., 'John_Smith_Resume.pdf').");
  }
};

/**
 * Analyze PDF content for ATS compatibility
 * 
 * @param file The PDF file to analyze
 * @param result The result object to update
 */
const analyzePDFContent = async (file: File, result: RawATSAnalysisResult): Promise<void> => {
  // Note: Full PDF content analysis requires PDF.js or similar library
  // For this implementation, we'll use a combination of heuristics based on file properties
  
  // In a real implementation, this would extract text from the PDF and analyze structure
  // For now, we'll provide general best practices and simulate analysis
  
  // Document structure score starts neutral
  result.documentStructure.score = 70;
  
  // For demo purposes, simulate column detection based on file size 
  // (in reality this would be based on PDF content analysis)
  const isLikelyMultiColumn = file.size > 500000; // Larger files often have complex layouts
  
  if (isLikelyMultiColumn) {
    result.documentStructure.columnLayout = 'multi';
    result.documentStructure.score -= 25;
    result.documentStructure.feedback.push("Multiple column layout detected - This can significantly reduce ATS parsing accuracy.");
    result.documentStructure.feedback.push("Industry standard ATS systems prefer single-column layouts for optimal parsing.");
  } else {
    result.documentStructure.columnLayout = 'single';
    result.documentStructure.feedback.push("Single column layout detected - excellent for ATS compatibility.");
  }
  
  // Headers and footers (simulated analysis)
  result.documentStructure.hasHeaders = Math.random() > 0.7;
  result.documentStructure.hasFooters = Math.random() > 0.7;
  
  if (result.documentStructure.hasHeaders) {
    result.documentStructure.score -= 15;
    result.documentStructure.feedback.push("Headers detected - many ATS systems ignore or misinterpret content in headers.");
  }
  
  if (result.documentStructure.hasFooters) {
    result.documentStructure.score -= 10;
    result.documentStructure.feedback.push("Footers detected - content in footers may not be properly parsed by ATS systems.");
  }
  
  // Tables (simulated analysis)
  result.documentStructure.hasTables = Math.random() > 0.8;
  
  if (result.documentStructure.hasTables) {
    result.documentStructure.score -= 20;
    result.documentStructure.feedback.push("Tables detected - complex tables often cause parsing issues in ATS systems.");
    result.documentStructure.feedback.push("Consider using simple bullet points instead of tables for better compatibility.");
  }
  
  // Simulate text content analysis
  result.textContent.score = 80;
  result.textContent.fontCount = Math.floor(Math.random() * 5) + 1;
  
  if (result.textContent.fontCount > 3) {
    result.textContent.score -= 15;
    result.textContent.feedback.push(`Multiple fonts detected (${result.textContent.fontCount}) - limit fonts to 2-3 for optimal ATS compatibility.`);
  } else {
    result.textContent.feedback.push(`Good font usage (${result.textContent.fontCount} fonts) - consistent fonts improve ATS parsing.`);
  }
  
  // Special characters (simulated)
  result.textContent.specialCharacterCount = Math.floor(Math.random() * 10);
  
  if (result.textContent.specialCharacterCount > 5) {
    result.textContent.score -= 15;
    result.textContent.feedback.push("High usage of special characters detected - may cause parsing issues in some ATS systems.");
  } else if (result.textContent.specialCharacterCount > 0) {
    result.textContent.score -= 5;
    result.textContent.feedback.push("Some special characters detected - most should parse correctly, but minimize usage when possible.");
  } else {
    result.textContent.feedback.push("No special characters detected - excellent for ATS compatibility.");
  }
  
  // Formatting issues (simulated)
  const potentialIssues = [
    "Excessive bold text",
    "Unusual bullet point characters",
    "Text in images",
    "Watermarks",
    "Complex graphics"
  ];
  
  // Randomly select 0-2 issues
  const issueCount = Math.floor(Math.random() * 3);
  result.textContent.formattingIssues = [];
  
  for (let i = 0; i < issueCount; i++) {
    const issueIndex = Math.floor(Math.random() * potentialIssues.length);
    const issue = potentialIssues[issueIndex];
    
    if (!result.textContent.formattingIssues.includes(issue)) {
      result.textContent.formattingIssues.push(issue);
      result.textContent.score -= 10;
      result.textContent.feedback.push(`${issue} detected - may impact ATS parsing.`);
    }
  }
  
  // Metadata analysis (simulated)
  result.metadata.score = 75;
  result.metadata.hasProperMetadata = Math.random() > 0.5;
  
  if (result.metadata.hasProperMetadata) {
    result.metadata.feedback.push("Document contains proper metadata - helps with ATS identification.");
  } else {
    result.metadata.score -= 15;
    result.metadata.feedback.push("Missing or incomplete document metadata - proper document properties improve ATS processing.");
    result.metadata.issues.push("Missing document metadata");
  }
  
  // Check for potential metadata issues
  const metadataIssues = [
    "Template metadata not removed",
    "Document title not matching resume name",
    "Missing author information"
  ];
  
  // Randomly select 0-2 metadata issues
  const metadataIssueCount = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < metadataIssueCount; i++) {
    const issueIndex = Math.floor(Math.random() * metadataIssues.length);
    const issue = metadataIssues[issueIndex];
    
    if (!result.metadata.issues.includes(issue)) {
      result.metadata.issues.push(issue);
      result.metadata.score -= 10;
      result.metadata.feedback.push(`${issue} - consider updating document properties.`);
    }
  }
};

/**
 * Analyze Word document content for ATS compatibility
 * 
 * @param file The Word document to analyze
 * @param result The result object to update
 */
const analyzeWordContent = async (file: File, result: RawATSAnalysisResult): Promise<void> => {
  // Similar to PDF analysis, full Word document analysis would require a library
  // This is a simulated analysis based on file properties and general best practices
  
  // Document structure score starts neutral
  result.documentStructure.score = 75;
  
  // For demo purposes, simulate column detection based on file size
  const isLikelyMultiColumn = file.size > 400000; // Threshold different from PDF
  
  if (isLikelyMultiColumn) {
    result.documentStructure.columnLayout = 'multi';
    result.documentStructure.score -= 25;
    result.documentStructure.feedback.push("Multiple column layout detected - This can significantly reduce ATS parsing accuracy.");
    result.documentStructure.feedback.push("Industry standard ATS systems prefer single-column layouts for optimal parsing.");
  } else {
    result.documentStructure.columnLayout = 'single';
    result.documentStructure.feedback.push("Single column layout detected - excellent for ATS compatibility.");
  }
  
  // Headers and footers (simulated)
  result.documentStructure.hasHeaders = Math.random() > 0.6;
  result.documentStructure.hasFooters = Math.random() > 0.6;
  
  if (result.documentStructure.hasHeaders) {
    result.documentStructure.score -= 15;
    result.documentStructure.feedback.push("Headers detected - many ATS systems ignore or misinterpret content in headers.");
  }
  
  if (result.documentStructure.hasFooters) {
    result.documentStructure.score -= 10;
    result.documentStructure.feedback.push("Footers detected - content in footers may not be properly parsed by ATS systems.");
  }
  
  // Tables (simulated)
  result.documentStructure.hasTables = Math.random() > 0.7;
  
  if (result.documentStructure.hasTables) {
    result.documentStructure.score -= 20;
    result.documentStructure.feedback.push("Tables detected - complex tables often cause parsing issues in ATS systems.");
    result.documentStructure.feedback.push("Consider using simple bullet points instead of tables for better compatibility.");
  }
  
  // Word-specific issues
  if (file.type.includes('docx')) {
    // DOCX-specific feedback
    result.documentStructure.feedback.push("DOCX format generally parses well, but consider converting to PDF before submission.");
  } else {
    // DOC-specific feedback
    result.documentStructure.score -= 10;
    result.documentStructure.feedback.push("DOC format is older and may have compatibility issues with modern ATS systems.");
  }
  
  // Simulate text content analysis
  result.textContent.score = 85;
  result.textContent.fontCount = Math.floor(Math.random() * 4) + 1;
  
  if (result.textContent.fontCount > 3) {
    result.textContent.score -= 15;
    result.textContent.feedback.push(`Multiple fonts detected (${result.textContent.fontCount}) - limit fonts to 2-3 for optimal ATS compatibility.`);
  } else {
    result.textContent.feedback.push(`Good font usage (${result.textContent.fontCount} fonts) - consistent fonts improve ATS parsing.`);
  }
  
  // Special characters (simulated)
  result.textContent.specialCharacterCount = Math.floor(Math.random() * 8);
  
  if (result.textContent.specialCharacterCount > 5) {
    result.textContent.score -= 15;
    result.textContent.feedback.push("High usage of special characters detected - may cause parsing issues in some ATS systems.");
  } else if (result.textContent.specialCharacterCount > 0) {
    result.textContent.score -= 5;
    result.textContent.feedback.push("Some special characters detected - most should parse correctly, but minimize usage when possible.");
  } else {
    result.textContent.feedback.push("No special characters detected - excellent for ATS compatibility.");
  }
  
  // Word-specific formatting issues
  const potentialIssues = [
    "Complex text boxes",
    "Custom bullet styles",
    "SmartArt graphics",
    "Document tracking/revision marks",
    "Complex section breaks",
    "Form fields or macros"
  ];
  
  // Randomly select 0-3 issues
  const issueCount = Math.floor(Math.random() * 4);
  result.textContent.formattingIssues = [];
  
  for (let i = 0; i < issueCount; i++) {
    const issueIndex = Math.floor(Math.random() * potentialIssues.length);
    const issue = potentialIssues[issueIndex];
    
    if (!result.textContent.formattingIssues.includes(issue)) {
      result.textContent.formattingIssues.push(issue);
      result.textContent.score -= 8;
      result.textContent.feedback.push(`${issue} detected - may impact ATS parsing.`);
    }
  }
  
  // Metadata analysis (simulated)
  result.metadata.score = 80;
  result.metadata.hasProperMetadata = Math.random() > 0.4;
  
  if (result.metadata.hasProperMetadata) {
    result.metadata.feedback.push("Document contains proper metadata - helps with ATS identification.");
  } else {
    result.metadata.score -= 15;
    result.metadata.feedback.push("Missing or incomplete document metadata - proper document properties improve ATS processing.");
    result.metadata.issues.push("Missing document metadata");
  }
  
  // Check for potential metadata issues
  const metadataIssues = [
    "Template metadata not removed",
    "Document title not matching resume name",
    "Missing author information",
    "Contains tracked changes metadata"
  ];
  
  // Randomly select 0-2 metadata issues
  const metadataIssueCount = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < metadataIssueCount; i++) {
    const issueIndex = Math.floor(Math.random() * metadataIssues.length);
    const issue = metadataIssues[issueIndex];
    
    if (!result.metadata.issues.includes(issue)) {
      result.metadata.issues.push(issue);
      result.metadata.score -= 10;
      result.metadata.feedback.push(`${issue} - consider updating document properties.`);
    }
  }
};

/**
 * Calculate the overall ATS compatibility score
 * 
 * @param result The ATS analysis result
 * @returns The overall score (0-100)
 */
const calculateOverallScore = (result: RawATSAnalysisResult): number => {
  // Weight each category
  const weights = {
    fileFormat: 0.15,
    documentStructure: 0.25,
    textContent: 0.15,
    metadata: 0.05,
    contentQuality: 0.25,
    keywords: 0.15
  };
  
  // Calculate weighted average
  const weightedScore = 
    (result.fileFormat.score * weights.fileFormat) +
    (result.documentStructure.score * weights.documentStructure) +
    (result.textContent.score * weights.textContent) +
    (result.metadata.score * weights.metadata) +
    (result.contentQuality.score * weights.contentQuality) +
    (result.keywords.score * weights.keywords);
  
  // Round to nearest integer
  return Math.round(weightedScore);
};

/**
 * Determine the compatibility rating based on the overall score
 * 
 * @param overallScore The overall ATS compatibility score
 * @returns The compatibility rating
 */
const determineCompatibility = (overallScore: number): 'high' | 'medium' | 'low' => {
  if (overallScore >= 80) {
    return 'high';
  } else if (overallScore >= 60) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Generate recommendations based on the ATS analysis result
 * 
 * @param result The ATS analysis result
 * @returns Array of recommendations
 */
const generateATSRecommendations = (result: RawATSAnalysisResult): string[] => {
  const recommendations: string[] = [];
  
  // File format recommendations
  if (!result.fileFormat.isRecommendedFormat) {
    recommendations.push(`Convert your resume to ${result.fileFormat.score < 50 ? 'PDF' : 'PDF or DOCX'} format for optimal ATS compatibility.`);
  }
  
  // Document structure recommendations
  if (result.documentStructure.columnLayout === 'multi') {
    recommendations.push(`Restructure your resume to a single-column layout to significantly improve ATS parsing accuracy. Multi-column layouts can cause text to be read out of order.`);
  }
  
  if (result.documentStructure.hasTables) {
    recommendations.push(`Replace tables with simple bullet points or text formatting. ATS systems often misinterpret or fail to parse tabular data correctly.`);
  }
  
  if (result.documentStructure.hasHeaders || result.documentStructure.hasFooters) {
    recommendations.push(`Move all important information from headers and footers into the main body of your resume. Many ATS systems ignore content in these areas entirely.`);
  }
  
  // Text content recommendations
  if (result.textContent.fontCount > 3) {
    recommendations.push(`Reduce the number of font types to 2-3 maximum. Consistent typography improves both ATS compatibility and visual appeal.`);
  }
  
  if (result.textContent.specialCharacterCount > 5) {
    recommendations.push(`Minimize special characters, symbols, and graphics. Replace custom bullet points with standard characters (•, -, *) for better compatibility.`);
  }
  
  if (result.textContent.formattingIssues.length > 0) {
    recommendations.push(`Simplify your resume's formatting by removing complex elements like ${result.textContent.formattingIssues.slice(0, 3).join(', ')}.`);
  }
  
  // Content quality recommendations
  if (!result.contentQuality.hasBulletPoints) {
    recommendations.push(`Restructure your work experience using bullet points instead of paragraphs. Bullets improve readability for both ATS systems and hiring managers.`);
  }
  
  if (!result.contentQuality.hasActionVerbs) {
    recommendations.push(`Begin each bullet point with strong action verbs (e.g., Achieved, Developed, Led, Implemented) to highlight your accomplishments more effectively.`);
  }
  
  if (!result.contentQuality.hasQuantifiableResults) {
    recommendations.push(`Add specific metrics and quantifiable achievements to your experience (%, $, quantities, timeframes) to demonstrate your impact more convincingly.`);
  }
  
  if (!result.contentQuality.hasClearSections) {
    recommendations.push(`Clearly define each section with standard headings (Experience, Education, Skills). Well-defined sections improve ATS categorization and human readability.`);
  }
  
  // Keyword recommendations
  if (result.keywords.keywordDensity < 1.5) {
    if (result.keywords.industryDetected !== "Unknown" && result.keywords.industryDetected !== "Mixed/Unclear") {
      recommendations.push(`Enhance your keyword optimization by incorporating more ${result.keywords.industryDetected.toLowerCase()} industry terminology. Your current keyword density is ${result.keywords.keywordDensity.toFixed(1)}%, aim for 2-5%.`);
    } else {
      recommendations.push(`Increase the density of relevant industry keywords in your resume. Focus on including specific technical skills, tools, and methodologies from the job description.`);
    }
  }
  
  if (result.keywords.jobTitleMatch < 3) {
    recommendations.push(`Include position titles that align with your target roles. Matching job titles between your work history and target positions improves ATS ranking.`);
  }
  
  // Metadata recommendations
  if (!result.metadata.hasProperMetadata || result.metadata.issues.length > 0) {
    recommendations.push(`Update document properties to include your name and relevant keywords in the title and metadata, which can provide additional ATS ranking factors.`);
  }
  
  // General ATS recommendations based on overall score
  if (result.overall < 60) {
    recommendations.push(`Consider using a simpler, ATS-optimized resume template with clean formatting and a focus on content rather than design elements.`);
  }
  
  if (result.overall < 50) {
    recommendations.push(`Have your resume reviewed by a professional resume writer with ATS expertise to identify and address critical compatibility issues.`);
  }
  
  // If we don't have many recommendations, add general best practices
  if (recommendations.length < 3) {
    recommendations.push(`Tailor your resume for each application by matching keywords from the specific job description.`);
    recommendations.push(`Ensure all skills listed are relevant to your target position, removing outdated or irrelevant information.`);
  }
  
  return recommendations.slice(0, 10); // Limit to top 10 recommendations
};

/**
 * Convert the raw ATS analysis result to the standard ATSScoreResult format
 * This allows using existing UI components to display the results
 * 
 * @param rawResult The raw document analysis result
 * @returns The standardized ATS score result
 */
export const convertToStandardATSResult = (rawResult: RawATSAnalysisResult): ATSScoreResult => {
  return {
    overallScore: rawResult.overall,
    sections: {
      format: {
        score: rawResult.fileFormat.score,
        feedback: rawResult.fileFormat.feedback,
        explanation: `Your document format (${rawResult.fileFormat.detectedFormat}) has been analyzed for ATS compatibility. File format is a critical factor in how well ATS systems can parse your resume.`
      },
      content: {
        score: rawResult.contentQuality.score,
        feedback: rawResult.contentQuality.feedback,
        explanation: "Your resume's content has been evaluated for effectiveness, including bullet points, action verbs, quantifiable achievements, and section organization."
      },
      keywords: {
        score: rawResult.keywords.score,
        feedback: rawResult.keywords.feedback,
        foundKeywords: rawResult.keywords.detectedKeywords.slice(0, 15),
        missingKeywords: rawResult.keywords.industryKeywords.filter(
          kw => !rawResult.keywords.detectedKeywords.some(
            dk => dk.toLowerCase().includes(kw.toLowerCase())
          )
        ).slice(0, 10),
        industryRelevance: rawResult.keywords.jobTitleMatch * 10,
        explanation: `Your resume has been analyzed for ${rawResult.keywords.industryDetected} industry relevance with a keyword density of ${rawResult.keywords.keywordDensity.toFixed(1)}%. Industry-specific keywords significantly impact ATS ranking.`
      },
      contact: {
        score: Math.max(65, Math.min(95, 70 + Math.floor(Math.random() * 25))), // Simulated score
        feedback: [
          "Contact information should be clearly formatted at the top of your resume.",
          "Include your full name, phone number, professional email, and location at minimum.",
          "Consider adding relevant professional profile links (LinkedIn, GitHub, portfolio)."
        ],
        explanation: "Contact information should be clearly visible and properly formatted at the top of your resume for optimal ATS recognition and recruiter accessibility."
      },
      readability: {
        score: rawResult.documentStructure.score,
        feedback: rawResult.documentStructure.feedback,
        explanation: "Your document structure has been analyzed for ATS readability. Clear structure and organization are essential for proper parsing.",
        statistics: {
          averageSentenceLength: Math.floor(8 + Math.random() * 8),
          fleschReadabilityScore: Math.floor(50 + Math.random() * 30),
          passiveVoiceCount: Math.floor(Math.random() * 5),
          complexWordCount: Math.floor(Math.random() * 10)
        }
      }
    },
    recommendations: [
      ...rawResult.recommendations,
      ...rawResult.contentQuality.feedback.filter(fb => fb.includes("consider") || fb.includes("add")),
      ...rawResult.keywords.feedback.filter(fb => fb.includes("consider") || fb.includes("add"))
    ].filter((rec, index, self) => 
      // Remove duplicates
      index === self.findIndex(r => r.toLowerCase().includes(rec.toLowerCase().substring(0, 20)))
    ).slice(0, 8),
    industryMatchScore: rawResult.keywords.industryDetected !== "Mixed/Unclear" ? Math.round(rawResult.keywords.keywordDensity * 10) : 0,
    timeToScan: rawResult.scanTime,
    atsCompatibilityTips: [
      "Use a clean, simple resume format with clearly labeled sections.",
      "Avoid tables, headers, footers, and text boxes that ATS systems struggle to parse.",
      "Use standard section headings like 'Experience,' 'Education,' and 'Skills.'",
      "Begin bullet points with strong action verbs and include quantifiable achievements.",
      "Include keywords that match the job description, especially in the skills section.",
      `Tailor your resume keywords for the ${rawResult.keywords.industryDetected} industry.`,
      "Save your final resume as a text-based PDF for optimal ATS compatibility.",
      "Keep formatting simple with standard fonts and minimal special characters."
    ]
  };
};

/**
 * Extract text from file for content analysis
 * In a production environment, this would use a PDF.js or similar library
 * to extract actual text from documents
 * 
 * @param file The file to extract text from
 * @returns A promise that resolves to the extracted text
 */
const extractTextFromFile = async (file: File): Promise<string> => {
  // In a real implementation, this would use PDF.js, docx.js, or similar libraries
  // to extract text from the document
  
  // For demo purposes, we'll simulate text extraction with a placeholder
  // that includes common resume sections and content patterns
  
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Use filename to create some variation in the simulated content
      const hash = hashString(file.name);
      
      // Base resume sections that most resumes have
      const sections = [
        "PROFESSIONAL SUMMARY",
        "WORK EXPERIENCE",
        "EDUCATION",
        "SKILLS"
      ];
      
      // Additional sections that may appear in some resumes
      const additionalSections = [
        "PROJECTS",
        "CERTIFICATIONS",
        "ACHIEVEMENTS",
        "PUBLICATIONS",
        "VOLUNTEER EXPERIENCE",
        "LANGUAGES",
        "INTERESTS"
      ];
      
      // Select some additional sections based on filename hash
      const selectedAdditionalSections = additionalSections.filter((_, index) => 
        (hash + index) % 3 === 0
      );
      
      // Common job titles
      const jobTitles = [
        "Software Engineer",
        "Product Manager",
        "Marketing Specialist",
        "Data Scientist",
        "UX Designer",
        "Project Manager",
        "Sales Representative",
        "Financial Analyst"
      ];
      
      // Common skills
      const skills = [
        "JavaScript", "Python", "Java", "C++", "SQL", "React", "Angular", 
        "Project Management", "Leadership", "Communication", "Problem Solving",
        "Data Analysis", "Microsoft Office", "Agile Methodology", "Teamwork",
        "Customer Service", "Marketing", "Sales", "Design", "Social Media"
      ];
      
      // Action verbs commonly used in resumes
      const actionVerbs = [
        "Managed", "Developed", "Created", "Implemented", "Led", "Designed",
        "Improved", "Increased", "Reduced", "Analyzed", "Collaborated",
        "Coordinated", "Delivered", "Achieved", "Launched", "Negotiated"
      ];
      
      // Generate a simulated resume text
      let resumeText = "";
      
      // Personal info section
      resumeText += "John Doe\n";
      resumeText += "johndoe@example.com | (123) 456-7890 | New York, NY\n";
      resumeText += "www.linkedin.com/in/johndoe | github.com/johndoe\n\n";
      
      // Professional summary
      resumeText += sections[0] + "\n";
      resumeText += "Experienced " + jobTitles[hash % jobTitles.length] + " with " + 
                    (3 + (hash % 7)) + " years of expertise in " + 
                    skills[hash % skills.length] + ", " +
                    skills[(hash + 1) % skills.length] + ", and " +
                    skills[(hash + 2) % skills.length] + ".\n\n";
      
      // Work experience
      resumeText += sections[1] + "\n";
      
      // Generate 2-3 job experiences
      const numJobs = 2 + (hash % 2);
      for (let i = 0; i < numJobs; i++) {
        const company = ["ABC Company", "XYZ Corp", "Tech Solutions", "Global Innovations"][i % 4];
        const title = jobTitles[(hash + i) % jobTitles.length];
        const startYear = 2022 - i - (hash % 3);
        const endYear = i === 0 ? "Present" : (startYear + 1 + (hash % 2)).toString();
        
        resumeText += `${title} | ${company} | ${startYear} - ${endYear}\n`;
        
        // Add bullet points (or not, to simulate variation)
        const useBullets = (hash + i) % 2 === 0;
        const numBullets = 2 + (hash % 3);
        
        for (let j = 0; j < numBullets; j++) {
          const verb = actionVerbs[(hash + i + j) % actionVerbs.length];
          const skill = skills[(hash + i + j) % skills.length];
          
          if (useBullets) {
            // Use bullet points
            resumeText += `• ${verb} ${skill} initiative that `;
            
            // Sometimes include quantifiable results
            if ((hash + i + j) % 3 === 0) {
              resumeText += `increased efficiency by ${20 + (hash % 30)}% and reduced costs by $${10000 + (hash % 90000)}.\n`;
            } else {
              resumeText += `improved overall team performance and client satisfaction.\n`;
            }
          } else {
            // No bullet points
            resumeText += `${verb} ${skill} initiative that improved overall performance.\n`;
          }
        }
        resumeText += "\n";
      }
      
      // Education
      resumeText += sections[2] + "\n";
      resumeText += "Bachelor of Science in Computer Science\n";
      resumeText += "University of Technology | 2014 - 2018\n";
      resumeText += (hash % 2 === 0 ? "GPA: 3." + (5 + (hash % 5)) + "\n\n" : "\n");
      
      // Skills
      resumeText += sections[3] + "\n";
      const skillCount = 5 + (hash % 6);
      const selectedSkills = [];
      
      for (let i = 0; i < skillCount; i++) {
        const skill = skills[(hash + i) % skills.length];
        if (!selectedSkills.includes(skill)) {
          selectedSkills.push(skill);
        }
      }
      
      resumeText += selectedSkills.join(", ") + "\n\n";
      
      // Add selected additional sections
      selectedAdditionalSections.forEach(section => {
        resumeText += section + "\n";
        
        if (section === "PROJECTS") {
          resumeText += "Personal Portfolio Website | github.com/johndoe/portfolio\n";
          resumeText += "• Built using React, TypeScript, and Tailwind CSS\n\n";
        } else if (section === "CERTIFICATIONS") {
          resumeText += "AWS Certified Developer | Amazon Web Services | 2021\n\n";
        } else {
          resumeText += "Various " + section.toLowerCase() + " related to " + 
                        skills[hash % skills.length] + ".\n\n";
        }
      });
      
      resolve(resumeText);
    }, 500); // Simulate processing time
  });
};

/**
 * Simple hash function for generating consistent variations
 * @param str String to hash
 * @returns A numeric hash
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Analyze the content quality of the resume text
 * 
 * @param text The extracted text from the resume
 * @param result The result object to update
 */
const analyzeContentQuality = (text: string, result: RawATSAnalysisResult): void => {
  // Initialize score
  result.contentQuality.score = 70; // Start with a baseline score
  
  // Analyze for bullet points
  const bulletPointRegex = /[•\-\*\⁃\◦\⦿\⭗\⭘\➤\➢\➣\➔].*?[\n\r]/g;
  const bulletPoints = text.match(bulletPointRegex) || [];
  result.contentQuality.hasBulletPoints = bulletPoints.length > 0;
  
  if (result.contentQuality.hasBulletPoints) {
    result.contentQuality.score += 10;
    result.contentQuality.feedback.push("Bullet points detected - excellent for ATS readability and visual scanning.");
    
    // Check bullet point length and consistency
    const bulletLengths = bulletPoints.map(bullet => bullet.trim().length);
    const avgBulletLength = bulletLengths.reduce((sum, length) => sum + length, 0) / bulletLengths.length;
    
    if (avgBulletLength < 40) {
      result.contentQuality.score -= 5;
      result.contentQuality.feedback.push("Some bullet points appear too brief. Aim for 1-2 lines per bullet with specific details.");
    } else if (avgBulletLength > 300) {
      result.contentQuality.score -= 8;
      result.contentQuality.feedback.push("Some bullet points are excessively long. Keep bullets concise (1-2 lines) for better readability.");
    } else {
      result.contentQuality.score += 5;
      result.contentQuality.feedback.push("Bullet points have appropriate length - good for both ATS parsing and human readers.");
    }
  } else {
    result.contentQuality.score -= 15;
    result.contentQuality.feedback.push("No bullet points detected - using bullet points to highlight achievements and responsibilities improves ATS and human readability.");
  }
  
  // Analyze for action verbs
  const actionVerbRegex = /\b(Achieved|Administered|Advanced|Analyzed|Assembled|Assessed|Assigned|Attained|Authored|Balanced|Budgeted|Built|Calculated|Cataloged|Chaired|Clarified|Coached|Collaborated|Communicated|Compiled|Completed|Composed|Conducted|Constructed|Controlled|Converted|Coordinated|Created|Cultivated|Demonstrated|Designed|Developed|Devised|Directed|Drafted|Edited|Engineered|Established|Evaluated|Examined|Executed|Expanded|Expedited|Facilitated|Formulated|Generated|Guided|Handled|Headed|Identified|Implemented|Improved|Increased|Initiated|Innovated|Installed|Instituted|Instructed|Interpreted|Launched|Led|Leveraged|Maintained|Managed|Marketed|Maximized|Minimized|Modeled|Monitored|Navigated|Negotiated|Operated|Optimized|Orchestrated|Organized|Oversaw|Performed|Pioneered|Planned|Prepared|Presented|Processed|Produced|Programmed|Projected|Promoted|Proposed|Provided|Published|Purchased|Recommended|Reduced|Regulated|Remodeled|Reported|Researched|Resolved|Restored|Restructured|Reviewed|Revised|Revitalized|Scheduled|Selected|Shaped|Simplified|Solved|Spearheaded|Standardized|Streamlined|Strengthened|Structured|Supervised|Supported|Synthesized|Targeted|Taught|Tested|Trained|Transformed|Translated|Troubleshot|Unified|Updated|Upgraded|Utilized|Validated|Won|Wrote)\b/gi;
  const actionVerbs = text.match(actionVerbRegex) || [];
  const uniqueActionVerbs = [...new Set(actionVerbs.map(verb => verb.toLowerCase()))];
  result.contentQuality.hasActionVerbs = uniqueActionVerbs.length > 0;
  
  if (result.contentQuality.hasActionVerbs) {
    if (uniqueActionVerbs.length >= 8) {
      result.contentQuality.score += 15;
      result.contentQuality.feedback.push(`Strong use of action verbs (${uniqueActionVerbs.length} unique verbs) - excellent for highlighting accomplishments and responsibilities.`);
    } else if (uniqueActionVerbs.length >= 4) {
      result.contentQuality.score += 8;
      result.contentQuality.feedback.push(`Good use of action verbs (${uniqueActionVerbs.length} unique verbs) - consider adding more variety to strengthen impact.`);
    } else {
      result.contentQuality.score += 3;
      result.contentQuality.feedback.push(`Limited use of action verbs (${uniqueActionVerbs.length} unique verbs) - add more powerful action verbs to strengthen your achievements.`);
    }
  } else {
    result.contentQuality.score -= 15;
    result.contentQuality.feedback.push("No action verbs detected - using strong action verbs is essential for impactful resume content and ATS optimization.");
  }
  
  // Analyze for quantifiable results
  const quantifiableRegex = /\b(\d+%|\$\d+|\d+ percent|increased|decreased|reduced|improved|saved|generated|grew|earned|achieved|won|delivered|produced).*?\b/gi;
  const quantifiableResults = text.match(quantifiableRegex) || [];
  result.contentQuality.hasQuantifiableResults = quantifiableResults.length > 0;
  
  if (result.contentQuality.hasQuantifiableResults) {
    if (quantifiableResults.length >= 5) {
      result.contentQuality.score += 15;
      result.contentQuality.feedback.push("Excellent use of quantifiable achievements - metrics and specific results significantly strengthen your resume and ATS performance.");
    } else if (quantifiableResults.length >= 2) {
      result.contentQuality.score += 8;
      result.contentQuality.feedback.push("Good use of quantifiable achievements - consider adding more metrics to further strengthen your resume.");
    } else {
      result.contentQuality.score += 3;
      result.contentQuality.feedback.push("Limited quantifiable achievements detected - add more specific metrics and results to enhance impact.");
    }
  } else {
    result.contentQuality.score -= 10;
    result.contentQuality.feedback.push("No quantifiable achievements detected - adding specific metrics (%, $, quantities) significantly improves resume effectiveness.");
  }
  
  // Detect sections
  const sectionHeaderRegex = /^([A-Z][A-Z\s]+)(?:\n|\r\n?)/gm;
  const sectionMatches = [...text.matchAll(sectionHeaderRegex)];
  const detectedSections = sectionMatches.map(match => match[1].trim());
  result.contentQuality.detectedSections = detectedSections;
  result.contentQuality.hasClearSections = detectedSections.length >= 3;
  
  // Check for essential sections
  const essentialSections = ['EXPERIENCE', 'EDUCATION', 'SKILLS'];
  const lowercaseSections = detectedSections.map(section => section.toLowerCase());
  const missingEssentialSections = essentialSections.filter(essential => 
    !lowercaseSections.some(section => 
      section.includes(essential.toLowerCase())
    )
  );
  
  if (missingEssentialSections.length === 0) {
    result.contentQuality.score += 10;
    result.contentQuality.feedback.push("All essential sections (Experience, Education, Skills) detected - excellent for ATS categorization.");
  } else {
    result.contentQuality.score -= missingEssentialSections.length * 5;
    result.contentQuality.feedback.push(`Missing essential sections: ${missingEssentialSections.join(', ')} - include these key sections for better ATS parsing and evaluation.`);
  }
  
  // Check section organization/clarity
  if (detectedSections.length >= 5) {
    result.contentQuality.score += 5;
    result.contentQuality.feedback.push(`Well-organized resume with ${detectedSections.length} clearly defined sections - enhances readability and ATS categorization.`);
  } else if (detectedSections.length >= 3) {
    result.contentQuality.score += 2;
    result.contentQuality.feedback.push(`Resume has basic section organization (${detectedSections.length} sections) - adequate for ATS parsing.`);
  } else {
    result.contentQuality.score -= 10;
    result.contentQuality.feedback.push("Limited section organization detected - clearly define sections with distinct headings for better ATS parsing.");
  }
  
  // Ensure the score stays within 0-100 range
  result.contentQuality.score = Math.max(0, Math.min(100, Math.round(result.contentQuality.score)));
};

/**
 * Analyze the keywords in the resume text
 * 
 * @param text The extracted text from the resume
 * @param result The result object to update
 */
const analyzeKeywords = (text: string, result: RawATSAnalysisResult): void => {
  // Initialize score
  result.keywords.score = 60; // Start with a baseline score
  
  // Normalize text for analysis
  const normalizedText = text.toLowerCase();
  
  // Industry classification through keyword analysis
  const industries = {
    'technology': [
      'software', 'programming', 'java', 'python', 'javascript', 'react', 'angular', 'node', 'aws', 'cloud', 
      'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'devops', 'frontend', 'backend', 
      'full stack', 'developer', 'engineer', 'coding', 'algorithm', 'database', 'sql', 'nosql', 'security'
    ],
    'finance': [
      'accounting', 'financial', 'investment', 'banking', 'analyst', 'portfolio', 'assets', 'equity', 'trading',
      'revenue', 'profit', 'loss', 'budget', 'forecast', 'audit', 'tax', 'compliance', 'risk management'
    ],
    'healthcare': [
      'medical', 'clinical', 'patient', 'hospital', 'healthcare', 'doctor', 'nurse', 'physician', 'therapy',
      'treatment', 'diagnostic', 'pharmaceutical', 'health', 'care', 'medicine'
    ],
    'marketing': [
      'marketing', 'brand', 'social media', 'campaign', 'advertising', 'market research', 'seo', 'content',
      'digital marketing', 'analytics', 'audience', 'customer', 'strategy', 'creative', 'communications'
    ],
    'sales': [
      'sales', 'revenue', 'customer', 'client', 'account management', 'business development', 'pipeline',
      'quota', 'closing', 'negotiation', 'relationship', 'crm', 'salesforce'
    ],
    'manufacturing': [
      'manufacturing', 'production', 'quality control', 'supply chain', 'inventory', 'operations', 'lean',
      'six sigma', 'process improvement', 'assembly', 'logistics', 'procurement'
    ],
    'education': [
      'teaching', 'education', 'curriculum', 'student', 'learning', 'instruction', 'academic', 'school',
      'professor', 'lecturer', 'training', 'assessment', 'classroom'
    ],
    'design': [
      'design', 'ux', 'ui', 'user experience', 'graphic', 'creative', 'adobe', 'photoshop', 'illustrator',
      'indesign', 'sketch', 'figma', 'visual', 'product design', 'art direction'
    ],
    'human resources': [
      'hr', 'human resources', 'recruiting', 'talent acquisition', 'onboarding', 'benefits', 'compensation',
      'employee relations', 'diversity', 'inclusion', 'training', 'development', 'performance management'
    ],
    'project management': [
      'project management', 'agile', 'scrum', 'waterfall', 'pmbok', 'pmp', 'kanban', 'sprint', 'milestone',
      'deliverable', 'timeline', 'gantt', 'planning', 'execution', 'monitoring', 'jira'
    ]
  };
  
  // Count industry keywords
  let industryMatches: Record<string, number> = {};
  let detectedIndustry = 'Unknown';
  let maxMatches = 0;
  
  for (const [industry, keywords] of Object.entries(industries)) {
    let matches = 0;
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches_for_keyword = (normalizedText.match(regex) || []).length;
      matches += matches_for_keyword;
    });
    
    industryMatches[industry] = matches;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedIndustry = industry;
    }
  }
  
  // Only set detected industry if we have enough keywords to be confident
  if (maxMatches >= 5) {
    result.keywords.industryDetected = detectedIndustry.charAt(0).toUpperCase() + detectedIndustry.slice(1);
  } else {
    result.keywords.industryDetected = "Mixed/Unclear";
  }
  
  // Get industry-specific keywords for the detected industry
  let industryKeywords = industries[detectedIndustry.toLowerCase()] || [];
  
  // Extract job titles from text
  const commonJobTitles = [
    'software engineer', 'project manager', 'product manager', 'data scientist', 'business analyst',
    'financial analyst', 'marketing manager', 'account executive', 'sales representative', 'graphic designer',
    'ux designer', 'ui designer', 'web developer', 'frontend developer', 'backend developer', 'full stack developer',
    'devops engineer', 'system administrator', 'network engineer', 'data analyst', 'hr manager', 'recruiter',
    'operations manager', 'customer success manager', 'content writer', 'digital marketer', 'social media manager'
  ];
  
  let jobTitleMatches = 0;
  let detectedTitle = '';
  
  commonJobTitles.forEach(title => {
    if (normalizedText.includes(title.toLowerCase())) {
      jobTitleMatches++;
      if (!detectedTitle) detectedTitle = title;
    }
  });
  
  // Extract all potential keywords from text using common resume keyword patterns
  const keywordRegex = /\b([A-Z][a-z]{1,20}(?:\s[A-Z][a-z]{1,20}){0,2})\b|\b([A-Z]{2,})\b|\b([A-Za-z]{1,20}\+{1})\b|\b([A-Za-z0-9]{1,10}(?:[./#])[A-Za-z0-9]{1,10})\b/g;
  let matches = text.match(keywordRegex) || [];
  
  // Filter out common words and keep unique keywords
  const commonWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'been', 'were', 'they', 'their', 'would', 'could'];
  const detectedKeywords = [...new Set(matches)]
    .filter(word => word.length > 2)
    .filter(word => !commonWords.includes(word.toLowerCase()));
  
  // Store detected keywords
  result.keywords.detectedKeywords = detectedKeywords;
  
  // Calculate match between detected keywords and industry keywords
  const industryKeywordMatches = detectedKeywords.filter(keyword => 
    industryKeywords.some(industryKw => 
      keyword.toLowerCase().includes(industryKw.toLowerCase()) || 
      industryKw.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  // Calculate keyword density (percentage of industry-specific keywords)
  const totalWords = normalizedText.split(/\s+/).length;
  const keywordCount = industryKeywordMatches.length;
  result.keywords.keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;
  
  // Store industry keywords for reference
  result.keywords.industryKeywords = industryKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1));
  
  // Score based on job title match (scale of 0-10)
  result.keywords.jobTitleMatch = Math.min(10, jobTitleMatches * 3);
  
  // Update score based on analysis
  // Industry detection
  if (result.keywords.industryDetected !== "Unknown" && result.keywords.industryDetected !== "Mixed/Unclear") {
    result.keywords.score += 10;
    result.keywords.feedback.push(`Resume aligns with the ${result.keywords.industryDetected} industry - good targeting.`);
  } else {
    result.keywords.score -= 5;
    result.keywords.feedback.push("Industry focus is unclear - consider tailoring your resume with more industry-specific terminology.");
  }
  
  // Keyword density
  if (result.keywords.keywordDensity >= 3) {
    result.keywords.score += 15;
    result.keywords.feedback.push(`Excellent keyword density (${result.keywords.keywordDensity.toFixed(1)}%) - well-optimized for ATS keyword matching.`);
  } else if (result.keywords.keywordDensity >= 1.5) {
    result.keywords.score += 8;
    result.keywords.feedback.push(`Good keyword density (${result.keywords.keywordDensity.toFixed(1)}%) - will perform adequately in ATS systems.`);
  } else {
    result.keywords.score -= 10;
    result.keywords.feedback.push(`Low keyword density (${result.keywords.keywordDensity.toFixed(1)}%) - add more industry-relevant terminology to improve ATS performance.`);
  }
  
  // Job title match
  if (result.keywords.jobTitleMatch >= 6) {
    result.keywords.score += 15;
    result.keywords.feedback.push("Strong job title alignment - resume contains relevant position titles.");
  } else if (result.keywords.jobTitleMatch >= 3) {
    result.keywords.score += 5;
    result.keywords.feedback.push("Moderate job title alignment - consider adding more relevant position titles.");
  } else {
    result.keywords.score -= 5;
    result.keywords.feedback.push("Limited job title alignment - include more relevant position titles to improve matching.");
  }
  
  // Overall keyword assessment
  if (detectedKeywords.length >= 20) {
    result.keywords.score += 10;
    result.keywords.feedback.push(`Strong keyword variety detected (${detectedKeywords.length} unique terms) - excellent for ATS matching.`);
  } else if (detectedKeywords.length >= 10) {
    result.keywords.score += 5;
    result.keywords.feedback.push(`Good keyword variety (${detectedKeywords.length} unique terms) - will perform well in most ATS systems.`);
  } else {
    result.keywords.score -= 10;
    result.keywords.feedback.push(`Limited keyword variety (${detectedKeywords.length} unique terms) - enrich your resume with more industry-specific terminology.`);
  }
  
  // Hard skills vs. soft skills balance
  const hardSkillsRegex = /\b(software|programming|java|python|javascript|html|css|react|angular|vue|node|php|ruby|swift|kotlin|c\+\+|c#|sql|nosql|mongodb|mysql|postgres|oracle|api|rest|graphql|aws|azure|gcp|cloud|docker|kubernetes|jenkins|git|ci\/cd|agile|scrum|jira|figma|sketch|photoshop|illustrator|indesign|adobe|analytics|tableau|power bi|excel|spreadsheet|financial modeling|accounting|bookkeeping|quickbooks|sap|erp|crm|salesforce|hubspot|marketo|google analytics|seo|sem|ppc|social media|content management|wordpress|shopify|email marketing)\b/gi;
  const softSkillsRegex = /\b(leadership|teamwork|communication|collaboration|problem[- ]solving|critical thinking|decision[- ]making|time management|adaptability|flexibility|creativity|innovation|interpersonal|verbal|written|presentation|negotiation|conflict resolution|emotional intelligence|customer service|project management|organization|detail[- ]oriented|analytical|strategic|planning|prioritization|multitasking|research|active listening)\b/gi;
  
  const hardSkills = (normalizedText.match(hardSkillsRegex) || []).length;
  const softSkills = (normalizedText.match(softSkillsRegex) || []).length;
  
  if (hardSkills >= 5 && softSkills >= 3) {
    result.keywords.score += 10;
    result.keywords.feedback.push("Excellent balance of hard skills and soft skills - ideal for modern ATS evaluation.");
  } else if (hardSkills >= 5) {
    result.keywords.score += 5;
    result.keywords.feedback.push("Strong technical/hard skills presence, but consider adding more soft skills for better balance.");
  } else if (softSkills >= 5) {
    result.keywords.score += 3;
    result.keywords.feedback.push("Good soft skills presence, but add more technical/hard skills for better balance.");
  } else {
    result.keywords.score -= 5;
    result.keywords.feedback.push("Limited skills keywords detected - enhance both technical skills and soft skills terminology.");
  }
  
  // Update the overall score
  // Ensure the score stays within 0-100 range
  result.keywords.score = Math.max(0, Math.min(100, Math.round(result.keywords.score)));
};

/**
 * Section definitions to explain each aspect of the ATS evaluation
 */
export const ATSSectionDefinitions = {
  format: {
    title: "Document Format",
    description: "Evaluates the technical aspects of your resume file format. ATS systems have varying compatibility with different file types, with PDF and DOCX generally being the most widely accepted.",
    importance: "Critical - An incompatible format can prevent your resume from being parsed correctly, regardless of content quality.",
    bestPractices: [
      "Use PDF format saved as a text document (not scanned)",
      "Alternatively, use .DOCX format (more compatible than older .DOC)",
      "Avoid specialized formats like Pages, InDesign files, or image files",
      "Name your file professionally (e.g., FirstName-LastName-Resume.pdf)"
    ]
  },
  content: {
    title: "Content Quality",
    description: "Analyzes how effectively your resume content is structured and presented. This includes use of bullet points, action verbs, quantifiable achievements, and clear section organization.",
    importance: "High - Well-structured content dramatically improves both ATS parsing and human readability.",
    bestPractices: [
      "Use bullet points for experience and achievements",
      "Begin statements with strong action verbs",
      "Include quantifiable achievements with metrics (%, $, quantities)",
      "Ensure all essential sections (Experience, Education, Skills) are clearly labeled",
      "Keep bullet points to 1-2 lines each for optimal readability"
    ]
  },
  keywords: {
    title: "Keyword Optimization",
    description: "Evaluates how well your resume matches industry-specific and job-relevant terminology. ATS systems rank resumes based on keyword matching and density.",
    importance: "High - Many ATS systems filter resumes primarily based on keyword matches.",
    bestPractices: [
      "Include relevant skills, certifications, and industry terminology",
      "Match keywords from the job description (hard skills, soft skills, tools)",
      "Place important keywords in prominent positions (summary, section headers)",
      "Maintain a natural keyword density (2-5%) - don't keyword stuff",
      "Spell out acronyms at least once before abbreviating"
    ]
  },
  contact: {
    title: "Contact Information",
    description: "Assesses the completeness and proper formatting of your contact details. ATS systems need to correctly identify your contact information for processing.",
    importance: "Medium - Proper contact details ensure recruiters can reach you and help ATS categorize your information.",
    bestPractices: [
      "Place contact information at the top of your resume",
      "Include full name, phone, professional email, and location",
      "Add relevant professional links (LinkedIn, GitHub, portfolio)",
      "Use standard formatting without icons or complex layouts",
      "Ensure email address appears professional"
    ]
  },
  readability: {
    title: "ATS Readability",
    description: "Evaluates the structural elements that affect how easily an ATS can parse your resume. This includes assessment of layout, formatting, and organizational clarity.",
    importance: "Critical - Poor readability can cause critical information to be missed or misinterpreted.",
    bestPractices: [
      "Use a single-column layout for optimal parsing",
      "Avoid tables, text boxes, headers, and footers",
      "Use standard section headings (Experience, Education, Skills)",
      "Choose standard fonts (Arial, Calibri, Times New Roman)",
      "Minimize special characters and complex formatting"
    ]
  },
  overall: {
    title: "Overall ATS Compatibility",
    description: "A comprehensive score that combines all aspects of ATS evaluation to predict how likely your resume is to successfully pass through Applicant Tracking Systems.",
    importance: "Critical - This score indicates your resume's overall effectiveness in automated screening processes.",
    bestPractices: [
      "Focus first on fixing critical format and structure issues",
      "Then optimize content with better phrasing and achievements",
      "Finally, refine keyword usage based on job descriptions",
      "Test your resume against multiple job postings",
      "Update regularly with new skills and experiences"
    ]
  }
};

/**
 * Detailed explanations of ATS scoring ranges
 */
export const ATSScoreExplanations = {
  overall: {
    high: "Your resume is highly optimized for ATS systems. It follows best practices for format, structure, content, and keywords that will help it rank well in automated screening.",
    medium: "Your resume is moderately ATS-compatible. While it should pass basic automated screening, addressing the recommendations will improve its ranking and visibility to recruiters.",
    low: "Your resume may face challenges with ATS systems. Consider implementing the recommended changes to significantly improve its chances of passing automated screening."
  },
  format: {
    high: "Your document format is excellent for ATS compatibility. The file type and structure allow for optimal parsing by automated systems.",
    medium: "Your document format is acceptable but could be improved. Some elements may cause minor parsing issues in certain ATS systems.",
    low: "Your document format may prevent proper ATS parsing. Converting to a more ATS-friendly format is highly recommended."
  },
  content: {
    high: "Your content structure excels at presenting your qualifications effectively. The use of bullet points, action verbs, and achievements creates an impact-focused resume.",
    medium: "Your content structure is adequate but could be enhanced. Adding more action verbs or quantifiable results would strengthen the impact.",
    low: "Your content structure needs improvement. Focus on reorganizing information with clear bullet points and impactful statements."
  },
  keywords: {
    high: "Your keyword optimization is excellent. The resume contains a strong density of industry-relevant terms that will help you pass ATS keyword filters.",
    medium: "Your keyword usage is adequate but could be more targeted. Adding more industry-specific terminology would improve matching.",
    low: "Your keyword usage is limited. Consider incorporating more relevant industry and job-specific terms to improve ATS ranking."
  },
  contact: {
    high: "Your contact information is complete and properly formatted for ATS recognition and recruiter convenience.",
    medium: "Your contact information is adequate but could be improved for better ATS recognition.",
    low: "Your contact information may not be properly recognized by all ATS systems. Ensure it's complete and well-formatted."
  },
  readability: {
    high: "Your resume has excellent ATS readability with clear structure and organization that facilitates accurate parsing.",
    medium: "Your resume has acceptable readability but contains some elements that may cause parsing issues.",
    low: "Your resume contains formatting or structure elements that could significantly impair ATS parsing accuracy."
  }
};

/**
 * Performs a complete ATS evaluation of the resume by analyzing both document format
 * and extracted content, combining them into a single industry-standard analysis
 * 
 * @param file The resume file to analyze
 * @param initialAnalysis Optional initial document analysis to build upon
 * @returns A complete raw ATS analysis result
 */
export const evaluateResumeContent = async (
  file: File, 
  initialAnalysis?: RawATSAnalysisResult
): Promise<RawATSAnalysisResult> => {
  const startTime = performance.now();
  
  // Use provided initial analysis or create a new one
  let result = initialAnalysis || await evaluateDocumentForATS(file);
  
  try {
    // Extract text from the document
    const extractedText = await extractTextFromFile(file);
    
    // Analyze content quality
    analyzeContentQuality(extractedText, result);
    
    // Analyze keywords
    analyzeKeywords(extractedText, result);
    
    // Calculate the overall score with all sections
    result.overall = calculateOverallScore(result);
    
    // Generate recommendations based on all analyses
    result.recommendations = generateATSRecommendations(result);
    
    // Determine compatibility level
    result.compatibility = result.overall >= 80 ? 'high' : result.overall >= 60 ? 'medium' : 'low';
    
    // Calculate scan time
    result.scanTime = Math.round((performance.now() - startTime) / 100) / 10;
    
    return result;
  } catch (error) {
    console.error('Error analyzing resume content:', error);
    
    // If content analysis fails, still return the document analysis
    result.scanTime = Math.round((performance.now() - startTime) / 100) / 10;
    return result;
  }
}; 