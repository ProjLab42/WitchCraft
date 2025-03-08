import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto py-12 px-4">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: November 1, 2023</p>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Introduction</h2>
          <p>
            At WitchCraft, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
            you use our resume creation service.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          
          <h3 className="text-xl font-bold mt-6 mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact information (name, email address, phone number)</li>
            <li>Professional information (work history, education, skills, certifications)</li>
            <li>Account credentials (username, password)</li>
            <li>Payment information (when you subscribe to premium features)</li>
          </ul>
          
          <h3 className="text-xl font-bold mt-6 mb-3">Usage Information</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>How you interact with our service</li>
            <li>The features you use</li>
            <li>The resumes you create and edit</li>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Process your resume creation requests</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Information Sharing and Disclosure</h2>
          <p className="font-semibold">We may share your information with:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Service providers who perform services on our behalf</li>
            <li>Business partners with your consent</li>
            <li>Legal authorities when required by law</li>
            <li>Other parties in connection with a corporate transaction</li>
          </ul>
          <p>We do not sell your personal information to third parties.</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Data Security</h2>
          <p>
            We implement appropriate security measures to protect against unauthorized access, alteration, 
            disclosure, or destruction of your personal information. However, no method of transmission over 
            the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Your Data Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Restrict or object to our processing of your information</li>
            <li>Receive your information in a portable format</li>
            <li>Withdraw consent at any time</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to collect information about your browsing 
            activities and to remember your preferences. You can instruct your browser to refuse all cookies or 
            to indicate when a cookie is being sent.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 16. We do not knowingly collect 
            personal information from children. If you are a parent or guardian and believe your child has 
            provided us with personal information, please contact us.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to 
            review this Privacy Policy periodically for any changes.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Open Source Project</h2>
          <p>
            WitchCraft is an open-source project licensed under the MIT License. As such:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are free to use, modify, and distribute the software as per the license terms.</li>
            <li>Any modifications you make to the software are at your own risk.</li>
            <li>The original creators and contributors of WitchCraft cannot be held liable for any issues that arise from modified versions.</li>
            <li>You must include the original copyright notice and permission notice in all copies or substantial portions of the software.</li>
          </ul>
          
          <div className="mt-8 p-6 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-bold mb-4">MIT License</h3>
            <p className="mb-4">Copyright (c) 2025 ProjLab42</p>
            <p className="mb-4">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p className="mb-4">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p className="mb-4">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
              AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
              LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
              SOFTWARE.
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
          <p>
            Please don't contact us. We don't have a customer support team. 
          </p>
          <p>
            If you have an offer for a job, please contact us.
        </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
