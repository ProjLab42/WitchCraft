import { ParsedResume } from "@/types/resume-parser";

export interface ATSScoreResult {
  overallScore: number;
  sections: {
    format: {
      score: number;
      feedback: string[];
      explanation: string;
    };
    content: {
      score: number;
      feedback: string[];
      explanation: string;
    };
    keywords: {
      score: number;
      feedback: string[];
      foundKeywords: string[];
      missingKeywords: string[];
      industryRelevance: number;
      explanation: string;
    };
    contact: {
      score: number;
      feedback: string[];
      explanation: string;
    };
    readability: {
      score: number;
      feedback: string[];
      explanation: string;
      statistics: {
        averageSentenceLength: number;
        fleschReadabilityScore: number;
        passiveVoiceCount: number;
        complexWordCount: number;
      };
    };
  };
  recommendations: string[];
  industryMatchScore?: number;
  timeToScan: number;
  atsCompatibilityTips: string[];
}

/**
 * Main function to score resume for ATS compatibility
 */
export const scoreResumeForATS = (parsedResume: ParsedResume, jobTitle?: string): ATSScoreResult => {
  // Initialize result object
  const result: ATSScoreResult = {
    overallScore: 0,
    sections: {
      format: {
        score: 0,
        feedback: [],
        explanation: ""
      },
      content: {
        score: 0,
        feedback: [],
        explanation: ""
      },
      keywords: {
        score: 0,
        feedback: [],
        foundKeywords: [],
        missingKeywords: [],
        industryRelevance: 0,
        explanation: ""
      },
      contact: {
        score: 0,
        feedback: [],
        explanation: ""
      },
      readability: {
        score: 0,
        feedback: [],
        explanation: "",
        statistics: {
          averageSentenceLength: 0,
          fleschReadabilityScore: 0,
          passiveVoiceCount: 0,
          complexWordCount: 0
        }
      }
    },
    recommendations: [],
    timeToScan: Math.floor(Math.random() * 3) + 1, // Simulating scan time between 1-3 seconds
    atsCompatibilityTips: [
      "Submit your resume as a PDF unless specifically instructed otherwise.",
      "Use a single-column layout for optimal ATS parsing.",
      "Avoid using headers, footers, or page numbers as ATS systems often ignore them.",
      "Spell out abbreviations at least once before using them consistently.",
      "Match your resume keywords to the specific job description when applying."
    ]
  };

  // Start timer to measure execution time (approximating ATS scan time)
  const startTime = performance.now();

  // Score each section
  const formatResult = evaluateFormat(parsedResume);
  const contentResult = evaluateContent(parsedResume);
  const keywordsResult = evaluateKeywords(parsedResume);
  const contactResult = evaluateContactInfo(parsedResume);
  const readabilityResult = evaluateReadability(parsedResume);

  // Assign section scores
  result.sections.format = formatResult;
  result.sections.content = contentResult;
  result.sections.keywords = keywordsResult;
  result.sections.contact = contactResult;
  result.sections.readability = readabilityResult;

  // Calculate overall score
  result.overallScore = calculateOverallScore(
    formatResult.score,
    contentResult.score,
    keywordsResult.score,
    contactResult.score,
    readabilityResult.score
  );

  // Generate recommendations
  result.recommendations = generateRecommendations(
    formatResult.score,
    contentResult.score,
    keywordsResult.score,
    contactResult.score,
    formatResult.feedback,
    contentResult.feedback,
    keywordsResult.feedback,
    contactResult.feedback,
    keywordsResult.foundKeywords,
    keywordsResult.missingKeywords
  );

  // End timer and calculate approximate scan time
  const endTime = performance.now();
  result.timeToScan = Math.round((endTime - startTime) / 100) / 10;
  if (result.timeToScan < 0.5) result.timeToScan = 0.5;

  return result;
};

/**
 * Calculate overall ATS score with readability included
 */
const calculateOverallScore = (
  format: number, 
  content: number, 
  keywords: number, 
  contactInfo: number,
  readability: number
): number => {
  // Weighted average of all scores
  // Format: 22%, Content: 25%, Keywords: 33%, Contact Info: 10%, Readability: 10%
  return Math.round(
    (format * 0.22) +
    (content * 0.25) +
    (keywords * 0.33) +
    (contactInfo * 0.10) +
    (readability * 0.10)
  );
};

/**
 * Evaluates the format of the resume
 */
const evaluateFormat = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    explanation: "",
    fileFormatAnalysis: {
      format: "unknown",
      isOptimal: false
    }
  };

  let points = 0;
  const totalPoints = 10; // Increased total points for more detailed assessment

  // Check for presence of key sections
  // We'll use bio as summary since there's no dedicated summary field
  const hasSummary = parsedResume.personalInfo && parsedResume.personalInfo.bio && parsedResume.personalInfo.bio.trim().length > 0;
  const hasExperience = parsedResume.experience && parsedResume.experience.length > 0;
  const hasEducation = parsedResume.education && parsedResume.education.length > 0;
  const hasSkills = parsedResume.skills && parsedResume.skills.length > 0;

  // Count required sections
  const requiredSections = [hasSummary, hasExperience, hasEducation, hasSkills];
  const requiredSectionCount = requiredSections.filter(has => has).length;

  if (requiredSectionCount === 4) {
    points += 2;
    result.feedback.push("Excellent section organization - resume contains all key sections (summary, experience, education, skills) for optimal ATS parsing.");
  } else if (requiredSectionCount === 3) {
    points += 1;
    // Find missing section
    const missingSections = [];
    if (!hasSummary) missingSections.push("summary/objective");
    if (!hasExperience) missingSections.push("work experience");
    if (!hasEducation) missingSections.push("education");
    if (!hasSkills) missingSections.push("skills");
    
    result.feedback.push(`Good section organization - contains most key sections, but missing ${missingSections.join(', ')}. ATS systems expect standard section organization.`);
  } else {
    // Find missing sections
    const missingSections = [];
    if (!hasSummary) missingSections.push("summary/objective");
    if (!hasExperience) missingSections.push("work experience");
    if (!hasEducation) missingSections.push("education");
    if (!hasSkills) missingSections.push("skills");
    
    result.feedback.push(`Needs improved structure - missing important sections: ${missingSections.join(', ')}. ATS systems rely on standard section headings to categorize information.`);
  }

  // Check for section headings clarity
  const headingsAnalysis = analyzeHeadings(parsedResume);
  
  if (headingsAnalysis.clarity >= 80) {
    points += 2;
    result.feedback.push("Excellent use of clear section headings - this helps ATS systems correctly categorize your information.");
  } else if (headingsAnalysis.clarity >= 50) {
    points += 1;
    result.feedback.push("Section headings could be clearer - consider using standard headings like 'Experience', 'Education', and 'Skills' for better ATS recognition.");
  } else {
    result.feedback.push("Section headings are unclear or missing - this makes it difficult for ATS systems to properly categorize your information.");
  }

  // Check for chronological order of experience and education
  const chronologyAnalysis = analyzeChronology(parsedResume);
  
  if (chronologyAnalysis.isChronological) {
    points += 1;
    result.feedback.push("Experience and education sections are in proper reverse-chronological order - this is the preferred format for ATS systems.");
  } else {
    result.feedback.push("Experience or education sections are not in reverse-chronological order - ATS systems expect most recent positions/degrees first.");
  }

  // Check for consistent date formatting
  const dateFormatResult = getDateFormat(parsedResume);
  if (dateFormatResult.isConsistent) {
    points += 1;
    result.feedback.push(`Consistent date formatting (${dateFormatResult.format}) - this helps ATS systems correctly parse your timeline.`);
  } else {
    result.feedback.push("Inconsistent date formatting detected - standardize dates throughout your resume for better ATS parsing.");
  }

  // Check for appropriate length
  const lengthAnalysis = analyzeResumeLength(parsedResume);
  
  if (lengthAnalysis.isOptimal) {
    points += 1;
    result.feedback.push("Optimal resume length - your resume contains sufficient detail while remaining concise.");
  } else if (lengthAnalysis.isTooLong) {
    result.feedback.push("Resume appears too lengthy - consider condensing to 1-2 pages for better readability.");
  } else if (lengthAnalysis.isTooShort) {
    result.feedback.push("Resume appears too brief - consider adding more detail about your experience and qualifications.");
  }

  // Check for appropriate use of sections and subsections
  const structureAnalysis = analyzeStructure(parsedResume);
  
  if (structureAnalysis.wellStructured) {
    points += 1;
    result.feedback.push("Well-structured content with appropriate use of sections and subsections - improves readability for both ATS and recruiters.");
  } else {
    result.feedback.push("Structure could be improved - use clear sections and subsections to organize information in a scanner-friendly format.");
  }

  // Check for contact information placement and completeness
  const contactInfoAnalysis = analyzeContactInfo(parsedResume);
  
  if (contactInfoAnalysis.isComplete && contactInfoAnalysis.isProminentlyPlaced) {
    points += 1;
    result.feedback.push("Contact information is complete and prominently placed - ensures recruiters can easily reach you after ATS screening.");
  } else if (contactInfoAnalysis.isComplete) {
    points += 0.5;
    result.feedback.push("Contact information is complete but could be more prominently displayed at the top of your resume.");
  } else {
    result.feedback.push("Contact information is incomplete or not prominently displayed - ensure complete details are at the top of your resume.");
  }

  // Check for appropriate white space and readability
  const readabilityAnalysis = analyzeReadability(parsedResume);
  
  if (readabilityAnalysis.isReadable) {
    points += 1;
    result.feedback.push("Good use of white space and formatting - creates a readable document that's scanner-friendly.");
  } else {
    result.feedback.push("Improve readability with better use of white space, margins, and consistent formatting.");
  }

  // File format analysis - note this would be more accurate with actual file metadata
  // but we can make recommendations based on best practices
  result.fileFormatAnalysis = {
    format: "PDF/Word recommended",
    isOptimal: true
  };
  
  // Calculate score as percentage
  result.score = Math.round((points / totalPoints) * 100);

  // Generate detailed explanation based on score
  if (result.score >= 90) {
    result.explanation = "Your resume has excellent formatting that is highly compatible with ATS systems. The document structure, section organization, and formatting consistency all contribute to optimal parsing accuracy.";
  } else if (result.score >= 70) {
    result.explanation = "Your resume formatting is good but has some areas for improvement. Addressing the feedback points will help ensure ATS systems accurately parse your information and improve your chances of passing automated screenings.";
  } else if (result.score >= 50) {
    result.explanation = "Your resume formatting needs improvement to be ATS-compatible. Consider implementing the suggested changes to ensure your information is correctly categorized and parsed by automated systems.";
  } else {
    result.explanation = "Your resume format requires significant revision for ATS compatibility. The current structure and organization may prevent proper parsing of your qualifications by automated systems, reducing your chances of passing initial screenings.";
  }

  return result;
};

