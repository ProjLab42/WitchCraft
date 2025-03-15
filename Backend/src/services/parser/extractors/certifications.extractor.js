/**
 * Extract certifications from certification text
 * @param {string} certText - Text containing certifications
 * @returns {Array} - Array of certification objects
 */
function extractCertifications(certText) {
  console.log("\n=== CERTIFICATION EXTRACTION STARTED ===");
  console.log(`Input text length: ${certText?.length || 0} characters`);
  
  if (!certText) {
    console.log("❌ Invalid input: text is empty");
    return [];
  }
  
  const certifications = [];
  
  try {
    // Split the text into lines for processing
    const lines = certText.split('\n').filter(line => line.trim().length > 0);
    console.log(`Found ${lines.length} non-empty lines in the text`);
    
    // Log the first few lines to understand the structure
    console.log("First few lines of input:");
    lines.slice(0, Math.min(10, lines.length)).forEach((line, i) => {
      console.log(`Line ${i + 1}: "${line.trim()}"`);
    });
    
    // Pattern for detecting dates in lines
    const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i;
    
    // Process lines in pairs (certificate name + issuer)
    for (let i = 0; i < lines.length; i += 2) {
      const certLine = lines[i].trim();
      const issuerLine = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
      
      console.log(`\n--- Processing Certification ${i/2 + 1} ---`);
      console.log(`Certificate line: "${certLine}"`);
      if (issuerLine) console.log(`Issuer line: "${issuerLine}"`);
      
      // Extract certification name and date
      let name = certLine;
      let date = 'Unknown';
      
      // Check if the certification line contains a date
      const dateMatch = certLine.match(dateRegex);
      if (dateMatch) {
        date = dateMatch[0];
        // Remove the date from the name
        name = certLine.replace(dateMatch[0], '').trim();
        name = name.replace(/\s+$/, ''); // Remove trailing spaces
        console.log(`✅ Extracted date: "${date}"`);
      }
      
      // Clean up the name (remove any trailing punctuation)
      name = name.replace(/[.,;:]$/, '').trim();
      console.log(`✅ Extracted certification name: "${name}"`);
      
      // Extract issuer
      let issuer = issuerLine || 'Unknown';
      console.log(`✅ Extracted issuer: "${issuer}"`);
      
      // Create certification object
      const certification = {
        name,
        issuer,
        date,
        expirationDate: '',
        credentialId: ''
      };
      
      certifications.push(certification);
      console.log(`✅ Added certification: ${name} from ${issuer} (${date})`);
    }
    
    // If we didn't find any certifications with the paired approach, try a more flexible approach
    if (certifications.length === 0) {
      console.log("\nNo certifications found with paired approach, trying flexible approach...");
      
      // Look for lines that might be certification names (contain a date or certification keywords)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        console.log(`Analyzing line ${i + 1}: "${line}"`);
        
        // Check if this line looks like a certification name
        if (
          line.match(dateRegex) || 
          line.includes('Certificate') || 
          line.includes('Certification') ||
          line.includes('Certified') ||
          line.includes('CCNA') ||
          line.includes('CompTia') ||
          line === line.toUpperCase()
        ) {
          // Extract certification name and date
          let name = line;
          let date = 'Unknown';
          let issuer = 'Unknown';
          
          // Check if the line contains a date
          const dateMatch = line.match(dateRegex);
          if (dateMatch) {
            date = dateMatch[0];
            // Remove the date from the name
            name = line.replace(dateMatch[0], '').trim();
            name = name.replace(/\s+$/, ''); // Remove trailing spaces
            console.log(`✅ Extracted date: "${date}"`);
          }
          
          // Clean up the name (remove any trailing punctuation)
          name = name.replace(/[.,;:]$/, '').trim();
          console.log(`✅ Extracted certification name: "${name}"`);
          
          // Check if the next line might be the issuer
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            // If the next line doesn't look like a certification (no date, not all caps)
            if (!nextLine.match(dateRegex) && 
                !nextLine.includes('Certificate') && 
                !nextLine.includes('Certification') &&
                !nextLine.includes('Certified') &&
                !nextLine.includes('CCNA') &&
                !nextLine.includes('CompTia') &&
                nextLine !== nextLine.toUpperCase()) {
              issuer = nextLine;
              i++; // Skip the issuer line in the next iteration
              console.log(`✅ Extracted issuer: "${issuer}"`);
            }
          }
          
          // Create certification object
          const certification = {
            name,
            issuer,
            date,
            expirationDate: '',
            credentialId: ''
          };
          
          certifications.push(certification);
          console.log(`✅ Added certification: ${name} from ${issuer} (${date})`);
        }
      }
    }
    
    console.log(`\n=== CERTIFICATION EXTRACTION COMPLETED: ${certifications.length} certifications found ===\n`);
    return certifications;
  } catch (error) {
    console.error('Error in extractCertifications:', error);
    return [];
  }
}

module.exports = {
  extractCertifications
}; 