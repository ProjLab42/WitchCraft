/**
 * Extract education information from text
 * @param {string} text - Text to extract education from
 * @returns {Array} - Array of education objects
 */
function extractEducation(text) {
  console.log("\n=== EDUCATION EXTRACTION STARTED ===");
  console.log(`Input text length: ${text?.length || 0} characters`);
  
  if (!text || typeof text !== 'string') {
    console.log("❌ Invalid input: text is empty or not a string");
    return [];
  }
  
  const education = [];
  let degreeFound = false; // Initialize degreeFound variable
  
  try {
    // Split the text into lines for processing
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log(`Found ${lines.length} non-empty lines in the text`);
    
    // Identify potential education entry patterns
    console.log("Analyzing text structure to identify education entries...");
    
    // First, identify bullet points and non-bullet points
    const bulletMarkers = ['•', '-', '*', '⁃', '◦', '▪', '■', '●', '○', '➢', '➤', '➥', '➔'];
    const lineTypes = lines.map(line => {
      const trimmedLine = line.trim();
      const startsWithBullet = bulletMarkers.some(marker => trimmedLine.startsWith(marker));
      const looksLikeBullet = /^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192]/.test(trimmedLine);
      
      return {
        line: trimmedLine,
        isBullet: startsWithBullet || looksLikeBullet,
        hasDate: /\b(?:19|20)\d{2}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{1,2}\/\d{4}/.test(trimmedLine),
        hasDateRange: /(?:-|to|–|until|\s)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present|Current|Now|Ongoing|\d{4})/.test(trimmedLine),
        hasSchoolIndicator: /university|college|school|academy|institute|polytechnic/i.test(trimmedLine),
        hasDegreeIndicator: /bachelor|master|phd|diploma|certificate|degree|b\.s\.|m\.s\.|b\.a\.|m\.a\.|m\.b\.a\.|major|minor|graduate|undergraduate|postgraduate/i.test(trimmedLine),
        hasGPAIndicator: /gpa|grade point average|cgpa|cum laude|magna cum laude|summa cum laude/i.test(trimmedLine)
      };
    });
    
    // Identify education entry starting points
    const educationEntryIndices = [];
    
    // First pass: look for clear education patterns
    for (let i = 0; i < lineTypes.length; i++) {
      const current = lineTypes[i];
      const next = i < lineTypes.length - 1 ? lineTypes[i + 1] : null;
      
      // Strong indicators of an education entry:
      // 1. Line has both school and date
      // 2. Line has degree indicator followed by school indicator
      // 3. Line has school indicator followed by date
      
      if (
        // Case 1: Line has both school and date
        (current.hasSchoolIndicator && (current.hasDate || current.hasDateRange)) ||
        
        // Case 2: Line has degree indicator followed by school indicator
        (current.hasDegreeIndicator && next && next.hasSchoolIndicator) ||
        
        // Case 3: Line has school indicator followed by date
        (current.hasSchoolIndicator && next && (next.hasDate || next.hasDateRange))
      ) {
        // Check if this is not a bullet point
        if (!current.isBullet) {
          educationEntryIndices.push(i);
          console.log(`Potential education entry at line ${i}: "${lines[i]}"`);
        }
      }
    }
    
    // If we found very few entries, try a more aggressive approach
    if (educationEntryIndices.length < 1) {
      console.log("Few education entries found, trying alternative approach...");
      
      // Second pass: look for any non-bullet line that has a school or degree indicator
      for (let i = 0; i < lineTypes.length; i++) {
        const current = lineTypes[i];
        
        if (!current.isBullet && (current.hasSchoolIndicator || current.hasDegreeIndicator) && 
            !educationEntryIndices.includes(i)) {
          educationEntryIndices.push(i);
          console.log(`Additional potential education entry at line ${i}: "${lines[i]}"`);
        }
      }
    }
    
    // Sort indices to ensure they're in order
    educationEntryIndices.sort((a, b) => a - b);
    
    // Process each education entry
    for (let entryIndex = 0; entryIndex < educationEntryIndices.length; entryIndex++) {
      const startLineIndex = educationEntryIndices[entryIndex];
      const endLineIndex = entryIndex < educationEntryIndices.length - 1 ? 
                          educationEntryIndices[entryIndex + 1] - 1 : 
                          lines.length - 1;
      
      // Extract the lines for this education entry
      const eduLines = lines.slice(startLineIndex, endLineIndex + 1);
      console.log(`\n--- Processing Education Entry ${entryIndex + 1} (lines ${startLineIndex}-${endLineIndex}) ---`);
      console.log(`Education entry text:\n${eduLines.join('\n')}`);
      
      const edu = {
        id: education.length + 1,
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
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
        
        // Pattern 2: "YYYY - YYYY" or "YYYY - Present"
        /\b(\d{4})\s*(?:-|to|–|until|\s)\s*(\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 3: "YYYY-Present" (no space)
        /\b(\d{4})-(Present|Current|Now|Ongoing)/i
      ];
      
      // First, try to find a complete date range in a single line
      for (let i = 0; i < eduLines.length; i++) {
        const line = eduLines[i];
        
        for (const pattern of dateRangePatterns) {
          const match = line.match(pattern);
          if (match) {
            edu.startDate = match[1];
            edu.endDate = match[2] || "";
            dateRangeFound = true;
            dateLineIndex = i;
            console.log(`✅ Found date range in line ${i}: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
            break;
          }
        }
        
        if (dateRangeFound) break;
      }
      
      // If no complete date range found, look for individual dates
      if (!dateRangeFound) {
        // Look for any date mentions
        const datePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\b(?:19|20)\d{2}\b/gi;
        
        let dates = [];
        for (let i = 0; i < eduLines.length; i++) {
          const line = eduLines[i];
          const matches = line.match(datePattern);
          
          if (matches) {
            dates = dates.concat(matches);
            if (dateLineIndex === -1) dateLineIndex = i;
          }
        }
        
        if (dates.length >= 2) {
          edu.startDate = dates[0];
          edu.endDate = dates[1];
          dateRangeFound = true;
          console.log(`✅ Found separate dates: ${edu.startDate} to ${edu.endDate}`);
        } else if (dates.length === 1) {
          edu.startDate = dates[0];
          edu.endDate = "";
          dateRangeFound = true;
          console.log(`⚠️ Found only start date: ${edu.startDate}`);
        } else {
          console.log("❌ No dates found");
        }
      }
      
      // Extract school and degree
      console.log("Extracting school and degree...");
      
      // Analyze non-bullet lines to identify school and degree
      const nonBulletLines = eduLines.filter((_, i) => !lineTypes[startLineIndex + i].isBullet);
      
      // First, try to identify the school
      for (let i = 0; i < nonBulletLines.length; i++) {
        const line = nonBulletLines[i].toLowerCase();
        
        // Special case: line contains both school and degree with pipe separator
        // Format: "School | Degree [Date]"
        if (line.includes('|') && line.includes('university')) {
          const parts = nonBulletLines[i].split('|').map(part => part.trim());
          if (parts.length >= 2) {
            // First part is likely the school
            edu.school = parts[0].trim();
            
            // Second part might contain degree and date
            let degreePart = parts[1].trim();
            
            // Try to extract date from degree part
            for (const pattern of dateRangePatterns) {
              const dateMatch = degreePart.match(pattern);
              if (dateMatch) {
                // If we haven't found a date yet, use this one
                if (!dateRangeFound) {
                  edu.startDate = dateMatch[1];
                  edu.endDate = dateMatch[2] || "";
                  dateRangeFound = true;
                  console.log(`✅ Found date range in degree part: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
                }
                // Remove date from degree part
                degreePart = degreePart.replace(pattern, '').trim();
              }
            }
            
            // Check for year pattern (YYYY-Present or YYYY-YYYY)
            const yearPattern = /\b(20\d{2})\s*(?:-|to|–|until)\s*(20\d{2}|Present|Current|Now|Ongoing)\b/i;
            const yearMatch = degreePart.match(yearPattern);
            if (yearMatch) {
              if (!dateRangeFound) {
                edu.startDate = yearMatch[1];
                edu.endDate = yearMatch[2] || "";
                dateRangeFound = true;
                console.log(`✅ Found year range in degree part: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
              }
              // Remove date from degree part
              degreePart = degreePart.replace(yearPattern, '').trim();
            }
            
            // Check for single year pattern (YYYY)
            const singleYearPattern = /\b(20\d{2})\b/;
            const singleYearMatch = degreePart.match(singleYearPattern);
            if (singleYearMatch && !dateRangeFound) {
              edu.startDate = singleYearMatch[1];
              edu.endDate = "";
              dateRangeFound = true;
              console.log(`⚠️ Found only start year in degree part: ${edu.startDate}`);
              // Remove date from degree part
              degreePart = degreePart.replace(singleYearPattern, '').trim();
            }
            
            // The remaining text is likely the degree
            if (degreePart) {
              // Check if it contains "Minor in" or similar
              const minorMatch = degreePart.match(/(.+?)(?:\s*-\s*Minor\s+in\s+(.+))/i);
              if (minorMatch) {
                edu.degree = minorMatch[1].trim();
                if (!edu.field) {
                  edu.field = minorMatch[1].trim();
                }
                edu.description = `Minor in ${minorMatch[2].trim()}`;
                console.log(`✅ Extracted degree with minor: "${edu.degree}" with "${edu.description}"`);
              } else {
                edu.degree = degreePart;
                console.log(`✅ Extracted degree from pipe: "${edu.degree}"`);
              }
              degreeFound = true;
            }
            
            console.log(`✅ Extracted school from pipe: "${edu.school}"`);
            break;
          }
        }
        
        // Standard case: line contains university/college/etc.
        else if (line.includes('university') || line.includes('college') || 
            line.includes('school') || line.includes('institute') || 
            line.includes('academy') || line.includes('polytechnic')) {
          
          // Extract the school name
          edu.school = nonBulletLines[i];
          
          // If the school line also contains the date, remove the date part
          if (dateLineIndex >= 0 && eduLines[dateLineIndex] === nonBulletLines[i]) {
            for (const pattern of dateRangePatterns) {
              edu.school = edu.school.replace(pattern, '').trim();
            }
          }
          
          console.log(`✅ Extracted school: "${edu.school}"`);
          break;
        }
      }
      
      // If no school found, use the first non-bullet line
      if (!edu.school && nonBulletLines.length > 0) {
        // Check if the first line contains a pipe separator
        if (nonBulletLines[0].includes('|')) {
          const parts = nonBulletLines[0].split('|').map(part => part.trim());
          if (parts.length >= 2) {
            edu.school = parts[0];
            console.log(`✅ Extracted school from first line with pipe: "${edu.school}"`);
            
            // The second part might be the degree
            if (!degreeFound) {
              // Extract date if present
              let degreePart = parts[1];
              for (const pattern of dateRangePatterns) {
                const dateMatch = degreePart.match(pattern);
                if (dateMatch) {
                  if (!dateRangeFound) {
                    edu.startDate = dateMatch[1];
                    edu.endDate = dateMatch[2] || "";
                    dateRangeFound = true;
                    console.log(`✅ Found date range in degree part: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
                  }
                  // Remove date from degree part
                  degreePart = degreePart.replace(pattern, '').trim();
                }
              }
              
              // Check for year pattern (YYYY-Present or YYYY-YYYY)
              const yearPattern = /\b(20\d{2})\s*(?:-|to|–|until)\s*(20\d{2}|Present|Current|Now|Ongoing)\b/i;
              const yearMatch = degreePart.match(yearPattern);
              if (yearMatch) {
                if (!dateRangeFound) {
                  edu.startDate = yearMatch[1];
                  edu.endDate = yearMatch[2] || "";
                  dateRangeFound = true;
                  console.log(`✅ Found year range in degree part: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
                }
                // Remove date from degree part
                degreePart = degreePart.replace(yearPattern, '').trim();
              }
              
              // Check for single year pattern (YYYY)
              const singleYearPattern = /\b(20\d{2})\b/;
              const singleYearMatch = degreePart.match(singleYearPattern);
              if (singleYearMatch && !dateRangeFound) {
                edu.startDate = singleYearMatch[1];
                edu.endDate = "";
                dateRangeFound = true;
                console.log(`⚠️ Found only start year in degree part: ${edu.startDate}`);
                // Remove date from degree part
                degreePart = degreePart.replace(singleYearPattern, '').trim();
              }
              
              edu.degree = degreePart;
              degreeFound = true;
              console.log(`✅ Extracted degree from first line with pipe: "${edu.degree}"`);
            }
          }
        } else {
          edu.school = nonBulletLines[0];
          
          // If the first line also contains the date, remove the date part
          if (dateLineIndex >= 0 && eduLines[dateLineIndex] === nonBulletLines[0]) {
            for (const pattern of dateRangePatterns) {
              edu.school = edu.school.replace(pattern, '').trim();
            }
          }
          
          console.log(`⚠️ Using first line as school: "${edu.school}"`);
        }
      }
      
      // Next, try to identify the degree
      const degreeKeywords = [
        'Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate', 'Degree',
        'B.S.', 'M.S.', 'B.A.', 'M.A.', 'M.B.A.', 'B.Tech', 'M.Tech',
        'BSc', 'MSc', 'BA', 'MA', 'MBA', 'B.Sc.', 'M.Sc.'
      ];
      
      // Look for lines containing "Bachelor of Science", "Master of", etc.
      let degreeLineIndex = -1;
      degreeFound = false; // Reset degreeFound for this section
      
      // First, prioritize lines with pipe separator as they typically contain both degree and field
      for (let i = 0; i < nonBulletLines.length; i++) {
        const line = nonBulletLines[i];
        
        // Skip the line we identified as the school
        if (line === edu.school) continue;
        
        // Check for pipe separator pattern first (e.g., "Bachelor of Science | Computer Science")
        if (line.includes('|')) {
          const parts = line.split('|').map(part => part.trim());
          if (parts.length >= 2) {
            // Check if the first part contains a degree keyword
            const hasDegreeKeyword = degreeKeywords.some(keyword => 
              parts[0].includes(keyword) || parts[0].toLowerCase().includes(keyword.toLowerCase())
            );
            
            if (hasDegreeKeyword) {
              edu.degree = parts[0];
              edu.field = parts[1];
              degreeLineIndex = i;
              degreeFound = true;
              console.log(`✅ Extracted degree with pipe: "${edu.degree}" in "${edu.field}"`);
              break;
            }
          }
        }
      }
      
      // If no degree found with pipe separator, try other patterns
      if (!degreeFound) {
        for (let i = 0; i < nonBulletLines.length; i++) {
          const line = nonBulletLines[i];
          
          // Skip the line we identified as the school
          if (line === edu.school) continue;
          
          // Check if this line contains degree keywords
          const hasDegreeKeyword = degreeKeywords.some(keyword => 
            line.includes(keyword) || line.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (hasDegreeKeyword) {
            degreeLineIndex = i;
            
            // Try to separate degree from field using various patterns
            
            // Pattern 1: "Bachelor of Science | Computer Science"
            const pipePattern = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech|BSc|MSc|BA|MA|MBA)(?:\s+(?:of|in|on))?\s+([^|]+)\s*\|\s*(.+)/i);
            
            if (pipePattern) {
              edu.degree = `${pipePattern[1]} ${pipePattern[2].trim()}`;
              edu.field = pipePattern[3].trim();
              degreeFound = true;
              console.log(`✅ Extracted degree with pipe: "${edu.degree}" in "${edu.field}"`);
              break;
            }
            
            // Pattern 2: "Bachelor of Science in Computer Science"
            const inPattern = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech|BSc|MSc|BA|MA|MBA)(?:\s+(?:of|in|on))?\s+([^,]+)(?:\s+(?:in|of|on)\s+)(.+)/i);
            
            if (inPattern) {
              edu.degree = `${inPattern[1]} ${inPattern[2].trim()}`;
              edu.field = inPattern[3].trim();
              degreeFound = true;
              console.log(`✅ Extracted degree with 'in': "${edu.degree}" in "${edu.field}"`);
              break;
            }
            
            // Pattern 3: "Bachelor of Science, Computer Science"
            const commaPattern = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech|BSc|MSc|BA|MA|MBA)(?:\s+(?:of|in|on))?\s+([^,]+),\s*(.+)/i);
            
            if (commaPattern) {
              edu.degree = `${commaPattern[1]} ${commaPattern[2].trim()}`;
              edu.field = commaPattern[3].trim();
              degreeFound = true;
              console.log(`✅ Extracted degree with comma: "${edu.degree}" in "${edu.field}"`);
              break;
            }
            
            // Pattern 4: Simple "Bachelor of Science"
            const simplePattern = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech|BSc|MSc|BA|MA|MBA|B\.Sc\.|M\.Sc\.)(?:\s+(?:of|in|on))?\s+([^,|]+)/i);
            
            if (simplePattern) {
              edu.degree = `${simplePattern[1]} ${simplePattern[2].trim()}`;
              degreeFound = true;
              console.log(`✅ Extracted degree: "${edu.degree}"`);
              
              // Look for field in the next line if available
              if (i + 1 < nonBulletLines.length && nonBulletLines[i + 1] !== edu.school) {
                const nextLine = nonBulletLines[i + 1];
                if (!nextLine.match(dateRegex) && !degreeKeywords.some(k => nextLine.includes(k))) {
                  edu.field = nextLine.trim();
                  console.log(`✅ Extracted field from next line: "${edu.field}"`);
                }
              }
              break;
            }
            
            // Pattern 5: "B.Sc. Computer Science" (no "of" or "in")
            const abbreviatedPattern = line.match(/(B\.Sc\.|M\.Sc\.|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech)\s+([^,|]+)/i);
            
            if (abbreviatedPattern) {
              edu.degree = line.trim(); // Use the whole line as the degree
              degreeFound = true;
              console.log(`✅ Extracted abbreviated degree: "${edu.degree}"`);
              break;
            }
            
            // If no pattern matched but we found a degree keyword, use the whole line
            edu.degree = line.trim();
            degreeFound = true;
            console.log(`⚠️ Using whole line as degree: "${edu.degree}"`);
            break;
          }
        }
      }
      
      // If no degree found but we have more than one non-bullet line, use the second line
      if (!degreeFound && nonBulletLines.length > 1) {
        // Skip the line we identified as the school
        const secondLine = nonBulletLines.find(line => line !== edu.school);
        if (secondLine) {
          edu.degree = secondLine;
          console.log(`⚠️ Using second line as degree: "${edu.degree}"`);
          
          // Try to extract field from the degree line
          const pipeMatch = secondLine.match(/^[^|]+\|\s*(.+)/);
          if (pipeMatch) {
            edu.field = pipeMatch[1].trim();
            edu.degree = secondLine.split('|')[0].trim();
            console.log(`✅ Split degree and field by pipe: "${edu.degree}" in "${edu.field}"`);
          }
        }
      }
      
      // Extract relevant coursework if present
      console.log("Extracting relevant coursework...");
      
      // Look for coursework
      let courseworkLines = [];
      let inCourseworkSection = false;
      
      for (const line of eduLines) {
        // Check if this line starts the coursework section
        if (line.match(/(?:Relevant|Key|Core)\s+Coursework:?/i)) {
          inCourseworkSection = true;
          // Extract the part after "Relevant Coursework:"
          const courseworkPart = line.replace(/^(?:Relevant|Key|Core)\s+Coursework:?\s*/i, '').trim();
          if (courseworkPart) {
            courseworkLines.push(courseworkPart);
          }
        } 
        // If we're in the coursework section and the line doesn't contain GPA or degree keywords,
        // and is not a bullet point, consider it part of the coursework
        else if (inCourseworkSection && 
                !line.match(/GPA|Grade\s+Point\s+Average/i) && 
                !degreeKeywords.some(k => line.includes(k)) &&
                !bulletMarkers.some(marker => line.trim().startsWith(marker))) {
          courseworkLines.push(line);
        }
        // If we encounter a line with GPA after coursework started, stop collecting coursework
        else if (inCourseworkSection && line.match(/GPA|Grade\s+Point\s+Average/i)) {
          break;
        }
      }
      
      // Combine all coursework lines
      if (courseworkLines.length > 0) {
        const coursework = courseworkLines.join(', ');
        
        // Store coursework in the field if field is empty, otherwise append to description
        if (!edu.field) {
          edu.field = coursework;
          console.log(`✅ Using coursework as field: "${edu.field}"`);
        } else {
          // If we already have a field, add coursework to description
          if (!edu.description) {
            edu.description = `Relevant Coursework: ${coursework}`;
          } else {
            edu.description += `\nRelevant Coursework: ${coursework}`;
          }
          console.log(`✅ Added coursework to description: "${coursework}"`);
        }
      }
      
      // Extract GPA if present
      console.log("Extracting GPA...");
      const gpaPattern = /(?:GPA|CGPA|Grade Point Average)[:\s]+([0-9.]+)(?:\/([0-9.]+))?/i;
      
      for (const line of eduLines) {
        const gpaMatch = line.match(gpaPattern);
        if (gpaMatch) {
          edu.gpa = gpaMatch[1] + (gpaMatch[2] ? `/${gpaMatch[2]}` : '');
          console.log(`✅ Extracted GPA: "${edu.gpa}"`);
          break;
        }
      }
      
      // Extract bullet points
      console.log("Extracting bullet points...");
      
      // Identify bullet point lines
      const bulletPointLines = eduLines.filter((_, i) => lineTypes[startLineIndex + i].isBullet);
      
      if (bulletPointLines.length > 0) {
        // Process bullet points
        edu.bulletPoints = bulletPointLines.map(line => {
          // Remove bullet markers from the beginning of the line
          return line.replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]\s*/, '').trim();
        });
        
        console.log(`✅ Extracted ${bulletPointLines.length} bullet points`);
        if (edu.bulletPoints.length > 0) {
          console.log(`First bullet point: "${edu.bulletPoints[0]}"`);
        }
      } else {
        console.log("❌ No bullet points found");
      }
      
      // Clean up and normalize fields
      edu.school = edu.school || '';
      edu.degree = edu.degree || '';
      edu.field = edu.field || '';
      
      // Only add education entries that have at least some information
      if (edu.school || edu.degree || edu.startDate) {
        education.push(edu);
        console.log(`✅ Added education: ${edu.degree} at ${edu.school} (${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''})`);
      } else {
        console.log("❌ Education entry skipped: insufficient information");
      }
    }
    
    // If we didn't find any education entries with the structured approach, fall back to the original method
    if (education.length === 0) {
      console.log("\nNo education entries found with structured approach, falling back to original method...");
      
      const educationBlocks = text.split(/(?=\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4}\s*-\s*\d{4}|\d{4})/i);
      console.log(`Found ${educationBlocks.length} potential education blocks using original method`);
      
      for (let blockIndex = 0; blockIndex < educationBlocks.length; blockIndex++) {
        const block = educationBlocks[blockIndex].trim();
        if (block.length === 0) continue;
        
        console.log(`\n--- Processing Education Block ${blockIndex + 1} ---`);
        console.log(`Block text (first 100 chars): ${block.substring(0, 100).replace(/\n/g, "\\n")}...`);
        
        const edu = {
          id: education.length + 1,
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: '',
          bulletPoints: []
        };
        
        // Extract dates
        const dateRegex = /(\d{4})\s*(?:-|to|–|until)\s*(\d{4}|Present|Current)/i;
        const dateMatch = block.match(dateRegex);
        
        if (dateMatch) {
          edu.startDate = dateMatch[1];
          edu.endDate = dateMatch[2] || "";
          console.log(`✅ Found date range: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
        } else {
          // Try to find a single year
          const yearMatch = block.match(/\b((?:19|20)\d{2})\b/);
          if (yearMatch) {
            edu.startDate = yearMatch[1];
            console.log(`⚠️ Found only start date: ${edu.startDate}`);
          }
        }
        
        // Extract school and degree
        const lines = block.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length > 0) {
          // Check if the first line contains a pipe separator (School | Degree)
          if (lines[0].includes('|')) {
            const parts = lines[0].split('|').map(part => part.trim());
            if (parts.length >= 2) {
              // First part is likely the school
              edu.school = parts[0];
              console.log(`✅ Extracted school from pipe: "${edu.school}"`);
              
              // Second part might contain degree and date
              let degreePart = parts[1];
              
              // Try to extract date from degree part
              const yearPattern = /\b(20\d{2})\s*(?:-|to|–|until)\s*(20\d{2}|Present|Current|Now|Ongoing)\b/i;
              const yearMatch = degreePart.match(yearPattern);
              if (yearMatch) {
                edu.startDate = yearMatch[1];
                edu.endDate = yearMatch[2] || "";
                console.log(`✅ Found year range in degree part: ${edu.startDate}${edu.endDate ? ` to ${edu.endDate}` : ''}`);
                // Remove date from degree part
                degreePart = degreePart.replace(yearPattern, '').trim();
              } else {
                // Check for single year pattern (YYYY)
                const singleYearPattern = /\b(20\d{2})\b/;
                const singleYearMatch = degreePart.match(singleYearPattern);
                if (singleYearMatch) {
                  edu.startDate = singleYearMatch[1];
                  edu.endDate = "";
                  console.log(`⚠️ Found only start year in degree part: ${edu.startDate}`);
                  // Remove date from degree part
                  degreePart = degreePart.replace(singleYearPattern, '').trim();
                }
              }
              
              // Check if it contains "Minor in" or similar
              const minorMatch = degreePart.match(/(.+?)(?:\s*-\s*Minor\s+in\s+(.+))/i);
              if (minorMatch) {
                edu.degree = minorMatch[1].trim();
                edu.field = minorMatch[1].trim();
                edu.description = `Minor in ${minorMatch[2].trim()}`;
                console.log(`✅ Extracted degree with minor: "${edu.degree}" with "${edu.description}"`);
              } else {
                edu.degree = degreePart;
                console.log(`✅ Extracted degree from pipe: "${edu.degree}"`);
              }
            }
          } else {
            // First line is likely the school
            edu.school = lines[0].replace(dateRegex, '').trim();
            console.log(`✅ Extracted school: "${edu.school}"`);
            
            // Look for degree information
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (line.includes('Bachelor') || line.includes('Master') || 
                  line.includes('PhD') || line.includes('Diploma') || 
                  line.includes('Certificate') || line.includes('Degree') ||
                  line.includes('B.S.') || line.includes('M.S.') || 
                  line.includes('B.A.') || line.includes('M.A.') || 
                  line.includes('M.B.A.')) {
                
                // Try to separate degree from field
                const degreeMatch = line.match(/(Bachelor|Master|PhD|Diploma|Certificate|Degree|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Sc\.|M\.Sc\.)(?:\s+(?:of|in|on))?\s+([^,]+)/i);
                
                if (degreeMatch) {
                  edu.degree = degreeMatch[1];
                  edu.field = degreeMatch[2];
                  console.log(`✅ Extracted degree: "${edu.degree}" in "${edu.field}"`);
                } else {
                  // Check for abbreviated degree format (B.Sc. Computer Science)
                  const abbreviatedMatch = line.match(/(B\.Sc\.|M\.Sc\.|B\.S\.|M\.S\.|B\.A\.|M\.A\.|M\.B\.A\.|B\.Tech|M\.Tech)\s+([^,|]+)/i);
                  if (abbreviatedMatch) {
                    edu.degree = line.trim();
                    console.log(`✅ Extracted abbreviated degree: "${edu.degree}"`);
                  }
                  // Check for pipe separator
                  else if (line.includes('|')) {
                    const pipeParts = line.split('|').map(part => part.trim());
                    if (pipeParts.length >= 2 && 
                        degreeKeywords.some(k => pipeParts[0].includes(k) || pipeParts[0].toLowerCase().includes(k.toLowerCase()))) {
                      edu.degree = pipeParts[0];
                      edu.field = pipeParts[1];
                      console.log(`✅ Extracted degree with pipe: "${edu.degree}" in "${edu.field}"`);
                    } else {
                      edu.degree = line;
                      console.log(`✅ Extracted degree: "${edu.degree}"`);
                    }
                  } else {
                    edu.degree = line;
                    console.log(`✅ Extracted degree: "${edu.degree}"`);
                  }
                }
                
                break;
              }
            }
            
            // Look for GPA
            for (const line of lines) {
              const gpaMatch = line.match(/(?:GPA|CGPA|Grade Point Average)[:\s]+([0-9.]+)(?:\/([0-9.]+))?/i);
              if (gpaMatch) {
                edu.gpa = gpaMatch[1] + (gpaMatch[2] ? `/${gpaMatch[2]}` : '');
                console.log(`✅ Extracted GPA: "${edu.gpa}"`);
                break;
              }
            }
            
            // Look for coursework
            let courseworkLines = [];
            let inCourseworkSection = false;
            
            for (const line of lines) {
              // Check if this line starts the coursework section
              if (line.match(/(?:Relevant|Key|Core)\s+Coursework:?/i)) {
                inCourseworkSection = true;
                // Extract the part after "Relevant Coursework:"
                const courseworkPart = line.replace(/^(?:Relevant|Key|Core)\s+Coursework:?\s*/i, '').trim();
                if (courseworkPart) {
                  courseworkLines.push(courseworkPart);
                }
              } 
              // If we're in the coursework section and the line doesn't contain GPA or degree keywords,
              // and is not a bullet point, consider it part of the coursework
              else if (inCourseworkSection && 
                      !line.match(/GPA|Grade\s+Point\s+Average/i) && 
                      !degreeKeywords.some(k => line.includes(k)) &&
                      !bulletMarkers.some(marker => line.trim().startsWith(marker))) {
                courseworkLines.push(line);
              }
              // If we encounter a line with GPA after coursework started, stop collecting coursework
              else if (inCourseworkSection && line.match(/GPA|Grade\s+Point\s+Average/i)) {
                break;
              }
            }
            
            // Combine all coursework lines
            if (courseworkLines.length > 0) {
              const coursework = courseworkLines.join(', ');
              
              // Store coursework in the field if field is empty, otherwise append to description
              if (!edu.field) {
                edu.field = coursework;
                console.log(`✅ Using coursework as field: "${edu.field}"`);
              } else {
                // If we already have a field, add coursework to description
                if (!edu.description) {
                  edu.description = `Relevant Coursework: ${coursework}`;
                } else {
                  edu.description += `\nRelevant Coursework: ${coursework}`;
                }
                console.log(`✅ Added coursework to description: "${coursework}"`);
              }
            }
            
            // Extract bullet points (lines that start with bullet markers)
            const bulletPointLines = lines.filter(line => {
              const trimmedLine = line.trim();
              return bulletMarkers.some(marker => trimmedLine.startsWith(marker)) || 
                     /^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192]/.test(trimmedLine);
            });
            
            if (bulletPointLines.length > 0) {
              edu.bulletPoints = bulletPointLines.map(line => {
                return line.replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]\s*/, '').trim();
              });
              
              console.log(`✅ Extracted ${bulletPointLines.length} bullet points`);
              if (edu.bulletPoints.length > 0) {
                console.log(`First bullet point: "${edu.bulletPoints[0]}"`);
              }
            }
          }
        }
        
        // Only add education entries that have at least some information
        if (edu.school || edu.degree || edu.startDate) {
          education.push(edu);
          console.log(`✅ Added education: ${edu.degree} at ${edu.school} (${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''})`);
        } else {
          console.log("❌ Education block skipped: insufficient information");
        }
      }
    }
    
    // Sort education by date (most recent first)
    console.log("\nSorting education by date...");
    try {
      education.sort((a, b) => {
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
      console.log(`✅ Sorted ${education.length} education entries by date`);
    } catch (error) {
      console.error('Error sorting education:', error);
      // Continue with unsorted education if there's an error
    }
  } catch (error) {
    console.error('Error in extractEducation:', error);
    return [];
  }
  
  console.log(`\n=== EDUCATION EXTRACTION COMPLETED: ${education.length} entries found ===\n`);
  return education;
}

module.exports = {
  extractEducation
}; 