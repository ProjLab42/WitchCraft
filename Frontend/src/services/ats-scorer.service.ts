import { ParsedResume } from "@/types/resume-parser";

export interface ATSScoreResult {
  overallScore: number;
  sections: {
    format: {
      score: number;
      feedback: string[];
    };
    content: {
      score: number;
      feedback: string[];
    };
    keywords: {
      score: number;
      feedback: string[];
      detectedKeywords: string[];
    };
    contact: {
      score: number;
      feedback: string[];
    };
  };
  recommendations: string[];
}

/**
 * Evaluates a parsed resume against ATS standards
 * @param parsedResume The parsed resume data
 * @returns ATS score result with feedback
 */
export const scoreResumeForATS = (parsedResume: ParsedResume): ATSScoreResult => {
  // Initialize result structure
  const result: ATSScoreResult = {
    overallScore: 0,
    sections: {
      format: {
        score: 0,
        feedback: [],
      },
      content: {
        score: 0,
        feedback: [],
      },
      keywords: {
        score: 0,
        feedback: [],
        detectedKeywords: [],
      },
      contact: {
        score: 0,
        feedback: [],
      },
    },
    recommendations: [],
  };

  // Score each section
  const formatScore = evaluateFormat(parsedResume);
  const contentScore = evaluateContent(parsedResume);
  const keywordsScore = evaluateKeywords(parsedResume);
  const contactScore = evaluateContactInfo(parsedResume);

  // Assign section scores
  result.sections.format = formatScore;
  result.sections.content = contentScore;
  result.sections.keywords = keywordsScore;
  result.sections.contact = contactScore;

  // Calculate overall score (weighted average)
  result.overallScore = calculateOverallScore([
    { score: formatScore.score, weight: 0.25 },
    { score: contentScore.score, weight: 0.35 },
    { score: keywordsScore.score, weight: 0.25 },
    { score: contactScore.score, weight: 0.15 },
  ]);

  // Generate overall recommendations
  result.recommendations = generateRecommendations(result);

  return result;
};

/**
 * Evaluates the format of the resume
 */
const evaluateFormat = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
  };

  let points = 0;
  const totalPoints = 5;

  // Check if sections are present in a logical order
  if (parsedResume.experience.length > 0) {
    points++;
  } else {
    result.feedback.push("Missing work experience section, which is critical for ATS scanning.");
  }

  if (parsedResume.education.length > 0) {
    points++;
  } else {
    result.feedback.push("Missing education section, which is typically expected by ATS systems.");
  }

  if (parsedResume.skills.length > 0) {
    points++;
  } else {
    result.feedback.push("Missing skills section, which helps ATS match your qualifications to job requirements.");
  }

  // Check for consistent date formats
  const dateFormats = new Set();
  parsedResume.experience.forEach(exp => {
    if (exp.period) {
      dateFormats.add(getDateFormat(exp.period));
    }
  });

  parsedResume.education.forEach(edu => {
    if (edu.year) {
      dateFormats.add(getDateFormat(edu.year));
    }
  });

  if (dateFormats.size <= 1) {
    points++;
  } else {
    result.feedback.push("Inconsistent date formats detected. Use a single format throughout your resume.");
  }

  // Check for appropriate section headings
  const hasAppropriateHeadings = true; // Simplified check
  if (hasAppropriateHeadings) {
    points++;
  } else {
    result.feedback.push("Use clear section headings like 'Experience', 'Education', and 'Skills'.");
  }

  // Calculate score as percentage
  result.score = Math.round((points / totalPoints) * 100);

  // Add positive feedback if score is good
  if (result.score >= 80) {
    result.feedback.push("Your resume has a good structure that should be easily parsed by ATS systems.");
  }

  return result;
};

/**
 * Evaluates the content quality of the resume
 */
