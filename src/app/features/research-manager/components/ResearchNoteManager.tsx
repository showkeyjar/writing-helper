"use client";

import { useState } from 'react';
import { ResearchNote } from '../../../lib/bookTypes';

interface ResearchNoteManagerProps {
  researchNotes: ResearchNote[];
  onNoteUpdate: (note: ResearchNote) => void;
  onNoteCreate: (note: ResearchNote) => void;
  onNoteDelete: (noteId: string) => void;
  bookId: string;
}

export default function ResearchNoteManager({
  researchNotes,
  onNoteUpdate,
  onNoteCreate,
  onNoteDelete,
  bookId
}: ResearchNoteManagerProps) {
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<ResearchNote | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 获取所有类别
  const categories = Array.from(new Set(researchNotes.map(note => note.category).filter(Boolean)));

  // 筛选和搜索笔记
  const filteredNotes = researchNotes.filter(note => {
    const matchesCategory = filterCategory === 'all' || note.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleNewNote = () => {
    const newNote: ResearchNote = {
      id: Date.now().toString(),
      bookId,
      title: '新研究笔记',
      content: '',
      source: '',
      category: '',
      tags: [],
      relatedChapters: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setEditingNote(newNote);
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleEditNote = (note: ResearchNote) => {
    setEditingNote({ ...note });
    setIsEditing(true);
    setSelectedNote(null);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    
    const updatedNote = { ...editingNote, updatedAt: new Date() };
    
    if (researchNotes.find(n => n.id === editingNote.id)) {
      onNoteUpdate(updatedNote);
    } else {
      onNoteCreate(updatedNote);
    }
    
    setIsEditing(false);
    setEditingNote(null);
    setSelectedNote(updatedNote);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleInputChange = (field: keyof ResearchNote, value: any) => {
    if (!editingNote) return;
    setEditingNote({ ...editingNote, [field]: value });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  const exportNotes = () => {
    const data = {
      researchNotes,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsMarkdown = () => {
    const markdown = filteredNotes.map(note => {
      let content = `# ${note.title}\n\n`;
      
      if (note.category) {
        content += `**类别：** ${note.category}\n\n`;
      }
      
      if (note.source) {
        content += `**来源：** ${note.source}\n\n`;
      }
      
      if (note.tags.length > 0) {
        content += `**标签：** ${note.tags.join(', ')}\n\n`;
      }
      
      content += `${note.content}\n\n`;
      content += `*创建时间：${new Date(note.createdAt).toLocaleString()}*\n\n`;
      content += `---\n\n`;
      
      return content;
    }).join('');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-notes.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 笔记列表 */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">研究笔记</h3>
              <button
                onClick={handleNewNote}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                新建笔记
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索笔记..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            
            {/* 类别筛选 */}
            <div className="mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">全部类别</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {/* 导出按钮 */}
            <div className="flex space-x-2">
              <button
                onClick={exportNotes}
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                导出JSON
              </button>
              <button
                onClick={exportAsMarkdown}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                导出MD
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {researchNotes.length === 0 ? '还没有创建任何研究笔记' : '没有符合条件的笔记'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedNote?.id === note.id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{note.title}</h4>
                      {note.category && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {note.category}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {note.content.substring(0, 100)}...
                    </p>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {note.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          编辑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('确定要删除这个笔记吗？')) {
                              onNoteDelete(note.id);
                              if (selectedNote?.id === note.id) {
                                setSelectedNote(null);
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
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
      </div>

      {/* 笔记详情/编辑 */}
      <div className="lg:col-span-2">
        {isEditing && editingNote ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {researchNotes.find(n => n.id === editingNote.id) ? '编辑笔记' : '新建笔记'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">基本信息</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      笔记标题 *
                    </label>
                    <input
                      type="text"
                      value={editingNote.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="输入笔记标题"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      类别
                    </label>
                    <input
                      type="text"
                      value={editingNote.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="如：历史资料、人物原型、技术资料等"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    资料来源
                  </label>
                  <input
                    type="text"
                    value={editingNote.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="书籍、网站、文章等来源信息"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签（用逗号分隔）
                  </label>
                  <input
                    type="text"
                    value={editingNote.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="标签1, 标签2, 标签3"
                  />
                </div>
              </div>

              {/* 笔记内容 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">笔记内容</h4>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="记录您的研究内容、想法和发现..."
                />
              </div>
            </div>
          </div>
        ) : selectedNote ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{selectedNote.title}</h3>
                {selectedNote.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {selectedNote.category}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleEditNote(selectedNote)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                编辑笔记
              </button>
            </div>

            <div className="space-y-6">
              {/* 元信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">创建时间：</span>
                  {new Date(selectedNote.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">更新时间：</span>
                  {new Date(selectedNote.updatedAt).toLocaleString()}
                </div>
                {selectedNote.source && (
                  <div className="md:col-span-2">
                    <span className="font-medium">来源：</span>
                    {selectedNote.source}
                  </div>
                )}
              </div>

              {/* 标签 */}
              {selectedNote.tags.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 笔记内容 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">笔记内容</h4>
                <div className="prose max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {selectedNote.content}
                  </div>
                </div>
              </div>

              {/* 相关章节 */}
              {selectedNote.relatedChapters.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">相关章节</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.relatedChapters.map((chapterId, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        章节 {chapterId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">
              请选择一个研究笔记查看详情，或创建新笔记
            </div>
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              创建新笔记
            </button>
          </div>
        )}
      </div>
    </div>
  );
}