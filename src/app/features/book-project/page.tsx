"use client";

import { useState, useEffect } from 'react';
import FeatureLayout from '../../components/FeatureLayout';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectEditor from './components/ProjectEditor';
import ProjectList from './components/ProjectList';
import { BookProject } from '../../lib/bookTypes';

export default function BookProjectPage() {
  const [projects, setProjects] = useState<BookProject[]>([]);
  const [currentProject, setCurrentProject] = useState<BookProject | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard' | 'editor'>('list');

  // 从localStorage加载数据
  useEffect(() => {
    const savedProjects = localStorage.getItem('writing-helper-projects');
    const savedCurrentProject = localStorage.getItem('writing-helper-current-project');
    
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
      } catch (error) {
        console.error('加载项目数据失败:', error);
      }
    }
    
    if (savedCurrentProject) {
      try {
        const parsedProject = JSON.parse(savedCurrentProject);
        setCurrentProject(parsedProject);
        setActiveTab('dashboard');
      } catch (error) {
        console.error('加载当前项目失败:', error);
      }
    }
  }, []);

  // 保存数据到localStorage
  const saveProjects = (updatedProjects: BookProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem('writing-helper-projects', JSON.stringify(updatedProjects));
  };

  const saveCurrentProject = (project: BookProject | null) => {
    setCurrentProject(project);
    if (project) {
      localStorage.setItem('writing-helper-current-project', JSON.stringify(project));
    } else {
      localStorage.removeItem('writing-helper-current-project');
    }
  };

  const handleProjectSelect = (project: BookProject) => {
    saveCurrentProject(project);
    setActiveTab('dashboard');
  };

  const handleProjectUpdate = (updatedProject: BookProject) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(updatedProjects);
    saveCurrentProject(updatedProject);
  };

  const handleProjectCreate = (newProject: BookProject) => {
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    saveCurrentProject(newProject);
    setActiveTab('dashboard');
  };

  const handleProjectDelete = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    saveProjects(updatedProjects);
    if (currentProject?.id === projectId) {
      saveCurrentProject(null);
      setActiveTab('list');
    }
  };

  const handleNewProject = () => {
    const newProject: BookProject = {
      id: Date.now().toString(),
      title: '新书项目',
      description: '',
      genre: '',
      targetWordCount: 80000,
      currentWordCount: 0,
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
      characters: [],
      worldBuilding: [],
      researchNotes: []
    };
    
    handleProjectCreate(newProject);
  };

  return (
    <FeatureLayout
      title="书籍项目管理"
      description="创建和管理您的写作项目，跟踪整体进度"
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
              项目列表
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!currentProject}
            >
              项目仪表板
              {!currentProject && <span className="text-xs text-gray-400 ml-1">(需选择项目)</span>}
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              disabled={!currentProject}
            >
              项目设置
              {!currentProject && <span className="text-xs text-gray-400 ml-1">(需选择项目)</span>}
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[600px]">
          {activeTab === 'list' && (
            <ProjectList
              projects={projects}
              onProjectSelect={handleProjectSelect}
              onProjectDelete={handleProjectDelete}
              onNewProject={handleNewProject}
            />
          )}
          
          {activeTab === 'dashboard' && currentProject && (
            <ProjectDashboard
              project={currentProject}
              onProjectUpdate={handleProjectUpdate}
            />
          )}
          
          {activeTab === 'dashboard' && !currentProject && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                请先在项目列表中选择一个项目
              </div>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                创建新项目
              </button>
            </div>
          )}
          
          {activeTab === 'editor' && currentProject && (
            <ProjectEditor
              project={currentProject}
              onProjectUpdate={handleProjectUpdate}
            />
          )}
          
          {activeTab === 'editor' && !currentProject && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">
                请先选择一个项目进行编辑
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}