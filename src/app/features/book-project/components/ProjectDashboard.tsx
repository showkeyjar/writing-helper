"use client";

import { useState, useEffect } from 'react';
import { BookProject, WritingGoal } from '../../../lib/bookTypes';

interface ProjectDashboardProps {
  project: BookProject;
  onProjectUpdate: (project: BookProject) => void;
}

export default function ProjectDashboard({ project, onProjectUpdate }: ProjectDashboardProps) {
  const [goals, setGoals] = useState<WritingGoal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<WritingGoal>>({
    type: 'daily',
    target: 1000,
    unit: 'words',
    description: ''
  });

  useEffect(() => {
    // 从localStorage加载目标数据
    const savedGoals = localStorage.getItem(`writing-goals-${project.id}`);
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('加载目标数据失败:', error);
      }
    }
  }, [project.id]);

  const saveGoals = (updatedGoals: WritingGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(`writing-goals-${project.id}`, JSON.stringify(updatedGoals));
  };

  const getProgress = () => {
    if (project.targetWordCount === 0) return 0;
    return Math.min(100, Math.round((project.currentWordCount / project.targetWordCount) * 100));
  };

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

  const updateProjectStatus = (status: BookProject['status']) => {
    const updatedProject = { ...project, status, updatedAt: new Date() };
    onProjectUpdate(updatedProject);
  };

  const addGoal = () => {
    if (!newGoal.target || !newGoal.description) return;

    const goal: WritingGoal = {
      id: Date.now().toString(),
      bookId: project.id,
      type: newGoal.type as any,
      target: newGoal.target,
      current: 0,
      unit: newGoal.unit as any,
      deadline: newGoal.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认一周后
      description: newGoal.description,
      completed: false
    };

    saveGoals([...goals, goal]);
    setNewGoal({
      type: 'daily',
      target: 1000,
      unit: 'words',
      description: ''
    });
    setShowGoalForm(false);
  };

  const updateGoal = (goalId: string, updates: Partial<WritingGoal>) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
  };

  const exportProject = () => {
    const projectData = {
      project,
      goals,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}-project-data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = getProgress();
  const remainingWords = project.targetWordCount - project.currentWordCount;
  const averageChapterWords = project.chapters.length > 0 
    ? Math.round(project.currentWordCount / project.chapters.length) 
    : 0;

  return (
    <div className="space-y-6">
      {/* 项目概览 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            <button
              onClick={exportProject}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              导出项目
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{project.currentWordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">当前字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{project.targetWordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">目标字数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{project.chapters.length}</div>
            <div className="text-sm text-gray-500">章节数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{progress}%</div>
            <div className="text-sm text-gray-500">完成进度</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>写作进度</span>
            <span>{remainingWords > 0 ? `还需 ${remainingWords.toLocaleString()} 字` : '已完成目标'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 状态更新 */}
        <div className="flex space-x-2">
          <button
            onClick={() => updateProjectStatus('planning')}
            className={`px-3 py-1 rounded text-sm ${
              project.status === 'planning' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            规划中
          </button>
          <button
            onClick={() => updateProjectStatus('writing')}
            className={`px-3 py-1 rounded text-sm ${
              project.status === 'writing' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            写作中
          </button>
          <button
            onClick={() => updateProjectStatus('editing')}
            className={`px-3 py-1 rounded text-sm ${
              project.status === 'editing' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            编辑中
          </button>
          <button
            onClick={() => updateProjectStatus('completed')}
            className={`px-3 py-1 rounded text-sm ${
              project.status === 'completed' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已完成
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">章节统计</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">总章节数</span>
              <span className="font-medium">{project.chapters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">平均字数</span>
              <span className="font-medium">{averageChapterWords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">草稿章节</span>
              <span className="font-medium">
                {project.chapters.filter(ch => ch.status === 'draft').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成章节</span>
              <span className="font-medium">
                {project.chapters.filter(ch => ch.status === 'final').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">角色设定</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">总角色数</span>
              <span className="font-medium">{project.characters.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">主角</span>
              <span className="font-medium">
                {project.characters.filter(ch => ch.role === 'protagonist').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">反派</span>
              <span className="font-medium">
                {project.characters.filter(ch => ch.role === 'antagonist').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">配角</span>
              <span className="font-medium">
                {project.characters.filter(ch => ch.role === 'supporting').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">研究资料</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">总笔记数</span>
              <span className="font-medium">{project.researchNotes.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">世界设定</span>
              <span className="font-medium">{project.worldBuilding.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">创建时间</span>
              <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最后更新</span>
              <span className="font-medium">{new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 写作目标 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">写作目标</h3>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {showGoalForm ? '取消' : '添加目标'}
          </button>
        </div>

        {showGoalForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="daily">每日目标</option>
                <option value="weekly">每周目标</option>
                <option value="monthly">每月目标</option>
                <option value="milestone">里程碑</option>
              </select>
              
              <input
                type="number"
                value={newGoal.target}
                onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                placeholder="目标数量"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              
              <select
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="words">字数</option>
                <option value="chapters">章节</option>
                <option value="scenes">场景</option>
              </select>
              
              <input
                type="date"
                value={newGoal.deadline ? new Date(newGoal.deadline).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: new Date(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <input
              type="text"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="目标描述"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            
            <button
              onClick={addGoal}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              添加目标
            </button>
          </div>
        )}

        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              还没有设置写作目标
            </div>
          ) : (
            goals.map((goal) => {
              const goalProgress = goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0;
              const isOverdue = new Date(goal.deadline) < new Date() && !goal.completed;
              
              return (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.description}</h4>
                      <p className="text-sm text-gray-600">
                        {goal.type === 'daily' && '每日目标'} 
                        {goal.type === 'weekly' && '每周目标'}
                        {goal.type === 'monthly' && '每月目标'}
                        {goal.type === 'milestone' && '里程碑'}
                        - {goal.target} {goal.unit === 'words' ? '字' : goal.unit === 'chapters' ? '章节' : '场景'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOverdue && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          已逾期
                        </span>
                      )}
                      {goal.completed && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          已完成
                        </span>
                      )}
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>进度: {goal.current} / {goal.target}</span>
                      <span>{goalProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          goal.completed ? 'bg-green-600' : isOverdue ? 'bg-red-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${goalProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>截止日期: {new Date(goal.deadline).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={goal.current}
                        onChange={(e) => updateGoal(goal.id, { current: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => updateGoal(goal.id, { completed: !goal.completed })}
                        className={`px-2 py-1 rounded text-sm ${
                          goal.completed 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {goal.completed ? '取消完成' : '标记完成'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}