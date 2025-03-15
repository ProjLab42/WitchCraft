import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
          
          <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: November 1, 2023</p>
        </div>
        
        <div className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using WitchCraft's resume creation services ("Service"), you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Our Service and its original content, features, and functionality are and will remain the exclusive property of WitchCraft and its licensors. 
              The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            </li>
            <li>
              The resumes you create using our Service are your property. However, you grant us a license to store and process your data to provide the Service.
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You are responsible for safeguarding the password you use to access the Service and for any activities or actions under your password. We encourage you to 
              use "strong" passwords (passwords that use a combination of upper and lowercase letters, numbers, and symbols) with your account.
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">4. User Content</h2>
          <p>
            Our Service allows you to post, link, store, share, and otherwise make available certain information, text, graphics, or other material ("Content"). 
            You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
          </p>
          <p className="font-semibold mt-4">
            By posting Content on or through the Service, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The Content is yours and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms.</li>
            <li>The posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights, or any other rights of any person or entity.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">5. Prohibited Uses</h2>
          <p className="font-semibold">
            You agree not to use the Service:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate WitchCraft, a WitchCraft employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which may harm WitchCraft or users of the Service.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">6. Termination</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </li>
            <li>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service, or notify us that you would like your account deleted.
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            In no event shall WitchCraft, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your access to or use of or inability to access or use the Service;</li>
            <li>Any conduct or content of any third party on the Service;</li>
            <li>Any content obtained from the Service; and</li>
            <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">8. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, 
            whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
          </p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </li>
            <li>
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or 
              unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">10. Changes to Terms</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to 
              any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </li>
            <li>
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">11. Open Source License</h2>
          <p>
            WitchCraft is an open-source project licensed under the MIT License. This means:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are free to use, modify, distribute, and create derivative works based on this software.</li>
            <li>If you create modified versions or derivatives of WitchCraft, you do so at your own risk.</li>
            <li>Any legal issues arising from your modifications or derivative works will not hold the original WitchCraft creators or contributors liable.</li>
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

export default Terms;
