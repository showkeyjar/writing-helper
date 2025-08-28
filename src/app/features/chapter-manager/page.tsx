"use client";

import { useState, useEffect } from 'react';
import FeatureLayout from '../../components/FeatureLayout';
import ChapterList from './components/ChapterList';
import ChapterEditor from './components/ChapterEditor';
import ChapterGenerator from './components/ChapterGenerator';
import { Chapter, BookProject } from '../../lib/bookTypes';

export default function ChapterManagerPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'generator'>('list');
  const [bookProject, setBookProject] = useState<BookProject | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedChapters = localStorage.getItem('writing-helper-chapters');
    const savedProject = localStorage.getItem('writing-helper-current-project');
    
    if (savedChapters) {
      try {
        setChapters(JSON.parse(savedChapters));
      } catch (error) {
        console.error('加载章节数据失败:', error);
      }
    }
    
    if (savedProject) {
      try {
        setBookProject(JSON.parse(savedProject));
      } catch (error) {
        console.error('加载项目数据失败:', error);
      }
    }
  }, []);

  // 保存数据到localStorage
  const saveChapters = (updatedChapters: Chapter[]) => {
    setChapters(updatedChapters);
    localStorage.setItem('writing-helper-chapters', JSON.stringify(updatedChapters));
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setActiveTab('editor');
  };

  const handleChapterUpdate = (updatedChapter: Chapter) => {
    const updatedChapters = chapters.map(ch => 
      ch.id === updatedChapter.id ? updatedChapter : ch
    );
    saveChapters(updatedChapters);
    setCurrentChapter(updatedChapter);
  };

  const handleChapterCreate = (newChapter: Chapter) => {
    const updatedChapters = [...chapters, newChapter];
    saveChapters(updatedChapters);
    setCurrentChapter(newChapter);
    setActiveTab('editor');
  };

  const handleChapterDelete = (chapterId: string) => {
    const updatedChapters = chapters.filter(ch => ch.id !== chapterId);
    saveChapters(updatedChapters);
    if (currentChapter?.id === chapterId) {
      setCurrentChapter(null);
      setActiveTab('list');
    }
  };

  const handleNewChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      bookId: bookProject?.id || 'default',
      title: '新章节',
      content: '',
      wordCount: 0,
      order: chapters.length + 1,
      status: 'draft',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    handleChapterCreate(newChapter);
  };

  return (
    <FeatureLayout
      title="章节管理"
      description="管理和编辑书籍章节，跟踪写作进度"
    >
      <div className="space-y-6">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              章节列表
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!currentChapter}
            >
              章节编辑器
              {!currentChapter && <span className="text-xs text-gray-400 ml-1">(需选择章节)</span>}
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generator'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI章节生成
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[600px]">
          {activeTab === 'list' && (
            <ChapterList
              chapters={chapters}
              onChapterSelect={handleChapterSelect}
              onChapterDelete={handleChapterDelete}
              onNewChapter={handleNewChapter}
            />
          )}
          
          {activeTab === 'editor' && currentChapter && (
            <ChapterEditor
              chapter={currentChapter}
              onChapterUpdate={handleChapterUpdate}
            />
          )}
          
          {activeTab === 'editor' && !currentChapter && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                请先在章节列表中选择一个章节进行编辑
              </div>
              <button
                onClick={handleNewChapter}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                创建新章节
              </button>
            </div>
          )}
          
          {activeTab === 'generator' && (
            <ChapterGenerator
              onChapterGenerated={handleChapterCreate}
              existingChapters={chapters}
            />
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}