// 简历生成器相关类型定义

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string; // 空值表示当前工作
  isCurrent: boolean;
  location: string;
  description: string;
  achievements: string[];
  technologies?: string[]; // 技术岗位使用
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string[];
  relevantCourses?: string[];
}

export interface Skill {
  id: string;
  category: string; // "技术技能", "语言技能", "软技能"等
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  highlights: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages?: { name: string; proficiency: string }[];
  customSections?: { title: string; content: string }[];
}

export interface JobDescription {
  jobTitle: string;
  company: string;
  industry: string;
  requirements: string[];
  responsibilities: string[];
  preferredSkills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'technical';
  preview: string; // 预览图URL
  styles: {
    primaryColor: string;
    fontFamily: string;
    layout: 'single-column' | 'two-column';
    accentColor?: string;
  };
}

export interface ResumeGenerationRequest {
  personalInfo: Partial<PersonalInfo>;
  jobDescription: JobDescription;
  workExperience: Partial<WorkExperience>[];
  education: Partial<Education>[];
  skills: string[]; // 简化输入，AI会扩展
  template: ResumeTemplate;
  llmApiUrl: string;
  llmApiKey: string;
  model: string;
  customPrompt?: string;
}

export interface ResumeGenerationResponse {
  resume: ResumeData;
  suggestions: string[];
  optimizationTips: string[];
  error?: string;
}

// 简历生成的提示词模板
export interface ResumePromptTemplate {
  industry: string;
  experienceLevel: string;
  focusAreas: string[];
  toneStyle: 'professional' | 'creative' | 'technical' | 'executive';
}