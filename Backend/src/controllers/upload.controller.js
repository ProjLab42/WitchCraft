const { parseResume } = require('../services/parser.service');

// Upload and parse a resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    
    // Parse the resume
    const parsedData = await parseResume(fileBuffer, fileType);
    
    res.json({
      message: 'Resume parsed successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ message: 'Error parsing resume' });
  }
};
