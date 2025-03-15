/**
 * Extract certifications from certification text
 * @param {string} certText - Text containing certifications
 * @returns {Array} - Array of certification objects
 */
function extractCertifications(certText) {
  if (!certText) return [];
  
  const certifications = [];
  const certBlocks = certText.split(/\n{2,}/);
  
  for (const block of certBlocks) {
    if (block.trim().length === 0) continue;
    
    const lines = block.split('\n');
    if (lines.length === 0) continue;
    
    // First line is likely the certification name
    const name = lines[0].trim();
    
    // Try to extract issuer and date
    let issuer = '';
    let date = '';
    let expirationDate = '';
    let credentialId = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for issuer (contains words like "issued by", "provider", etc.)
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('provider') || line.toLowerCase().includes('from')) {
        issuer = line.replace(/issued by|provider|from/i, '').trim();
      }
      
      // Look for date
      const dateRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i;
      const dateMatch = line.match(dateRegex);
      if (dateMatch && !date) {
        date = dateMatch[0];
      } else if (dateMatch && date) {
        expirationDate = dateMatch[0];
      }
      
      // Look for credential ID
      if (line.toLowerCase().includes('credential') || line.toLowerCase().includes('id')) {
        credentialId = line.replace(/credential|id/i, '').trim();
      }
    }
    
    certifications.push({
      name,
      issuer: issuer || 'Unknown',
      date: date || 'Unknown',
      expirationDate,
      credentialId
    });
  }
  
  return certifications;
}

module.exports = {
  extractCertifications
}; 