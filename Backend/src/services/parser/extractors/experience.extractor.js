/**
 * Extract work experiences from text
 * @param {string} text - Text to extract experiences from
 * @returns {Array} - Array of experience objects
 */
function extractExperiences(text) {
  console.log("\n=== EXPERIENCE EXTRACTION STARTED ===");
  console.log(`Input text length: ${text?.length || 0} characters`);
  
  if (!text || typeof text !== 'string') {
    console.log("❌ Invalid input: text is empty or not a string");
    return [];
  }
 
  const experiences = [];
  
  try {
    // Split the text into lines for processing
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log(`Found ${lines.length} non-empty lines in the text`);
    
    // Identify potential job entries by looking for patterns
    console.log("Analyzing text structure to identify job entries...");
    
    // First, identify bullet points and non-bullet points
    const bulletMarkers = ['•', '-', '*', '⁃', '◦', '▪', '■', '●', '○', '➢', '➤', '➥', '➔'];
    const lineTypes = lines.map(line => {
      const trimmedLine = line.trim();
      const startsWithBullet = bulletMarkers.some(marker => trimmedLine.startsWith(marker));
      const looksLikeBullet = /^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192]/.test(trimmedLine);
      
      // Check if it starts with an action verb (common in bullet points)
      const actionVerbs = [
        'developed', 'created', 'designed', 'implemented', 'managed',
        'led', 'coordinated', 'analyzed', 'built', 'established',
        'improved', 'increased', 'reduced', 'achieved', 'delivered',
        'launched', 'executed', 'generated', 'maintained', 'organized',
        'produced', 'provided', 'resolved', 'supported', 'trained',
        'responsible', 'assisted', 'collaborated', 'facilitated', 'simulated',
        'identified', 'structured', 'organized', 'taught'
      ];
      
      const words = trimmedLine.toLowerCase().split(/\s+/);
      const startsWithActionVerb = words.length > 0 && actionVerbs.includes(words[0]);
      
      return {
        line: trimmedLine,
        isBullet: startsWithBullet || looksLikeBullet || startsWithActionVerb,
        hasDate: /\b(?:19|20)\d{2}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{1,2}\/\d{4}/.test(trimmedLine),
        hasDateRange: /(?:-|to|–|until|\s)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present|Current|Now|Ongoing|\d{4})/.test(trimmedLine),
        hasCompanyIndicator: /university|college|inc|llc|ltd|corporation|corp|company|co|gmbh|group|technologies|solutions|systems|associates|program/i.test(trimmedLine),
        hasLocationIndicator: trimmedLine.includes('|') || (trimmedLine.includes(',') && /[A-Z][a-z]+,\s+[A-Z]{2}/.test(trimmedLine)),
        hasJobTitleIndicator: /assistant|associate|intern|manager|director|engineer|developer|analyst|designer|consultant|specialist|coordinator|administrator|officer|representative|supervisor|lead|head|executive|president|vp|vice president|ceo|cto|cfo|coo|member/i.test(trimmedLine)
      };
    });
    
    // Identify job entry starting points
    const jobEntryIndices = [];
    
    // First pass: look for clear job title + date patterns
    for (let i = 0; i < lineTypes.length; i++) {
      const current = lineTypes[i];
      const next = i < lineTypes.length - 1 ? lineTypes[i + 1] : null;
      const prev = i > 0 ? lineTypes[i - 1] : null;
      
      // Strong indicators of a job entry:
      // 1. Line has both job title and date
      // 2. Line has job title followed by line with company/location
      // 3. Line has company name followed by date
      // 4. Non-bullet line after several bullet points (likely a new entry)
      
      if (
        // Case 1: Line has both job title and date
        (current.hasJobTitleIndicator && (current.hasDate || current.hasDateRange)) ||
        
        // Case 2: Line has job title, next line has company/location
        (current.hasJobTitleIndicator && next && (next.hasCompanyIndicator || next.hasLocationIndicator)) ||
        
        // Case 3: Line has company name and date
        (current.hasCompanyIndicator && (current.hasDate || current.hasDateRange)) ||
        
        // Case 4: Non-bullet line after bullet points (likely new entry)
        (!current.isBullet && prev && prev.isBullet && i > 1 && lineTypes[i-2].isBullet &&
         (current.hasJobTitleIndicator || current.hasCompanyIndicator || current.hasDate))
      ) {
        // Check if this is not a continuation of a bullet point
        if (!current.isBullet) {
          jobEntryIndices.push(i);
          console.log(`Potential job entry at line ${i}: "${lines[i]}"`);
        }
      }
    }
    
    // If we found very few entries, try a more aggressive approach
    if (jobEntryIndices.length < 2) {
      console.log("Few job entries found, trying alternative approach...");
      
      // Second pass: look for any non-bullet line that has a date or job title
      for (let i = 0; i < lineTypes.length; i++) {
        const current = lineTypes[i];
        
        if (!current.isBullet && (current.hasDate || current.hasJobTitleIndicator) && 
            !jobEntryIndices.includes(i)) {
          jobEntryIndices.push(i);
          console.log(`Additional potential job entry at line ${i}: "${lines[i]}"`);
        }
      }
    }
    
    // Sort indices to ensure they're in order
    jobEntryIndices.sort((a, b) => a - b);
    
    // Process each job entry
    for (let entryIndex = 0; entryIndex < jobEntryIndices.length; entryIndex++) {
      const startLineIndex = jobEntryIndices[entryIndex];
      const endLineIndex = entryIndex < jobEntryIndices.length - 1 ? 
                          jobEntryIndices[entryIndex + 1] - 1 : 
                          lines.length - 1;
      
      // Extract the lines for this job entry
      const jobLines = lines.slice(startLineIndex, endLineIndex + 1);
      console.log(`\n--- Processing Job Entry ${entryIndex + 1} (lines ${startLineIndex}-${endLineIndex}) ---`);
      console.log(`Job entry text:\n${jobLines.join('\n')}`);
      
      const experience = {
        id: experiences.length + 1,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        description: '',
        bulletPoints: []
      };
      
      // Extract date range
      console.log("Extracting date range...");
      let dateLineIndex = -1;
      let dateRangeFound = false;
      
      // Define date range patterns to try
      const dateRangePatterns = [
        // Pattern 1: "Month Year - Month Year" or "Month Year - Present"
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*(?:-|to|–|until|\s)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 2: "MM/YYYY - MM/YYYY" or "MM/YYYY - Present"
        /\b(\d{1,2}\/\d{4})\s*(?:-|to|–|until|\s)\s*(\d{1,2}\/\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 3: "MM/DD/YYYY - MM/DD/YYYY" or "MM/DD/YYYY - Present"
        /\b(\d{1,2}\/\d{1,2}\/\d{4})\s*(?:-|to|–|until|\s)\s*(\d{1,2}\/\d{1,2}\/\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 4: "YYYY - YYYY" or "YYYY - Present"
        /\b(\d{4})\s*(?:-|to|–|until|\s)\s*(\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 5: "YYYY-Present" (no space)
        /\b(\d{4})-(Present|Current|Now|Ongoing)/i
      ];
      
      // First, try to find a complete date range in a single line
      for (let i = 0; i < jobLines.length; i++) {
        const line = jobLines[i];
        
        for (const pattern of dateRangePatterns) {
          const match = line.match(pattern);
          if (match) {
            experience.startDate = match[1];
            experience.endDate = match[2] || "";
            dateRangeFound = true;
            dateLineIndex = i;
            console.log(`✅ Found date range in line ${i}: ${experience.startDate}${experience.endDate ? ` to ${experience.endDate}` : ''}`);
            break;
          }
        }
        
        if (dateRangeFound) break;
      }
      
      // If no complete date range found, look for individual dates
      if (!dateRangeFound) {
        // Look for any date mentions
        const datePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{4}|\b(?:19|20)\d{2}\b/gi;
        
        let dates = [];
        for (let i = 0; i < jobLines.length; i++) {
          const line = jobLines[i];
          const matches = line.match(datePattern);
          
          if (matches) {
            dates = dates.concat(matches);
            if (dateLineIndex === -1) dateLineIndex = i;
          }
        }
        
        if (dates.length >= 2) {
          experience.startDate = dates[0];
          experience.endDate = dates[1];
          dateRangeFound = true;
          console.log(`✅ Found separate dates: ${experience.startDate} to ${experience.endDate}`);
        } else if (dates.length === 1) {
          experience.startDate = dates[0];
          experience.endDate = ""; // Don't assume Present
          dateRangeFound = true;
          console.log(`⚠️ Found only start date: ${experience.startDate}`);
        } else {
          console.log("❌ No dates found");
        }
      }
      
      // Extract position and company
      console.log("Extracting position and company...");
      
      // Analyze non-bullet lines to identify position and company
      const nonBulletLines = jobLines.filter((_, i) => !lineTypes[startLineIndex + i].isBullet);
      
      // If we have at least one non-bullet line, it's likely the job title/company
      if (nonBulletLines.length > 0) {
        // First line is typically the job title, possibly with date
        let positionLine = nonBulletLines[0];
        
        // If the first line contains a date, try to extract just the position part
        if (dateLineIndex === 0 || (dateLineIndex >= 0 && jobLines[dateLineIndex] === positionLine)) {
          // Extract the part before the date
          const dateIndex = positionLine.indexOf(experience.startDate);
          if (dateIndex > 0) {
            positionLine = positionLine.substring(0, dateIndex).trim();
          } else {
            // Try to find any year pattern and extract before that
            const yearMatch = positionLine.match(/\b(?:19|20)\d{2}\b/);
            if (yearMatch && yearMatch.index > 0) {
              positionLine = positionLine.substring(0, yearMatch.index).trim();
            }
          }
        }
        
        // Clean up position line - remove trailing commas, etc.
        positionLine = positionLine.replace(/,$/, '').trim();
        
        // Set position
        experience.position = positionLine;
        console.log(`✅ Extracted position: "${experience.position}"`);
        
        // If we have a second non-bullet line, it's likely the company
        if (nonBulletLines.length > 1) {
          experience.company = nonBulletLines[1].trim();
          console.log(`✅ Extracted company: "${experience.company}"`);
        } else {
          // Try to extract company from the position line if it contains a comma or pipe
          const companySeparators = [',', '|', ' at ', ' for ', ' with '];
          for (const separator of companySeparators) {
            if (positionLine.includes(separator)) {
              const parts = positionLine.split(separator);
              if (parts.length >= 2) {
                experience.position = parts[0].trim();
                experience.company = parts[1].trim();
                console.log(`✅ Split position and company: "${experience.position}" at "${experience.company}"`);
                break;
              }
            }
          }
          
          if (!experience.company) {
            console.log("❌ No company line identified");
          }
        }
      } else {
        console.log("❌ No non-bullet lines found for position/company");
      }
      
      // Extract bullet points
      console.log("Extracting bullet points...");
      
      // Identify bullet point lines
      const bulletPointLines = jobLines.filter((_, i) => lineTypes[startLineIndex + i].isBullet);
      
      if (bulletPointLines.length > 0) {
        // Process bullet points
        experience.bulletPoints = bulletPointLines.map(line => {
          // Remove bullet markers from the beginning of the line
          return line.replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]\s*/, '').trim();
        });
        
        console.log(`✅ Extracted ${bulletPointLines.length} bullet points`);
        if (experience.bulletPoints.length > 0) {
          console.log(`First bullet point: "${experience.bulletPoints[0]}"`);
        }
      } else {
        console.log("❌ No bullet points found");
      }
      
      // Clean up and normalize fields
      experience.company = experience.company || '';
      experience.position = experience.position || '';
      experience.description = experience.description || '';
      
      // Only add experiences that have at least some information
      if (experience.company || experience.position || experience.startDate) {
        // Special case: if position contains company and no company is set
        if (experience.position && !experience.company && 
            (experience.position.includes(',') || experience.position.includes('|'))) {
          const parts = experience.position.split(/[,|]/);
          if (parts.length >= 2) {
            experience.position = parts[0].trim();
            experience.company = parts[1].trim();
          }
        }
        
        experiences.push(experience);
        console.log(`✅ Added experience: ${experience.position} at ${experience.company} (${experience.startDate}${experience.endDate ? ` - ${experience.endDate}` : ''})`);
      } else {
        console.log("❌ Experience entry skipped: insufficient information");
      }
    }
    
    // Sort experiences by date (most recent first)
    console.log("\nSorting experiences by date...");
    try {
      experiences.sort((a, b) => {
        // If both have end dates
        if (a.endDate && b.endDate) {
          // If one is "Present" or "Current", it should come first
          if (/present|current|now|ongoing/i.test(a.endDate)) return -1;
          if (/present|current|now|ongoing/i.test(b.endDate)) return 1;
          
          // Otherwise compare the dates
          try {
            return new Date(b.endDate) - new Date(a.endDate);
          } catch (error) {
            console.log(`⚠️ Date comparison error: ${error.message}`);
            return 0; // If date comparison fails, consider them equal
          }
        }
        
        // If only one has an end date
        if (a.endDate && !b.endDate) return -1;
        if (!a.endDate && b.endDate) return 1;
        
        // If neither has an end date, compare start dates
        if (a.startDate && b.startDate) {
          try {
            return new Date(b.startDate) - new Date(a.startDate);
          } catch (error) {
            console.log(`⚠️ Date comparison error: ${error.message}`);
            return 0; // If date comparison fails, consider them equal
          }
        }
        
        return 0;
      });
      console.log(`✅ Sorted ${experiences.length} experiences by date`);
    } catch (error) {
      console.error('Error sorting experiences:', error);
      // Continue with unsorted experiences if there's an error
    }
  } catch (error) {
    console.error('Error in extractExperiences:', error);
    return [];
  }
  
  console.log(`\n=== EXPERIENCE EXTRACTION COMPLETED: ${experiences.length} experiences found ===\n`);
  return experiences;
}

module.exports = {
  extractExperiences
}; 