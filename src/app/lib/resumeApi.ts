import { ResumeGenerationRequest, ResumeGenerationResponse, ResumeData, JobDescription } from './resumeTypes';

// 流式简历生成回调函数类型
export type ResumeStreamCallback = (
  section: string, 
  content: string, 
  isComplete: boolean, 
  error?: string
) => void;

// 生成简历内容的提示词模板
export function generateResumePrompt(request: ResumeGenerationRequest): string {
  const { personalInfo, jobDescription, workExperience, education, skills } = request;
  
  // 安全的数组处理
  const safeRequirements = Array.isArray(jobDescription.requirements) ? jobDescription.requirements : [];
  const safeResponsibilities = Array.isArray(jobDescription.responsibilities) ? jobDescription.responsibilities : [];
  const safePreferredSkills = Array.isArray(jobDescription.preferredSkills) ? jobDescription.preferredSkills : [];
  const safeWorkExperience = Array.isArray(workExperience) ? workExperience : [];
  const safeEducation = Array.isArray(education) ? education : [];
  const safeSkills = Array.isArray(skills) ? skills : [];
  
  return `你是一名专业的简历撰写专家。请基于以下信息，生成一份针对性强、专业的简历内容。

## 目标岗位信息
职位：${jobDescription.jobTitle || '目标职位'}
公司：${jobDescription.company || '目标公司'}
行业：${jobDescription.industry || '相关行业'}
经验要求：${jobDescription.experienceLevel || 'mid'}

### 岗位要求
${safeRequirements.map(req => `- ${req}`).join('\n') || '- 根据职位特点提供相关要求'}

### 主要职责
${safeResponsibilities.map(resp => `- ${resp}`).join('\n') || '- 根据职位特点提供相关职责'}

### 优先技能
${safePreferredSkills.map(skill => `- ${skill}`).join('\n') || '- 根据职位特点提供相关技能'}

## 个人信息
姓名：${personalInfo.fullName || '[待填写]'}
邮箱：${personalInfo.email || '[待填写]'}
电话：${personalInfo.phone || '[待填写]'}
地址：${personalInfo.location || '[待填写]'}

## 工作经历
${safeWorkExperience.map((exp, index) => `
${index + 1}. ${exp.company || '公司名称'} - ${exp.position || '职位名称'}
时间：${exp.startDate || '开始时间'} - ${exp.endDate || (exp.isCurrent ? '至今' : '结束时间')}
地点：${exp.location || '工作地点'}
描述：${exp.description || '请根据目标岗位优化工作描述'}
`).join('\n') || '1. 请根据对话信息补充工作经历'}

## 教育背景
${safeEducation.map((edu, index) => `
${index + 1}. ${edu.institution || '学校名称'} - ${edu.degree || '学位'} ${edu.field || '专业'}
时间：${edu.startDate || '开始时间'} - ${edu.endDate || '结束时间'}
GPA：${edu.gpa || '(如适用)'}
`).join('\n') || '1. 请根据对话信息补充教育背景'}

## 技能关键词
${safeSkills.join(', ') || '请根据对话信息补充技能'}

## 要求
请生成JSON格式的简历数据，严格按照以下结构返回：

{
  "personalInfo": {
    "fullName": "${personalInfo.fullName || '姓名'}",
    "email": "${personalInfo.email || 'email@example.com'}",
    "phone": "${personalInfo.phone || '手机号码'}",
    "location": "${personalInfo.location || '城市'}",
    "linkedin": "${personalInfo.linkedin || ''}",
    "github": "${personalInfo.github || ''}",
    "website": "${personalInfo.website || ''}"
  },
  "professionalSummary": "3-4句话的专业总结，突出与目标岗位的匹配度",
  "workExperience": [
    {
      "id": "work_1",
      "company": "公司名称",
      "position": "职位名称", 
      "startDate": "2022-01",
      "endDate": "2024-01",
      "isCurrent": false,
      "location": "城市",
      "description": "详细的工作描述，突出与目标岗位相关的经验",
      "achievements": [
        "量化的成就1：增长了30%的业绩",
        "量化的成就2：管理5人团队完成重要项目",
        "量化的成就3：优化流程提升20%效率"
      ],
      "technologies": ["相关技术1", "相关技术2", "相关技能3"]
    }
  ],
  "education": [
    {
      "id": "edu_1", 
      "institution": "学校名称",
      "degree": "学位",
      "field": "专业",
      "startDate": "2018-09",
      "endDate": "2022-06",
      "gpa": "GPA成绩(如适用)",
      "honors": ["相关荣誉1", "相关荣誉2"]
    }
  ],
  "skills": [
    {
      "id": "skill_1",
      "category": "技术技能",
      "name": "Python",
      "level": "advanced"
    },
    {
      "id": "skill_2", 
      "category": "专业技能",
      "name": "项目管理",
      "level": "intermediate"
    }
  ],
  "projects": [
    {
      "id": "project_1",
      "name": "项目名称",
      "description": "项目简介和你的贡献",
      "technologies": ["技术栈1", "技术栈2"],
      "startDate": "2023-01",
      "endDate": "2023-06", 
      "highlights": [
        "项目亮点1",
        "项目成果2"
      ],
      "url": ""
    }
  ],
  "certifications": []
}

请确保内容：
- 针对${jobDescription.jobTitle || '目标职位'}岗位高度定制
- 使用${jobDescription.industry || '相关行业'}行业相关关键词
- 量化成就和结果（用具体数字）
- 突出匹配的技能和经验
- 工作描述要详细具体，不要空泛
- 技能按类别合理分组
- 语言专业简洁，突出价值

重要：只返回JSON格式数据，不要添加任何额外的解释或markdown标记。`;
}

