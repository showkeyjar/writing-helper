import { ResumeTemplate } from './resumeTypes';

// 预定义的简历模板
export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-blue',
    name: '现代商务',
    description: '简洁现代的设计，适合商务和管理岗位',
    category: 'modern',
    preview: '/templates/modern-blue.png',
    styles: {
      primaryColor: '#2563eb',
      fontFamily: 'Inter, sans-serif',
      layout: 'two-column',
      accentColor: '#f1f5f9'
    }
  },
  {
    id: 'classic-black',
    name: '经典黑白',
    description: '传统经典设计，适合传统行业和高级职位',
    category: 'classic',
    preview: '/templates/classic-black.png',
    styles: {
      primaryColor: '#1f2937',
      fontFamily: 'Georgia, serif',
      layout: 'single-column',
      accentColor: '#f9fafb'
    }
  },
  {
    id: 'creative-purple',
    name: '创意设计',
    description: '富有创意的设计，适合设计师和创意岗位',
    category: 'creative',
    preview: '/templates/creative-purple.png',
    styles: {
      primaryColor: '#7c3aed',
      fontFamily: 'Poppins, sans-serif',
      layout: 'two-column',
      accentColor: '#faf5ff'
    }
  },
  {
    id: 'minimal-gray',
    name: '极简主义',
    description: '极简清爽的设计，适合技术和研究岗位',
    category: 'minimal',
    preview: '/templates/minimal-gray.png',
    styles: {
      primaryColor: '#4b5563',
      fontFamily: 'Source Sans Pro, sans-serif',
      layout: 'single-column',
      accentColor: '#f8fafc'
    }
  },
  {
    id: 'tech-green',
    name: '科技风格',
    description: '现代科技风格，适合IT和技术岗位',
    category: 'technical',
    preview: '/templates/tech-green.png',
    styles: {
      primaryColor: '#059669',
      fontFamily: 'JetBrains Mono, monospace',
      layout: 'two-column',
      accentColor: '#ecfdf5'
    }
  }
];

// 根据行业和岗位推荐模板
export function getRecommendedTemplates(industry: string, jobLevel: string): ResumeTemplate[] {
  const industryMap: Record<string, string[]> = {
    'technology': ['tech-green', 'minimal-gray', 'modern-blue'],
    'finance': ['classic-black', 'modern-blue', 'minimal-gray'],
    'marketing': ['creative-purple', 'modern-blue', 'tech-green'],
    'design': ['creative-purple', 'minimal-gray', 'modern-blue'],
    'consulting': ['modern-blue', 'classic-black', 'minimal-gray'],
    'healthcare': ['classic-black', 'minimal-gray', 'modern-blue'],
    'education': ['classic-black', 'minimal-gray', 'creative-purple'],
    'default': ['modern-blue', 'classic-black', 'minimal-gray']
  };

  const levelMap: Record<string, string[]> = {
    'executive': ['classic-black', 'modern-blue'],
    'senior': ['modern-blue', 'classic-black', 'minimal-gray'],
    'mid': ['modern-blue', 'tech-green', 'creative-purple'],
    'entry': ['minimal-gray', 'modern-blue', 'tech-green']
  };

  const industryTemplates = industryMap[industry.toLowerCase()] || industryMap.default;
  const levelTemplates = levelMap[jobLevel.toLowerCase()] || levelMap.mid;

  // 取交集，如果没有交集则使用行业推荐
  const recommended = industryTemplates.filter(id => levelTemplates.includes(id));
  const templateIds = recommended.length > 0 ? recommended : industryTemplates;

  return resumeTemplates.filter(template => templateIds.includes(template.id));
}

// 模板样式生成器
export function generateTemplateStyles(template: ResumeTemplate): string {
  const { primaryColor, fontFamily, accentColor } = template.styles;
  
  return `
    .resume-template-${template.id} {
      font-family: ${fontFamily};
      color: #1f2937;
      line-height: 1.6;
      max-width: 8.5in;
      margin: 0 auto;
      background: white;
      min-height: 11in;
    }
    
    .resume-template-${template.id} .header {
      background: ${primaryColor};
      color: white;
      padding: 2rem;
      text-align: center;
    }
    
    .resume-template-${template.id} .header h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .resume-template-${template.id} .header .contact {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .resume-template-${template.id} .section {
      padding: 1.5rem 2rem;
      border-left: ${template.styles.layout === 'two-column' ? `4px solid ${accentColor}` : 'none'};
    }
    
    .resume-template-${template.id} .section h2 {
      color: ${primaryColor};
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
      border-bottom: 2px solid ${accentColor};
      padding-bottom: 0.5rem;
    }
    
    .resume-template-${template.id} .experience-item {
      margin-bottom: 1.5rem;
    }
    
    .resume-template-${template.id} .experience-item h3 {
      font-size: 1.2rem;
      font-weight: bold;
      color: ${primaryColor};
    }
    
    .resume-template-${template.id} .experience-item .company {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    
    .resume-template-${template.id} .experience-item .date {
      font-size: 0.9rem;
      color: #9ca3af;
      font-style: italic;
    }
    
    .resume-template-${template.id} .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .resume-template-${template.id} .skill-category {
      background: ${accentColor};
      padding: 1rem;
      border-radius: 0.5rem;
    }
    
    .resume-template-${template.id} .skill-category h4 {
      color: ${primaryColor};
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .resume-template-${template.id} .achievement {
      display: flex;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    
    .resume-template-${template.id} .achievement::before {
      content: "▸";
      color: ${primaryColor};
      font-weight: bold;
      margin-right: 0.5rem;
    }
    
    @media print {
      .resume-template-${template.id} {
        box-shadow: none;
        margin: 0;
        max-width: none;
      }
    }
    
    ${template.styles.layout === 'two-column' ? `
      .resume-template-${template.id} .content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
      }
      
      .resume-template-${template.id} .main-content {
        padding-right: 1rem;
      }
      
      .resume-template-${template.id} .sidebar {
        background: ${accentColor};
        padding: 1.5rem;
        border-radius: 0.5rem;
      }
    ` : ''}
  `;
}

// 获取模板默认配置
export function getTemplateDefaults(templateId: string) {
  const template = resumeTemplates.find(t => t.id === templateId);
  if (!template) return null;

  return {
    template,
    sectionOrder: [
      'personalInfo',
      'professionalSummary', 
      'workExperience',
      'skills',
      'education',
      'projects',
      'certifications'
    ],
    sectionVisibility: {
      personalInfo: true,
      professionalSummary: true,
      workExperience: true,
      skills: true,
      education: true,
      projects: true,
      certifications: true,
      languages: false,
      customSections: false
    }
  };
}