const evaluateContent = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
  };

  let points = 0;
  const totalPoints = 5;

  // Check for bullet points in experience
  const hasBulletPoints = parsedResume.experience.some(exp => 
    exp.bulletPoints && exp.bulletPoints.length > 0
  );
  
  if (hasBulletPoints) {
    points++;
  } else {
    result.feedback.push("Use bullet points to describe your experience for better ATS readability.");
  }

  // Check for action verbs in experience descriptions
  const actionVerbsUsed = checkForActionVerbs(parsedResume);
  if (actionVerbsUsed) {
    points++;
  } else {
    result.feedback.push("Use more action verbs (e.g., 'managed', 'developed', 'created') in your descriptions.");
  }

  // Check for quantifiable achievements
  const hasQuantifiableAchievements = checkForQuantifiableAchievements(parsedResume);
  if (hasQuantifiableAchievements) {
    points++;
  } else {
    result.feedback.push("Include quantifiable achievements (numbers, percentages) to strengthen your resume.");
  }

  // Check for appropriate length of descriptions
  const hasAppropriateLength = checkDescriptionLength(parsedResume);
  if (hasAppropriateLength) {
    points++;
  } else {
    result.feedback.push("Keep bullet points concise (1-2 lines each) for better ATS readability.");
  }

  // Check for industry-specific terminology
  const hasIndustryTerminology = true; // Simplified check
  if (hasIndustryTerminology) {
    points++;
  } else {
    result.feedback.push("Include more industry-specific terminology relevant to your field.");
  }

  // Calculate score as percentage
  result.score = Math.round((points / totalPoints) * 100);

  // Add positive feedback if score is good
  if (result.score >= 80) {
    result.feedback.push("Your resume content is well-structured for ATS systems.");
  }

  return result;
};

/**
 * Evaluates the keywords in the resume
 */
const evaluateKeywords = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
    detectedKeywords: [] as string[],
  };

  // Common industry keywords to check for
  const commonKeywords = [
    // Technical skills
    "javascript", "typescript", "react", "angular", "vue", "node", "express", "mongodb", "sql", "nosql", 
    "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "ci/cd", "devops", "agile", "scrum",
    "python", "java", "c#", ".net", "php", "ruby", "go", "rust", "swift", "kotlin",
    "html", "css", "sass", "less", "bootstrap", "tailwind", "material-ui", "responsive",
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello",
    "rest", "graphql", "api", "microservices", "serverless", "websockets",
    "machine learning", "ai", "data science", "big data", "analytics", "tableau", "power bi",
    "mobile", "ios", "android", "react native", "flutter", "xamarin",
    "testing", "unit testing", "integration testing", "jest", "mocha", "cypress", "selenium",
    
    // Soft skills
    "leadership", "management", "communication", "teamwork", "problem solving", "critical thinking",
    "project management", "time management", "organization", "detail oriented", "analytical",
    "customer service", "client relations", "negotiation", "presentation", "public speaking",
    
    // Business terms
    "strategy", "operations", "marketing", "sales", "finance", "accounting", "human resources",
    "product management", "business development", "customer success", "stakeholder",
    "roi", "kpi", "metrics", "revenue", "growth", "profit", "budget", "forecasting",
    
    // Resume-specific terms
    "experience", "education", "skills", "certifications", "achievements", "references",
    "bachelor", "master", "phd", "degree", "university", "college", "gpa",
    "professional", "expert", "specialist", "coordinator", "associate", "senior", "junior", "lead"
  ];

  // Extract all text from the resume
  const allText = extractAllText(parsedResume).toLowerCase();
  
  // Count detected keywords
  const detected = commonKeywords.filter(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(allText);
  });
  
  result.detectedKeywords = detected;
  
  // Score based on number of keywords
  const keywordCount = detected.length;
  let points = 0;
  
  if (keywordCount >= 15) {
    points = 5; // Excellent
  } else if (keywordCount >= 10) {
    points = 4; // Very good
  } else if (keywordCount >= 7) {
    points = 3; // Good
  } else if (keywordCount >= 5) {
    points = 2; // Fair
  } else if (keywordCount >= 3) {
    points = 1; // Poor
  }
  
  // Calculate score as percentage
  result.score = Math.round((points / 5) * 100);
  
  // Add feedback based on score
  if (result.score >= 80) {
    result.feedback.push(`Good use of industry keywords. ${keywordCount} relevant terms detected.`);
  } else if (result.score >= 60) {
    result.feedback.push(`Your resume includes some industry keywords, but could use more. ${keywordCount} relevant terms detected.`);
  } else {
    result.feedback.push(`Your resume lacks sufficient industry keywords. Only ${keywordCount} relevant terms detected.`);
    result.feedback.push("Consider adding more job-specific and industry-specific terminology.");
  }
  
  return result;
};

