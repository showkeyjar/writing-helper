"use client";

import { useState, useEffect } from 'react';
import { BookOutline, OutlineNode } from '../../../lib/bookTypes';

interface OutlineEditorProps {
  outline: BookOutline;
  onOutlineUpdated: (outline: BookOutline) => void;
}

export default function OutlineEditor({ outline, onOutlineUpdated }: OutlineEditorProps) {
  const [editingOutline, setEditingOutline] = useState<BookOutline>(outline);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<string | null>(null);

  useEffect(() => {
    setEditingOutline(outline);
    // 默认展开第一层节点
    const firstLevelNodes = outline.structure.map(node => node.id);
    setExpandedNodes(new Set(firstLevelNodes));
  }, [outline]);

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const updateNode = (nodeId: string, updates: Partial<OutlineNode>) => {
    const updateNodeRecursive = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, ...updates };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateNodeRecursive(node.children) };
        }
        return node;
      });
    };

    const updatedStructure = updateNodeRecursive(editingOutline.structure);
    const updatedOutline = {
      ...editingOutline,
      structure: updatedStructure,
      updatedAt: new Date()
    };
    
    setEditingOutline(updatedOutline);
    onOutlineUpdated(updatedOutline);
  };

  const addChildNode = (parentId: string) => {
    const findParentAndAdd = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.map(node => {
        if (node.id === parentId) {
          const newChild: OutlineNode = {
            id: Date.now().toString(),
            title: '新章节',
            description: '',
            type: node.type === 'part' ? 'chapter' : 'section',
            level: node.level + 1,
            order: node.children.length + 1,
            parentId: parentId,
            children: [],
            estimatedWordCount: 0,
            status: 'planned',
            notes: '',
            keyPoints: []
          };
          return { ...node, children: [...node.children, newChild] };
        }
        if (node.children.length > 0) {
          return { ...node, children: findParentAndAdd(node.children) };
        }
        return node;
      });
    };

    const updatedStructure = findParentAndAdd(editingOutline.structure);
    const updatedOutline = {
      ...editingOutline,
      structure: updatedStructure,
      updatedAt: new Date()
    };
    
    setEditingOutline(updatedOutline);
    onOutlineUpdated(updatedOutline);
  };

  const deleteNode = (nodeId: string) => {
    const deleteNodeRecursive = (nodes: OutlineNode[]): OutlineNode[] => {
      return nodes.filter(node => node.id !== nodeId).map(node => ({
        ...node,
        children: deleteNodeRecursive(node.children)
      }));
    };

    const updatedStructure = deleteNodeRecursive(editingOutline.structure);
    const updatedOutline = {
      ...editingOutline,
      structure: updatedStructure,
      updatedAt: new Date()
    };
    
    setEditingOutline(updatedOutline);
    onOutlineUpdated(updatedOutline);
  };

  const moveNode = (nodeId: string, direction: 'up' | 'down') => {
    const moveNodeInArray = (nodes: OutlineNode[]): OutlineNode[] => {
      const nodeIndex = nodes.findIndex(n => n.id === nodeId);
      if (nodeIndex === -1) {
        return nodes.map(node => ({
          ...node,
          children: moveNodeInArray(node.children)
        }));
      }

      const newNodes = [...nodes];
      if (direction === 'up' && nodeIndex > 0) {
        [newNodes[nodeIndex - 1], newNodes[nodeIndex]] = [newNodes[nodeIndex], newNodes[nodeIndex - 1]];
      } else if (direction === 'down' && nodeIndex < nodes.length - 1) {
        [newNodes[nodeIndex], newNodes[nodeIndex + 1]] = [newNodes[nodeIndex + 1], newNodes[nodeIndex]];
      }

      // 更新order
      newNodes.forEach((node, index) => {
        node.order = index + 1;
      });

      return newNodes;
    };

    const updatedStructure = moveNodeInArray(editingOutline.structure);
    const updatedOutline = {
      ...editingOutline,
      structure: updatedStructure,
      updatedAt: new Date()
    };
    
    setEditingOutline(updatedOutline);
    onOutlineUpdated(updatedOutline);
  };

  const exportOutline = () => {
    const generateMarkdown = (nodes: OutlineNode[], level: number = 1): string => {
      return nodes.map(node => {
        const indent = '#'.repeat(level);
        let content = `${indent} ${node.title}\n\n`;
        
        if (node.description) {
          content += `${node.description}\n\n`;
        }
        
        if (node.keyPoints.length > 0) {
          content += '**关键要点：**\n';
          node.keyPoints.forEach(point => {
            content += `- ${point}\n`;
          });
          content += '\n';
        }
        
        if (node.notes) {
          content += `**备注：** ${node.notes}\n\n`;
        }
        
        if (node.children.length > 0) {
          content += generateMarkdown(node.children, level + 1);
        }
        
        return content;
      }).join('');
    };

    const markdown = `# ${editingOutline.bookId} - 提纲\n\n**主题：** ${editingOutline.theme}\n\n**目标读者：** ${editingOutline.targetAudience}\n\n**关键信息：** ${editingOutline.keyMessages.join(', ')}\n\n---\n\n${generateMarkdown(editingOutline.structure)}`;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingOutline.bookId}-outline.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderNode = (node: OutlineNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const isEditing = editingNode === node.id;
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.id} className={`ml-${level * 4} border-l-2 border-gray-200 pl-4 mb-4`}>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {hasChildren && (
                <button
                  onClick={() => toggleNodeExpansion(node.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                node.type === 'part' ? 'bg-purple-100 text-purple-800' :
                node.type === 'chapter' ? 'bg-blue-100 text-blue-800' :
                node.type === 'section' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {node.type === 'part' ? '部分' :
                 node.type === 'chapter' ? '章节' :
                 node.type === 'section' ? '小节' : '场景'}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                node.status === 'completed' ? 'bg-green-100 text-green-800' :
                node.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {node.status === 'completed' ? '已完成' :
                 node.status === 'in_progress' ? '进行中' : '计划中'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => moveNode(node.id, 'up')}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="上移"
              >
                ↑
              </button>
              <button
                onClick={() => moveNode(node.id, 'down')}
                className="text-gray-400 hover:text-gray-600 text-sm"
                title="下移"
              >
                ↓
              </button>
              <button
                onClick={() => setEditingNode(isEditing ? null : node.id)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                {isEditing ? '完成' : '编辑'}
              </button>
              <button
                onClick={() => addChildNode(node.id)}
                className="text-green-600 hover:text-green-800 text-sm"
                title="添加子节点"
              >
                +
              </button>
              <button
                onClick={() => deleteNode(node.id)}
                className="text-red-600 hover:text-red-800 text-sm"
                title="删除"
              >
                ×
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={node.title}
                onChange={(e) => updateNode(node.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="标题"
              />
              <textarea
                value={node.description}
                onChange={(e) => updateNode(node.id, { description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="描述"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={node.estimatedWordCount}
                  onChange={(e) => updateNode(node.id, { estimatedWordCount: parseInt(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="预计字数"
                />
                <select
                  value={node.status}
                  onChange={(e) => updateNode(node.id, { status: e.target.value as any })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="planned">计划中</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              <textarea
                value={node.notes}
                onChange={(e) => updateNode(node.id, { notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="备注"
              />
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{node.title}</h4>
              {node.description && (
                <p className="text-gray-600 text-sm mb-2">{node.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>预计字数: {node.estimatedWordCount}</span>
                <span>层级: {node.level}</span>
                <span>顺序: {node.order}</span>
              </div>
              {node.notes && (
                <p className="text-gray-500 text-xs mt-2 italic">{node.notes}</p>
              )}
            </div>
          )}
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-4">
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 提纲信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">提纲信息</h3>
            <p className="text-sm text-gray-500 mt-1">
              创建时间: {editingOutline.createdAt.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              更新时间: {editingOutline.updatedAt.toLocaleString()}
            </p>
          </div>
          <button
            onClick={exportOutline}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            导出为 Markdown
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">主题:</span>
            <p className="text-gray-600 mt-1">{editingOutline.theme}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">目标读者:</span>
            <p className="text-gray-600 mt-1">{editingOutline.targetAudience || '未指定'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">关键信息:</span>
            <p className="text-gray-600 mt-1">{editingOutline.keyMessages.join(', ') || '无'}</p>
          </div>
        </div>
      </div>

      {/* 提纲结构 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">提纲结构</h3>
        <div className="space-y-4">
          {editingOutline.structure.map(node => renderNode(node))}
        </div>
        
        {editingOutline.structure.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无提纲内容
          </div>
        )}
      </div>
    </div>
  );
}