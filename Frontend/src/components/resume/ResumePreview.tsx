import { useState, useEffect } from "react";

interface ResumePreviewProps {
  formData: any;
  sectionOrder: string[];
}

export function ResumePreview({ formData, sectionOrder }: ResumePreviewProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const renderSection = (sectionType: string) => {
    switch (sectionType) {
      case 'summary':
        return formData.summary && (
          <div key="summary" className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Summary</h2>
            <p className="text-gray-700">{formData.summary}</p>
          </div>
        );
      case 'experience':
        return formData.experiences && formData.experiences.length > 0 && (
          <div key="experience" className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Experience</h2>
            {formData.experiences.map((exp: any) => (
              <div key={exp.id} className="mb-4">
                {exp.company && (
                  <div className="flex justify-between">
                    <h3 className="font-medium">{exp.company}</h3>
                    {exp.period && (
                      <div className="text-sm text-gray-500">
                        {exp.period}
                      </div>
                    )}
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
        );
      case 'education':
        return formData.education && formData.education.length > 0 && (
          <div key="education" className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Education</h2>
            {formData.education.map((edu: any) => (
              <div key={edu.id} className="mb-4">
                {edu.institution && (
                  <div className="flex justify-between">
                    <h3 className="font-medium">{edu.institution}</h3>
                    {edu.year && (
                      <div className="text-sm text-gray-500">
                        {edu.year}
                      </div>
                    )}
                  </div>
                )}
                {(edu.degree || edu.field) && (
                  <div className="text-gray-600">
                    {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                  </div>
                )}
                {edu.description && (
                  <p className="mt-1 text-sm text-gray-700">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        );
      case 'projects':
        return formData.projects && formData.projects.length > 0 && (
          <div key="projects" className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Projects</h2>
            {formData.projects.map((proj: any) => (
              <div key={proj.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{proj.name || "Project Name"}</h3>
                  {proj.period && (
                     <div className="text-sm text-gray-500 ml-2 flex-shrink-0">
                       {proj.period}
                     </div>
                   )}
                </div>
                {proj.role && (
                  <div className="text-gray-600 italic">{proj.role}</div>
                )}
                {proj.description && (
                  <p className="mt-1 text-sm text-gray-700">{proj.description}</p>
                )}
                {proj.url && (
                  <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mt-1">Project Link</a>
                )}
                {proj.github && (
                   <a href={proj.github} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block mt-1">GitHub Link</a>
                 )}
              </div>
            ))}
          </div>
        );
      case 'skills':
        return formData.skills && (
          <div key="skills" className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Skills</h2>
            <p className="text-gray-700">{formData.skills}</p>
          </div>
        );
      case 'languages':
        return formData.languages && (
          <div key="languages" className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Languages</h2>
            <p className="text-gray-700">{formData.languages}</p>
          </div>
        );
      case 'certifications':
        return formData.certificates && (
          <div key="certifications" className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">Certifications</h2>
            <p className="text-gray-700">{formData.certificates}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const validSectionOrder = sectionOrder.filter(type => {
      if (type === 'experience') return formData.experiences && formData.experiences.length > 0;
      if (type === 'certifications') return formData.certificates;
      return formData[type] && (!Array.isArray(formData[type]) || formData[type].length > 0);
  });

  return (
    <div className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 border-b pb-6">
        <h1 className="text-2xl font-bold">{formData.name || "Your Name"}</h1>
        <p className="text-lg text-gray-600">{formData.jobTitle || "Job Title"}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
          {formData.email && <div>{formData.email}</div>}
          {formData.phone && <div>{formData.phone}</div>}
          {formData.location && <div>{formData.location}</div>}
          {formData.linkedin && <div>{formData.linkedin}</div>}
          {formData.website && <div>{formData.website}</div>}
        </div>
      </div>

      {validSectionOrder.map(sectionType => renderSection(sectionType))}
    </div>
  );
}