/**
 * Evaluates the contact information in the resume
 */
const evaluateContactInfo = (parsedResume: ParsedResume) => {
  const result = {
    score: 0,
    feedback: [] as string[],
  };

  let points = 0;
  const totalPoints = 4;
  
  // Check for name
  if (parsedResume.personalInfo && parsedResume.personalInfo.name) {
    points++;
  } else {
    result.feedback.push("Missing full name, which is essential for ATS identification.");
  }
  
  // Check for email
  if (parsedResume.personalInfo && parsedResume.personalInfo.email) {
    // Check if the email format is valid
    if (isValidEmail(parsedResume.personalInfo.email)) {
      points++;
    } else {
      result.feedback.push("Email address appears to have an invalid format.");
    }
  } else {
    result.feedback.push("Missing email address, which is a critical contact method for employers.");
  }
  
  // Check for phone number
  if (parsedResume.personalInfo && parsedResume.personalInfo.phone) {
    points++;
  } else {
    result.feedback.push("Missing phone number, which is a standard contact method for employers.");
  }
  
  // Check for location
  if (parsedResume.personalInfo && parsedResume.personalInfo.location) {
    points++;
  } else {
    result.feedback.push("Missing location information, which helps employers assess your proximity.");
  }

  // Calculate score as percentage
  result.score = Math.round((points / totalPoints) * 100);
  
  // Add positive feedback if score is good
  if (result.score === 100) {
    result.feedback.push("All essential contact information is present and properly formatted.");
  }
  
  return result;
};

/**
 * Extract all text from the resume for analysis
 */
const extractAllText = (parsedResume: ParsedResume): string => {
  let text = '';
  
  // Personal info
  if (parsedResume.personalInfo) {
    text += `${parsedResume.personalInfo.name || ''} `;
    text += `${parsedResume.personalInfo.title || ''} `;
    text += `${parsedResume.personalInfo.bio || ''} `;
  }
  
  // Experience
  parsedResume.experience.forEach(exp => {
    text += `${exp.title || ''} ${exp.company || ''} ${exp.period || ''} ${exp.description || ''} `;
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        text += `${bp.text || ''} `;
      });
    }
  });
  
  // Education
  parsedResume.education.forEach(edu => {
    text += `${edu.degree || ''} ${edu.institution || ''} ${edu.year || ''} ${edu.description || ''} `;
    if (edu.bulletPoints) {
      edu.bulletPoints.forEach(bp => {
        text += `${bp.text || ''} `;
      });
    }
  });
  
  // Skills
  parsedResume.skills.forEach(skill => {
    text += `${skill.name || ''} `;
  });
  
  // Projects
  parsedResume.projects.forEach(proj => {
    text += `${proj.name || ''} ${proj.description || ''} `;
    if (proj.bulletPoints) {
      proj.bulletPoints.forEach(bp => {
        text += `${bp.text || ''} `;
      });
    }
  });
  
  // Certifications
  parsedResume.certifications.forEach(cert => {
    text += `${cert.name || ''} ${cert.issuer || ''} ${cert.date || ''} ${cert.description || ''} `;
    if (cert.bulletPoints) {
      cert.bulletPoints.forEach(bp => {
        text += `${bp.text || ''} `;
      });
    }
  });
  
  return text;
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
  
  // Check if at least 3 action verbs are used
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
  
  // Check for numbers, percentages, dollar amounts, etc.
  const quantifiableRegex = /\b\d+%|\$\d+|\d+ percent|\d+ times|increased by \d+|decreased by \d+|improved by \d+|\d+ people|\d+ team members|\d+ projects|\d+ clients|\d+ customers|\d+ users|\d+ products|\d+ services|\d+ years|\d+ months|\d+ weeks|\d+ days|\d+ hours|\d+ million|\d+ billion|\d+ thousand|\d+k|\d+M|\d+B|\d+T/i;
  
  return quantifiableRegex.test(allText);
};

/**
 * Check if bullet points and descriptions are appropriate length
 */
