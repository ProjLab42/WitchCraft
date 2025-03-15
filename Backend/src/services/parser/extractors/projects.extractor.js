/**
 * Extract projects from parsed data
 * @param {Object} parsedData - Parsed resume data
 * @returns {Array} - Array of project objects
 */
function extractProjects(text) {
  console.log("\n=== PROJECT EXTRACTION STARTED ===");
  console.log(`Input text length: ${text?.length || 0} characters`);
  
  if (!text || typeof text !== 'string') {
    console.log("❌ Invalid input: text is empty or not a string");
    return [];
  }
  
  const projects = [];
  
  try {
    // Split the text into lines for processing
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    console.log(`Found ${lines.length} non-empty lines in the text`);
    
    // Identify potential project entry patterns
    console.log("Analyzing text structure to identify project entries...");
    
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
        hasDateRange: /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*(?:-|to|–|until|\s)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|(?:19|20)\d{2}\s*(?:-|to|–|until|\s)\s*(?:19|20)\d{2}|(?:19|20)\d{2}\s*(?:-|to|–|until|\s)\s*Present/i.test(trimmedLine),
        hasLink: /https?:\/\/[^\s]+/.test(trimmedLine),
        hasGitHub: /github\.com/.test(trimmedLine.toLowerCase()),
        hasProjectIndicator: /project|app|application|website|web app|mobile app|system|platform|tool|prototype|demo/i.test(trimmedLine),
        hasTechnologyIndicator: /(?:Node\.js|Express\.js|React|Angular|Vue|JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Swift|Kotlin|Go|Rust|HTML|CSS|SQL|MySQL|PostgreSQL|MongoDB|Firebase|AWS|Azure|GCP|Docker|Kubernetes)/i.test(trimmedLine),
        looksLikeContinuation: /^(?:for|using|with|and|in|to|on|of|by)\s+/i.test(trimmedLine) && !startsWithBullet && !looksLikeBullet
      };
    });
    
    // Identify project entry starting points
    const projectEntryIndices = [];
    
    // First pass: look for clear project patterns
    for (let i = 0; i < lineTypes.length; i++) {
      const current = lineTypes[i];
      const next = i < lineTypes.length - 1 ? lineTypes[i + 1] : null;
      const prev = i > 0 ? lineTypes[i - 1] : null;
      
      // Skip lines that look like continuations of previous lines
      if (current.looksLikeContinuation && prev && !prev.isBullet) {
        console.log(`Skipping line ${i} as it looks like a continuation: "${lines[i]}"`);
        continue;
      }
      
      // Strong indicators of a project entry:
      // 1. Line has project indicator and is not a bullet point
      // 2. Line has GitHub link and is not a bullet point
      // 3. Line is followed by bullet points describing the project
      // 4. Line has a date range (likely a project with dates)
      
      if (
        // Case 1: Line has project indicator
        (current.hasProjectIndicator && !current.isBullet) ||
        
        // Case 2: Line has GitHub link
        (current.hasGitHub && !current.isBullet) ||
        
        // Case 3: Line is followed by bullet points
        (!current.isBullet && next && next.isBullet) ||
        
        // Case 4: Line has a date range and is not a bullet point
        (current.hasDateRange && !current.isBullet)
      ) {
        // Skip if this line is likely a continuation of the previous line
        if (current.looksLikeContinuation && i > 0) {
          continue;
        }
        
        projectEntryIndices.push(i);
        console.log(`Potential project entry at line ${i}: "${lines[i]}"`);
      }
    }
    
    // If we found very few entries, try a more aggressive approach
    if (projectEntryIndices.length < 1) {
      console.log("Few project entries found, trying alternative approach...");
      
      // Second pass: look for any non-bullet line that might be a project title
      for (let i = 0; i < lineTypes.length; i++) {
        const current = lineTypes[i];
        const next = i < lineTypes.length - 1 ? lineTypes[i + 1] : null;
        
        // Skip lines that look like continuations
        if (current.looksLikeContinuation) {
          continue;
        }
        
        // If this is a non-bullet line and not already identified as a project entry
        if (!current.isBullet && !projectEntryIndices.includes(i)) {
          // If it's a short line (likely a title) or has a link or technologies
          if (current.line.length < 60 || current.hasLink || current.hasTechnologyIndicator) {
            projectEntryIndices.push(i);
            console.log(`Additional potential project entry at line ${i}: "${lines[i]}"`);
          }
        }
      }
    }
    
    // Sort indices to ensure they're in order
    projectEntryIndices.sort((a, b) => a - b);
    
    // Process each project entry
    for (let entryIndex = 0; entryIndex < projectEntryIndices.length; entryIndex++) {
      const startLineIndex = projectEntryIndices[entryIndex];
      const endLineIndex = entryIndex < projectEntryIndices.length - 1 ? 
                          projectEntryIndices[entryIndex + 1] - 1 : 
                          lines.length - 1;
      
      // Extract the lines for this project entry
      const projectLines = lines.slice(startLineIndex, endLineIndex + 1);
      console.log(`\n--- Processing Project Entry ${entryIndex + 1} (lines ${startLineIndex}-${endLineIndex}) ---`);
      console.log(`Project entry text:\n${projectLines.join('\n')}`);
      
      const project = {
        id: projects.length + 1,
        name: '',
        description: '',
        link: '',
        technologies: [],
        startDate: '',
        endDate: '',
        bulletPoints: []
      };
      
      // Extract date range if present
      console.log("Extracting date range...");
      let dateRangeFound = false;
      let dateLineIndex = -1;
      
      // Define date range patterns to try
      const dateRangePatterns = [
        // Pattern 1: "Month Year - Month Year" or "Month Year - Present"
        /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\s*(?:-|to|–|until|\s)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 2: "YYYY - YYYY" or "YYYY - Present"
        /\b(\d{4})\s*(?:-|to|–|until|\s)\s*(\d{4}|Present|Current|Now|Ongoing)/i,
        
        // Pattern 3: "YYYY-Present" (no space)
        /\b(\d{4})-(Present|Current|Now|Ongoing)/i
      ];
      
      // Try to find a complete date range in any line
      for (let i = 0; i < projectLines.length; i++) {
        const line = projectLines[i];
        for (const pattern of dateRangePatterns) {
          const match = line.match(pattern);
          if (match) {
            project.startDate = match[1];
            project.endDate = match[2] || "";
            dateRangeFound = true;
            dateLineIndex = i;
            console.log(`✅ Found date range: ${project.startDate}${project.endDate ? ` to ${project.endDate}` : ''}`);
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
        for (let i = 0; i < projectLines.length; i++) {
          const line = projectLines[i];
          const matches = line.match(datePattern);
          
          if (matches) {
            dates = dates.concat(matches);
            if (dateLineIndex === -1) dateLineIndex = i;
          }
        }
        
        if (dates.length >= 2) {
          project.startDate = dates[0];
          project.endDate = dates[1];
          dateRangeFound = true;
          console.log(`✅ Found separate dates: ${project.startDate} to ${project.endDate}`);
        } else if (dates.length === 1) {
          project.startDate = dates[0];
          project.endDate = "";
          dateRangeFound = true;
          console.log(`⚠️ Found only start date: ${project.startDate}`);
        } else {
          console.log("❌ No dates found");
        }
      }
      
      // First line is likely the project name, but remove the date part if present
      let projectName = projectLines[0].trim();
      
      // Remove date range from project name if present
      if (dateLineIndex === 0) {
        for (const pattern of dateRangePatterns) {
          projectName = projectName.replace(pattern, '').trim();
        }
        
        // Also try to remove any remaining year mentions
        projectName = projectName.replace(/\b(?:19|20)\d{2}\b/g, '').trim();
      }
      
      project.name = projectName;
      console.log(`✅ Extracted project name: "${project.name}"`);
      
      // Extract link if present in any line
      for (const line of projectLines) {
        const linkRegex = /https?:\/\/[^\s]+/;
        const linkMatch = line.match(linkRegex);
        if (linkMatch) {
          project.link = linkMatch[0];
          console.log(`✅ Extracted project link: "${project.link}"`);
          break;
        }
      }
      
      // Extract technologies if present
      console.log("Extracting technologies...");
      const techPatterns = [
        // Pattern 1: "Technologies: X, Y, Z"
        /(?:Technologies|Tech Stack|Tools|Built with|Developed using|Stack):\s*(.+)/i,
        
        // Pattern 2: "X, Y, Z" in parentheses
        /\(([^)]+(?:JavaScript|Python|Java|C\+\+|HTML|CSS|React|Angular|Vue|Node\.js|Express\.js|Django|Flask|Ruby|PHP|Swift|Kotlin|Go|Rust|TypeScript)[^)]*)\)/i,
        
        // Pattern 3: "using X, Y, Z"
        /using\s+([^.]+(?:JavaScript|Python|Java|C\+\+|HTML|CSS|React|Angular|Vue|Node\.js|Express\.js|Django|Flask|Ruby|PHP|Swift|Kotlin|Go|Rust|TypeScript)[^.]*)/i
      ];
      
      // Common technology keywords to look for
      const techKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust',
        'HTML', 'CSS', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Azure', 'GCP',
        'React', 'Angular', 'Vue', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel',
        'Docker', 'Kubernetes', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib',
        'Android', 'iOS', 'React Native', 'Flutter', 'Xamarin', 'Unity', 'Unreal Engine',
        'REST API', 'GraphQL', 'WebSocket', 'JWT', 'OAuth', 'SAML', 'LLM', 'Gemini', 'GPT'
      ];
      
      let techsFound = false;
      
      // First try pattern matching
      for (const line of projectLines) {
        for (const pattern of techPatterns) {
          const match = line.match(pattern);
          if (match) {
            const techsText = match[1];
            const techs = techsText.split(/,|;|\|/).map(tech => tech.trim()).filter(tech => tech.length > 0);
            project.technologies = techs;
            techsFound = true;
            console.log(`✅ Extracted technologies using pattern: ${techs.join(', ')}`);
            break;
          }
        }
        
        if (techsFound) break;
      }
      
      // If no technologies found with patterns, look for tech keywords in all lines
      if (!techsFound) {
        const foundTechs = new Set();
        
        for (const line of projectLines) {
          for (const tech of techKeywords) {
            // Use word boundary to ensure we're matching whole words
            // Escape any regex special characters in the tech name
            const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedTech}\\b`, 'i');
            if (regex.test(line)) {
              foundTechs.add(tech);
            }
          }
        }
        
        if (foundTechs.size > 0) {
          project.technologies = Array.from(foundTechs);
          console.log(`✅ Extracted technologies using keywords: ${project.technologies.join(', ')}`);
          techsFound = true;
        } else {
          console.log("❌ No technologies found");
        }
      }
      
      // Extract bullet points
      console.log("Extracting bullet points...");
      
      // Identify bullet point lines
      const bulletPointLines = projectLines.filter((_, i) => {
        // Skip the first line if it's the project name
        if (i === 0 && !lineTypes[startLineIndex + i].isBullet) return false;
        return lineTypes[startLineIndex + i].isBullet;
      });
      
      if (bulletPointLines.length > 0) {
        // Process bullet points
        project.bulletPoints = bulletPointLines.map(line => {
          // Remove bullet markers from the beginning of the line
          return line.replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]\s*/, '').trim();
        });
        
        console.log(`✅ Extracted ${bulletPointLines.length} bullet points`);
        if (project.bulletPoints.length > 0) {
          console.log(`First bullet point: "${project.bulletPoints[0]}"`);
        }
      } else {
        console.log("❌ No bullet points found");
        
        // If no bullet points, use non-first lines as description
        if (projectLines.length > 1) {
          // Skip the first line (project name) and any lines that look like continuations of the project name
          let descriptionStartIndex = 1;
          while (
            descriptionStartIndex < projectLines.length && 
            lineTypes[startLineIndex + descriptionStartIndex].looksLikeContinuation
          ) {
            descriptionStartIndex++;
          }
          
          if (descriptionStartIndex < projectLines.length) {
            project.description = projectLines.slice(descriptionStartIndex).join('\n').trim();
            console.log(`✅ Using remaining lines as description: "${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}"`);
          }
        }
      }
      
      // If we have continuation lines right after the project name, they might be part of the name or description
      if (projectLines.length > 1 && lineTypes[startLineIndex + 1].looksLikeContinuation) {
        // If the continuation line contains technologies, add it to the description
        if (lineTypes[startLineIndex + 1].hasTechnologyIndicator) {
          if (!project.description) {
            project.description = projectLines[1];
          } else {
            project.description = projectLines[1] + '\n' + project.description;
          }
          console.log(`✅ Added continuation line to description: "${projectLines[1]}"`);
        } 
        // Otherwise, it might be part of the project name
        else {
          project.name += ' ' + projectLines[1].trim();
          console.log(`✅ Updated project name with continuation: "${project.name}"`);
        }
      }
      
      // Only add project entries that have at least a name
      if (project.name) {
        projects.push(project);
        console.log(`✅ Added project: ${project.name}`);
      } else {
        console.log("❌ Project entry skipped: no name found");
      }
    }
    
    // If we didn't find any project entries with the structured approach, fall back to a simpler method
    if (projects.length === 0) {
      console.log("\nNo project entries found with structured approach, falling back to simpler method...");
      
      // Split text into blocks separated by multiple newlines
      const projectBlocks = text.split(/\n{2,}/);
      console.log(`Found ${projectBlocks.length} potential project blocks using simpler method`);
      
      for (let blockIndex = 0; blockIndex < projectBlocks.length; blockIndex++) {
        const block = projectBlocks[blockIndex].trim();
        if (block.length === 0) continue;
        
        console.log(`\n--- Processing Project Block ${blockIndex + 1} ---`);
        console.log(`Block text (first 100 chars): ${block.substring(0, 100).replace(/\n/g, "\\n")}...`);
        
        const lines = block.split('\n').filter(line => line.trim().length > 0);
        if (lines.length === 0) continue;
        
        const project = {
          id: projects.length + 1,
          name: '',
          description: '',
          link: '',
          technologies: [],
          startDate: '',
          endDate: '',
          bulletPoints: []
        };
        
        // Extract date range if present
        let dateRangeFound = false;
        
        // Try to find a complete date range in any line
        for (const line of lines) {
          for (const pattern of dateRangePatterns) {
            const match = line.match(pattern);
            if (match) {
              project.startDate = match[1];
              project.endDate = match[2] || "";
              dateRangeFound = true;
              console.log(`✅ Found date range: ${project.startDate}${project.endDate ? ` to ${project.endDate}` : ''}`);
              
              // Remove date from line if it's the first line (likely the project name)
              if (line === lines[0]) {
                lines[0] = lines[0].replace(pattern, '').trim();
              }
              
              break;
            }
          }
          
          if (dateRangeFound) break;
        }
        
        // First line is likely the project name
        project.name = lines[0].trim();
        console.log(`✅ Extracted project name: "${project.name}"`);
        
        // Extract link if present in any line
        for (const line of lines) {
          const linkRegex = /https?:\/\/[^\s]+/;
          const linkMatch = line.match(linkRegex);
          if (linkMatch) {
            project.link = linkMatch[0];
            console.log(`✅ Extracted project link: "${project.link}"`);
            break;
          }
        }
        
        // Extract technologies if present
        let techsFound = false;
        
        // First try pattern matching
        for (const line of lines) {
          for (const pattern of techPatterns) {
            const match = line.match(pattern);
            if (match) {
              const techsText = match[1];
              const techs = techsText.split(/,|;|\|/).map(tech => tech.trim()).filter(tech => tech.length > 0);
              project.technologies = techs;
              techsFound = true;
              console.log(`✅ Extracted technologies using pattern: ${techs.join(', ')}`);
              break;
            }
          }
          
          if (techsFound) break;
        }
        
        // If no technologies found with patterns, look for tech keywords in all lines
        if (!techsFound) {
          const foundTechs = new Set();
          
          for (const line of lines) {
            for (const tech of techKeywords) {
              // Use word boundary to ensure we're matching whole words
              // Escape any regex special characters in the tech name
              const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(`\\b${escapedTech}\\b`, 'i');
              if (regex.test(line)) {
                foundTechs.add(tech);
              }
            }
          }
          
          if (foundTechs.size > 0) {
            project.technologies = Array.from(foundTechs);
            console.log(`✅ Extracted technologies using keywords: ${project.technologies.join(', ')}`);
            techsFound = true;
          } else {
            console.log("❌ No technologies found");
          }
        }
        
        // Identify bullet point lines
        const bulletPointLines = lines.filter((line, i) => {
          // Skip the first line (project name)
          if (i === 0) return false;
          
          const trimmedLine = line.trim();
          return bulletMarkers.some(marker => trimmedLine.startsWith(marker)) || 
                 /^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192]/.test(trimmedLine);
        });
        
        if (bulletPointLines.length > 0) {
          // Process bullet points
          project.bulletPoints = bulletPointLines.map(line => {
            // Remove bullet markers from the beginning of the line
            return line.replace(/^\s*[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25B8\u2192•\-\*\⁃\◦\▪\■\●\○\➢\➤\➥\➔]\s*/, '').trim();
          });
          
          console.log(`✅ Extracted ${bulletPointLines.length} bullet points`);
          if (project.bulletPoints.length > 0) {
            console.log(`First bullet point: "${project.bulletPoints[0]}"`);
          }
        } else {
          console.log("❌ No bullet points found");
          
          // If no bullet points, use non-first lines as description
          if (lines.length > 1) {
            project.description = lines.slice(1).join('\n').trim();
            console.log(`✅ Using remaining lines as description: "${project.description.substring(0, 50)}${project.description.length > 50 ? '...' : ''}"`);
          }
        }
        
        // Only add project entries that have at least a name
        if (project.name) {
          projects.push(project);
          console.log(`✅ Added project: ${project.name}`);
        } else {
          console.log("❌ Project block skipped: no name found");
        }
      }
    }
    
    // Post-process projects to merge any that might be fragments of the same project
    console.log("\nPost-processing projects to merge fragments...");
    const mergedProjects = [];
    let skipIndices = new Set();
    
    for (let i = 0; i < projects.length; i++) {
      if (skipIndices.has(i)) continue;
      
      const currentProject = projects[i];
      
      // Check if the next project looks like a continuation of this one
      if (i + 1 < projects.length) {
        const nextProject = projects[i + 1];
        
        // If the next project name starts with a continuation word and has no dates
        if (
          /^(?:using|with|for|and|in|to|on|of|by)\b/i.test(nextProject.name) && 
          !nextProject.startDate && 
          !nextProject.endDate
        ) {
          console.log(`Merging project "${nextProject.name}" into "${currentProject.name}" as it looks like a continuation`);
          
          // Merge the description
          if (nextProject.description) {
            if (currentProject.description) {
              currentProject.description += '\n' + nextProject.description;
            } else {
              currentProject.description = nextProject.description;
            }
          }
          
          // Add the continuation to the description
          if (!currentProject.description) {
            currentProject.description = nextProject.name;
          } else {
            currentProject.description = nextProject.name + '\n' + currentProject.description;
          }
          
          // Merge bullet points
          currentProject.bulletPoints = currentProject.bulletPoints.concat(nextProject.bulletPoints);
          
          // Merge technologies
          if (nextProject.technologies.length > 0) {
            const allTechs = new Set([...currentProject.technologies, ...nextProject.technologies]);
            currentProject.technologies = Array.from(allTechs);
          }
          
          // Skip the next project when we process the list
          skipIndices.add(i + 1);
        }
      }
      
      mergedProjects.push(currentProject);
    }
    
    console.log(`Merged ${projects.length - mergedProjects.length} project fragments`);
    
    return mergedProjects;
  } catch (error) {
    console.error('Error in extractProjects:', error);
    return [];
  }
  
  console.log(`\n=== PROJECT EXTRACTION COMPLETED: ${projects.length} projects found ===\n`);
  return projects;
}

module.exports = {
  extractProjects
}; 