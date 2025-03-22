# WitchCraft

WitchCraft is a powerful CV management tool that enables quick creation of tailored, professional resumes. Built with modern web technologies, it helps job seekers create ATS-friendly resumes that stand out to employers.

## 🌟 Features

- **Resume Builder**: Intuitive drag-and-drop interface to build professional resumes
- **Template Library**: Multiple professionally designed resume templates
- **Resume Customization**: Easily customize sections, content, and styling
- **ATS-Friendly**: Optimized for Applicant Tracking Systems
- **Export Options**: Download as PDF or DOCX
- **Resume Upload**: Import existing resumes to edit and improve
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- React.js with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- Shadcn UI components
- React Router for navigation
- React DnD for drag-and-drop functionality
- PDF and DOCX export capabilities

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- RESTful API architecture
- File upload handling with Multer
- PDF and DOCX parsing

## 📋 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ProjLab42/WitchCraft.git
cd WitchCraft
```

2. Install Frontend dependencies
```bash
cd Frontend
npm install
```

3. Install Backend dependencies
```bash
cd ../Backend
npm install
```

4. Set up environment variables
   - Create a `.env` file in the Backend directory based on the provided example

5. Start the Backend server
```bash
npm run dev
```

6. Start the Frontend development server
```bash
cd ../Frontend
npm run dev
```

7. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:8080)

## 🔧 Development

### Frontend Structure
- `/src/components`: Reusable UI components
- `/src/pages`: Main application pages
- `/src/services`: API service integrations
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions

### Backend Structure
- `/src/controllers`: Request handlers
- `/src/models`: MongoDB schema models
- `/src/routes`: API route definitions
- `/src/middleware`: Express middleware
- `/src/services`: Business logic services
- `/src/config`: Configuration files

### PDF/DOCX Export System

WitchCraft provides two methods for exporting resumes:

#### Server-Side Generation (Preferred Method)
- **PDF Generation**: Uses `puppeteer` to render HTML/CSS templates to PDF documents
  - Located in `Backend/src/services/pdf.service.js`
  - Creates ATS-friendly PDFs with selectable text
  - Supports custom templates with proper formatting
  - Accessible via `GET /resume/download/:id/pdf?template=TemplateName`

- **DOCX Generation**: Uses `docx` library to create structured Word documents
  - Located in `Backend/src/services/document.service.js`
  - Creates clean, professional Word documents
  - Accessible via `GET /resume/download/:id/docx`

#### Client-Side Generation (Fallback Method)
- **PDF Generation**: Uses `html2canvas` and `jspdf` 
  - Located in `Frontend/src/components/resume-editor/utils.ts`
  - Renders what's visible on screen
  - Limited ATS compatibility (creates image-based PDFs)

- **DOCX Generation**: Uses the `docx` library on the client side
  - Also in `Frontend/src/components/resume-editor/utils.ts`
  - Creates structured Word documents directly in the browser

The system attempts to use server-side generation first, falling back to client-side methods if there's an error or if the resume hasn't been saved to the database.

**Dependencies:**
- Server-side: `puppeteer`, `handlebars`, `pdf-lib`, `docx`
- Client-side: `html2canvas`, `jspdf`, `docx`, `file-saver`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributors

- ProjLab42 Team

## 🙏 Acknowledgements

- All the open-source libraries and tools that made this project possible
- The community for feedback and support
