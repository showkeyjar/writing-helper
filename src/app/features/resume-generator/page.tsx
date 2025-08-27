"use client";

import React, { useState } from 'react';
import { ResumeGenerationRequest, JobDescription, PersonalInfo, WorkExperience, Education, ResumeData } from '../../lib/resumeTypes';
import { resumeTemplates, getRecommendedTemplates } from '../../lib/resumeTemplates';
import { generateResumeStream, generateResume } from '../../lib/resumeApi';
import { ResumePdfExporter } from '../../lib/resumePdfExport';
import { GuideState } from '../../lib/resumeAiGuide';
import ResumePreview from '../../components/ResumePreview';
import ApiSettings, { ApiProvider } from '../../components/ApiSettings';
import AiGuideChat from '../../components/AiGuideChat';
import FeatureLayout from '../../components/FeatureLayout';

type GenerationMode = 'manual' | 'ai-guide';

export default function ResumeGeneratorPage() {
  // 基础状态
  const [generationMode, setGenerationMode] = useState<GenerationMode>('ai-guide');
  const [currentStep, setCurrentStep] = useState(1);
  const [useStreaming, setUseStreaming] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API设置
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openai');
  const [llmApiUrl, setLlmApiUrl] = useState('https://api.openai.com/v1/chat/completions');
  const [llmApiKey, setLlmApiKey] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [showApiSettings, setShowApiSettings] = useState(false);

  // 表单数据
  const [personalInfo, setPersonalInfo] = useState<Partial<PersonalInfo>>({
    fullName: '',
    email: '',
    phone: '',
    location: ''
  });

  const [jobDescription, setJobDescription] = useState<JobDescription>({
    jobTitle: '',
    company: '',
    industry: '',
    requirements: [],
    responsibilities: [],
    preferredSkills: [],
    experienceLevel: 'mid'
  });

  const [workExperience, setWorkExperience] = useState<Partial<WorkExperience>[]>([{
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    location: '',
    description: ''
  }]);

  const [education, setEducation] = useState<Partial<Education>[]>([{
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: ''
  }]);

  const [skills, setSkills] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState(resumeTemplates[0]);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  
  // 流式输出内容
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);

  // AI引导模式状态
  const [aiGuideCompleted, setAiGuideCompleted] = useState(false);
  const [aiCollectedData, setAiCollectedData] = useState<GuideState | null>(null);

  // 处理AI引导完成
  const handleAiGuideComplete = async (collectedData: GuideState) => {
    setAiGuideCompleted(true);
    setAiCollectedData(collectedData);
    
    // 自动进入生成流程
    if (llmApiKey || apiProvider === 'ollama') {
      await generateResumeFromAiData(collectedData);
    }
  };

  // 从AI收集的数据生成简历
  const generateResumeFromAiData = async (collectedData: GuideState) => {
    setIsGenerating(true);
    setError(null);
    setStreamingContent('');
    setIsStreamComplete(false);
    setGeneratedResume(null);

    const request: ResumeGenerationRequest = {
      personalInfo: collectedData.personalInfo || {},
      jobDescription: (collectedData.jobDescription || {
        jobTitle: '',
        company: '',
        industry: '',
        requirements: [],
        responsibilities: [],
        preferredSkills: [],
        experienceLevel: 'mid' as const
      }) as JobDescription,
      workExperience: collectedData.collectedData?.workExperience || [],
      education: collectedData.collectedData?.education || [],
      skills: collectedData.collectedData?.skills?.map(s => s.name) || [],
      template: selectedTemplate,
      llmApiUrl,
      llmApiKey,
      model
    };

    try {
      if (useStreaming) {
        let accumulatedContent = '';
        await generateResumeStream(request, (section, content, isComplete, errorMsg) => {
          if (errorMsg) {
            setError(errorMsg);
            setIsGenerating(false);
          } else if (isComplete) {
            setIsStreamComplete(true);
            setIsGenerating(false);
            try {
              let jsonContent = accumulatedContent;
              const jsonMatch = accumulatedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
              if (jsonMatch) {
                jsonContent = jsonMatch[1];
              }
              const firstBrace = jsonContent.indexOf('{');
              const lastBrace = jsonContent.lastIndexOf('}');
              if (firstBrace >= 0 && lastBrace >= firstBrace) {
                jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
              }
              const resumeData = JSON.parse(jsonContent);
              setGeneratedResume(resumeData);
            } catch (e) {
              console.warn('JSON解析失败，创建基础结构:', e);
              setGeneratedResume(createBasicResumeFromAiData(collectedData, accumulatedContent));
            }
          } else if (content) {
            accumulatedContent += content;
            setStreamingContent(accumulatedContent);
          }
        });
      } else {
        const response = await generateResume(request);
        if (response.error) {
          setError(response.error);
        } else {
          setGeneratedResume(response.resume);
        }
        setIsGenerating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  // 从AI收集的数据创建基础简历结构
  const createBasicResumeFromAiData = (collectedData: GuideState, content?: string): ResumeData => {
    return {
      personalInfo: collectedData.personalInfo as PersonalInfo,
      professionalSummary: content ? content.substring(0, 300) + '...' : '基于我们的对话生成的专业总结...',
      workExperience: collectedData.collectedData?.workExperience || [],
      education: collectedData.collectedData?.education || [],
      skills: collectedData.collectedData?.skills || [],
      projects: collectedData.collectedData?.projects || [],
      certifications: collectedData.collectedData?.certifications || []
    };
  };

  // 添加工作经历
  const addWorkExperience = () => {
    setWorkExperience([...workExperience, {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      location: '',
      description: ''
    }]);
  };

  // 添加教育经历
  const addEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: ''
    }]);
  };

  // 解析岗位描述
  const parseJobDescription = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    const requirements: string[] = [];
    const responsibilities: string[] = [];
    const skills: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('要求') || trimmed.includes('需要') || trimmed.includes('必须')) {
        requirements.push(trimmed);
      } else if (trimmed.includes('职责') || trimmed.includes('负责')) {
        responsibilities.push(trimmed);
      } else if (trimmed.includes('技能') || trimmed.includes('熟练')) {
        skills.push(trimmed);
      }
    });

    setJobDescription(prev => ({
      ...prev,
      requirements: requirements.length > 0 ? requirements : [text],
      responsibilities: responsibilities.length > 0 ? responsibilities : [],
      preferredSkills: skills.length > 0 ? skills : []
    }));
  };

  // 手动模式生成简历
  const handleManualGenerate = async () => {
    if (!llmApiKey && apiProvider !== 'ollama') {
      setError('请设置API密钥');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStreamingContent('');
    setIsStreamComplete(false);
    setGeneratedResume(null);

    const request: ResumeGenerationRequest = {
      personalInfo,
      jobDescription,
      workExperience,
      education,
      skills: skills.split(/[,，、]/).map(s => s.trim()).filter(s => s),
      template: selectedTemplate,
      llmApiUrl,
      llmApiKey,
      model
    };

    try {
      if (useStreaming) {
        let accumulatedContent = '';
        await generateResumeStream(request, (section, content, isComplete, errorMsg) => {
          if (errorMsg) {
            setError(errorMsg);
            setIsGenerating(false);
          } else if (isComplete) {
            setIsStreamComplete(true);
            setIsGenerating(false);
            try {
              let jsonContent = accumulatedContent;
              const jsonMatch = accumulatedContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
              if (jsonMatch) {
                jsonContent = jsonMatch[1];
              }
              const firstBrace = jsonContent.indexOf('{');
              const lastBrace = jsonContent.lastIndexOf('}');
              if (firstBrace >= 0 && lastBrace >= firstBrace) {
                jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
              }
              const resumeData = JSON.parse(jsonContent);
              setGeneratedResume(resumeData);
            } catch (e) {
              console.warn('JSON解析失败，创建基础结构:', e);
              setGeneratedResume(createBasicResume(accumulatedContent));
            }
          } else if (content) {
            accumulatedContent += content;
            setStreamingContent(accumulatedContent);
          }
        });
      } else {
        const response = await generateResume(request);
        if (response.error) {
          setError(response.error);
        } else {
          setGeneratedResume(response.resume);
        }
        setIsGenerating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
      setIsGenerating(false);
    }
  };

  // 创建基础简历结构
  const createBasicResume = (content?: string): ResumeData => {
    return {
      personalInfo: personalInfo as PersonalInfo,
      professionalSummary: content ? content.substring(0, 300) + '...' : '专业总结将在这里显示...',
      workExperience: workExperience.map((exp, index) => ({
        id: `work-${index}`,
        company: exp.company || '公司名称',
        position: exp.position || '职位名称',
        startDate: exp.startDate || '开始时间',
        endDate: exp.endDate || '结束时间',
        isCurrent: exp.isCurrent || false,
        location: exp.location || '工作地点',
        description: exp.description || '工作描述将在这里显示...',
        achievements: [
          '主要成就1：具体量化结果',
          '主要成就2：项目贡献描述',
          '主要成就3：技能提升体现'
        ],
        technologies: []
      })) as WorkExperience[],
      education: education.map((edu, index) => ({
        id: `edu-${index}`,
        institution: edu.institution || '学校名称',
        degree: edu.degree || '学位',
        field: edu.field || '专业',
        startDate: edu.startDate || '开始时间',
        endDate: edu.endDate || '结束时间',
        gpa: edu.gpa || '',
        honors: []
      })) as Education[],
      skills: skills.split(/[,，、]/).map((skill, index) => ({
        id: `skill-${index}`,
        category: '专业技能',
        name: skill.trim(),
        level: 'intermediate' as const
      })).filter(skill => skill.name),
      projects: [],
      certifications: []
    };
  };

  // 导出简历为PDF
  const handleExportPdf = async () => {
    if (!generatedResume) return;
    
    try {
      await ResumePdfExporter.exportToPdf(generatedResume, selectedTemplate);
    } catch (error) {
      console.error('PDF导出失败:', error);
      setError('PDF导出失败，请重试');
    }
  };

  // 下载简历为HTML
  const handleDownloadHtml = () => {
    if (!generatedResume) return;
    
    try {
      ResumePdfExporter.downloadAsHtml(generatedResume, selectedTemplate);
    } catch (error) {
      console.error('HTML下载失败:', error);
      setError('HTML下载失败，请重试');
    }
  };

  // 打印简历
  const handlePrintResume = async () => {
    if (!generatedResume) return;
    
    try {
      await ResumePdfExporter.printResume(generatedResume, selectedTemplate);
    } catch (error) {
      console.error('打印失败:', error);
      setError('打印失败，请重试');
    }
  };

  return (
    <FeatureLayout
      title="智能简历生成器"
      subtitle="基于岗位需求，AI智能生成专业简历"
    >
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          
          {/* 模式选择 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">选择生成模式</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="generationMode"
                  value="ai-guide"
                  checked={generationMode === 'ai-guide'}
                  onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">🤖 AI引导模式（推荐）</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="generationMode"
                  value="manual"
                  checked={generationMode === 'manual'}
                  onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">📝 手动填写模式</span>
              </label>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {generationMode === 'ai-guide' 
                ? 'AI顾问通过对话引导您提供信息，自动收集简历素材，更智能更便捷'
                : '通过表单逐步填写个人信息，适合喜欢自主控制的用户'
              }
            </p>
          </div>

          {/* API设置 */}
          <div className="mb-6">
            <ApiSettings
              showSettings={showApiSettings}
              toggleSettings={() => setShowApiSettings(!showApiSettings)}
              apiProvider={apiProvider}
              setApiProvider={setApiProvider}
              apiUrl={llmApiUrl}
              setApiUrl={setLlmApiUrl}
              apiKey={llmApiKey}
              setApiKey={setLlmApiKey}
              model={model}
              setModel={setModel}
            />
          </div>

          {/* AI引导模式 */}
          {generationMode === 'ai-guide' && (
            <div className="space-y-6">
              {(llmApiKey || apiProvider === 'ollama') && !aiGuideCompleted ? (
                <div>
                  <h3 className="text-lg font-medium mb-4">AI简历顾问</h3>
                  <AiGuideChat
                    onComplete={handleAiGuideComplete}
                    llmConfig={{
                      apiUrl: llmApiUrl,
                      apiKey: llmApiKey,
                      model: model
                    }}
                  />
                </div>
              ) : !aiGuideCompleted ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800 text-sm">
                    请先配置API设置，然后开始AI引导对话。
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-green-800 font-medium">AI对话已完成</h4>
                      <p className="text-green-700 text-sm">简历信息收集完毕，正在生成专业简历...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 手动填写模式 */}
          {generationMode === 'manual' && (
            <div className="space-y-6">
              {/* 个人信息 */}
              <div>
                <h3 className="text-lg font-medium mb-4">个人基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                    <input
                      type="text"
                      value={personalInfo.fullName || ''}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                    <input
                      type="email"
                      value={personalInfo.email || ''}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">手机号码 *</label>
                    <input
                      type="tel"
                      value={personalInfo.phone || ''}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="138-0000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">所在城市 *</label>
                    <input
                      type="text"
                      value={personalInfo.location || ''}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="北京市"
                    />
                  </div>
                </div>
              </div>

              {/* 目标岗位 */}
              <div>
                <h3 className="text-lg font-medium mb-4">目标岗位信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">岗位名称 *</label>
                    <input
                      type="text"
                      value={jobDescription.jobTitle}
                      onChange={(e) => setJobDescription(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="产品经理"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">目标公司 *</label>
                    <input
                      type="text"
                      value={jobDescription.company}
                      onChange={(e) => setJobDescription(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="阿里巴巴"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">岗位描述和要求 *</label>
                  <textarea
                    rows={4}
                    value={jobDescription.requirements.join('\n')}
                    onChange={(e) => parseJobDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="请粘贴完整的岗位描述，或输入主要要求..."
                  />
                </div>
              </div>

              {/* 专业技能 */}
              <div>
                <h3 className="text-lg font-medium mb-4">专业技能</h3>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="请输入您的专业技能，用逗号分隔。例如：Python, Java, React, 项目管理, 数据分析..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleManualGenerate}
                  disabled={isGenerating || (!llmApiKey && apiProvider !== 'ollama')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? '生成中...' : '生成简历'}
                </button>
              </div>
            </div>
          )}

          {/* 生成状态 */}
          {isGenerating && (
            <div className="mt-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">AI正在生成您的专业简历...</p>
              {useStreaming && streamingContent && (
                <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto text-sm">
                  <pre className="whitespace-pre-wrap">{streamingContent}</pre>
                  {!isStreamComplete && (
                    <span className="inline-block w-2 h-5 ml-1 bg-indigo-600 animate-pulse"></span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">生成失败</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 简历预览 */}
          {generatedResume && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">简历预览</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={handlePrintResume}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded hover:bg-indigo-50"
                  >
                    打印
                  </button>
                  <button 
                    onClick={handleDownloadHtml}
                    className="px-3 py-1 text-sm text-green-600 hover:text-green-800 border border-green-200 rounded hover:bg-green-50"
                  >
                    HTML
                  </button>
                  <button 
                    onClick={handleExportPdf}
                    className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800 border border-orange-200 rounded hover:bg-orange-50"
                  >
                    导出PDF
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border">
                <ResumePreview
                  resumeData={generatedResume}
                  template={selectedTemplate}
                  className="max-h-96 overflow-y-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}