/**
 * Analyzes the overall readability of the resume layout
 * This is different from the evaluateReadability function which focuses on text readability
 */
const analyzeReadability = (parsedResume: ParsedResume) => {
  // Without access to the actual formatting, we can only infer readability 
  // from content structure patterns
  
  let readabilityScore = 50; // Start with neutral score
  
  // Check if experience has bullet points (improves readability)
  const hasBulletPoints = parsedResume.experience.some(exp => 
    exp.bulletPoints && exp.bulletPoints.length > 0
  );
  
  if (hasBulletPoints) {
    readabilityScore += 15;
  }
  
  // Check bullet point length (optimal is 1-2 lines)
  if (hasBulletPoints) {
    let totalBullets = 0;
    let optimalLengthBullets = 0;
    
    parsedResume.experience.forEach(exp => {
      if (exp.bulletPoints) {
        exp.bulletPoints.forEach(bp => {
          totalBullets++;
          if (bp.text && bp.text.length >= 30 && bp.text.length <= 150) {
            optimalLengthBullets++;
          }
        });
      }
    });
    
    if (totalBullets > 0) {
      const optimalRatio = optimalLengthBullets / totalBullets;
      readabilityScore += optimalRatio * 15;
    }
  }
  
  // Check if experience and education sections have clear separation
  if (parsedResume.experience.length > 0 && parsedResume.education.length > 0) {
    readabilityScore += 10;
  }
  
  // Check if there's a skills section (improves scanability)
  if (parsedResume.skills && parsedResume.skills.length > 0) {
    readabilityScore += 10;
  }
  
  return {
    isReadable: readabilityScore >= 70,
    readabilityScore
  };
};

/**
 * Checks if experience and education are in reverse chronological order
 */
const analyzeChronology = (parsedResume: ParsedResume) => {
  let experienceChronological = true;
  let educationChronological = true;
  
  // Check experience chronology
  if (parsedResume.experience && parsedResume.experience.length > 1) {
    for (let i = 0; i < parsedResume.experience.length - 1; i++) {
      const currentExp = parsedResume.experience[i];
      const nextExp = parsedResume.experience[i + 1];
      
      // Try to extract years from period strings
      const currentYear = extractYearFromPeriod(currentExp.period || '');
      const nextYear = extractYearFromPeriod(nextExp.period || '');
      
      // If we have valid years to compare
      if (currentYear && nextYear && currentYear < nextYear) {
        experienceChronological = false;
        break;
      }
    }
  }
  
  // Check education chronology
  if (parsedResume.education && parsedResume.education.length > 1) {
    for (let i = 0; i < parsedResume.education.length - 1; i++) {
      const currentEdu = parsedResume.education[i];
      const nextEdu = parsedResume.education[i + 1];
      
      // Try to extract years from year field (ParsedEducation uses year instead of period)
      const currentYear = extractYearFromPeriod(currentEdu.year || '');
      const nextYear = extractYearFromPeriod(nextEdu.year || '');
      
      // If we have valid years to compare
      if (currentYear && nextYear && currentYear < nextYear) {
        educationChronological = false;
        break;
      }
    }
  }
  
  return {
    isChronological: experienceChronological && educationChronological,
    experienceChronological,
    educationChronological
  };
};

/**
 * Analyzes the clarity and effectiveness of section headings
 */
const analyzeHeadings = (parsedResume: ParsedResume) => {
  let clarity = 0;
  const maxClarity = 100;
  
  // Extract all potential section headings
  const sectionHeadings: string[] = [];
  
  // We don't have direct access to section headings in the parsed data
  // But we can infer from the presence of sections and their content
  
  // Experience titles might give us clues about headings
  if (parsedResume.experience && parsedResume.experience.length > 0) {
    // Check if the first experience entry might be a section header instead of a job
    const firstExp = parsedResume.experience[0];
    if (firstExp.title && 
        (firstExp.title.toLowerCase().includes("experience") ||
         firstExp.title.toLowerCase().includes("work") ||
         firstExp.title.toLowerCase().includes("employment") ||
         firstExp.title.toLowerCase().includes("career"))) {
      sectionHeadings.push(firstExp.title);
      clarity += 20;
    } else {
      // We have experience but no clear heading detected
      clarity += 10;
    }
  }
  
  // Education section might give us clues
  if (parsedResume.education && parsedResume.education.length > 0) {
    // Check if the first education entry might be a section header
    const firstEdu = parsedResume.education[0];
    if (firstEdu.degree && 
        (firstEdu.degree.toLowerCase().includes("education") ||
         firstEdu.degree.toLowerCase().includes("academic"))) {
      sectionHeadings.push(firstEdu.degree);
      clarity += 20;
    } else {
      // We have education but no clear heading detected
      clarity += 10;
    }
  }
  
  // Skills section
  if (parsedResume.skills && parsedResume.skills.length > 0) {
    // We can't really detect the heading here, but we can infer one exists
    clarity += 15;
  }
  
  // Get personal bio as potential summary
  let summaryText = "";
  if (parsedResume.personalInfo && parsedResume.personalInfo.bio) {
    summaryText = parsedResume.personalInfo.bio;
  }
  
  // Summary/bio section
  if (summaryText && summaryText.trim().length > 0) {
    // First few words might be a heading
    const firstFewWords = summaryText.trim().split(' ').slice(0, 3).join(' ');
    if (firstFewWords.toLowerCase().includes("summary") || 
        firstFewWords.toLowerCase().includes("objective") || 
        firstFewWords.toLowerCase().includes("profile")) {
      sectionHeadings.push(firstFewWords);
      clarity += 15;
    } else {
      // We have a summary but no clear heading detected
      clarity += 10;
    }
  }
  
  // Implement inference about heading clarity
  // - If we detected actual headings, this is good
  // - If we have all sections but didn't detect headings, they might exist but not be ideal
  // - If we're missing sections, clarity is lower
  
  const hasAllSections = summaryText.length > 0 && 
                        parsedResume.experience && parsedResume.experience.length > 0 &&
                        parsedResume.education && parsedResume.education.length > 0 &&
                        parsedResume.skills && parsedResume.skills.length > 0;
                        
  if (hasAllSections && sectionHeadings.length >= 2) {
    clarity += 30; // Excellent clarity if we detected headings and have all sections
  } else if (hasAllSections) {
    clarity += 15; // Good but could be better
  }
  
  return {
    clarity: Math.min(clarity, maxClarity),
    detectedHeadings: sectionHeadings
  };
};

/**
 * Check for consistent date formatting
 */
const getDateFormat = (parsedResume: ParsedResume) => {
  const dateFormats = {
    monthYear: 0, // "January 2020", "Jan 2020"
    monthYearAbbr: 0, // "Jan. 2020"
    numericalSlash: 0, // "01/2020"
    numericalDash: 0, // "01-2020"
    yearOnly: 0 // "2020"
  };

  const patterns = {
    monthYear: /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/i,
    monthYearAbbr: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}\b/i,
    numericalSlash: /\b\d{1,2}\/\d{4}\b/,
    numericalDash: /\b\d{1,2}-\d{4}\b/,
    yearOnly: /\b\d{4}\b/
  };

  // Check experience dates
  parsedResume.experience.forEach(exp => {
    if (exp.period) {
      for (const [format, pattern] of Object.entries(patterns)) {
        if (pattern.test(exp.period)) {
          dateFormats[format as keyof typeof dateFormats]++;
        }
      }
    }
  });

  // Check education dates - use year field in education
  parsedResume.education.forEach(edu => {
    const dateText = edu.year || "";
    if (dateText) {
      for (const [format, pattern] of Object.entries(patterns)) {
        if (pattern.test(dateText)) {
          dateFormats[format as keyof typeof dateFormats]++;
        }
      }
    }
  });

  // Find the most common format
  let mostCommonFormat = "yearOnly";
  let maxCount = 0;

  for (const [format, count] of Object.entries(dateFormats)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonFormat = format;
    }
  }

  // Check if all dates follow the most common format
  const totalDates = parsedResume.experience.length + parsedResume.education.length;
  const isConsistent = maxCount / totalDates > 0.8; // 80% or more use the same format

  return {
    format: mostCommonFormat,
    isConsistent
  };
};

