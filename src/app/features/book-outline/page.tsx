"use client";

import { useState } from 'react';
import FeatureLayout from '../../components/FeatureLayout';
import OutlineGenerator from './components/OutlineGenerator';
import OutlineEditor from './components/OutlineEditor';
import { BookOutline, OutlineNode } from '../../lib/bookTypes';

export default function BookOutlinePage() {
  const [currentOutline, setCurrentOutline] = useState<BookOutline | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'editor'>('generator');

  const handleOutlineGenerated = (outline: BookOutline) => {
    setCurrentOutline(outline);
    setActiveTab('editor');
  };

  const handleOutlineUpdated = (outline: BookOutline) => {
    setCurrentOutline(outline);
  };

  return (
    <FeatureLayout
      title="书籍提纲设计"
      description="智能生成和编辑书籍提纲，为您的创作提供清晰的结构框架"
    >
      <div className="space-y-6">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generator')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generator'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              智能生成提纲
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!currentOutline}
            >
              编辑提纲
              {!currentOutline && <span className="text-xs text-gray-400 ml-1">(需先生成提纲)</span>}
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[600px]">
          {activeTab === 'generator' && (
            <OutlineGenerator onOutlineGenerated={handleOutlineGenerated} />
          )}
          
          {activeTab === 'editor' && currentOutline && (
            <OutlineEditor 
              outline={currentOutline} 
              onOutlineUpdated={handleOutlineUpdated}
            />
          )}
          
          {activeTab === 'editor' && !currentOutline && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                请先在"智能生成提纲"标签页中生成一个提纲
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}