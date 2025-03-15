const { parseResume } = require('../services/parser.service');

// Upload and parse a resume
exports.uploadResume = async (req, res) => {
  console.log('Resume upload request received');
  
  try {
    // Check if file exists
    if (!req.file) {
      console.error('Upload error: No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Log file details
    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      user: req.user ? req.user.id : 'unauthenticated'
    });

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    
    // Parse the resume
    console.log('Starting resume parsing process...');
    const startTime = Date.now();
    
    const parsedData = await parseResume(fileBuffer, fileType);
    
    const endTime = Date.now();
    console.log(`Resume parsing completed in ${endTime - startTime}ms`);
    
    // Check if parsed data is valid
    if (!parsedData) {
      console.error('Parsing error: No data returned from parser');
      return res.status(500).json({ message: 'Error parsing resume: No data returned' });
    }
    
    // Log parsing results summary
    console.log('Parsing results summary:', {
      personalInfo: parsedData.name ? 'Found' : 'Not found',
      experiences: parsedData.experiences?.length || 0,
      education: parsedData.education?.length || 0,
      skills: parsedData.skills?.length || 0,
      projects: parsedData.projects?.length || 0,
      certifications: parsedData.certifications?.length || 0
    });
    
    // Send response
    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    console.error('Error stack:', error.stack);
    
    // Send detailed error response
    res.status(500).json({ 
      message: 'Error parsing resume',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
