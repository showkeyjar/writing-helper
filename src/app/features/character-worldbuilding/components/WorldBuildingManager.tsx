"use client";

import { useState } from 'react';
import { WorldBuilding, Character } from '../../../lib/bookTypes';

interface WorldBuildingManagerProps {
  worldBuilding: WorldBuilding[];
  onWorldBuildingUpdate: (worldBuilding: WorldBuilding) => void;
  onWorldBuildingCreate: (worldBuilding: WorldBuilding) => void;
  onWorldBuildingDelete: (worldBuildingId: string) => void;
  bookId: string;
  characters: Character[];
}

export default function WorldBuildingManager({
  worldBuilding,
  onWorldBuildingUpdate,
  onWorldBuildingCreate,
  onWorldBuildingDelete,
  bookId,
  characters
}: WorldBuildingManagerProps) {
  const [selectedItem, setSelectedItem] = useState<WorldBuilding | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<WorldBuilding | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | WorldBuilding['category']>('all');

  const categories = [
    { value: 'setting', label: '场景设定', color: 'bg-blue-100 text-blue-800' },
    { value: 'culture', label: '文化背景', color: 'bg-green-100 text-green-800' },
    { value: 'history', label: '历史背景', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'technology', label: '科技设定', color: 'bg-purple-100 text-purple-800' },
    { value: 'magic', label: '魔法体系', color: 'bg-pink-100 text-pink-800' },
    { value: 'politics', label: '政治制度', color: 'bg-red-100 text-red-800' },
    { value: 'economy', label: '经济体系', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'other', label: '其他设定', color: 'bg-gray-100 text-gray-800' }
  ];

  const getCategoryInfo = (category: WorldBuilding['category']) => {
    return categories.find(c => c.value === category) || categories[7];
  };

  const filteredItems = worldBuilding.filter(item => 
    filterCategory === 'all' || item.category === filterCategory
  );

  const handleNewItem = () => {
    const newItem: WorldBuilding = {
      id: Date.now().toString(),
      bookId,
      category: 'setting',
      title: '新设定',
      description: '',
      details: '',
      relatedCharacters: [],
      relatedChapters: [],
      notes: ''
    };
    
    setEditingItem(newItem);
    setIsEditing(true);
    setSelectedItem(null);
  };

  const handleEditItem = (item: WorldBuilding) => {
    setEditingItem({ ...item });
    setIsEditing(true);
    setSelectedItem(null);
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    if (worldBuilding.find(wb => wb.id === editingItem.id)) {
      onWorldBuildingUpdate(editingItem);
    } else {
      onWorldBuildingCreate(editingItem);
    }
    
    setIsEditing(false);
    setEditingItem(null);
    setSelectedItem(editingItem);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleInputChange = (field: keyof WorldBuilding, value: any) => {
    if (!editingItem) return;
    setEditingItem({ ...editingItem, [field]: value });
  };

  const toggleRelatedCharacter = (characterId: string) => {
    if (!editingItem) return;
    
    const relatedCharacters = editingItem.relatedCharacters.includes(characterId)
      ? editingItem.relatedCharacters.filter(id => id !== characterId)
      : [...editingItem.relatedCharacters, characterId];
    
    setEditingItem({ ...editingItem, relatedCharacters });
  };

  const exportWorldBuilding = () => {
    const data = {
      worldBuilding,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worldbuilding.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 设定列表 */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">世界设定</h3>
              <button
                onClick={handleNewItem}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                新建设定
              </button>
            </div>
            
            <div className="mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">全部设定</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={exportWorldBuilding}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              导出世界设定
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {worldBuilding.length === 0 ? '还没有创建任何世界设定' : '没有符合筛选条件的设定'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const categoryInfo = getCategoryInfo(item.category);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedItem?.id === item.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description || '暂无描述'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {item.relatedCharacters.length} 个相关角色
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-xs"
                          >
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个设定吗？')) {
                                onWorldBuildingDelete(item.id);
                                if (selectedItem?.id === item.id) {
                                  setSelectedItem(null);
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
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
      </div>

      {/* 设定详情/编辑 */}
      <div className="lg:col-span-2">
        {isEditing && editingItem ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {worldBuilding.find(wb => wb.id === editingItem.id) ? '编辑设定' : '新建设定'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveItem}
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
                      设定标题 *
                    </label>
                    <input
                      type="text"
                      value={editingItem.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="输入设定标题"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      设定类别
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    简要描述
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="简要描述这个世界设定"
                  />
                </div>
              </div>

              {/* 详细内容 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">详细内容</h4>
                <textarea
                  value={editingItem.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="详细描述这个世界设定的各个方面..."
                />
              </div>

              {/* 相关角色 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">相关角色</h4>
                {characters.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    还没有创建任何角色
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {characters.map((character) => (
                      <label key={character.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingItem.relatedCharacters.includes(character.id)}
                          onChange={() => toggleRelatedCharacter(character.id)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{character.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  创作备注
                </label>
                <textarea
                  value={editingItem.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="记录创作思路、灵感或其他备注"
                />
              </div>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{selectedItem.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryInfo(selectedItem.category).color}`}>
                  {getCategoryInfo(selectedItem.category).label}
                </span>
              </div>
              <button
                onClick={() => handleEditItem(selectedItem)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                编辑设定
              </button>
            </div>

            <div className="space-y-6">
              {selectedItem.description && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">简要描述</h4>
                  <p className="text-gray-700">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.details && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">详细内容</h4>
                  <div className="text-gray-700 whitespace-pre-wrap">{selectedItem.details}</div>
                </div>
              )}

              {selectedItem.relatedCharacters.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">相关角色</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.relatedCharacters.map((characterId) => {
                      const character = characters.find(c => c.id === characterId);
                      return character ? (
                        <span
                          key={characterId}
                          className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {character.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {selectedItem.relatedChapters.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">相关章节</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.relatedChapters.map((chapterId, index) => (
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

              {selectedItem.notes && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">创作备注</h4>
                  <p className="text-gray-700">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">
              请选择一个世界设定查看详情，或创建新设定
            </div>
            <button
              onClick={handleNewItem}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              创建新设定
            </button>
          </div>
        )}
      </div>
    </div>
  );
}