"use client";

import { useState, useEffect } from 'react';
import { Chapter } from '../../../lib/bookTypes';

interface ChapterEditorProps {
  chapter: Chapter;
  onChapterUpdate: (chapter: Chapter) => void;
}

export default function ChapterEditor({ chapter, onChapterUpdate }: ChapterEditorProps) {
  const [editingChapter, setEditingChapter] = useState<Chapter>(chapter);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  useEffect(() => {
    setEditingChapter(chapter);
  }, [chapter]);

  // 自动保存功能
  useEffect(() => {
    if (!autoSave) return;

    const timer = setTimeout(() => {
      if (editingChapter.content !== chapter.content || 
          editingChapter.title !== chapter.title ||
          editingChapter.notes !== chapter.notes) {
        handleSave();
      }
    }, 2000); // 2秒后自动保存

    return () => clearTimeout(timer);
  }, [editingChapter.content, editingChapter.title, editingChapter.notes, autoSave]);

  const handleInputChange = (field: keyof Chapter, value: any) => {
    const updatedChapter = { ...editingChapter, [field]: value };
    
    // 如果是内容变化，重新计算字数
    if (field === 'content') {
      updatedChapter.wordCount = countWords(value);
    }
    
    updatedChapter.updatedAt = new Date();
    setEditingChapter(updatedChapter);
  };

  const countWords = (text: string): number => {
    // 简单的中英文字数统计
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  };

  const handleSave = () => {
    onChapterUpdate(editingChapter);
    setLastSaved(new Date());
  };

  const exportChapter = () => {
    const content = `# ${editingChapter.title}\n\n${editingChapter.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingChapter.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertTemplate = (template: string) => {
    const textarea = document.getElementById('chapter-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = editingChapter.content;
      const newContent = currentContent.substring(0, start) + template + currentContent.substring(end);
      handleInputChange('content', newContent);
      
      // 重新设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.length, start + template.length);
      }, 0);
    }
  };

  const templates = [
    { name: '对话', content: '\n"对话内容，"角色A说道。\n\n"回应内容，"角色B回答。\n' },
    { name: '场景描述', content: '\n[场景描述：描述当前环境、氛围和视觉细节]\n' },
    { name: '内心独白', content: '\n（角色内心想法：表达角色的思考和感受）\n' },
    { name: '动作描述', content: '\n角色进行了某个动作，展现了其状态或意图。\n' },
    { name: '时间转换', content: '\n---\n\n[时间：XX小时后/第二天/一周后]\n\n' },
    { name: '章节小结', content: '\n\n## 本章要点\n\n- 要点一\n- 要点二\n- 要点三\n' }
  ];

  return (
    <div className="space-y-6">
      {/* 章节信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">章节信息</h3>
            <p className="text-sm text-gray-500 mt-1">
              最后保存: {lastSaved.toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">自动保存</span>
            </label>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              手动保存
            </button>
            <button
              onClick={exportChapter}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              导出章节
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">章节顺序</label>
            <input
              type="number"
              value={editingChapter.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
            <select
              value={editingChapter.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">草稿</option>
              <option value="review">审阅中</option>
              <option value="final">最终版</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">字数统计</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
              {editingChapter.wordCount.toLocaleString()} 字
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">创建时间</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm">
              {new Date(editingChapter.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">章节标题</label>
          <input
            type="text"
            value={editingChapter.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="输入章节标题"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">章节备注</label>
          <textarea
            value={editingChapter.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="记录创作思路、要点或提醒事项"
          />
        </div>
      </div>

      {/* 写作工具栏 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">快速插入模板</h4>
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <button
              key={template.name}
              onClick={() => insertTemplate(template.content)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* 章节内容编辑器 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-lg font-medium text-gray-900">章节内容</h4>
        </div>
        <div className="p-4">
          <textarea
            id="chapter-content"
            value={editingChapter.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            rows={25}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            placeholder="开始写作您的章节内容..."
            style={{ minHeight: '600px' }}
          />
        </div>
      </div>

      {/* 写作提示 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">写作提示</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 使用模板快速插入常用的写作结构</li>
          <li>• 开启自动保存功能避免内容丢失</li>
          <li>• 在备注中记录创作思路和要点</li>
          <li>• 定期导出章节内容作为备份</li>
        </ul>
      </div>
    </div>
  );
}