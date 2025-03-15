/**
 * Extract email from text
 * @param {string} text - Text to extract email from
 * @returns {string} - Extracted email
 */
function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : '';
}

/**
 * Extract phone number from text
 * @param {string} text - Text to extract phone number from
 * @returns {string} - Extracted phone number
 */
function extractPhone(text) {
  // This regex handles various phone formats
  const phoneRegex = /(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : '';
}

/**
 * Extract LinkedIn URL from text
 * @param {string} text - Text to extract LinkedIn URL from
 * @returns {string} - Extracted LinkedIn URL
 */
function extractLinkedIn(text) {
  // Look for LinkedIn URLs with or without protocol
  const linkedinRegexes = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i,
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/profile\/view\?id=[a-zA-Z0-9_-]+/i
  ];
  
  for (const regex of linkedinRegexes) {
    const match = text.match(regex);
    if (match) return match[0];
  }
  
  return '';
}

/**
 * Extract website URL from text
 * @param {string} text - Text to extract website URL from
 * @returns {string} - Extracted website URL
 */
function extractWebsite(text) {
  // Enhanced regex to match more website formats
  // 1. Full URLs with protocol (http/https)
  // 2. URLs without protocol (www.example.com)
  // 3. Domain names (example.com)
  const websiteRegexes = [
    // Full URLs with protocol (excluding LinkedIn)
    /https?:\/\/(?!(?:www\.)?linkedin\.com)[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i,
    
    // URLs with www but no protocol
    /(?<!@)www\.[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i,
    
    // Simple domain names (something.something)
    /\b(?!www\.)(?!linkedin\.com)(?!mailto:)(?!tel:)[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i
  ];
  
  for (const regex of websiteRegexes) {
    const match = text.match(regex);
    if (match) {
      // If it's a domain without protocol, add https://
      if (!match[0].startsWith('http') && !match[0].startsWith('www.')) {
        return `https://${match[0]}`;
      } else if (match[0].startsWith('www.')) {
        return `https://${match[0]}`;
      }
      return match[0];
    }
  }
  
  return '';
}

/**
 * Extract all links from text
 * @param {string} text - Text to extract links from
 * @returns {Array} - Array of extracted links with type and url
 */
function extractAllLinks(text) {
  const links = [];
  
  // Extract LinkedIn
  const linkedin = extractLinkedIn(text);
  if (linkedin) {
    links.push({
      type: 'linkedin',
      url: linkedin.startsWith('http') ? linkedin : `https://${linkedin}`
    });
  }
  
  // Extract website
  const website = extractWebsite(text);
  if (website) {
    links.push({
      type: 'website',
      url: website
    });
  }
  
  // Extract GitHub
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) {
    links.push({
      type: 'github',
      url: githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`
    });
  }
  
  // Extract Twitter/X
  const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_-]+/i;
  const twitterMatch = text.match(twitterRegex);
  if (twitterMatch) {
    links.push({
      type: 'twitter',
      url: twitterMatch[0].startsWith('http') ? twitterMatch[0] : `https://${twitterMatch[0]}`
    });
  }
  
  // Extract other links that weren't caught by the specific extractors
  const generalLinkRegex = /https?:\/\/(?!(?:www\.)?linkedin\.com)(?!(?:www\.)?github\.com)(?!(?:www\.)?twitter\.com)(?!(?:www\.)?x\.com)[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
  const generalLinks = text.match(generalLinkRegex) || [];
  
  generalLinks.forEach(link => {
    // Check if this link is already in our list
    if (!links.some(existingLink => existingLink.url === link)) {
      links.push({
        type: 'other',
        url: link
      });
    }
  });
  
  return links;
}

/**
 * Extract name from text
 * @param {string} text - Text to extract name from
 * @returns {string} - Extracted name
 */
function extractName(text) {
  // Assume the name is at the beginning of the resume
  // This is a simplistic approach and might need refinement
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Look at the first few lines for a potential name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    
    // Check if this line looks like a name (no special characters, not too long)
    if (line.length > 0 && line.length < 50 && /^[A-Za-z\s.'-]+$/.test(line)) {
      return line;
    }
  }
  
  return '';
}

/**
 * Extract location from parsed data
 * @param {Object} parsedData - Parsed resume data
 * @returns {string} - Extracted location
 */
function extractLocation(parsedData) {
  // Try to find location in the text
  const locationRegex = /([A-Za-z\s]+,\s*[A-Z]{2})/;
  const match = parsedData.summary ? parsedData.summary.match(locationRegex) : null;
  return match ? match[1] : '';
}

/**
 * Guess job title from text and experiences
 * @param {string} text - Resume text
 * @param {Array} experiences - Extracted experiences
 * @returns {string} - Guessed job title
 */
function guessJobTitle(text, experiences) {
  // If we have experiences, use the most recent position
  if (experiences && experiences.length > 0) {
    return experiences[0].position;
  }
  
  // Otherwise try to find common job titles in the text
  const commonTitles = [
    'Software Engineer', 'Software Developer', 'Web Developer',
    'Product Manager', 'Project Manager', 'Program Manager',
    'Data Scientist', 'Data Analyst', 'Business Analyst',
    'Marketing Manager', 'Sales Manager', 'Account Executive',
    'UX Designer', 'UI Designer', 'Graphic Designer',
    'Content Writer', 'Technical Writer'
  ];
  
  for (const title of commonTitles) {
    if (text.includes(title)) {
      return title;
    }
  }
  
  return '';
}

/**
 * Extract personal information from resume text
 * @param {string} text - Resume text
 * @param {Object} parsedData - Partially parsed resume data
 * @returns {Object} - Extracted personal information
 */
function extractPersonalInfo(text, parsedData) {
  // Extract all links
  const allLinks = extractAllLinks(text);
  
  // Find primary website (non-LinkedIn, non-GitHub, non-Twitter)
  const primaryWebsite = allLinks.find(link => 
    link.type === 'website' || 
    (link.type === 'other' && 
     !link.url.includes('linkedin.com') && 
     !link.url.includes('github.com') && 
     !link.url.includes('twitter.com') && 
     !link.url.includes('x.com'))
  );
  
  // Find LinkedIn
  const linkedinLink = allLinks.find(link => link.type === 'linkedin');
  
  // Create additional links array
  const additionalLinks = allLinks
    .filter(link => 
      (link.type !== 'linkedin' || !linkedinLink || link.url !== linkedinLink.url) && 
      (link.type !== 'website' || !primaryWebsite || link.url !== primaryWebsite.url)
    )
    .map(link => ({
      name: link.type.charAt(0).toUpperCase() + link.type.slice(1),
      url: link.url
    }));
  
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    linkedin: linkedinLink ? linkedinLink.url : '',
    website: primaryWebsite ? primaryWebsite.url : '',
    location: extractLocation(parsedData),
    jobTitle: guessJobTitle(text, parsedData.experiences),
    links: {
      linkedin: linkedinLink ? linkedinLink.url : '',
      portfolio: primaryWebsite ? primaryWebsite.url : '',
      additionalLinks: additionalLinks
    }
  };
}

module.exports = {
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractWebsite,
  extractAllLinks,
  extractName,
  extractLocation,
  guessJobTitle,
  extractPersonalInfo
}; 