/**
 * Analyzes the overall length of the resume
 */
const analyzeResumeLength = (parsedResume: ParsedResume) => {
  // Calculate an approximate length based on content volume
  let contentVolume = 0;
  
  // Add length of summary
  if (parsedResume.summary) {
    contentVolume += parsedResume.summary.length;
  }
  
  // Add length of experience descriptions
  if (parsedResume.experience) {
    parsedResume.experience.forEach(exp => {
      if (exp.description) contentVolume += exp.description.length;
      if (exp.bulletPoints) {
        exp.bulletPoints.forEach(bp => {
          if (bp.text) contentVolume += bp.text.length;
        });
      }
    });
  }
  
  // Add education descriptions
  if (parsedResume.education) {
    parsedResume.education.forEach(edu => {
      if (edu.description) contentVolume += edu.description.length;
    });
  }
  
  // Add skills length
  if (parsedResume.skills) {
    contentVolume += parsedResume.skills.join(', ').length;
  }
  
  // Add projects length
  if (parsedResume.projects) {
    parsedResume.projects.forEach(proj => {
      if (proj.description) contentVolume += proj.description.length;
      if (proj.bulletPoints) {
        proj.bulletPoints.forEach(bp => {
          if (bp.text) contentVolume += bp.text.length;
        });
      }
    });
  }
  
  // Approximate character count to pages
  // ~3000 characters per page is a rough estimate for a typical resume
  const approximatePages = contentVolume / 3000;
  
  return {
    contentVolume,
    approximatePages,
    isOptimal: approximatePages >= 0.75 && approximatePages <= 2.2,
    isTooLong: approximatePages > 2.2,
    isTooShort: approximatePages < 0.75
  };
};

/**
 * Analyzes the overall structure of the resume
 */
const analyzeStructure = (parsedResume: ParsedResume) => {
  let structurePoints = 0;
  const maxPoints = 10;
  
  // Check if experience includes company, title, and dates
  if (parsedResume.experience && parsedResume.experience.length > 0) {
    const hasCompleteExperience = parsedResume.experience.every(exp => 
      exp.company && exp.title && exp.period
    );
    
    if (hasCompleteExperience) {
      structurePoints += 3;
    } else {
      // Check what percentage of entries are complete
      const completeEntries = parsedResume.experience.filter(exp => 
        exp.company && exp.title && exp.period
      ).length;
      
      structurePoints += (completeEntries / parsedResume.experience.length) * 3;
    }
  }
  
  // Check if education includes degree, institution, and dates
  if (parsedResume.education && parsedResume.education.length > 0) {
    const hasCompleteEducation = parsedResume.education.every(edu => 
      edu.degree && edu.institution && edu.period
    );
    
    if (hasCompleteEducation) {
      structurePoints += 2;
    } else {
      // Check what percentage of entries are complete
      const completeEntries = parsedResume.education.filter(edu => 
        edu.degree && edu.institution && edu.period
      ).length;
      
      structurePoints += (completeEntries / parsedResume.education.length) * 2;
    }
  }
  
  // Check for bullet points in experience
  if (parsedResume.experience && parsedResume.experience.length > 0) {
    const hasBulletPoints = parsedResume.experience.some(exp => 
      exp.bulletPoints && exp.bulletPoints.length > 0
    );
    
    if (hasBulletPoints) {
      structurePoints += 2;
    }
  }
  
  // Check if skills are clearly organized
  if (parsedResume.skills && parsedResume.skills.length > 0) {
    structurePoints += 1;
    
    // If skills have categories, that's even better
    // We can't really detect this from the structure, but we can give benefit of doubt
    structurePoints += 1;
  }
  
  // Check if resume has summary/objective at the beginning
  if (parsedResume.summary && parsedResume.summary.trim().length > 0) {
    structurePoints += 1;
  }
  
  return {
    wellStructured: structurePoints >= 7,
    structureScore: (structurePoints / maxPoints) * 100
  };
};

/**
 * Analyzes contact information placement and completeness
 */
const analyzeContactInfo = (parsedResume: ParsedResume) => {
  const hasName = parsedResume.personalInfo && parsedResume.personalInfo.name && parsedResume.personalInfo.name.trim().length > 0;
  const hasEmail = parsedResume.personalInfo && parsedResume.personalInfo.email && isValidEmail(parsedResume.personalInfo.email);
  const hasPhone = parsedResume.personalInfo && parsedResume.personalInfo.phone && parsedResume.personalInfo.phone.trim().length > 0;
  const hasLocation = parsedResume.personalInfo && parsedResume.personalInfo.location && parsedResume.personalInfo.location.trim().length > 0;
  
  const isComplete = hasName && hasEmail && (hasPhone || hasLocation);
  
  // We can only infer placement from structure - assuming it's placed properly
  // A more sophisticated check would require the original document layout
  const isProminentlyPlaced = hasName && hasEmail;
  
  return {
    isComplete,
    isProminentlyPlaced,
    hasName,
    hasEmail,
    hasPhone,
    hasLocation
  };
};

/**
 * Evaluates the readability of the resume
 */
const evaluateReadability = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    explanation: "",
    statistics: {
      averageSentenceLength: 0,
      fleschReadabilityScore: 0,
      passiveVoiceCount: 0,
      complexWordCount: 0
    }
  };

  // Extract all text from resume
  const allText = extractAllText(parsedResume);
  
  // Calculate readability statistics
  const stats = calculateReadabilityStatistics(allText);
  result.statistics = stats;
  
  let points = 0;
  const totalPoints = 10;
  
  // Evaluate average sentence length
  if (stats.averageSentenceLength <= 15) {
    points += 3;
    result.feedback.push("Excellent sentence length (avg. " + stats.averageSentenceLength.toFixed(1) + " words) - concise sentences are easier for ATS systems and recruiters to process.");
  } else if (stats.averageSentenceLength <= 20) {
    points += 2;
    result.feedback.push("Good sentence length (avg. " + stats.averageSentenceLength.toFixed(1) + " words) - most sentences are concise and direct.");
  } else if (stats.averageSentenceLength <= 25) {
    points += 1;
    result.feedback.push("Moderate sentence length (avg. " + stats.averageSentenceLength.toFixed(1) + " words) - consider shortening some sentences for better clarity.");
  } else {
    result.feedback.push("Sentences are too long (avg. " + stats.averageSentenceLength.toFixed(1) + " words) - break down complex sentences into shorter, more direct statements for better readability.");
  }
  
  // Evaluate Flesch Reading Ease
  if (stats.fleschReadabilityScore >= 60) {
    points += 2;
    result.feedback.push("Excellent readability score - your resume text is easy to understand and scan quickly.");
  } else if (stats.fleschReadabilityScore >= 50) {
    points += 1.5;
    result.feedback.push("Good readability score - your resume uses mostly clear, straightforward language.");
  } else if (stats.fleschReadabilityScore >= 40) {
    points += 1;
    result.feedback.push("Moderate readability score - consider simplifying some language for better clarity.");
  } else {
    result.feedback.push("Low readability score - simplify complex language and break down lengthy sentences for better comprehension.");
  }
  
  // Evaluate passive voice usage
  const passiveRatio = stats.passiveVoiceCount / Math.max(stats.sentenceCount, 1);
  if (passiveRatio <= 0.1) {
    points += 2;
    result.feedback.push("Excellent use of active voice - this creates more dynamic and impactful descriptions of your achievements.");
  } else if (passiveRatio <= 0.2) {
    points += 1;
    result.feedback.push("Good use of active voice with some passive constructions - try to replace remaining passive voice with active statements.");
  } else {
    result.feedback.push("Too much passive voice detected - convert passive phrases like 'was responsible for' to active statements like 'managed' or 'led' for greater impact.");
  }
  
  // Evaluate complex word usage
  const complexRatio = stats.complexWordCount / Math.max(stats.wordCount, 1);
  if (complexRatio <= 0.15) {
    points += 3;
    result.feedback.push("Appropriate level of vocabulary complexity - your resume uses clear, accessible language that both ATS and humans can easily understand.");
  } else if (complexRatio <= 0.25) {
    points += 1.5;
    result.feedback.push("Slightly complex vocabulary - consider simplifying some terms unless they're industry-standard keywords.");
  } else {
    result.feedback.push("Overly complex vocabulary - simplify terminology where possible while retaining essential industry keywords.");
  }
  
  // Calculate score
  result.score = Math.round((points / totalPoints) * 100);
  
  // Generate explanation
  if (result.score >= 90) {
    result.explanation = "Your resume has excellent readability with concise sentences, active voice, and clear language. This makes it easy for both ATS systems to parse and for hiring managers to quickly understand your qualifications.";
  } else if (result.score >= 70) {
    result.explanation = "Your resume has good readability with generally clear language. Some minor improvements to sentence length, voice, or vocabulary would make your qualifications even more accessible to readers.";
  } else if (result.score >= 50) {
    result.explanation = "Your resume has moderate readability. Consider revising sentences to be more concise and direct, using more active voice, and simplifying complex language while retaining essential industry terminology.";
  } else {
    result.explanation = "Your resume's readability needs significant improvement. Focus on creating shorter, more direct sentences, eliminating passive voice, and simplifying complex terminology to ensure your qualifications are clearly communicated.";
  }
  
  return result;
};

