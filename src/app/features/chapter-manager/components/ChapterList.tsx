"use client";

import { useState } from 'react';
import { Chapter } from '../../../lib/bookTypes';

interface ChapterListProps {
  chapters: Chapter[];
  onChapterSelect: (chapter: Chapter) => void;
  onChapterDelete: (chapterId: string) => void;
  onNewChapter: () => void;
}

export default function ChapterList({ 
  chapters, 
  onChapterSelect, 
  onChapterDelete, 
  onNewChapter 
}: ChapterListProps) {
  const [sortBy, setSortBy] = useState<'order' | 'title' | 'status' | 'updatedAt'>('order');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'review' | 'final'>('all');

  const filteredAndSortedChapters = chapters
    .filter(chapter => filterStatus === 'all' || chapter.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'order':
          return a.order - b.order;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  const getStatusColor = (status: Chapter['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Chapter['status']) => {
    switch (status) {
      case 'draft':
        return '草稿';
      case 'review':
        return '审阅中';
      case 'final':
        return '最终版';
      default:
        return '未知';
    }
  };

  const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);

  const exportAllChapters = () => {
    const sortedChapters = chapters.sort((a, b) => a.order - b.order);
    const content = sortedChapters.map(chapter => {
      return `# ${chapter.title}\n\n${chapter.content}\n\n---\n\n`;
    }).join('');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-chapters.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">写作统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{chapters.length}</div>
            <div className="text-sm text-gray-500">总章节数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalWordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {chapters.filter(ch => ch.status === 'final').length}
            </div>
            <div className="text-sm text-gray-500">已完成章节</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {chapters.filter(ch => ch.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-500">草稿章节</div>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="order">按顺序</option>
                <option value="title">按标题</option>
                <option value="status">按状态</option>
                <option value="updatedAt">按更新时间</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态筛选</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="review">审阅中</option>
                <option value="final">最终版</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={exportAllChapters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              disabled={chapters.length === 0}
            >
              导出全部
            </button>
            <button
              onClick={onNewChapter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              新建章节
            </button>
          </div>
        </div>
      </div>

      {/* 章节列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAndSortedChapters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {chapters.length === 0 ? '还没有创建任何章节' : '没有符合筛选条件的章节'}
            </div>
            <button
              onClick={onNewChapter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              创建第一个章节
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedChapters.map((chapter) => (
              <div
                key={chapter.id}
                className="p-6 hover:bg-gray-50 cursor-pointer"
                onClick={() => onChapterSelect(chapter)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        第{chapter.order}章：{chapter.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chapter.status)}`}>
                        {getStatusText(chapter.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
                      <span>{chapter.wordCount.toLocaleString()} 字</span>
                      <span>创建于 {new Date(chapter.createdAt).toLocaleDateString()}</span>
                      <span>更新于 {new Date(chapter.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {chapter.notes && (
                      <p className="text-sm text-gray-600 italic">{chapter.notes}</p>
                    )}
                    
                    {chapter.content && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {chapter.content.substring(0, 150)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChapterSelect(chapter);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      编辑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这个章节吗？此操作不可恢复。')) {
                          onChapterDelete(chapter.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}