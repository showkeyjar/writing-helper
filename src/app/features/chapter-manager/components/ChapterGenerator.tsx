"use client";

import { useState } from 'react';
import ApiSettings from '../../../components/ApiSettings';
import { Chapter } from '../../../lib/bookTypes';

interface ChapterGeneratorProps {
  onChapterGenerated: (chapter: Chapter) => void;
  existingChapters: Chapter[];
}

export default function ChapterGenerator({ onChapterGenerated, existingChapters }: ChapterGeneratorProps) {
  const [formData, setFormData] = useState({
    chapterTitle: '',
    chapterOrder: existingChapters.length + 1,
    plotSummary: '',
    characters: '',
    setting: '',
    mood: '',
    keyEvents: '',
    targetWordCount: 3000,
    writingStyle: 'narrative',
    previousChapterSummary: '',
    nextChapterHint: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const writingStyles = [
    { value: 'narrative', label: '叙述性' },
    { value: 'dialogue', label: '对话为主' },
    { value: 'descriptive', label: '描述性' },
    { value: 'action', label: '动作场面' },
    { value: 'introspective', label: '内心独白' },
    { value: 'mixed', label: '混合风格' }
  ];

  const moods = [
    '紧张', '轻松', '悲伤', '欢快', '神秘', '浪漫', '激动', '平静', 
    '恐怖', '温馨', '严肃', '幽默', '忧郁', '希望', '绝望', '其他'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateChapter = async () => {
    if (!formData.chapterTitle.trim() || !formData.plotSummary.trim()) {
      setError('请填写章节标题和情节概要');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-chapter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          existingChaptersCount: existingChapters.length
        }),
      });

      if (!response.ok) {
        throw new Error('生成章节失败');
      }

      const result = await response.json();
      
      // 创建新章节对象
      const newChapter: Chapter = {
        id: Date.now().toString(),
        bookId: 'default',
        title: formData.chapterTitle,
        content: result.content,
        wordCount: countWords(result.content),
        order: formData.chapterOrder,
        status: 'draft',
        notes: `AI生成 - ${formData.plotSummary}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onChapterGenerated(newChapter);
      
      // 重置表单
      setFormData({
        ...formData,
        chapterTitle: '',
        chapterOrder: existingChapters.length + 2,
        plotSummary: '',
        keyEvents: '',
        previousChapterSummary: '',
        nextChapterHint: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成章节时发生错误');
    } finally {
      setIsGenerating(false);
    }
  };

  const countWords = (text: string): number => {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  };

  const loadChapterContext = (chapterId: string) => {
    const chapter = existingChapters.find(ch => ch.id === chapterId);
    if (chapter) {
      const summary = chapter.content.substring(0, 200) + '...';
      setFormData(prev => ({ ...prev, previousChapterSummary: summary }));
    }
  };

  return (
    <div className="space-y-6">
      {/* API设置 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API 设置</h3>
        <ApiSettings />
      </div>

      {/* 基本信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">章节基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              章节标题 *
            </label>
            <input
              type="text"
              value={formData.chapterTitle}
              onChange={(e) => handleInputChange('chapterTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入章节标题"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              章节顺序
            </label>
            <input
              type="number"
              value={formData.chapterOrder}
              onChange={(e) => handleInputChange('chapterOrder', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标字数
            </label>
            <input
              type="number"
              value={formData.targetWordCount}
              onChange={(e) => handleInputChange('targetWordCount', parseInt(e.target.value) || 3000)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="500"
              max="10000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              写作风格
            </label>
            <select
              value={formData.writingStyle}
              onChange={(e) => handleInputChange('writingStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {writingStyles.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            情节概要 *
          </label>
          <textarea
            value={formData.plotSummary}
            onChange={(e) => handleInputChange('plotSummary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="描述本章节的主要情节发展和要点"
          />
        </div>
      </div>

      {/* 详细设定 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">详细设定</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主要角色
            </label>
            <input
              type="text"
              value={formData.characters}
              onChange={(e) => handleInputChange('characters', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="列出本章节涉及的主要角色"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              场景设定
            </label>
            <input
              type="text"
              value={formData.setting}
              onChange={(e) => handleInputChange('setting', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="描述故事发生的时间和地点"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            情感基调
          </label>
          <div className="flex flex-wrap gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => handleInputChange('mood', mood)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.mood === mood
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            关键事件
          </label>
          <textarea
            value={formData.keyEvents}
            onChange={(e) => handleInputChange('keyEvents', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="列出本章节中需要发生的关键事件或转折点"
          />
        </div>
      </div>

      {/* 上下文连接 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">上下文连接</h3>
        
        {existingChapters.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择前一章节作为参考
            </label>
            <select
              onChange={(e) => e.target.value && loadChapterContext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">选择章节...</option>
              {existingChapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  第{chapter.order}章：{chapter.title}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            前章节概要
          </label>
          <textarea
            value={formData.previousChapterSummary}
            onChange={(e) => handleInputChange('previousChapterSummary', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="简述前一章节的主要内容，帮助AI更好地连接剧情"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            下章节提示
          </label>
          <textarea
            value={formData.nextChapterHint}
            onChange={(e) => handleInputChange('nextChapterHint', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="为下一章节留下伏笔或提示"
          />
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* 生成按钮 */}
      <div className="flex justify-center">
        <button
          onClick={generateChapter}
          disabled={isGenerating}
          className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '正在生成章节...' : '生成AI章节'}
        </button>
      </div>

      {/* 使用提示 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">使用提示</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 详细的情节概要能帮助AI生成更符合预期的内容</li>
          <li>• 提供前章节概要可以保持故事的连贯性</li>
          <li>• 选择合适的写作风格和情感基调</li>
          <li>• 生成后可以在编辑器中进一步修改和完善</li>
        </ul>
      </div>
    </div>
  );
}