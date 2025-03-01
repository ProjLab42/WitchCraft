
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { FileText, Upload, ArrowRight, CheckCircle } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 px-6 py-20 md:py-32">
          <div className="container flex flex-col items-center text-center">
            <div className="animate-slide-in-top inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <span>Building the perfect resume just got easier</span>
            </div>
            
            <h1 className="animate-fade-in mb-6 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Create stunning resumes that get you <span className="text-primary">noticed</span>
            </h1>
            
            <p className="animate-fade-in mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Design professional, ATS-friendly resumes in minutes with our intuitive builder. 
              Stand out from the competition and land your dream job.
            </p>
            
            <div className="animate-fade-in flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/create">
                  <FileText className="h-5 w-5" />
                  <span>Build Your Resume</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/upload">
                  <Upload className="h-5 w-5" />
                  <span>Upload Existing Resume</span>
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="absolute -bottom-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"></div>
        </section>
        
        {/* Features Section */}
        <section className="px-6 py-20 md:py-32">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why choose ResuMagic?</h2>
              <p className="text-lg text-muted-foreground">
                Our platform makes resume creation simple, efficient, and effective
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">ATS-Friendly Templates</h3>
                <p className="text-muted-foreground">
                  All our templates are designed to pass through Applicant Tracking Systems with ease.
                </p>
              </div>
              
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Professional Designs</h3>
                <p className="text-muted-foreground">
                  Choose from a variety of modern, professional templates tailored to your industry.
                </p>
              </div>
              
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Easy Customization</h3>
                <p className="text-muted-foreground">
                  Intuitive editor with drag-and-drop functionality makes resume building a breeze.
                </p>
              </div>
              
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Multiple Export Options</h3>
                <p className="text-muted-foreground">
                  Download your resume as PDF or DOCX, ready to send to employers.
                </p>
              </div>
              
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Real-time Preview</h3>
                <p className="text-muted-foreground">
                  See changes to your resume in real-time as you make them for perfect results.
                </p>
              </div>
              
              <div className="animate-fade-in group rounded-lg border bg-card p-6 transition-all hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Resume Parsing</h3>
                <p className="text-muted-foreground">
                  Upload your existing resume and our system will extract the information automatically.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-muted px-6 py-20 md:py-32">
          <div className="container text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to create your perfect resume?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Join thousands of job seekers who have successfully landed interviews with resumes created on our platform.
            </p>
            
            <Button asChild size="lg" className="gap-2">
              <Link to="/create">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
