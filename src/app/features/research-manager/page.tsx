"use client";

import { useState, useEffect } from 'react';
import FeatureLayout from '../../components/FeatureLayout';
import ResearchNoteManager from './components/ResearchNoteManager';
import { ResearchNote, BookProject } from '../../lib/bookTypes';

export default function ResearchManagerPage() {
  const [researchNotes, setResearchNotes] = useState<ResearchNote[]>([]);
  const [bookProject, setBookProject] = useState<BookProject | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedNotes = localStorage.getItem('writing-helper-research-notes');
    const savedProject = localStorage.getItem('writing-helper-current-project');
    
    if (savedNotes) {
      try {
        setResearchNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('加载研究笔记数据失败:', error);
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
  const saveResearchNotes = (updatedNotes: ResearchNote[]) => {
    setResearchNotes(updatedNotes);
    localStorage.setItem('writing-helper-research-notes', JSON.stringify(updatedNotes));
  };

  const handleNoteUpdate = (updatedNote: ResearchNote) => {
    const updatedNotes = researchNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    saveResearchNotes(updatedNotes);
  };

  const handleNoteCreate = (newNote: ResearchNote) => {
    const updatedNotes = [...researchNotes, newNote];
    saveResearchNotes(updatedNotes);
  };

  const handleNoteDelete = (noteId: string) => {
    const updatedNotes = researchNotes.filter(note => note.id !== noteId);
    saveResearchNotes(updatedNotes);
  };

  return (
    <FeatureLayout
      title="研究资料管理"
      description="收集、整理和管理写作相关的研究资料和笔记"
    >
      <div className="space-y-6">
        {/* 项目信息 */}
        {bookProject && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">当前项目</h3>
                <p className="text-blue-700">{bookProject.title}</p>
                <p className="text-sm text-blue-600">{bookProject.description}</p>
              </div>
              <div className="text-right text-sm text-blue-600">
                <div>{researchNotes.length} 个研究笔记</div>
              </div>
            </div>
          </div>
        )}

        {/* 研究笔记管理 */}
        <ResearchNoteManager
          researchNotes={researchNotes}
          onNoteUpdate={handleNoteUpdate}
          onNoteCreate={handleNoteCreate}
          onNoteDelete={handleNoteDelete}
          bookId={bookProject?.id || 'default'}
        />
      </div>
    </FeatureLayout>
  );
}