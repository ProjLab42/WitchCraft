const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const User = require('../../src/models/user.model');
const Resume = require('../../src/models/resume.model');
const geminiService = require('../../src/services/gemini.service');
const aiController = require('../../src/controllers/ai.controller');

describe('AI Controller', () => {
  let req, res, userFindStub, resumeFindStub, geminiStub;
  
  beforeEach(() => {
    // Create request and response objects
    req = {
      userId: new mongoose.Types.ObjectId().toString(),
      body: {
        jobDescription: 'Test job description for a software developer'
      }
    };
    
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    
    // Create test user
    const testUser = {
      _id: req.userId,
      name: 'Test User',
      email: 'test@example.com',
      toObject: () => ({
        _id: req.userId,
        name: 'Test User',
        email: 'test@example.com'
      })
    };
    
    // Create test resume with all section types
    const testResume = {
      user: req.userId,
      sections: {
        sectionMeta: {
          experience: { name: 'Experience', deletable: true, renamable: true },
          education: { name: 'Education', deletable: true, renamable: true },
          skills: { name: 'Skills', deletable: true, renamable: true },
          projects: { name: 'Projects', deletable: true, renamable: true },
          certifications: { name: 'Certifications', deletable: true, renamable: true }
        },
        experience: [
          { company: 'Test Company', title: 'Developer', period: '2020-Present', description: 'Development work' }
        ],
        education: [
          { institution: 'Test University', degree: 'Computer Science', period: '2016-2020', description: 'Studied CS' }
        ],
        skills: [
          { name: 'JavaScript' }, { name: 'React' }
        ],
        projects: [
          { name: 'Test Project', description: 'A test project', technologies: 'React, Node.js', period: '2020' }
        ],
        certifications: [
          { name: 'AWS Certification', issuer: 'Amazon', date: '2021' }
        ],
        customSections: {
          'Publications': [
            { name: 'Test Publication', description: 'A test publication' }
          ]
        }
      }
    };
    
    // Mock Gemini service response with all sections
    const geminiResponse = {
      summary: 'Test summary for a software developer resume',
      sections: {
        experience: [
          { company: 'Test Company', title: 'Senior Developer', period: '2020-Present', description: 'Advanced development work' }
        ],
        education: [
          { institution: 'Test University', degree: 'Computer Science', period: '2016-2020', description: 'Studied CS with honors' }
        ],
        skills: [
          { name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }
        ],
        projects: [
          { name: 'Test Project', description: 'An improved test project', technologies: 'React, Node.js, TypeScript', period: '2020-2022' }
        ],
        certifications: [
          { name: 'AWS Certification', issuer: 'Amazon', date: '2021' },
          { name: 'Google Cloud', issuer: 'Google', date: '2022' }
        ],
        customSections: {
          'Publications': [
            { name: 'Test Publication', description: 'A peer-reviewed publication' }
          ]
        }
      }
    };
    
    // Stub the User.findById method
    userFindStub = sinon.stub(User, 'findById').returns({
      select: sinon.stub().resolves(testUser)
    });
    
    // Stub the Resume.findOne method
    resumeFindStub = sinon.stub(Resume, 'findOne').resolves(testResume);
    
    // Stub the geminiService.processPrompt method
    geminiStub = sinon.stub(geminiService, 'processPrompt').resolves(geminiResponse);
  });
  
  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });
  
  describe('generateResumeFromProfile', () => {
    it('should return 400 if job description is missing', async () => {
      req.body = {}; // No job description
      
      await aiController.generateResumeFromProfile(req, res);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ error: 'Job description is required' })).to.be.true;
    });
    
    it('should return 404 if user is not found', async () => {
      userFindStub.returns({
        select: sinon.stub().resolves(null)
      });
      
      await aiController.generateResumeFromProfile(req, res);
      
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ error: 'User not found' })).to.be.true;
    });
    
    it('should generate a resume with all sections from the user profile', async () => {
      await aiController.generateResumeFromProfile(req, res);
      
      // Verify response status and structure
      expect(res.status.calledWith(200)).to.be.true;
      
      // Get the response object passed to res.json
      const response = res.json.firstCall.args[0];
      
      // Verify that resumeData exists and has the correct structure
      expect(response).to.have.property('resumeData');
      expect(response.resumeData).to.have.property('summary');
      expect(response.resumeData).to.have.property('sections');
      
      // Verify all sections exist
      const sections = response.resumeData.sections;
      const expectedSections = ['experience', 'education', 'skills', 'projects', 'certifications', 'customSections'];
      
      expectedSections.forEach(section => {
        expect(sections).to.have.property(section);
        
        // For array sections, verify they are arrays
        if (section !== 'customSections') {
          expect(sections[section]).to.be.an('array');
        }
      });
      
      // Verify customSections object
      expect(sections.customSections).to.be.an('object');
      expect(sections.customSections).to.have.property('Publications');
      expect(sections.customSections.Publications).to.be.an('array');
    });
    
    it('should handle Gemini API errors gracefully', async () => {
      // Make Gemini service throw an error
      const testError = new Error('Test Gemini API error');
      geminiStub.rejects(testError);
      
      await aiController.generateResumeFromProfile(req, res);
      
      // Verify error response
      expect(res.status.calledWith(500)).to.be.true;
      
      const errorResponse = res.json.firstCall.args[0];
      expect(errorResponse).to.have.property('error');
      expect(errorResponse.error).to.include('AI service error');
      
      // Verify the error response still includes the expected resumeData structure
      expect(errorResponse).to.have.property('resumeData');
      expect(errorResponse.resumeData).to.have.property('sections');
      
      // Check that all sections exist in the error response
      const errorSections = errorResponse.resumeData.sections;
      ['experience', 'education', 'skills', 'projects', 'certifications', 'customSections'].forEach(section => {
        expect(errorSections).to.have.property(section);
      });
    });
    
    it('should handle empty resume (no sections) correctly', async () => {
      // Set resume to null to test the default sections creation
      resumeFindStub.resolves(null);
      
      await aiController.generateResumeFromProfile(req, res);
      
      // Verify response
      expect(res.status.calledWith(200)).to.be.true;
      
      const response = res.json.firstCall.args[0];
      expect(response).to.have.property('resumeData');
      expect(response.resumeData).to.have.property('sections');
      
      // Check that all sections exist even with no resume
      const sections = response.resumeData.sections;
      ['experience', 'education', 'skills', 'projects', 'certifications', 'customSections'].forEach(section => {
        expect(sections).to.have.property(section);
      });
    });
  });
}); 