import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Github } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">About WitchCraft</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transforming the resume creation process with AI-powered tools to help you craft the perfect CV
            </p>
          </div>
        </section>

        {/* About the Tool */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg mb-4">
                  WitchCraft is a CV automation tool designed to make the resume creation process as seamless and effective as possible. 
                  Our mission is to help job seekers create professional, tailored resumes that stand out to employers and applicant tracking systems.
                </p>
                <p className="text-lg mb-6">
                  Built with modern technology and guided by best practices in resume design, WitchCraft offers a user-friendly interface 
                  that allows you to customize your resume to match your unique professional background and career goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link to="/templates">
                      <span>Get Started</span>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://github.com/ProjLab42/WitchCraft" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" /> View on GitHub
                    </a>
                  </Button>
                </div>
              </div>
              <div className="bg-muted rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>Drag-and-drop resume builder</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>Export in multiple formats (PDF, DOCX)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>Professional resume templates</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>Content management with sections for experience, education, skills, and more</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 bg-primary rounded-full p-1 text-primary-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span>User profiles to store and manage multiple resumes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-2 text-center">Our Team</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              WitchCraft is built by a team of passionate developers and designers dedicated to making job applications easier.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="bg-card rounded-lg p-6 text-center shadow-sm">
                <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                  <img
                    src="https://api.dicebear.com/7.x/personas/svg?seed=john"
                    alt="Nuh Al-Sharafi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-1">Nuh Al-Sharafi</h3>
                <p className="text-primary mb-3">Lead Developer</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Full-stack developer with expertise in React, TypeScript, and UI/UX design.
                  Founded WitchCraft to streamline resume creation for job seekers.
                </p>
                <div className="flex justify-center space-x-3">
                  <a href="https://www.linkedin.com/in/nuh-al-sharafi-9762ab222/" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://github.com/N-alsharafi/" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-card rounded-lg p-6 text-center shadow-sm">
                <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                  <img
                    src="https://api.dicebear.com/7.x/personas/svg?seed=sarah"
                    alt="Musab Ahmed Khan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-1">Musab Ahmed Khan</h3>
                <p className="text-primary mb-3">UI/UX Designer</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Designer with background in human-computer interaction. Passionate about creating 
                  intuitive interfaces that make complex tasks feel simple.
                </p>
                <div className="flex justify-center space-x-3">
                  <a href="https://www.linkedin.com/in/musab-ahmed-khan/" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://github.com/MAKhan22/" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-card rounded-lg p-6 text-center shadow-sm">
                <div className="w-24 h-24 mx-auto mb-4 overflow-hidden rounded-full">
                  <img
                    src="https://api.dicebear.com/7.x/personas/svg?seed=michael"
                    alt="Raamiz Khan Niazi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-xl mb-1">Raamiz Khan Niazi</h3>
                <p className="text-primary mb-3">Backend Developer</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Specialized in cloud infrastructure and API development. Experienced with Node.js,
                  databases, and scalable system design.
                </p>
                <div className="flex justify-center space-x-3">
                  <a href="https://www.linkedin.com/in/raamiz-khan-niazi-b77a43233/" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="https://github.com/Raamizkn" className="text-muted-foreground hover:text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Technology Stack</h2>
            
            {/* Frontend Stack */}
            <h3 className="text-2xl font-semibold mb-6 text-center">Frontend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 mx-auto md:max-w-3xl">
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#61DAFB]"><circle cx="12" cy="12" r="10"/><path d="M12 2a4.5 4.5 0 0 0 0 9 4.5 4.5 0 0 0 0-9z" fill="currentColor" opacity="0.3"/></svg>
                </div>
                <h3 className="font-medium">React</h3>
              </div>
              
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#3178C6]"><polygon points="12 2 2 7 12 12 22 7" fill="currentColor" opacity="0.3"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                </div>
                <h3 className="font-medium">TypeScript</h3>
              </div>
              
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#38B2AC]"><path d="M12 2 2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.3"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h3 className="font-medium">Tailwind CSS</h3>
              </div>
            </div>
            
            {/* Backend Stack */}
            <h3 className="text-2xl font-semibold mb-6 text-center">Backend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 md:max-w-3xl mx-auto">
              {/* Node.js */}
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#68A063]">
                    <path fill="currentColor" opacity="0.3" d="M12 21.8c-.6 0-1.2-.1-1.8-.4l-5.7-3.4c-.8-.5-1.3-1.5-1.3-2.4V8.4c0-1 .5-1.9 1.3-2.4l5.7-3.4c1.1-.7 2.5-.7 3.6 0l5.7 3.4c.8.5 1.3 1.5 1.3 2.4v7.2c0 1-.5 1.9-1.3 2.4l-5.7 3.4c-.6.3-1.2.4-1.8.4z"></path>
                    <path d="M6.2 6.9L12 3.2l5.8 3.7v7.4L12 17.8l-5.8-3.7z"></path>
                  </svg>
                </div>
                <h3 className="font-medium">Node.js</h3>
              </div>
              
              {/* Express.js */}
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#000000]">
                    <path fill="currentColor" opacity="0.3" d="M24 18.588a3.391 3.391 0 0 1-3.35 3.35h-17.3A3.391 3.391 0 0 1 0 18.588v-13.176A3.391 3.391 0 0 1 3.35 2.062h17.3A3.391 3.391 0 0 1 24 5.412v13.176z"></path>
                    <path d="M5 12h2m2 0h1m2 0h1m2 0h1m2 0h2m-9-3h2m2 0h4m-8 6h2m2 0h2"></path>
                  </svg>
                </div>
                <h3 className="font-medium">Express.js</h3>
              </div>

              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#F7DF1E]">
                    <rect width="20" height="20" x="2" y="2" fill="currentColor" opacity="0.3" rx="2" ry="2"></rect>
                    <path d="M16 16v-8h-8v8"></path>
                  </svg>
                </div>
                <h3 className="font-medium">JavaScript</h3>
              </div>
              
              {/* MongoDB */}
              <div className="text-center">
                <div className="bg-muted aspect-square rounded-lg flex items-center justify-center mb-3 max-w-[120px] mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-[#4DB33D]">
                    <path fill="currentColor" opacity="0.3" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                    <path d="M12 4v16M9 8l6-3M9 16l6 3"></path>
                  </svg>
                </div>
                <h3 className="font-medium">MongoDB</h3>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to craft your perfect resume?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have created professional resumes with WitchCraft.
            </p>
            <Button size="lg" className="px-8" asChild>
              <Link to="/">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