const checkDescriptionLength = (parsedResume: ParsedResume): boolean => {
  let totalBullets = 0;
  let longBullets = 0;
  
  // Check experience bullet points
  parsedResume.experience.forEach(exp => {
    if (exp.bulletPoints) {
      exp.bulletPoints.forEach(bp => {
        totalBullets++;
        // Check if bullet point is too long (more than 2 lines ~ 200 chars)
        if (bp.text && bp.text.length > 200) {
          longBullets++;
        }
      });
    }
    
    // Check if description is too long
    if (exp.description && exp.description.length > 300) {
      longBullets++;
      totalBullets++;
    }
  });
  
  // If we have bullet points and less than 30% are too long, pass the check
  if (totalBullets > 0 && (longBullets / totalBullets) < 0.3) {
    return true;
  }
  
  // If no bullet points, check other sections
  return totalBullets === 0;
};

/**
 * Get the date format from a string
 */
const getDateFormat = (dateStr: string): string => {
  // Check format: MM/YYYY or MM-YYYY
  if (/^\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
    return "MM/YYYY";
  }
  
  // Check format: YYYY
  if (/^\d{4}$/.test(dateStr)) {
    return "YYYY";
  }
  
  // Check format: Month YYYY
  if (/^[a-zA-Z]+\s+\d{4}$/.test(dateStr)) {
    return "Month YYYY";
  }
  
  // Check format: MM/DD/YYYY or MM-DD-YYYY
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
    return "MM/DD/YYYY";
  }
  
  // Check range format: YYYY-YYYY or YYYY - YYYY
  if (/^\d{4}\s*-\s*\d{4}$/.test(dateStr)) {
    return "YYYY-YYYY";
  }
  
  // Check range format: MM/YYYY - MM/YYYY
  if (/^\d{1,2}[\/\-]\d{4}\s*-\s*\d{1,2}[\/\-]\d{4}$/.test(dateStr)) {
    return "MM/YYYY-MM/YYYY";
  }
  
  // Check range format: Month YYYY - Month YYYY
  if (/^[a-zA-Z]+\s+\d{4}\s*-\s*[a-zA-Z]+\s+\d{4}$/.test(dateStr)) {
    return "Month YYYY-Month YYYY";
  }
  
  // Check "Present" format
  if (/present|current|now/i.test(dateStr)) {
    // Try to determine the format of the start date
    const startPart = dateStr.replace(/\s*-\s*(present|current|now)/i, '').trim();
    return getDateFormat(startPart) + "-Present";
  }
  
  return "Unknown";
};

/**
 * Check if an email is valid
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate overall score as weighted average
 */
const calculateOverallScore = (sections: { score: number; weight: number }[]): number => {
  let weightedScore = 0;
  let totalWeight = 0;
  
  sections.forEach(section => {
    weightedScore += section.score * section.weight;
    totalWeight += section.weight;
  });
  
  return Math.round(weightedScore / totalWeight);
};

/**
 * Generate overall recommendations based on section scores
 */
const generateRecommendations = (result: ATSScoreResult): string[] => {
  const recommendations: string[] = [];
  
  // Get the lowest scoring sections
  const sections = [
    { name: "format", score: result.sections.format.score, label: "resume format and structure" },
    { name: "content", score: result.sections.content.score, label: "content quality" },
    { name: "keywords", score: result.sections.keywords.score, label: "industry keywords" },
    { name: "contact", score: result.sections.contact.score, label: "contact information" }
  ].sort((a, b) => a.score - b.score);
  
  // Add recommendations for the lowest scoring sections
  sections.slice(0, 2).forEach(section => {
    if (section.score < 70) {
      recommendations.push(`Improve your ${section.label} to enhance ATS compatibility.`);
    }
  });
  
  // Add general recommendations
  if (result.overallScore < 70) {
    recommendations.push("Consider using a cleaner, more ATS-friendly resume format.");
  }
  
  if (result.sections.keywords.score < 60) {
    recommendations.push("Add more job-specific keywords that match the positions you're applying for.");
  }
  
  if (result.sections.content.score < 70) {
    recommendations.push("Use bullet points with action verbs and quantifiable achievements.");
  }
  
  if (result.sections.format.score < 70) {
    recommendations.push("Ensure your resume has clearly defined sections with standard headings.");
  }
  
  // If we have a high score overall, add a positive recommendation
  if (result.overallScore >= 80) {
    recommendations.push("Your resume is well-optimized for ATS systems. Consider minor improvements to achieve even better results.");
  }
  
  return recommendations;
}; 