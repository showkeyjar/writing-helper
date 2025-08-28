"use client";

import { useState } from 'react';
import ApiSettings from '../../../components/ApiSettings';
import { BookOutline, OutlineGenerationRequest, OutlineNode } from '../../../lib/bookTypes';

interface OutlineGeneratorProps {
  onOutlineGenerated: (outline: BookOutline) => void;
}

export default function OutlineGenerator({ onOutlineGenerated }: OutlineGeneratorProps) {
  const [formData, setFormData] = useState<OutlineGenerationRequest>({
    bookTitle: '',
    genre: '',
    theme: '',
    targetAudience: '',
    targetWordCount: 80000,
    keyElements: [],
    structure: 'three-act',
    additionalRequirements: ''
  });
  
  const [keyElementInput, setKeyElementInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genres = [
    '小说', '科幻', '奇幻', '悬疑', '推理', '言情', '历史', '传记',
    '自传', '商业', '自助', '技术', '教育', '儿童', '青少年', '其他'
  ];

  const structures = [
    { value: 'three-act', label: '三幕结构' },
    { value: 'hero-journey', label: '英雄之旅' },
    { value: 'five-act', label: '五幕结构' },
    { value: 'custom', label: '自定义结构' }
  ];

  const handleInputChange = (field: keyof OutlineGenerationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addKeyElement = () => {
    if (keyElementInput.trim() && !formData.keyElements.includes(keyElementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keyElements: [...prev.keyElements, keyElementInput.trim()]
      }));
      setKeyElementInput('');
    }
  };

  const removeKeyElement = (element: string) => {
    setFormData(prev => ({
      ...prev,
      keyElements: prev.keyElements.filter(e => e !== element)
    }));
  };

  const generateOutline = async () => {
    if (!formData.bookTitle.trim() || !formData.genre || !formData.theme.trim()) {
      setError('请填写书名、类型和主题');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('生成提纲失败');
      }

      const result = await response.json();
      
      // 创建BookOutline对象
      const outline: BookOutline = {
        id: Date.now().toString(),
        bookId: Date.now().toString(),
        structure: result.outline,
        theme: formData.theme,
        targetAudience: formData.targetAudience,
        keyMessages: formData.keyElements,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      onOutlineGenerated(outline);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成提纲时发生错误');
    } finally {
      setIsGenerating(false);
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              书名 *
            </label>
            <input
              type="text"
              value={formData.bookTitle}
              onChange={(e) => handleInputChange('bookTitle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="请输入书名"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              类型 *
            </label>
            <select
              value={formData.genre}
              onChange={(e) => handleInputChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择类型</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标字数
            </label>
            <input
              type="number"
              value={formData.targetWordCount}
              onChange={(e) => handleInputChange('targetWordCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="80000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标读者
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：成年读者、青少年、专业人士"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主题 *
          </label>
          <textarea
            value={formData.theme}
            onChange={(e) => handleInputChange('theme', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请描述书籍的核心主题和要传达的信息"
          />
        </div>
      </div>

      {/* 结构设置 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">结构设置</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            故事结构
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {structures.map(structure => (
              <label key={structure.value} className="flex items-center">
                <input
                  type="radio"
                  name="structure"
                  value={structure.value}
                  checked={formData.structure === structure.value}
                  onChange={(e) => handleInputChange('structure', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{structure.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            关键要素
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={keyElementInput}
              onChange={(e) => setKeyElementInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyElement()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入关键要素，如角色、情节点、设定等"
            />
            <button
              onClick={addKeyElement}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.keyElements.map((element, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                {element}
                <button
                  onClick={() => removeKeyElement(element)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 额外要求 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">额外要求</h3>
        <textarea
          value={formData.additionalRequirements}
          onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="请描述任何特殊要求，如特定的情节发展、风格偏好、避免的元素等"
        />
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
          onClick={generateOutline}
          disabled={isGenerating}
          className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '正在生成提纲...' : '生成智能提纲'}
        </button>
      </div>
    </div>
  );
}