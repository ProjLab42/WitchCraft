
import { useState, useEffect } from "react";

interface ResumePreviewProps {
  formData: any;
}

export function ResumePreview({ formData }: ResumePreviewProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="h-full overflow-auto rounded-lg border bg-white p-8 shadow-sm">
      <div className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
        <div className="mb-6 border-b pb-6">
          <h1 className="text-2xl font-bold">{formData.name || "Your Name"}</h1>
          <p className="text-lg text-gray-600">{formData.jobTitle || "Job Title"}</p>
          
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
            {formData.email && (
              <div>{formData.email}</div>
            )}
            {formData.phone && (
              <div>{formData.phone}</div>
            )}
            {formData.linkedin && (
              <div>{formData.linkedin}</div>
            )}
            {formData.website && (
              <div>{formData.website}</div>
            )}
          </div>
        </div>
        
        {formData.summary && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Summary</h2>
            <p className="text-gray-700">{formData.summary}</p>
          </div>
        )}
        
        {formData.experiences && formData.experiences.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Experience</h2>
            
            {formData.experiences.map((exp: any) => (
              <div key={exp.id} className="mb-4">
                {exp.company && (
                  <div className="flex justify-between">
                    <h3 className="font-medium">{exp.company}</h3>
                    <div className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate}
                    </div>
                  </div>
                )}
                
                {exp.position && (
                  <div className="text-gray-600">{exp.position}</div>
                )}
                
                {exp.description && (
                  <p className="mt-1 text-sm text-gray-700">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {formData.education && formData.education.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Education</h2>
            
            {formData.education.map((edu: any) => (
              <div key={edu.id} className="mb-4">
                {edu.school && (
                  <div className="flex justify-between">
                    <h3 className="font-medium">{edu.school}</h3>
                    <div className="text-sm text-gray-500">
                      {edu.startDate} - {edu.endDate}
                    </div>
                  </div>
                )}
                
                {(edu.degree || edu.field) && (
                  <div className="text-gray-600">
                    {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {formData.skills && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Skills</h2>
            <p className="text-gray-700">{formData.skills}</p>
          </div>
        )}
        
        {formData.languages && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Languages</h2>
            <p className="text-gray-700">{formData.languages}</p>
          </div>
        )}
        
        {formData.certificates && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Certifications</h2>
            <p className="text-gray-700">{formData.certificates}</p>
          </div>
        )}
      </div>
    </div>
  );
}
