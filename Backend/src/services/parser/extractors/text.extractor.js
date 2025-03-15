const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

/**
 * Extract text from PDF
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPdf(buffer) {
  try {
    // Using pdf-parse for text extraction
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract text from DOCX
 * @param {Buffer} buffer - DOCX file buffer
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromPdf,
  extractTextFromDocx
}; 