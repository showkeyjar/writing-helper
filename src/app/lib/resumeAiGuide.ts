import { ResumeData, JobDescription, PersonalInfo } from './resumeTypes';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  questionType?: QuestionType;
}

export type QuestionType = 
  | 'greeting'
  | 'target_job'
  | 'personal_info'
  | 'work_experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'final_review';

export interface GuideState {
  currentStage: QuestionType;
  collectedData: Partial<ResumeData>;
  jobDescription: Partial<JobDescription>;
  personalInfo: Partial<PersonalInfo>;
  isComplete: boolean;
}

export class ResumeAiGuide {
  private static readonly SYSTEM_PROMPT = `你是一位专业的HR专家和简历顾问，擅长通过对话收集候选人信息并生成高质量简历。

你的任务是：
1. 通过自然对话逐步收集用户的完整信息
2. 根据用户回答智能提出后续问题
3. 确保收集到的信息足够生成专业简历
4. 保持对话自然、友好且高效

对话流程：
1. 问候并了解目标岗位
2. 收集个人基本信息
3. 深入了解工作经历（重点询问具体成就和数据）
4. 教育背景
5. 技能和专长
6. 项目经历
7. 最终确认和优化建议

重要原则：
- 每次只问1-2个相关问题，不要一次性问太多
- 根据目标岗位调整问题重点
- 主动挖掘量化成就和具体数据
- 引导用户提供STAR格式的经历描述
- 保持专业但友好的语调`;

  private static readonly QUESTION_TEMPLATES = {
    greeting: [
      "你好！我是你的AI简历顾问。让我来帮你打造一份出色的简历吧！✨\n\n首先，请告诉我你想申请什么岗位？公司名称是什么？",
      "很高兴为你服务！🎯 为了为你量身定制简历，我需要了解一些信息。\n\n你目前在寻找什么类型的工作机会？"
    ],
    target_job: [
      "很好！{jobTitle}是个很有前景的岗位。\n\n能告诉我这个岗位的具体要求吗？比如需要哪些技能和经验？",
      "了解了，{company}的{jobTitle}岗位。\n\n这个职位主要负责什么工作？有什么特别的要求吗？"
    ],
    personal_info: [
      "现在让我们完善你的基本信息。\n\n你的全名是？联系方式（邮箱和电话）是什么？目前在哪个城市？",
      "请提供你的基本联系信息：姓名、邮箱、电话号码，以及你的LinkedIn或个人网站（如果有的话）。"
    ],
    work_experience: [
      "让我们详细聊聊你的工作经历。\n\n从最近的工作开始，你在哪家公司工作？担任什么职位？主要负责什么？",
      "工作经历是简历的重点。请告诉我你最近的工作：公司名称、职位、工作时间，以及你的主要职责。",
      "在{company}担任{position}期间，你取得了哪些具体成就？有什么数据可以量化你的贡献吗？",
      "这份工作中最让你自豪的项目或成就是什么？能详细描述一下背景、你的行动和最终结果吗？"
    ],
    education: [
      "接下来聊聊你的教育背景。\n\n你毕业于哪所学校？什么专业？什么时候毕业的？",
      "还有其他的教育经历吗？比如第二学位、重要的培训课程或认证？"
    ],
    skills: [
      "现在让我们梳理你的技能。\n\n针对{jobTitle}这个岗位，你有哪些相关的技术技能？熟练程度如何？",
      "除了技术技能，你还有哪些软技能？比如领导力、沟通能力、项目管理等？",
      "你最擅长使用哪些工具或软件？在实际工作中是如何应用的？"
    ],
    projects: [
      "有没有特别值得展示的项目经历？\n\n可以是工作项目、个人项目或开源贡献。",
      "这个项目的背景是什么？你在其中扮演了什么角色？使用了哪些技术？",
      "项目的最终效果如何？有什么具体的数据或成果可以展示吗？"
    ],
    achievements: [
      "还有什么其他的成就想要突出的吗？\n\n比如获奖经历、专业认证、发表的文章等？",
      "这些成就是如何取得的？对你的职业发展有什么帮助？"
    ],
    final_review: [
      "太棒了！我已经收集了很多有价值的信息。\n\n让我为你生成一份专业的简历。还有什么特别想强调的内容吗？"
    ]
  };

  public static generateQuestion(stage: QuestionType, context: Partial<GuideState>): string {
    const templates = this.QUESTION_TEMPLATES[stage];
    if (!templates || templates.length === 0) {
      return "请继续告诉我更多信息。";
    }

    // 随机选择一个模板
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // 替换模板中的变量
    return this.replaceTemplateVariables(template, context);
  }

