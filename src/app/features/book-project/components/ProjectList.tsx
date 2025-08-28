"use client";

import { useState } from 'react';
import { BookProject } from '../../../lib/bookTypes';

interface ProjectListProps {
  projects: BookProject[];
  onProjectSelect: (project: BookProject) => void;
  onProjectDelete: (projectId: string) => void;
  onNewProject: () => void;
}

export default function ProjectList({ 
  projects, 
  onProjectSelect, 
  onProjectDelete, 
  onNewProject 
}: ProjectListProps) {
  const [sortBy, setSortBy] = useState<'title' | 'status' | 'updatedAt' | 'progress'>('updatedAt');
  const [filterStatus, setFilterStatus] = useState<'all' | 'planning' | 'writing' | 'editing' | 'completed'>('all');

  const getStatusColor = (status: BookProject['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'writing':
        return 'bg-yellow-100 text-yellow-800';
      case 'editing':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: BookProject['status']) => {
    switch (status) {
      case 'planning':
        return '规划中';
      case 'writing':
        return '写作中';
      case 'editing':
        return '编辑中';
      case 'completed':
        return '已完成';
      default:
        return '未知';
    }
  };

  const getProgress = (project: BookProject) => {
    if (project.targetWordCount === 0) return 0;
    return Math.min(100, Math.round((project.currentWordCount / project.targetWordCount) * 100));
  };

  const filteredAndSortedProjects = projects
    .filter(project => filterStatus === 'all' || project.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'progress':
          return getProgress(b) - getProgress(a);
        default:
          return 0;
      }
    });

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const totalWords = projects.reduce((sum, p) => sum + p.currentWordCount, 0);

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">项目统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalProjects}</div>
            <div className="text-sm text-gray-500">总项目数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
            <div className="text-sm text-gray-500">已完成项目</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-500">总字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter(p => p.status === 'writing').length}
            </div>
            <div className="text-sm text-gray-500">进行中项目</div>
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
                <option value="updatedAt">按更新时间</option>
                <option value="title">按标题</option>
                <option value="status">按状态</option>
                <option value="progress">按进度</option>
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
                <option value="planning">规划中</option>
                <option value="writing">写作中</option>
                <option value="editing">编辑中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={onNewProject}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            新建项目
          </button>
        </div>
      </div>

      {/* 项目列表 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {projects.length === 0 ? '还没有创建任何项目' : '没有符合筛选条件的项目'}
            </div>
            <button
              onClick={onNewProject}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              创建第一个项目
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedProjects.map((project) => {
              const progress = getProgress(project);
              return (
                <div
                  key={project.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {project.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                        <span>{project.genre || '未分类'}</span>
                        <span>{project.currentWordCount.toLocaleString()} / {project.targetWordCount.toLocaleString()} 字</span>
                        <span>创建于 {new Date(project.createdAt).toLocaleDateString()}</span>
                        <span>更新于 {new Date(project.updatedAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* 进度条 */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>写作进度</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        <span>{project.chapters.length} 章节</span>
                        <span>{project.characters.length} 角色</span>
                        <span>{project.researchNotes.length} 研究笔记</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectSelect(project);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        打开
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定要删除这个项目吗？此操作不可恢复。')) {
                            onProjectDelete(project.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}