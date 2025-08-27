"use client";

import React from 'react';
import { ResumeData, ResumeTemplate } from '../lib/resumeTypes';
import { generateTemplateStyles } from '../lib/resumeTemplates';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: ResumeTemplate;
  className?: string;
}

export default function ResumePreview({ resumeData, template, className = "" }: ResumePreviewProps) {
  const { personalInfo, professionalSummary, workExperience, education, skills, projects, certifications } = resumeData;

  // 按类别分组技能
  const groupedSkills = skills?.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>) || {};

  return (
    <div className={`bg-white shadow-lg ${className}`}>
      {/* 动态样式注入 */}
      <style dangerouslySetInnerHTML={{ __html: generateTemplateStyles(template) }} />
      
      <div className={`resume-template-${template.id} print-area`}>
        {/* 头部 - 个人信息 */}
        <div className="header">
          <h1>{personalInfo?.fullName || '姓名'}</h1>
          <div className="contact">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {personalInfo?.email && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                  </svg>
                  {personalInfo.email}
                </span>
              )}
              {personalInfo?.phone && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo?.location && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  {personalInfo.location}
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm">
              {personalInfo?.linkedin && (
                <span>LinkedIn: {personalInfo.linkedin}</span>
              )}
              {personalInfo?.github && (
                <span>GitHub: {personalInfo.github}</span>
              )}
              {personalInfo?.website && (
                <span>网站: {personalInfo.website}</span>
              )}
            </div>
          </div>
        </div>

        {/* 主要内容区 */}
        <div className={template.styles.layout === 'two-column' ? 'content' : ''}>
          <div className={template.styles.layout === 'two-column' ? 'main-content' : ''}>
            
            {/* 专业总结 */}
            {professionalSummary && (
              <div className="section">
                <h2>专业总结</h2>
                <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
              </div>
            )}

            {/* 工作经历 */}
            {workExperience && workExperience.length > 0 && workExperience.some(exp => exp.company || exp.position) && (
              <div className="section">
                <h2>工作经历</h2>
                {workExperience.filter(exp => exp.company || exp.position).map((exp, index) => (
                  <div key={exp.id || index} className="experience-item">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3>{exp.position || '职位名称'}</h3>
                        <div className="company">{exp.company || '公司名称'}{exp.location && ` • ${exp.location}`}</div>
                      </div>
                      <div className="date text-right">
                        {exp.startDate || '开始时间'} - {exp.isCurrent ? '至今' : (exp.endDate || '结束时间')}
                      </div>
                    </div>
                    
                    {exp.description && (
                      <p className="text-gray-700 mb-2">{exp.description}</p>
                    )}
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="achievements">
                        {exp.achievements.map((achievement, idx) => (
                          <div key={idx} className="achievement text-gray-700">
                            {achievement}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 text-xs rounded-full"
                              style={{ 
                                backgroundColor: template.styles.accentColor,
                                color: template.styles.primaryColor
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 项目经历 */}
            {projects && projects.length > 0 && (
              <div className="section">
                <h2>项目经历</h2>
                {projects.map((project, index) => (
                  <div key={project.id || index} className="experience-item">
                    <div className="flex justify-between items-start mb-2">
                      <h3>{project.name}</h3>
                      <div className="date">
                        {project.startDate} - {project.endDate || '至今'}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{project.description}</p>
                    
                    {project.highlights && project.highlights.length > 0 && (
                      <div className="achievements mb-2">
                        {project.highlights.map((highlight, idx) => (
                          <div key={idx} className="achievement text-gray-700">
                            {highlight}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ 
                              backgroundColor: template.styles.accentColor,
                              color: template.styles.primaryColor
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {project.url && (
                      <div className="mt-2 text-sm text-blue-600">
                        项目链接: {project.url}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 侧边栏（双栏布局）或继续主要内容（单栏布局） */}
          <div className={template.styles.layout === 'two-column' ? 'sidebar' : ''}>
            
            {/* 技能 */}
            {Object.keys(groupedSkills).length > 0 && (
              <div className="section">
                <h2>专业技能</h2>
                <div className={template.styles.layout === 'two-column' ? 'space-y-4' : 'skills-grid'}>
                  {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <div key={category} className={template.styles.layout === 'two-column' ? '' : 'skill-category'}>
                      <h4 className="font-semibold mb-2">{category}</h4>
                      <div className="space-y-1">
                        {categorySkills.map((skill, idx) => (
                          <div key={skill.id || idx} className="flex justify-between items-center text-sm">
                            <span>{skill.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full mr-1 ${
                                    i < (['beginner', 'intermediate', 'advanced', 'expert'].indexOf(skill.level) + 1) * 1.25
                                      ? 'bg-current'
                                      : 'bg-gray-300'
                                  }`}
                                  style={{ color: template.styles.primaryColor }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 教育背景 */}
            {education && education.length > 0 && education.some(edu => edu.institution || edu.degree) && (
              <div className="section">
                <h2>教育背景</h2>
                {education.filter(edu => edu.institution || edu.degree).map((edu, index) => (
                  <div key={edu.id || index} className="mb-4">
                    <h3 className="font-semibold">{edu.degree || '学位'} {edu.field}</h3>
                    <div className="text-gray-600">{edu.institution || '学校名称'}</div>
                    <div className="text-sm text-gray-500">
                      {edu.startDate || '开始时间'} - {edu.endDate || '结束时间'}
                    </div>
                    {edu.gpa && (
                      <div className="text-sm">GPA: {edu.gpa}</div>
                    )}
                    {edu.honors && edu.honors.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">荣誉: </span>
                        {edu.honors.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 证书 */}
            {certifications && certifications.length > 0 && (
              <div className="section">
                <h2>专业证书</h2>
                {certifications.map((cert, index) => (
                  <div key={cert.id || index} className="mb-3">
                    <h4 className="font-semibold">{cert.name}</h4>
                    <div className="text-gray-600 text-sm">{cert.issuer}</div>
                    <div className="text-gray-500 text-sm">{cert.date}</div>
                    {cert.url && (
                      <div className="text-blue-600 text-sm">认证链接</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}