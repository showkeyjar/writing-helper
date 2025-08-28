"use client";

import { useState, useEffect } from 'react';
import { BookProject } from '../../../lib/bookTypes';

interface ProjectEditorProps {
  project: BookProject;
  onProjectUpdate: (project: BookProject) => void;
}

export default function ProjectEditor({ project, onProjectUpdate }: ProjectEditorProps) {
  const [editingProject, setEditingProject] = useState<BookProject>(project);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditingProject(project);
    setHasChanges(false);
  }, [project]);

  const handleInputChange = (field: keyof BookProject, value: any) => {
    const updatedProject = { ...editingProject, [field]: value, updatedAt: new Date() };
    setEditingProject(updatedProject);
    setHasChanges(true);
  };

  const handleSave = () => {
    onProjectUpdate(editingProject);
    setHasChanges(false);
  };

  const handleReset = () => {
    setEditingProject(project);
    setHasChanges(false);
  };

  const genres = [
    '小说', '科幻', '奇幻', '悬疑', '推理', '言情', '历史', '传记',
    '自传', '商业', '自助', '技术', '教育', '儿童', '青少年', '其他'
  ];

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.project) {
          const importedProject = {
            ...importedData.project,
            id: editingProject.id, // 保持当前项目ID
            updatedAt: new Date()
          };
          setEditingProject(importedProject);
          setHasChanges(true);
        }
      } catch (error) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  const exportProject = () => {
    const projectData = {
      project: editingProject,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingProject.title}-settings.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 保存提示 */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div className="text-yellow-800">
              您有未保存的更改
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                重置
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                保存更改
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 基本信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目标题 *
            </label>
            <input
              type="text"
              value={editingProject.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入项目标题"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              类型
            </label>
            <select
              value={editingProject.genre}
              onChange={(e) => handleInputChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择类型</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            项目描述
          </label>
          <textarea
            value={editingProject.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="描述您的项目内容、主题和目标"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标字数
            </label>
            <input
              type="number"
              value={editingProject.targetWordCount}
              onChange={(e) => handleInputChange('targetWordCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前字数
            </label>
            <input
              type="number"
              value={editingProject.currentWordCount}
              onChange={(e) => handleInputChange('currentWordCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              项目状态
            </label>
            <select
              value={editingProject.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="planning">规划中</option>
              <option value="writing">写作中</option>
              <option value="editing">编辑中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
      </div>

      {/* 项目统计 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">项目统计</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{editingProject.chapters.length}</div>
            <div className="text-sm text-gray-500">章节数量</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{editingProject.characters.length}</div>
            <div className="text-sm text-gray-500">角色数量</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{editingProject.worldBuilding.length}</div>
            <div className="text-sm text-gray-500">世界设定</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{editingProject.researchNotes.length}</div>
            <div className="text-sm text-gray-500">研究笔记</div>
          </div>
        </div>
      </div>

      {/* 时间信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">时间信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              创建时间
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
              {new Date(editingProject.createdAt).toLocaleString()}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最后更新
            </label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700">
              {new Date(editingProject.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">数据管理</h3>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={exportProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            导出项目设置
          </button>
          
          <div>
            <input
              type="file"
              accept=".json"
              onChange={importProject}
              className="hidden"
              id="import-project"
            />
            <label
              htmlFor="import-project"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer"
            >
              导入项目设置
            </label>
          </div>
          
          <button
            onClick={() => {
              if (confirm('确定要重置所有设置吗？此操作不可恢复。')) {
                const resetProject = {
                  ...editingProject,
                  description: '',
                  genre: '',
                  targetWordCount: 80000,
                  currentWordCount: 0,
                  status: 'planning' as const,
                  updatedAt: new Date()
                };
                setEditingProject(resetProject);
                setHasChanges(true);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            重置设置
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">注意事项</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 导出的项目设置包含基本信息，不包含章节内容</li>
            <li>• 导入设置会覆盖当前项目的基本信息</li>
            <li>• 重置设置会清除所有自定义配置</li>
            <li>• 所有操作都需要手动保存才能生效</li>
          </ul>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleReset}
          disabled={!hasChanges}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          重置更改
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存设置
        </button>
      </div>
    </div>
  );
}