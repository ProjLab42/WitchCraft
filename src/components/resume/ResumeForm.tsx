
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Save, Trash, Plus } from "lucide-react";
import { ProgressSteps } from "@/components/resume/ProgressSteps";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Profile" },
  { id: 2, label: "Experience" },
  { id: 3, label: "Education" },
  { id: 4, label: "Additional" },
  { id: 5, label: "Done" },
];

export function ResumeForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    email: "",
    phone: "",
    linkedin: "",
    website: "",
    summary: "",
    experiences: [{ id: 1, company: "", position: "", startDate: "", endDate: "", description: "" }],
    education: [{ id: 1, school: "", degree: "", field: "", startDate: "", endDate: "" }],
    skills: "",
    languages: "",
    certificates: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExperienceChange = (id: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handleEducationChange = (id: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: prev.experiences.length + 1,
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (id: number) => {
    if (formData.experiences.length === 1) {
      toast.error("You need at least one experience entry");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: prev.education.length + 1,
          school: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const removeEducation = (id: number) => {
    if (formData.education.length === 1) {
      toast.error("You need at least one education entry");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Resume saved successfully");
    // Here we would typically save the data to a backend
  };

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <ProgressSteps steps={steps} currentStep={currentStep} />
      
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Personal Profile</h2>
              <p className="text-muted-foreground">
                Let employers know who you are
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="linkedin.com/in/johnsmith"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="johnsmith.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Brief summary of your professional background and key strengths"
                className="min-h-[120px]"
              />
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Work Experience</h2>
              <p className="text-muted-foreground">
                Add your relevant work experience
              </p>
            </div>
            
            {formData.experiences.map((experience, index) => (
              <div key={experience.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Experience {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExperience(experience.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`company-${experience.id}`}>Company</Label>
                    <Input
                      id={`company-${experience.id}`}
                      value={experience.company}
                      onChange={(e) => handleExperienceChange(experience.id, "company", e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`position-${experience.id}`}>Position</Label>
                    <Input
                      id={`position-${experience.id}`}
                      value={experience.position}
                      onChange={(e) => handleExperienceChange(experience.id, "position", e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                    <Input
                      id={`startDate-${experience.id}`}
                      value={experience.startDate}
                      onChange={(e) => handleExperienceChange(experience.id, "startDate", e.target.value)}
                      placeholder="MM/YYYY"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                    <Input
                      id={`endDate-${experience.id}`}
                      value={experience.endDate}
                      onChange={(e) => handleExperienceChange(experience.id, "endDate", e.target.value)}
                      placeholder="MM/YYYY or Present"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`description-${experience.id}`}>Description</Label>
                  <Textarea
                    id={`description-${experience.id}`}
                    value={experience.description}
                    onChange={(e) => handleExperienceChange(experience.id, "description", e.target.value)}
                    placeholder="Describe your responsibilities and achievements"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addExperience} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Another Experience
            </Button>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Education</h2>
              <p className="text-muted-foreground">
                Add your educational background
              </p>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={edu.id} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Education {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`school-${edu.id}`}>School/University</Label>
                  <Input
                    id={`school-${edu.id}`}
                    value={edu.school}
                    onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                    placeholder="School or university name"
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                    <Input
                      id={`degree-${edu.id}`}
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                      placeholder="e.g. Bachelor's"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                    <Input
                      id={`field-${edu.id}`}
                      value={edu.field}
                      onChange={(e) => handleEducationChange(edu.id, "field", e.target.value)}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`eduStartDate-${edu.id}`}>Start Date</Label>
                    <Input
                      id={`eduStartDate-${edu.id}`}
                      value={edu.startDate}
                      onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                      placeholder="MM/YYYY"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`eduEndDate-${edu.id}`}>End Date</Label>
                    <Input
                      id={`eduEndDate-${edu.id}`}
                      value={edu.endDate}
                      onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                      placeholder="MM/YYYY or Present"
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button type="button" variant="outline" onClick={addEducation} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Another Education
            </Button>
          </div>
        )}
        
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Additional Information</h2>
              <p className="text-muted-foreground">
                Add other relevant information to enhance your resume
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="List your relevant technical and soft skills"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <Textarea
                id="languages"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="List languages you speak and your proficiency level"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="certificates">Certifications</Label>
              <Textarea
                id="certificates"
                name="certificates"
                value={formData.certificates}
                onChange={handleInputChange}
                placeholder="List any relevant certifications you have obtained"
                className="min-h-[100px]"
              />
            </div>
          </div>
        )}
        
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">Ready to Finalize</h2>
              <p className="text-muted-foreground">
                Review your information and save your resume
              </p>
            </div>
            
            <div className="flex items-center justify-center py-12">
              <Button type="submit" size="lg" className="px-8">
                <Save className="mr-2 h-4 w-4" />
                Save Resume
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < steps.length && (
            <Button type="button" onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