/**
 * Calculate readability statistics for the given text
 */
const calculateReadabilityStatistics = (text: string) => {
  // Split text into sentences (basic implementation)
  const sentenceDelimiters = /[.!?]+/g;
  const sentences = text.split(sentenceDelimiters).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Count words
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  const wordCount = words.length;
  
  // Calculate average sentence length
  const averageSentenceLength = wordCount / Math.max(sentenceCount, 1);
  
  // Count syllables (simplified approach)
  let syllableCount = 0;
  words.forEach(word => {
    syllableCount += countSyllables(word);
  });
  
  // Calculate Flesch Reading Ease
  // Formula: 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)
  const fleschReadabilityScore = 206.835 - 
                                (1.015 * averageSentenceLength) - 
                                (84.6 * (syllableCount / Math.max(wordCount, 1)));
  
  // Count passive voice instances (simplified detection)
  const passiveVoicePatterns = [
    /was (created|developed|managed|implemented|written|designed|built|achieved)/gi,
    /were (created|developed|managed|implemented|written|designed|built|achieved)/gi,
    /been (created|developed|managed|implemented|written|designed|built|achieved)/gi,
    /is (managed|created|handled|processed|overseen|monitored)/gi,
    /are (managed|created|handled|processed|overseen|monitored)/gi,
    /was responsible for/gi,
    /is responsible for/gi,
    /was tasked with/gi,
    /has been/gi,
    /have been/gi
  ];
  
  let passiveVoiceCount = 0;
  passiveVoicePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      passiveVoiceCount += matches.length;
    }
  });
  
  // Count complex words (words with 3+ syllables, simplified)
  let complexWordCount = 0;
  words.forEach(word => {
    if (countSyllables(word) >= 3) {
      complexWordCount++;
    }
  });
  
  return {
    sentenceCount,
    wordCount,
    syllableCount,
    averageSentenceLength,
    fleschReadabilityScore: Math.max(0, Math.min(100, fleschReadabilityScore)),
    passiveVoiceCount,
    complexWordCount
  };
};

/**
 * Count the number of syllables in a word (simplified approach)
 */
const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  
  // Remove common suffixes
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  
  // Count vowel groups
  const syllables = word.match(/[aeiouy]{1,2}/g);
  
  // Return syllable count, with minimum of 1
  return syllables ? syllables.length : 1;
};

/**
 * Evaluates the content quality of the resume
 */
const evaluateContent = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    explanation: ""
  };

  let points = 0;
  const totalPoints = 8;

  const hasBulletPoints = parsedResume.experience.some(exp => 
    exp.bulletPoints && exp.bulletPoints.length > 0
  );
  
  if (hasBulletPoints) {
    points++;
    result.feedback.push("Bullet points used effectively - improves readability and helps ATS parse distinct accomplishments.");
  } else {
    result.feedback.push("Use bullet points to describe your experience - this improves ATS readability and makes your achievements stand out.");
  }

  const actionVerbData = getActionVerbData(parsedResume);
  if (actionVerbData.count >= 5) {
    points += 2;
    result.feedback.push(`Strong use of action verbs (${actionVerbData.count} detected) - helps portray accomplishments effectively to both ATS and recruiters.`);
  } else if (actionVerbData.count >= 3) {
    points++;
    result.feedback.push(`Good use of action verbs (${actionVerbData.count} detected) - helps portray your contributions effectively.`);
  } else {
    result.feedback.push(`Limited use of action verbs - only ${actionVerbData.count} detected. Use more powerful action verbs (like 'managed', 'developed', 'created') to highlight your achievements.`);
  }

  const quantifiableData = getQuantifiableData(parsedResume);
  if (quantifiableData.count >= 3) {
    points += 2;
    result.feedback.push(`Excellent use of metrics and quantifiable achievements (${quantifiableData.count} detected) - helps ATS and recruiters understand your impact.`);
  } else if (quantifiableData.count >= 1) {
    points++;
    result.feedback.push(`Some quantifiable achievements detected (${quantifiableData.count}) - adding more metrics would strengthen your resume.`);
  } else {
    result.feedback.push("No quantifiable achievements detected. Include specific numbers, percentages, and metrics to strengthen your resume and provide concrete evidence of your accomplishments.");
  }

  const lengthAnalysis = analyzeBulletPointLength(parsedResume);
  if (lengthAnalysis.optimal >= 0.8) {
    points++;
    result.feedback.push("Bullet points are well-structured with optimal length - ATS can easily parse these concise statements.");
  } else if (lengthAnalysis.optimal >= 0.5) {
    points += 0.5;
    result.feedback.push("Some bullet points may be too lengthy - for optimal ATS scanning, keep each bullet to 1-2 lines (about 50-100 characters).");
  } else {
    result.feedback.push("Many bullet points are too long or too short - aim for 1-2 lines per bullet (about 50-100 characters) for best ATS readability.");
  }

  const clicheAnalysis = analyzeClichePhrases(parsedResume);
  if (clicheAnalysis.count <= 1) {
    points++;
    result.feedback.push("Good job avoiding resume clichés and overused phrases - your content appears authentic and specific.");
  } else {
    result.feedback.push(`Found ${clicheAnalysis.count} cliché phrases like "${clicheAnalysis.examples.join('", "')}". Replace generic phrases with specific accomplishments and skills.`);
  }

  const tenseAnalysis = analyzeTenseConsistency(parsedResume);
  if (tenseAnalysis.consistent) {
    points++;
    result.feedback.push("Consistent and appropriate tense usage throughout experience descriptions - demonstrates attention to detail.");
  } else {
    result.feedback.push("Inconsistent tense usage detected. Use past tense for previous roles and present tense for current positions consistently.");
  }

  result.score = Math.round((points / totalPoints) * 100);

  if (result.score >= 90) {
    result.explanation = "Your resume content is excellent, with strong action verbs, quantifiable achievements, and appropriately structured descriptions. This content is highly effective for both ATS systems and human reviewers.";
  } else if (result.score >= 70) {
    result.explanation = "Your resume content is good, with reasonable use of action verbs and some metrics. There's room for improvement in how you present your achievements and the specificity of your accomplishments.";
  } else if (result.score >= 50) {
    result.explanation = "Your resume content needs improvement to be more effective with ATS systems and recruiters. Focus on using more action verbs, adding quantifiable achievements, and optimizing bullet point structure.";
  } else {
    result.explanation = "Your resume content requires significant revision to effectively communicate your qualifications to ATS systems and hiring managers. Focus on completely restructuring how you describe your experiences and accomplishments.";
  }

  return result;
};

/**
 * Get detailed information about action verb usage
 */
const getActionVerbData = (parsedResume: ParsedResume) => {
  const actionVerbs = [
    "achieved", "accomplished", "administered", "advanced", "analyzed", "built", "calculated", 
    "collaborated", "conducted", "consolidated", "constructed", "contributed", "coordinated", 
    "created", "delegated", "demonstrated", "designed", "developed", "directed", "earned",
    "established", "evaluated", "executed", "expanded", "facilitated", "generated", "implemented",
    "improved", "increased", "initiated", "innovated", "introduced", "launched", "led",
    "maintained", "managed", "marketed", "negotiated", "operated", "optimized", "organized",
    "oversaw", "performed", "planned", "prepared", "presented", "produced", "programmed",
    "provided", "published", "recommended", "reduced", "researched", "resolved", "reviewed",
    "revitalized", "scheduled", "secured", "selected", "simplified", "solved", "spearheaded",
    "streamlined", "strengthened", "supervised", "supported", "surpassed", "trained", "transformed"
  ];
  
  const allText = extractAllText(parsedResume).toLowerCase();
  
  const usedVerbs: string[] = [];
  let count = 0;
  
  for (const verb of actionVerbs) {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(allText)) {
      count++;
      usedVerbs.push(verb);
    }
  }
  
  return {
    count,
    verbs: usedVerbs
  };
};

/**
 * Get detailed information about quantifiable achievements
 */
const getQuantifiableData = (parsedResume: ParsedResume) => {
  const allText = extractAllText(parsedResume);
  
  const quantifiableRegex = /\b\d+%|\$\d+|\d+ percent|\d+ times|increased by \d+|decreased by \d+|improved by \d+|\d+ people|\d+ team members|\d+ projects|\d+ clients|\d+ customers|\d+ users|\d+ products|\d+ services|\d+ years|\d+ months|\d+ weeks|\d+ days|\d+ hours|\d+ million|\d+ billion|\d+ thousand|\d+k|\d+M|\d+B|\d+T/gi;
  
  const matches = allText.match(quantifiableRegex) || [];
  
  return {
    count: matches.length,
    examples: matches.slice(0, 3)
  };
};

/**
 * Analyze the length of bullet points
 */
const analyzeBulletPointLength = (parsedResume: ParsedResume) => {
  let totalBullets = 0;
  let tooLong = 0;
  let tooShort = 0;
  let optimal = 0;
  
  parsedResume.experience.forEach(exp => {
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        totalBullets++;
        
        if (bp.text) {
          const length = bp.text.length;
          if (length > 200) {
            tooLong++;
          } 
          else if (length < 30) {
            tooShort++;
          }
          else {
            optimal++;
          }
        }
      });
    }
  });
  
  ['projects', 'education'].forEach(section => {
    if (parsedResume[section]) {
      parsedResume[section].forEach(item => {
        if (item.bulletPoints) {
          item.bulletPoints.forEach(bp => {
            totalBullets++;
            
            if (bp.text) {
              const length = bp.text.length;
              if (length > 200) {
                tooLong++;
              } else if (length < 30) {
                tooShort++;
              } else {
                optimal++;
              }
            }
          });
        }
      });
    }
  });
  
  return {
    total: totalBullets,
    tooLong,
    tooShort,
    optimal,
    optimal_ratio: totalBullets > 0 ? optimal / totalBullets : 0
  };
};

