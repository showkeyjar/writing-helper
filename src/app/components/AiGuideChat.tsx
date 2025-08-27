"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, QuestionType, GuideState, ResumeAiGuide } from '../lib/resumeAiGuide';

interface AiGuideChatProps {
  onComplete: (collectedData: GuideState) => void;
  llmConfig: {
    apiUrl: string;
    apiKey: string;
    model: string;
  };
}

export default function AiGuideChat({ onComplete, llmConfig }: AiGuideChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<QuestionType>('greeting');
  const [guideState, setGuideState] = useState<GuideState>({
    currentStage: 'greeting',
    collectedData: {},
    jobDescription: {},
    personalInfo: {},
    isComplete: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化对话
  useEffect(() => {
    const initMessage: ChatMessage = {
      id: 'init',
      role: 'assistant',
      content: ResumeAiGuide.generateQuestion('greeting', guideState),
      timestamp: new Date(),
      questionType: 'greeting'
    };
    setMessages([initMessage]);
  }, []);

  // 发送用户消息
  const sendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // 生成AI回复
      const aiResponse = await generateAiResponse([...messages, userMessage]);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        questionType: aiResponse.nextStage
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentStage(aiResponse.nextStage);

      // 更新收集的数据
      const updatedState = {
        ...guideState,
        currentStage: aiResponse.nextStage,
        ...ResumeAiGuide.extractStructuredData([...messages, userMessage, aiMessage])
      };
      setGuideState(updatedState);

      // 检查是否完成
      if (aiResponse.nextStage === 'final_review' && aiResponse.isComplete) {
        updatedState.isComplete = true;
        onComplete(updatedState);
      }

    } catch (error) {
      console.error('AI回复生成失败:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，遇到了一些技术问题。让我们继续刚才的话题吧。' + 
                 ResumeAiGuide.generateQuestion(currentStage, guideState),
        timestamp: new Date(),
        questionType: currentStage
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 生成AI回复
  const generateAiResponse = async (conversationMessages: ChatMessage[]) => {
    // 获取用户最新回复
    const latestUserMessage = conversationMessages[conversationMessages.length - 1];
    
    // 确定下一阶段
    const nextStage = ResumeAiGuide.getNextStage(
      currentStage, 
      latestUserMessage.content, 
      guideState
    );

    // 生成智能追问
    const followUps = ResumeAiGuide.generateSmartFollowUp(
      latestUserMessage.content, 
      currentStage
    );

    let aiContent = '';
    
    if (followUps.length > 0 && currentStage === nextStage) {
      // 如果有追问且还在同一阶段，使用追问
      aiContent = followUps[0];
    } else if (nextStage === 'final_review') {
      // 如果到了最终回顾阶段
      aiContent = "太棒了！基于我们的对话，我已经收集了丰富的信息。\n\n" +
                 "现在让我为你生成一份专业的简历。请稍等片刻... ✨";
    } else {
      // 使用AI生成或模板生成问题
      try {
        aiContent = await ResumeAiGuide.generateAIQuestion(
          conversationMessages,
          nextStage,
          llmConfig
        );
      } catch {
        aiContent = ResumeAiGuide.generateQuestion(nextStage, guideState);
      }
    }

    return {
      content: aiContent,
      nextStage: nextStage,
      isComplete: nextStage === 'final_review' && !followUps.length
    };
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 获取阶段进度
  const getProgress = () => {
    const stages: QuestionType[] = [
      'greeting', 'target_job', 'personal_info', 'work_experience', 
      'education', 'skills', 'projects', 'achievements', 'final_review'
    ];
    const currentIndex = stages.indexOf(currentStage);
    return Math.round((currentIndex / (stages.length - 1)) * 100);
  };

  return (
    <div className="border border-gray-300 rounded-md">
      {/* 对话区域 */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-indigo-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                <span className="text-sm">AI正在思考...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 进度指示器 */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">对话进度</span>
          <span className="text-xs text-gray-600">{getProgress()}% 完成</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入你的回答..."
            disabled={isLoading || guideState.isComplete}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!currentInput.trim() || isLoading || guideState.isComplete}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            发送
          </button>
        </div>
        
        {/* 快捷回复建议 */}
        {!isLoading && currentStage === 'work_experience' && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentInput('我负责团队管理和项目协调')}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              团队管理
            </button>
            <button
              onClick={() => setCurrentInput('我主要做技术开发工作')}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              技术开发
            </button>
            <button
              onClick={() => setCurrentInput('我负责销售和客户关系')}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              销售客户
            </button>
          </div>
        )}
      </div>
    </div>
  );
}