// 流式生成简历内容
export async function generateResumeStream(
  request: ResumeGenerationRequest,
  onUpdate: ResumeStreamCallback
): Promise<void> {
  try {
    const promptTemplate = generateResumePrompt(request);
    
    // 准备API请求
    const isGrokApi = request.llmApiUrl.includes('grok') || request.llmApiUrl.includes('xai');
    const isOllamaApi = request.llmApiUrl.includes('ollama') || request.llmApiUrl.includes('11434');
    const isDeepSeekApi = request.llmApiUrl.includes('deepseek');
    
    let requestBody: Record<string, unknown>;
    let isOllama = false;
    
    if (isOllamaApi) {
      requestBody = {
        model: request.model || 'llama2',
        prompt: promptTemplate,
        stream: true,
        format: 'json' // 请求JSON格式输出
      };
      isOllama = true;
    } else if (isGrokApi) {
      requestBody = {
        messages: [
          {
            role: 'system',
            content: '你是一名专业的简历撰写专家，请根据用户提供的信息生成高质量的简历内容。'
          },
          {
            role: 'user', 
            content: promptTemplate
          }
        ],
        model: 'grok-3-latest',
        temperature: 0.3, // 较低温度确保专业性
        stream: true
      };
    } else if (isDeepSeekApi) {
      requestBody = {
        model: request.model || 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一名专业的简历撰写专家，擅长根据岗位要求定制简历内容。'
          },
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        temperature: 0.3,
        stream: true
      };
    } else {
      // OpenAI
      requestBody = {
        model: request.model || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一名专业的简历撰写专家，请根据岗位要求生成针对性强的简历内容。'
          },
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        temperature: 0.3,
        stream: true
      };
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (!isOllamaApi && request.llmApiKey) {
      headers['Authorization'] = `Bearer ${request.llmApiKey}`;
    }

    console.log('开始流式简历生成请求到:', request.llmApiUrl);
    
    // 使用流式代理
    const response = await fetch('/api/stream-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUrl: request.llmApiUrl,
        headers,
        body: requestBody,
        isOllama
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: `流式请求失败: ${response.status}` } }));
      throw new Error(errorData.error?.message || `流式请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取流式响应');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          const dataStr = trimmedLine.slice(6);
          if (dataStr === '[DONE]') {
            onUpdate('complete', accumulatedContent, true);
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            
            if (data.error) {
              onUpdate('error', '', false, data.error.message);
              return;
            }

            if (data.choices && data.choices[0] && data.choices[0].delta) {
              const content = data.choices[0].delta.content || '';
              if (content) {
                accumulatedContent += content;
                onUpdate('content', content, false);
              }
              
              if (data.choices[0].finish_reason === 'stop') {
                onUpdate('complete', accumulatedContent, true);
                return;
              }
            }
          } catch (parseError) {
            console.warn('解析流式数据失败:', parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('流式简历生成错误:', error);
    onUpdate('error', '', false, error instanceof Error ? error.message : '未知错误');
  }
}

// 传统方式生成简历（非流式）
export async function generateResume(request: ResumeGenerationRequest): Promise<ResumeGenerationResponse> {
  try {
    const promptTemplate = generateResumePrompt(request);
    
    // 使用现有的generateContent API
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUrl: request.llmApiUrl,
        headers: {
          'Content-Type': 'application/json',
          ...(request.llmApiKey && !request.llmApiUrl.includes('ollama') ? {
            'Authorization': `Bearer ${request.llmApiKey}`
          } : {})
        },
        body: {
          model: request.model,
          messages: [
            {
              role: 'system',
              content: '你是一名专业的简历撰写专家。'
            },
            {
              role: 'user',
              content: promptTemplate
            }
          ],
          temperature: 0.3
        },
        isOllama: request.llmApiUrl.includes('ollama')
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    let content = '';
    if (data.choices && data.choices[0] && data.choices[0].message) {
      content = data.choices[0].message.content;
    } else if (data.content) {
      content = data.content;
    } else {
      throw new Error('无法从API响应中提取内容');
    }

    // 尝试解析JSON响应
    let resumeData: ResumeData;
    try {
      resumeData = JSON.parse(content);
    } catch {
      // 如果不是JSON格式，创建基础结构
      resumeData = {
        personalInfo: request.personalInfo as any,
        professionalSummary: content.substring(0, 500), // 截取前500字符作为总结
        workExperience: request.workExperience as any,
        education: request.education as any,
        skills: request.skills.map(skill => ({
          id: Math.random().toString(36).substr(2, 9),
          category: '专业技能',
          name: skill,
          level: 'intermediate' as const
        })),
        projects: [],
        certifications: []
      };
    }

    return {
      resume: resumeData,
      suggestions: [
        '添加更多量化的成就数据',
        '突出与目标岗位相关的技能',
        '优化关键词以通过ATS筛选'
      ],
      optimizationTips: [
        '使用行业专业术语',
        '突出leadership经验',
        '展示学习能力和适应性'
      ]
    };
  } catch (error) {
    console.error('简历生成错误:', error);
    return {
      resume: {} as ResumeData,
      suggestions: [],
      optimizationTips: [],
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}