/**
 * Analyze the use of cliché phrases in the resume
 */
const analyzeClichePhrases = (parsedResume: ParsedResume) => {
  const clichePhrases = [
    "team player",
    "detail-oriented",
    "results-driven",
    "hard worker",
    "think outside the box",
    "go-getter",
    "synergy",
    "best of breed",
    "go the extra mile",
    "self-starter",
    "proactive",
    "dynamic",
    "passionate",
    "proven track record",
    "excellent communication skills",
    "motivated",
    "creative",
    "responsible for",
    "duties included",
    "hard-working",
    "detail oriented",
    "results oriented",
    "team oriented",
    "bottom line",
    "value add",
    "people person"
  ];
  
  const allText = extractAllText(parsedResume).toLowerCase();
  
  let count = 0;
  const examples: string[] = [];
  
  for (const phrase of clichePhrases) {
    const regex = new RegExp(`\\b${phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
    if (regex.test(allText)) {
      count++;
      examples.push(phrase);
      if (examples.length >= 3) break;
    }
  }
  
  return {
    count,
    examples
  };
};

/**
 * Analyze the consistency of tense usage in experience descriptions
 */
const analyzeTenseConsistency = (parsedResume: ParsedResume) => {
  let consistent = true;
  let pastTenseCount = 0;
  let presentTenseCount = 0;
  let totalChecked = 0;
  
  const pastTenseRegex = /\b(ed|managed|developed|created|implemented|designed|led|built|achieved|increased|improved|reduced)\b/i;
  
  const presentTenseRegex = /\b(manage|develop|create|implement|design|lead|build|achieve|increase|improve|reduce)\b/i;
  
  parsedResume.experience.forEach(exp => {
    let isPresentJob = false;
    
    if (exp.period && /present|current|now/i.test(exp.period)) {
      isPresentJob = true;
    }
    
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        if (bp.text) {
          totalChecked++;
          const hasPastTense = pastTenseRegex.test(bp.text);
          const hasPresentTense = presentTenseRegex.test(bp.text);
          
          if (hasPastTense) pastTenseCount++;
          if (hasPresentTense) presentTenseCount++;
          
          if (isPresentJob && hasPastTense && !hasPresentTense) {
            consistent = false;
          } 
          else if (!isPresentJob && hasPresentTense && !hasPastTense) {
            consistent = false;
          }
        }
      });
    }
    
    if (exp.description) {
      totalChecked++;
      const hasPastTense = pastTenseRegex.test(exp.description);
      const hasPresentTense = presentTenseRegex.test(exp.description);
      
      if (hasPastTense) pastTenseCount++;
      if (hasPresentTense) presentTenseCount++;
      
      if (isPresentJob && hasPastTense && !hasPresentTense) {
        consistent = false;
      } 
      else if (!isPresentJob && hasPresentTense && !hasPastTense) {
        consistent = false;
      }
    }
  });
  
  return {
    consistent: totalChecked > 0 ? consistent : true,
    pastTenseCount,
    presentTenseCount,
    totalChecked
  };
};

/**
 * Evaluates the keywords usage in the resume
 */
const evaluateKeywords = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    foundKeywords: [] as string[],
    missingKeywords: [] as string[],
    industryRelevance: 0,
    explanation: ""
  };

  // Extract all text from the resume
  const allText = extractAllText(parsedResume).toLowerCase();
  
  // Detect industry based on job titles and skills
  const detectedIndustry = detectIndustry(parsedResume);
  const industryKeywords = getIndustryKeywords(detectedIndustry);
  
  // Common resume keywords (general professional terms)
  const commonKeywords = [
    "experience", "education", "skills", "projects", "achievements", "leadership",
    "management", "team", "success", "responsibility", "communication", "collaboration",
    "problem-solving", "analytics", "research", "development", "strategy", "planning",
    "organization", "implementation", "coordination", "assessment", "evaluation",
    "proficient", "knowledge", "expertise", "professional", "qualified", "certified",
    "specialized", "trained", "accomplished", "successful", "effective", "efficient",
    "reliable", "dedicated", "committed", "motivated", "enthusiastic", "passionate"
  ];
  
  // Technical skills keywords
  const technicalKeywords = [
    "programming", "software", "development", "engineering", "technical", "technology",
    "system", "application", "database", "network", "infrastructure", "architecture",
    "framework", "library", "api", "interface", "integration", "deployment", "implementation",
    "design", "analysis", "testing", "debugging", "maintenance", "support", "optimization",
    "performance", "security", "algorithm", "data structure", "version control", "git",
    "cloud", "aws", "azure", "google cloud", "devops", "ci/cd", "continuous integration",
    "agile", "scrum", "kanban", "sprint", "frontend", "backend", "full-stack", "web",
    "mobile", "desktop", "service", "microservice", "container", "docker", "kubernetes"
  ];
  
  // Tool and technology keywords
  const toolKeywords = [
    "javascript", "typescript", "python", "java", "c#", "c++", "go", "ruby", "php",
    "swift", "kotlin", "rust", "scala", "perl", "shell", "bash", "powershell", 
    "html", "css", "sql", "nosql", "react", "angular", "vue", "svelte", "node.js",
    "express", "django", "flask", "spring", "asp.net", "laravel", "ruby on rails",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy", "matplotlib",
    "mysql", "postgresql", "mongodb", "oracle", "sqlserver", "redis", "elasticsearch",
    "firebase", "aws", "ec2", "s3", "lambda", "dynamodb", "rds", "azure", "gcp",
    "docker", "kubernetes", "jenkins", "travis", "github actions", "gitlab ci",
    "terraform", "ansible", "puppet", "chef", "prometheus", "grafana", "elk",
    "jira", "confluence", "trello", "slack", "teams", "figma", "sketch", "adobe xd",
    "photoshop", "illustrator", "indesign", "premiere", "after effects", "excel",
    "word", "powerpoint", "tableau", "power bi", "looker", "metabase", "qlik"
  ];
  
  // Count found keywords
  const foundKeywords: string[] = [];
  
  // Check common keywords
  for (const keyword of commonKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(allText)) {
      foundKeywords.push(keyword);
    }
  }
  
  // Check technical keywords
  for (const keyword of technicalKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(allText)) {
      foundKeywords.push(keyword);
    }
  }
  
  // Check tool keywords
  for (const keyword of toolKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(allText)) {
      foundKeywords.push(keyword);
    }
  }
  
  // Check industry-specific keywords
  const foundIndustryKeywords: string[] = [];
  for (const keyword of industryKeywords) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(allText)) {
      foundIndustryKeywords.push(keyword);
      foundKeywords.push(keyword);
    }
  }
  
  // Deduplicate keywords
  result.foundKeywords = [...new Set(foundKeywords)];
  
  // Calculate industry relevance score
  result.industryRelevance = industryKeywords.length > 0 
    ? Math.min(100, Math.round((foundIndustryKeywords.length / Math.min(industryKeywords.length, 20)) * 100))
    : 0;
  
  // Generate missing keywords suggestion
  const suggestedKeywords = getMissingSuggestedKeywords(parsedResume, detectedIndustry, result.foundKeywords);
  result.missingKeywords = suggestedKeywords;
  
  // Calculate score based on keyword density and relevance
  const keywordDensity = foundKeywords.length;
  let points = 0;
  const totalPoints = 10;

  // Points based on total keywords found
  if (keywordDensity >= 30) {
    points += 4;
    result.feedback.push(`Excellent keyword density with ${keywordDensity} relevant terms detected - this significantly improves your visibility in ATS searches.`);
  } else if (keywordDensity >= 20) {
    points += 3;
    result.feedback.push(`Good keyword density with ${keywordDensity} relevant terms detected - this helps your resume rank well in ATS searches.`);
  } else if (keywordDensity >= 10) {
    points += 2;
    result.feedback.push(`Moderate keyword usage with ${keywordDensity} relevant terms - consider incorporating more industry-specific keywords.`);
  } else {
    points += 1;
    result.feedback.push(`Limited keyword usage detected (only ${keywordDensity} terms) - your resume needs more relevant keywords to perform well in ATS searches.`);
  }

  // Points based on industry relevance
  if (result.industryRelevance >= 80) {
    points += 4;
    result.feedback.push(`Excellent industry-specific terminology (${result.industryRelevance}% relevance) - your resume is well-tailored to the ${detectedIndustry} sector.`);
  } else if (result.industryRelevance >= 60) {
    points += 3;
    result.feedback.push(`Good industry-specific terminology (${result.industryRelevance}% relevance) - your resume demonstrates knowledge of the ${detectedIndustry} field.`);
  } else if (result.industryRelevance >= 40) {
    points += 2;
    result.feedback.push(`Moderate industry-specific terminology (${result.industryRelevance}% relevance) - consider adding more ${detectedIndustry}-specific terms.`);
  } else {
    points += 1;
    result.feedback.push(`Limited industry-specific terminology (${result.industryRelevance}% relevance) - your resume lacks sufficient ${detectedIndustry}-focused keywords.`);
  }

  // Points based on keyword placement
  const keywordPlacementScore = evaluateKeywordPlacement(parsedResume, result.foundKeywords);
  if (keywordPlacementScore >= 80) {
    points += 2;
    result.feedback.push("Excellent keyword placement - important terms are strategically positioned in section headings, job titles, and skill lists where ATS systems give them higher weight.");
  } else if (keywordPlacementScore >= 50) {
    points += 1;
    result.feedback.push("Reasonable keyword placement - consider emphasizing important terms in section headings, job titles, and the skills section for better ATS recognition.");
  } else {
    result.feedback.push("Poor keyword placement - keywords are buried in paragraphs or descriptions rather than highlighted in prominent positions like headings, job titles, or skill lists.");
  }

  // Add missing keywords feedback
  if (suggestedKeywords.length > 0) {
    result.feedback.push(`Consider adding these relevant ${detectedIndustry} keywords: ${suggestedKeywords.slice(0, 5).join(', ')}${suggestedKeywords.length > 5 ? '...' : ''}`);
  }

  // Calculate final score
  result.score = Math.round((points / totalPoints) * 100);

  // Generate detailed explanation based on score
  if (result.score >= 90) {
    result.explanation = `Your resume has exceptional keyword optimization for the ${detectedIndustry} industry, with strong keyword density and strategic placement. ATS systems will likely rank your resume highly for relevant positions.`;
  } else if (result.score >= 70) {
    result.explanation = `Your resume has good keyword optimization for the ${detectedIndustry} industry, though there's room for improvement. Consider adding more industry-specific terminology and ensuring strategic placement of keywords.`;
  } else if (result.score >= 50) {
    result.explanation = `Your resume has average keyword optimization for the ${detectedIndustry} industry. To improve ATS performance, incorporate more industry-specific terminology and position keywords more strategically.`;
  } else {
    result.explanation = `Your resume needs significant keyword enhancement for the ${detectedIndustry} industry. Focus on incorporating industry-specific terminology, technical skills, and ensuring proper keyword placement to improve ATS visibility.`;
  }

  return result;
};

/**
 * Detect the likely industry based on job titles and skills
 */
const detectIndustry = (parsedResume: ParsedResume): string => {
  const allText = extractAllText(parsedResume).toLowerCase();
  
  // Define industry indicators
  const industryIndicators: Record<string, string[]> = {
    "Software Development": ["software", "developer", "engineer", "programming", "web", "frontend", "backend", "full-stack", "mobile", "app", "code", "coding"],
    "Data Science": ["data scientist", "machine learning", "ai", "artificial intelligence", "deep learning", "neural network", "data analysis", "analytics", "statistics", "statistical", "big data"],
    "Healthcare": ["healthcare", "medical", "clinical", "doctor", "nurse", "patient", "hospital", "physician", "pharmaceutical", "biomedical", "health"],
    "Finance": ["finance", "financial", "banking", "investment", "investor", "trading", "trader", "portfolio", "asset", "wealth", "accounting", "accountant", "cpa", "audit", "tax"],
    "Marketing": ["marketing", "digital marketing", "seo", "content", "social media", "campaign", "branding", "brand", "advertise", "advertising", "market research"],
    "Sales": ["sales", "business development", "account executive", "customer acquisition", "revenue", "quota", "pipeline", "prospecting", "closing deals"],
    "Human Resources": ["hr", "human resources", "talent", "recruitment", "recruiting", "recruiter", "hiring", "onboarding", "benefits", "compensation", "employee relations"],
    "Engineering": ["engineering", "mechanical", "electrical", "civil", "structural", "architect", "architecture", "construction", "manufacturing", "industrial"],
    "Legal": ["legal", "lawyer", "attorney", "law", "counsel", "litigation", "paralegal", "contract", "compliance", "regulatory"],
    "Education": ["education", "teaching", "teacher", "professor", "academic", "school", "university", "college", "student", "curriculum", "instruction", "educational"]
  };
  
  // Score each industry
  const scores: Record<string, number> = {};
  
  for (const [industry, indicators] of Object.entries(industryIndicators)) {
    scores[industry] = 0;
    
    for (const indicator of indicators) {
      const regex = new RegExp(`\\b${indicator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const matches = (allText.match(regex) || []).length;
      scores[industry] += matches;
    }
    
    // Check job titles specifically (weighted heavier)
    parsedResume.experience.forEach(exp => {
      if (exp.title) {
        const title = exp.title.toLowerCase();
        for (const indicator of indicators) {
          if (title.includes(indicator.toLowerCase())) {
            scores[industry] += 3; // Extra weight for job titles
          }
        }
      }
    });
  }
  
  // Find highest scoring industry
  let highestScore = 0;
  let detectedIndustry = "General";
  
  for (const [industry, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedIndustry = industry;
    }
  }
  
  return highestScore >= 3 ? detectedIndustry : "General";
};

/**
 * Get industry-specific keywords based on detected industry
 */
const getIndustryKeywords = (industry: string): string[] => {
  const industryKeywords: Record<string, string[]> = {
    "Software Development": [
      "agile", "scrum", "kanban", "git", "github", "gitlab", "version control", "algorithm", "data structure", 
      "api", "rest", "graphql", "microservices", "cloud", "aws", "azure", "gcp", "devops", "ci/cd", 
      "docker", "kubernetes", "jenkins", "testing", "unit test", "integration test", "e2e test", "database", 
      "sql", "nosql", "orm", "frontend", "backend", "full-stack", "web development", "mobile development", 
      "responsive design", "ui/ux", "architecture", "design patterns", "mvc", "mvvm", "tdd", "bdd"
    ],
    "Data Science": [
      "machine learning", "deep learning", "neural network", "ai", "artificial intelligence", "nlp", 
      "natural language processing", "computer vision", "predictive modeling", "statistical analysis", 
      "data mining", "data visualization", "big data", "hadoop", "spark", "tensorflow", "pytorch", 
      "scikit-learn", "pandas", "numpy", "r", "python", "jupyter", "tableau", "power bi", "data warehouse", 
      "etl", "feature engineering", "regression", "classification", "clustering", "dimensionality reduction", 
      "time series", "a/b testing", "hypothesis testing", "bayesian"
    ],
    "Healthcare": [
      "patient care", "clinical", "medical", "healthcare", "hospital", "physician", "nurse", "nursing", 
      "patient", "diagnosis", "treatment", "therapy", "therapeutic", "pharmaceutical", "medication", 
      "prescription", "hipaa", "emr", "electronic medical record", "ehr", "electronic health record", 
      "clinical trial", "medical research", "patient safety", "quality improvement", "care coordination", 
      "telehealth", "telemedicine", "preventive care", "acute care", "chronic care", "rehabilitation"
    ],
    "Finance": [
      "financial analysis", "financial reporting", "accounting", "budgeting", "forecasting", "audit", 
      "tax", "investment", "portfolio management", "asset management", "wealth management", "banking", 
      "credit analysis", "risk management", "financial modeling", "valuation", "mergers & acquisitions", 
      "capital markets", "equity", "fixed income", "derivatives", "securities", "hedge fund", "private equity", 
      "venture capital", "financial regulation", "compliance", "gaap", "ifrs", "excel", "bloomberg"
    ],
    "Marketing": [
      "digital marketing", "social media marketing", "content marketing", "seo", "sem", "ppc", "paid search", 
      "email marketing", "marketing automation", "crm", "customer relationship management", "market research", 
      "brand strategy", "brand management", "marketing analytics", "campaign management", "lead generation", 
      "conversion optimization", "customer acquisition", "customer retention", "marketing strategy", 
      "public relations", "influencer marketing", "google analytics", "a/b testing", "kpi", "roi"
    ],
    "Sales": [
      "sales strategy", "account management", "business development", "client relationship", "closing", 
      "negotiation", "cold calling", "prospecting", "lead generation", "pipeline management", "sales funnel", 
      "revenue growth", "quota", "target", "forecasting", "crm", "salesforce", "hubspot", "consultative selling", 
      "solution selling", "value proposition", "competitive analysis", "customer acquisition", "customer retention", 
      "upselling", "cross-selling", "contract negotiation", "territory management"
    ],
    "Human Resources": [
      "talent acquisition", "recruitment", "hiring", "onboarding", "employee retention", "performance management", 
      "compensation", "benefits", "payroll", "hr compliance", "employee relations", "employee engagement", 
      "succession planning", "workforce planning", "learning & development", "training", "hris", "hr analytics", 
      "diversity & inclusion", "organizational development", "change management", "culture", "labor relations", 
      "conflict resolution", "employee experience", "hr strategy", "ada", "fmla", "eeoc"
    ],
    "Engineering": [
      "cad", "computer-aided design", "cae", "computer-aided engineering", "product development", 
      "mechanical design", "electrical design", "structural analysis", "finite element analysis", "fea", 
      "simulation", "prototyping", "manufacturing", "fabrication", "quality control", "quality assurance", 
      "testing", "certification", "regulatory compliance", "project management", "lean", "six sigma", 
      "iso", "safety standards", "industrial design", "materials science", "sustainability", "renewable energy", 
      "automation", "robotics", "blueprint", "technical drawing", "specifications"
    ],
    "Legal": [
      "litigation", "contract law", "corporate law", "intellectual property", "patent", "trademark", "copyright", 
      "compliance", "regulatory", "legal research", "legal writing", "negotiation", "mediation", "arbitration", 
      "counsel", "legal advice", "discovery", "deposition", "trial", "settlement", "due diligence", "legal analysis", 
      "case law", "precedent", "legal procedure", "legal documentation", "brief", "memorandum", "motion", "pleading", 
      "legal ethics", "bar"
    ],
    "Education": [
      "curriculum development", "instructional design", "lesson planning", "assessment", "evaluation", 
      "pedagogy", "teaching methodology", "classroom management", "student engagement", "differentiated instruction", 
      "blended learning", "e-learning", "online education", "educational technology", "learning management system", 
      "lms", "student success", "academic advising", "special education", "iep", "individualized education plan", 
      "professional development", "educational research", "learning outcomes", "standards-based", "student assessment", 
      "formative assessment", "summative assessment"
    ],
    "General": [
      "leadership", "management", "communication", "teamwork", "collaboration", "problem-solving", 
      "critical thinking", "decision making", "time management", "project management", "organization", 
      "planning", "strategic thinking", "innovation", "creativity", "adaptability", "flexibility", 
      "initiative", "productivity", "efficiency", "detail-oriented", "multitasking", "prioritization", 
      "conflict resolution", "negotiation", "presentation", "reporting", "analysis", "supervision", 
      "interpersonal", "verbal communication", "written communication"
    ]
  };
  
  return industryKeywords[industry] || industryKeywords["General"];
};

/**
 * Get missing but relevant keywords for the resume
 */
const getMissingSuggestedKeywords = (parsedResume: ParsedResume, industry: string, foundKeywords: string[]): string[] => {
  const industryKeywords = getIndustryKeywords(industry);
  
  // Find missing keywords
  const missingKeywords = industryKeywords.filter(keyword => 
    !foundKeywords.some(found => 
      found.toLowerCase() === keyword.toLowerCase() || 
      keyword.toLowerCase().includes(found.toLowerCase()) || 
      found.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  // Return a random selection of missing keywords (up to 10)
  const shuffled = missingKeywords.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
};

/**
 * Evaluate the strategic placement of keywords in the resume
 */
const evaluateKeywordPlacement = (parsedResume: ParsedResume, keywords: string[]): number => {
  let placementScore = 0;
  const maxScore = 100;
  
  // Check keywords in skills section (high value placement)
  if (parsedResume.skills && parsedResume.skills.length > 0) {
    const skillsText = parsedResume.skills.join(" ").toLowerCase();
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(skillsText)) {
        placementScore += 2; // High value for skills section
      }
    }
  }
  
  // Check keywords in job titles (high value placement)
  parsedResume.experience.forEach(exp => {
    if (exp.title) {
      const titleText = exp.title.toLowerCase();
      
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(titleText)) {
          placementScore += 3; // Very high value for job titles
        }
      }
    }
  });
  
  // Check keywords in bullet points (medium value placement)
  parsedResume.experience.forEach(exp => {
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        if (bp.text) {
          const bulletText = bp.text.toLowerCase();
          
          for (const keyword of keywords) {
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            if (regex.test(bulletText)) {
              placementScore += 1; // Medium value for bullet points
            }
          }
        }
      });
    }
  });
  
  // Cap the score at max
  return Math.min(placementScore, maxScore);
};

/**
 * Evaluates the contact information in the resume
 */
const evaluateContactInfo = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    explanation: ""
  };

  let points = 0;
  const totalPoints = 10;

  // Check for name
  if (parsedResume.personalInfo && parsedResume.personalInfo.name && parsedResume.personalInfo.name.trim()) {
    const name = parsedResume.personalInfo.name.trim();
    points += 2;
    
    // Check if full name is provided (first and last name)
    if (name.includes(' ') && name.length > 5) {
      points += 2;
      result.feedback.push("Full name present - helps ATS identify your identity.");
    } else {
      result.feedback.push("Missing full name, which is essential for ATS identification.");
    }
    
    if (parsedResume.personalInfo && parsedResume.personalInfo.email) {
      if (isValidEmail(parsedResume.personalInfo.email)) {
        points++;
        result.feedback.push("Valid email address present - helps ATS identify your contact method.");
      } else {
        result.feedback.push("Email address appears to have an invalid format.");
      }
    } else {
      result.feedback.push("Missing email address, which is a critical contact method for employers.");
    }
    
    if (parsedResume.personalInfo && parsedResume.personalInfo.phone) {
      points++;
      result.feedback.push("Phone number present - helps ATS identify your contact method.");
    } else {
      result.feedback.push("Missing phone number, which is a standard contact method for employers.");
    }
    
    if (parsedResume.personalInfo && parsedResume.personalInfo.location) {
      points++;
      result.feedback.push("Location information present - helps ATS assess your proximity.");
    } else {
      result.feedback.push("Missing location information, which helps employers assess your proximity.");
    }

    result.score = Math.round((points / totalPoints) * 100);
    
    if (result.score === 100) {
      result.explanation = "All essential contact information is present and properly formatted.";
    } else {
      result.explanation = "Some essential contact information is missing or improperly formatted. Consider adding or updating this information to improve ATS compatibility.";
    }
    
    return result;
  }
};

/**
 * Extract all text content from a resume
 */
const extractAllText = (parsedResume: ParsedResume): string => {
  let allText = "";
  
  // Personal info text
  if (parsedResume.personalInfo) {
    allText += parsedResume.personalInfo.name + " ";
    allText += parsedResume.personalInfo.email + " ";
    if (parsedResume.personalInfo.phone) allText += parsedResume.personalInfo.phone + " ";
    if (parsedResume.personalInfo.title) allText += parsedResume.personalInfo.title + " ";
    if (parsedResume.personalInfo.location) allText += parsedResume.personalInfo.location + " ";
    if (parsedResume.personalInfo.bio) allText += parsedResume.personalInfo.bio + " ";
  }
  
  // Experience text
  parsedResume.experience.forEach(exp => {
    allText += exp.title + " ";
    allText += exp.company + " ";
    allText += exp.period + " ";
    if (exp.description) allText += exp.description + " ";
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        if (bp.text) allText += bp.text + " ";
      });
    }
  });
  
  // Education text
  parsedResume.education.forEach(edu => {
    allText += edu.degree + " ";
    allText += edu.institution + " ";
    allText += edu.year + " ";
    if (edu.description) allText += edu.description + " ";
    if (edu.field) allText += edu.field + " ";
    if (edu.gpa) allText += edu.gpa + " ";
    if (edu.bulletPoints) {
      edu.bulletPoints.forEach(bp => {
        if (bp.text) allText += bp.text + " ";
      });
    }
  });
  
  // Skills
  if (parsedResume.skills) {
    parsedResume.skills.forEach(skill => {
      allText += skill.name + " ";
    });
  }
  
  // Projects
  if (parsedResume.projects) {
    parsedResume.projects.forEach(project => {
      allText += project.name + " ";
      if (project.description) allText += project.description + " ";
      if (project.bulletPoints) {
        project.bulletPoints.forEach(bp => {
          if (bp.text) allText += bp.text + " ";
        });
      }
    });
  }
  
  // Certifications
  if (parsedResume.certifications) {
    parsedResume.certifications.forEach(cert => {
      allText += cert.name + " ";
      allText += cert.issuer + " ";
      if (cert.bulletPoints) {
        cert.bulletPoints.forEach(bp => {
          if (bp.text) allText += bp.text + " ";
        });
      }
    });
  }
  
  return allText;
};

/**
 * Check for action verbs in the resume
 */
const checkForActionVerbs = (parsedResume: ParsedResume): boolean => {
  const actionVerbs = [
    "achieved", "accomplished", "administered", "advanced", "analyzed", "built", "calculated", 
    "collaborated", "conducted", "consolidated", "constructed", "contributed", "coordinated", 
    "created", "delegated", "demonstrated", "designed", "developed", "directed", "earned",
    "established", "evaluated", "executed", "expanded", "facilitated", "generated", "implemented",
    "improved", "increased", "initiated", "innovated", "introduced", "launched", "led",
    "maintained", "managed", "marketed", "negotiated", "operated", "optimized", "organized",
    "oversaw", "performed", "planned", "prepared", "presented", "produced", "programmed",
    "provided", "published", "recommended", "reduced", "researched", "resolved", "reviewed",
    "revitalized", "scheduled", "secured", "selected", "simplified", "solved", "spearheaded",
    "streamlined", "strengthened", "supervised", "supported", "surpassed", "trained", "transformed"
  ];
  
  const allText = extractAllText(parsedResume).toLowerCase();
  
  let count = 0;
  for (const verb of actionVerbs) {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(allText)) {
      count++;
      if (count >= 3) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Check for quantifiable achievements
 */
const checkForQuantifiableAchievements = (parsedResume: ParsedResume): boolean => {
  const allText = extractAllText(parsedResume);
  
  const quantifiableRegex = /\b\d+%|\$\d+|\d+ percent|\d+ times|increased by \d+|decreased by \d+|improved by \d+|\d+ people|\d+ team members|\d+ projects|\d+ clients|\d+ customers|\d+ users|\d+ products|\d+ services|\d+ years|\d+ months|\d+ weeks|\d+ days|\d+ hours|\d+ million|\d+ billion|\d+ thousand|\d+k|\d+M|\d+B|\d+T/i;
  
  return quantifiableRegex.test(allText);
};

/**
 * Check if bullet points and descriptions are appropriate length
 */
const checkDescriptionLength = (parsedResume: ParsedResume): boolean => {
  let totalBullets = 0;
  let longBullets = 0;
  
  parsedResume.experience.forEach(exp => {
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        totalBullets++;
        if (bp.text && bp.text.length > 200) {
          longBullets++;
        }
      });
    }
    
    if (exp.description && exp.description.length > 300) {
      longBullets++;
      totalBullets++;
    }
  });
  
  if (totalBullets > 0 && (longBullets / totalBullets) < 0.3) {
    return true;
  }
  
  return totalBullets === 0;
};

/**
 * Check if an email is valid
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generates actionable recommendations based on section scores
 */
const generateRecommendations = (
  formatScore: number, 
  contentScore: number, 
  keywordsScore: number, 
  contactInfoScore: number,
  formatFeedback: string[],
  contentFeedback: string[],
  keywordsFeedback: string[],
  contactFeedback: string[],
  foundKeywords: string[],
  missingKeywords: string[]
): string[] => {
  const recommendations: string[] = [];
  
  // Create a sorted array of scores to identify weakest areas
  const scores = [
    { section: "format", score: formatScore, feedback: formatFeedback },
    { section: "content", score: contentScore, feedback: contentFeedback },
    { section: "keywords", score: keywordsScore, feedback: keywordsFeedback },
    { section: "contactInfo", score: contactInfoScore, feedback: contactFeedback }
  ].sort((a, b) => a.score - b.score);
  
  // Focus on the lowest scoring sections
  const lowestSection = scores[0];
  const secondLowestSection = scores[1];
  
  // Generate recommendations for the lowest scoring section
  if (lowestSection.score < 70) {
    const priority = lowestSection.score < 50 ? "Critical priority" : "High priority";
    
    switch (lowestSection.section) {
      case "format":
        recommendations.push(`${priority}: Improve your resume format. ${getFormatRecommendation(formatScore, formatFeedback)}`);
        break;
      case "content":
        recommendations.push(`${priority}: Enhance your resume content. ${getContentRecommendation(contentScore, contentFeedback)}`);
        break;
      case "keywords":
        recommendations.push(`${priority}: Optimize your resume keywords. ${getKeywordsRecommendation(keywordsScore, keywordsFeedback, missingKeywords)}`);
        break;
      case "contactInfo":
        recommendations.push(`${priority}: Update your contact information. ${getContactRecommendation(contactInfoScore, contactFeedback)}`);
        break;
    }
  }
  
  // Generate recommendations for the second lowest scoring section
  if (secondLowestSection.score < 80) {
    const priority = secondLowestSection.score < 60 ? "High priority" : "Medium priority";
    
    switch (secondLowestSection.section) {
      case "format":
        recommendations.push(`${priority}: Improve your resume format. ${getFormatRecommendation(formatScore, formatFeedback)}`);
        break;
      case "content":
        recommendations.push(`${priority}: Enhance your resume content. ${getContentRecommendation(contentScore, contentFeedback)}`);
        break;
      case "keywords":
        recommendations.push(`${priority}: Optimize your resume keywords. ${getKeywordsRecommendation(keywordsScore, keywordsFeedback, missingKeywords)}`);
        break;
      case "contactInfo":
        recommendations.push(`${priority}: Update your contact information. ${getContactRecommendation(contactInfoScore, contactFeedback)}`);
        break;
    }
  }
  
  // Add a general recommendation for very good resumes
  if (scores[0].score >= 70) {
    const suggestedKeywords = missingKeywords.slice(0, 3).join(", ");
    if (suggestedKeywords) {
      recommendations.push(`Fine-tuning: Your resume is already well-optimized for ATS. For further improvement, consider adding these relevant keywords: ${suggestedKeywords}.`);
    } else {
      recommendations.push("Fine-tuning: Your resume is already well-optimized for ATS. For further improvement, ensure all achievements are quantified and formatting is consistent.");
    }
  }
  
  // Add file format recommendation if not already covered
  if (!recommendations.some(rec => rec.includes("PDF"))) {
    recommendations.push("Submit your resume as a PDF file unless specifically instructed otherwise. PDFs maintain your formatting across all ATS systems while still being machine-readable.");
  }
  
  // Limit to 3 most important recommendations
  return recommendations.slice(0, 3);
};

/**
 * Generate specific format recommendations
 */
const getFormatRecommendation = (score: number, feedback: string[]): string => {
  if (score < 50) {
    // Find most critical formatting issues
    const criticalIssues = feedback.filter(fb => 
      fb.includes("missing") || 
      fb.includes("structure") || 
      fb.includes("headings") ||
      fb.includes("sections")
    );
    
    if (criticalIssues.length > 0) {
      return criticalIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Use a clean, single-column layout with clearly labeled section headings like 'Experience', 'Education', and 'Skills' to ensure ATS systems can properly categorize your information.";
  } else if (score < 70) {
    // Find moderate formatting issues
    const moderateIssues = feedback.filter(fb => 
      fb.includes("could be") || 
      fb.includes("improve") || 
      fb.includes("consider")
    );
    
    if (moderateIssues.length > 0) {
      return moderateIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Standardize your section headings, ensure consistent date formatting throughout, and maintain proper reverse-chronological order for experience and education sections.";
  } else {
    return "Maintain your clean structure while ensuring consistent formatting of dates, bullet points, and margins throughout the document.";
  }
};

/**
 * Generate specific content recommendations
 */
const getContentRecommendation = (score: number, feedback: string[]): string => {
  if (score < 50) {
    // Find critical content issues
    const criticalIssues = feedback.filter(fb => 
      fb.includes("bullet points") || 
      fb.includes("action verbs") || 
      fb.includes("quantifiable") ||
      fb.includes("achievements")
    );
    
    if (criticalIssues.length > 0) {
      return criticalIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Restructure your experience using bullet points with strong action verbs (like 'achieved', 'developed', 'managed') at the beginning of each point, and include specific, measurable achievements.";
  } else if (score < 70) {
    // Find moderate content issues
    const moderateIssues = feedback.filter(fb => 
      fb.includes("Some") || 
      fb.includes("more") || 
      fb.includes("could be")
    );
    
    if (moderateIssues.length > 0) {
      return moderateIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Strengthen your bullet points with more powerful action verbs and include metrics where possible (e.g., 'Increased sales by 20%', 'Managed a team of 15 people').";
  } else {
    return "Further enhance your content by ensuring every bullet point follows the 'action verb + task + measurable result' formula for maximum impact.";
  }
};

/**
 * Generate specific keywords recommendations
 */
const getKeywordsRecommendation = (score: number, feedback: string[], missingKeywords: string[]): string => {
  const keywordSuggestions = missingKeywords.slice(0, 5).join(", ");
  
  if (score < 50) {
    // Find critical keyword issues
    const criticalIssues = feedback.filter(fb => 
      fb.includes("Limited keyword") || 
      fb.includes("lacks") || 
      fb.includes("missing")
    );
    
    if (criticalIssues.length > 0) {
      return `${criticalIssues[0].replace(/^[^a-zA-Z]+/, "")} Consider adding these relevant keywords: ${keywordSuggestions}.`;
    }
    
    return `Add industry-specific keywords throughout your resume, especially in your summary, skills section, and job descriptions. Consider including: ${keywordSuggestions}.`;
  } else if (score < 70) {
    // Find moderate keyword issues
    const moderateIssues = feedback.filter(fb => 
      fb.includes("Moderate") || 
      fb.includes("consider") || 
      fb.includes("more")
    );
    
    if (moderateIssues.length > 0) {
      return `${moderateIssues[0].replace(/^[^a-zA-Z]+/, "")} Consider adding: ${keywordSuggestions}.`;
    }
    
    return `Strategically incorporate more industry-specific terminology in your job titles, summary, and skills sections. Consider adding: ${keywordSuggestions}.`;
  } else {
    return `Your keyword usage is good, but for even better results, consider incorporating these additional terms in your skills section or job descriptions: ${keywordSuggestions}.`;
  }
};

/**
 * Generate specific contact information recommendations
 */
const getContactRecommendation = (score: number, feedback: string[]): string => {
  if (score < 50) {
    // Find critical contact info issues
    const criticalIssues = feedback.filter(fb => 
      fb.includes("Missing") || 
      fb.includes("invalid")
    );
    
    if (criticalIssues.length > 0) {
      return criticalIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Ensure your full name, professional email address, phone number, and location (city, state) are clearly displayed at the top of your resume.";
  } else if (score < 70) {
    // Find moderate contact info issues
    const moderateIssues = feedback.filter(fb => 
      fb.includes("could be") || 
      fb.includes("Consider") || 
      fb.includes("format")
    );
    
    if (moderateIssues.length > 0) {
      return moderateIssues[0].replace(/^[^a-zA-Z]+/, "");
    }
    
    return "Format your contact information professionally and consistently, and consider adding your LinkedIn profile URL for additional verification.";
  } else {
    return "Your contact information is good, but consider adding your LinkedIn profile and ensuring your email address uses a professional format.";
  }
};

/**
 * Extract year from period string
 */
const extractYearFromPeriod = (period: string): number | null => {
  // Try to find years in formats like "2018-2020", "2018 - Present", "Jan 2018 - Dec 2020", etc.
  const yearRegex = /\b(19|20)\d{2}\b/g;
  const years = period.match(yearRegex);
  
  if (!years || years.length === 0) return null;
  
  // If there are multiple years, take the most recent one as the start date
  // This works for both "start - end" and "end - start" formats since we're just comparing order
  const mostRecentYear = Math.max(...years.map(y => parseInt(y, 10)));
  return mostRecentYear;
};
  