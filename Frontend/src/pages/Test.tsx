import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import ResumeParserTest from '@/components/resume-parser/ResumeParserTest';

const TestPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-12 md:py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Test Page</h1>
            <p className="text-muted-foreground">
              This page contains test components for development and debugging
            </p>
          </div>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">Resume Parser Test</h2>
              <ResumeParserTest />
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TestPage; 