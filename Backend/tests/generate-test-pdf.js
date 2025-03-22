const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Simple test to generate a PDF with Puppeteer
async function generateTestPDF() {
  console.log('Starting test PDF generation...');
  
  let browser;
  
  try {
    // Launch a new browser instance
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    // Create a new page
    console.log('Creating page...');
    const page = await browser.newPage();
    
    // Set very simple HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Test PDF</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            h1 { color: #333; }
            p { line-height: 1.5; }
          </style>
        </head>
        <body>
          <h1>Test PDF Generation</h1>
          <p>This is a test PDF generated with Puppeteer.</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `;
    
    console.log('Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    // Save the PDF to file
    const outputPath = path.join(__dirname, 'test-output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`PDF generated successfully: ${outputPath}`);
    console.log(`PDF size: ${pdfBuffer.length} bytes`);
    
    return { success: true, path: outputPath, size: pdfBuffer.length };
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the browser
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  generateTestPDF()
    .then(result => {
      if (result.success) {
        console.log('Test completed successfully');
      } else {
        console.error('Test failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      process.exit(1);
    });
} else {
  // Export the function for use in other tests
  module.exports = { generateTestPDF };
} 