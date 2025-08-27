import { ResumeData, ResumeTemplate } from './resumeTypes';
import { generateTemplateStyles } from './resumeTemplates';

export interface PdfExportOptions {
  format?: 'a4' | 'letter';
  orientation?: 'portrait' | 'landscape';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export class ResumePdfExporter {
  private static generateHtmlContent(resumeData: ResumeData, template: ResumeTemplate): string {
    const { personalInfo, professionalSummary, workExperience, education, skills, projects, certifications } = resumeData;
    
    // 按类别分组技能
    const groupedSkills = skills?.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skills>) || {};

    const templateStyles = generateTemplateStyles(template);

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo?.fullName || '简历'} - 简历</title>
  <style>
    ${templateStyles}
    
    /* 打印专用样式 */
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      * {
        box-shadow: none !important;
      }
      
      .resume-template-${template.id} {
        box-shadow: none;
        margin: 0;
        max-width: none;
        min-height: auto;
        page-break-inside: avoid;
      }
      
      .section {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .experience-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    
    /* PDF导出样式优化 */
    body {
      font-family: ${template.styles.fontFamily};
      color: #1f2937;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .flex {
      display: flex;
    }
    
    .flex-wrap {
      flex-wrap: wrap;
    }
    
    .justify-center {
      justify-content: center;
    }
    
    .justify-between {
      justify-content: space-between;
    }
    
    .items-center {
      align-items: center;
    }
    
    .items-start {
      align-items: flex-start;
    }
    
    .gap-4 {
      gap: 1rem;
    }
    
    .gap-2 {
      gap: 0.5rem;
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
    
    .text-xs {
      font-size: 0.75rem;
    }
    
    .text-gray-700 {
      color: #374151;
    }
    
    .text-gray-600 {
      color: #4b5563;
    }
    
    .text-gray-500 {
      color: #6b7280;
    }
    
    .text-blue-600 {
      color: #2563eb;
    }
    
    .text-right {
      text-align: right;
    }
    
    .font-semibold {
      font-weight: 600;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .font-bold {
      font-weight: bold;
    }
    
    .leading-relaxed {
      line-height: 1.625;
    }
    
    .mb-2 {
      margin-bottom: 0.5rem;
    }
    
    .mb-3 {
      margin-bottom: 0.75rem;
    }
    
    .mb-4 {
      margin-bottom: 1rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .px-2 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .py-1 {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
    
    .rounded-full {
      border-radius: 9999px;
    }
    
    .w-2 {
      width: 0.5rem;
    }
    
    .h-2 {
      height: 0.5rem;
    }
    
    .w-4 {
      width: 1rem;
    }
    
    .h-4 {
      height: 1rem;
    }
    
    .mr-1 {
      margin-right: 0.25rem;
    }
    
    .space-y-1 > * + * {
      margin-top: 0.25rem;
    }
    
    .space-y-4 > * + * {
      margin-top: 1rem;
    }
    
    .bg-current {
      background-color: currentColor;
    }
    
    .bg-gray-300 {
      background-color: #d1d5db;
    }
  </style>
</head>
<body>
  <div class="resume-template-${template.id}">
    <!-- 头部 - 个人信息 -->
    <div class="header">
      <h1>${personalInfo?.fullName || '姓名'}</h1>
      <div class="contact">
        <div class="flex flex-wrap justify-center gap-4 text-sm">
          ${personalInfo?.email ? `
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              ${personalInfo.email}
            </span>
          ` : ''}
          ${personalInfo?.phone ? `
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              ${personalInfo.phone}
            </span>
          ` : ''}
          ${personalInfo?.location ? `
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              ${personalInfo.location}
            </span>
          ` : ''}
        </div>
        <div class="flex flex-wrap justify-center gap-4 mt-2 text-sm">
          ${personalInfo?.linkedin ? `<span>LinkedIn: ${personalInfo.linkedin}</span>` : ''}
          ${personalInfo?.github ? `<span>GitHub: ${personalInfo.github}</span>` : ''}
          ${personalInfo?.website ? `<span>网站: ${personalInfo.website}</span>` : ''}
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="${template.styles.layout === 'two-column' ? 'content' : ''}">
      <div class="${template.styles.layout === 'two-column' ? 'main-content' : ''}">
        
        <!-- 专业总结 -->
        ${professionalSummary ? `
          <div class="section">
            <h2>专业总结</h2>
            <p class="text-gray-700 leading-relaxed">${professionalSummary}</p>
          </div>
        ` : ''}

        <!-- 工作经历 -->
        ${workExperience && workExperience.length > 0 ? `
          <div class="section">
            <h2>工作经历</h2>
            ${workExperience.map((exp, index) => `
              <div class="experience-item">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h3>${exp.position}</h3>
                    <div class="company">${exp.company} • ${exp.location}</div>
                  </div>
                  <div class="date text-right">
                    ${exp.startDate} - ${exp.isCurrent ? '至今' : exp.endDate}
                  </div>
                </div>
                
                ${exp.description ? `<p class="text-gray-700 mb-2">${exp.description}</p>` : ''}
                
                ${exp.achievements && exp.achievements.length > 0 ? `
                  <div class="achievements">
                    ${exp.achievements.map(achievement => `
                      <div class="achievement text-gray-700">${achievement}</div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${exp.technologies && exp.technologies.length > 0 ? `
                  <div class="mt-2">
                    <div class="flex flex-wrap gap-2">
                      ${exp.technologies.map(tech => `
                        <span 
                          class="px-2 py-1 text-xs rounded-full"
                          style="background-color: ${template.styles.accentColor}; color: ${template.styles.primaryColor};"
                        >
                          ${tech}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 项目经历 -->
        ${projects && projects.length > 0 ? `
          <div class="section">
            <h2>项目经历</h2>
            ${projects.map(project => `
              <div class="experience-item">
                <div class="flex justify-between items-start mb-2">
                  <h3>${project.name}</h3>
                  <div class="date">
                    ${project.startDate} - ${project.endDate || '至今'}
                  </div>
                </div>
                
                <p class="text-gray-700 mb-2">${project.description}</p>
                
                ${project.highlights && project.highlights.length > 0 ? `
                  <div class="achievements mb-2">
                    ${project.highlights.map(highlight => `
                      <div class="achievement text-gray-700">${highlight}</div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${project.technologies && project.technologies.length > 0 ? `
                  <div class="flex flex-wrap gap-2">
                    ${project.technologies.map(tech => `
                      <span 
                        class="px-2 py-1 text-xs rounded-full"
                        style="background-color: ${template.styles.accentColor}; color: ${template.styles.primaryColor};"
                      >
                        ${tech}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${project.url ? `
                  <div class="mt-2 text-sm text-blue-600">
                    项目链接: ${project.url}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <!-- 侧边栏（双栏布局）或继续主要内容（单栏布局） -->
      <div class="${template.styles.layout === 'two-column' ? 'sidebar' : ''}">
        
        <!-- 技能 -->
        ${Object.keys(groupedSkills).length > 0 ? `
          <div class="section">
            <h2>专业技能</h2>
            <div class="${template.styles.layout === 'two-column' ? 'space-y-4' : 'skills-grid'}">
              ${Object.entries(groupedSkills).map(([category, categorySkills]) => `
                <div class="${template.styles.layout === 'two-column' ? '' : 'skill-category'}">
                  <h4 class="font-semibold mb-2">${category}</h4>
                  <div class="space-y-1">
                    ${categorySkills.map(skill => `
                      <div class="flex justify-between items-center text-sm">
                        <span>${skill.name}</span>
                        <div class="flex">
                          ${[...Array(5)].map((_, i) => `
                            <div
                              class="w-2 h-2 rounded-full mr-1 ${
                                i < (['beginner', 'intermediate', 'advanced', 'expert'].indexOf(skill.level) + 1) * 1.25
                                  ? 'bg-current'
                                  : 'bg-gray-300'
                              }"
                              style="color: ${template.styles.primaryColor};"
                            ></div>
                          `).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 教育背景 -->
        ${education && education.length > 0 ? `
          <div class="section">
            <h2>教育背景</h2>
            ${education.map(edu => `
              <div class="mb-4">
                <h3 class="font-semibold">${edu.degree} ${edu.field}</h3>
                <div class="text-gray-600">${edu.institution}</div>
                <div class="text-sm text-gray-500">${edu.startDate} - ${edu.endDate}</div>
                ${edu.gpa ? `<div class="text-sm">GPA: ${edu.gpa}</div>` : ''}
                ${edu.honors && edu.honors.length > 0 ? `
                  <div class="text-sm">
                    <span class="font-medium">荣誉: </span>
                    ${edu.honors.join(', ')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 证书 -->
        ${certifications && certifications.length > 0 ? `
          <div class="section">
            <h2>专业证书</h2>
            ${certifications.map(cert => `
              <div class="mb-3">
                <h4 class="font-semibold">${cert.name}</h4>
                <div class="text-gray-600 text-sm">${cert.issuer}</div>
                <div class="text-gray-500 text-sm">${cert.date}</div>
                ${cert.url ? `<div class="text-blue-600 text-sm">认证链接</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  public static async exportToPdf(
    resumeData: ResumeData, 
    template: ResumeTemplate, 
    options: PdfExportOptions = {}
  ): Promise<void> {
    const htmlContent = this.generateHtmlContent(resumeData, template);
    
    // 创建一个隐藏的iframe来生成PDF
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('无法访问iframe文档');
      }
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // 等待内容加载
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 使用浏览器的打印功能
      iframe.contentWindow?.print();
      
    } finally {
      // 清理iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }

  public static downloadAsHtml(
    resumeData: ResumeData, 
    template: ResumeTemplate, 
    filename?: string
  ): void {
    const htmlContent = this.generateHtmlContent(resumeData, template);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${resumeData.personalInfo?.fullName || 'resume'}_${template.name}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  public static async printResume(
    resumeData: ResumeData, 
    template: ResumeTemplate
  ): Promise<void> {
    const htmlContent = this.generateHtmlContent(resumeData, template);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('无法打开打印窗口，请检查浏览器弹窗设置');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // 等待内容加载
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    printWindow.print();
    printWindow.close();
  }
}