  private static replaceTemplateVariables(template: string, context: Partial<GuideState>): string {
    let result = template;
    
    if (context.jobDescription?.jobTitle) {
      result = result.replace(/\{jobTitle\}/g, context.jobDescription.jobTitle);
    }
    
    if (context.jobDescription?.company) {
      result = result.replace(/\{company\}/g, context.jobDescription.company);
    }
    
    return result;
  }

  public static getNextStage(currentStage: QuestionType, userResponse: string, context: Partial<GuideState>): QuestionType {
    const stageFlow: Record<QuestionType, QuestionType> = {
      greeting: 'target_job',
      target_job: 'personal_info',
      personal_info: 'work_experience',
      work_experience: 'education',
      education: 'skills',
      skills: 'projects',
      projects: 'achievements',
      achievements: 'final_review',
      final_review: 'final_review'
    };

    // 特殊逻辑：如果在work_experience阶段，检查是否需要继续收集更多工作经历
    if (currentStage === 'work_experience') {
      const hasMoreWork = userResponse.includes('还有') || userResponse.includes('另外') || userResponse.includes('之前');
      if (hasMoreWork) {
        return 'work_experience'; // 继续收集工作经历
      }
    }

    return stageFlow[currentStage];
  }

  public static generateSmartFollowUp(userResponse: string, currentStage: QuestionType): string[] {
    const followUps: string[] = [];
    
    switch (currentStage) {
      case 'work_experience':
        if (!userResponse.includes('%') && !userResponse.match(/\d+/)) {
          followUps.push("能提供一些具体的数据吗？比如销售额增长、团队规模、项目预算等？");
        }
        if (!userResponse.includes('责任') && !userResponse.includes('负责')) {
          followUps.push("你在这个职位的主要职责是什么？");
        }
        break;
        
      case 'skills':
        if (userResponse.includes('熟练')) {
          followUps.push("能举个具体例子说明你是如何使用这个技能的吗？");
        }
        break;
        
      case 'projects':
        if (!userResponse.includes('技术') && !userResponse.includes('工具')) {
          followUps.push("这个项目使用了哪些技术栈或工具？");
        }
        if (!userResponse.includes('结果') && !userResponse.includes('效果')) {
          followUps.push("项目完成后带来了什么具体的效果或收益？");
        }
        break;
    }
    
    return followUps;
  }

  public static extractStructuredData(messages: ChatMessage[]): Partial<GuideState> {
    const result: Partial<GuideState> = {
      collectedData: {},
      jobDescription: {},
      personalInfo: {},
      isComplete: false
    };

    // 这里可以使用NLP或者规则引擎来提取结构化数据
    // 简化版本：基于关键词匹配
    
    const allUserMessages = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ');

    // 提取邮箱
    const emailMatch = allUserMessages.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      result.personalInfo!.email = emailMatch[0];
    }

    // 提取电话号码
    const phoneMatch = allUserMessages.match(/1[3-9]\d{9}|(\d{3}[-.]?\d{3}[-.]?\d{4})/);
    if (phoneMatch) {
      result.personalInfo!.phone = phoneMatch[0];
    }

    // 提取公司信息
    const companyKeywords = ['在', '公司', '工作', '就职'];
    for (const keyword of companyKeywords) {
      const regex = new RegExp(`${keyword}([^，。！？\\s]{2,10})`, 'g');
      const match = allUserMessages.match(regex);
      if (match) {
        // 简单提取，实际应该更智能
        break;
      }
    }

    return result;
  }

  public static async generateAIQuestion(
    messages: ChatMessage[],
    currentStage: QuestionType,
    llmConfig: {
      apiUrl: string;
      apiKey: string;
      model: string;
    }
  ): Promise<string> {
    const conversationHistory = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `${this.SYSTEM_PROMPT}

当前对话阶段：${currentStage}
对话历史：
${conversationHistory}

根据以上对话历史和当前阶段，生成下一个合适的问题。问题应该：
1. 自然且有针对性
2. 帮助收集简历所需的关键信息
3. 根据用户之前的回答智能调整
4. 保持对话的连贯性

请只返回问题内容，不要包含其他解释。`;

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUrl: llmConfig.apiUrl,
          headers: {
            'Content-Type': 'application/json',
            ...(llmConfig.apiKey ? { 'Authorization': `Bearer ${llmConfig.apiKey}` } : {})
          },
          body: {
            model: llmConfig.model,
            messages: [
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 200
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI问题生成失败');
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.generateQuestion(currentStage, {});
    } catch (error) {
      console.error('AI问题生成错误:', error);
      return this.generateQuestion(currentStage, {});
    }
  }
}