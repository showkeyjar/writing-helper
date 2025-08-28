"use client";

import { useState } from 'react';
import { Character, CharacterRelationship } from '../../../lib/bookTypes';

interface CharacterManagerProps {
  characters: Character[];
  onCharacterUpdate: (character: Character) => void;
  onCharacterCreate: (character: Character) => void;
  onCharacterDelete: (characterId: string) => void;
  bookId: string;
}

export default function CharacterManager({
  characters,
  onCharacterUpdate,
  onCharacterCreate,
  onCharacterDelete,
  bookId
}: CharacterManagerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'protagonist' | 'antagonist' | 'supporting' | 'minor'>('all');

  const roles = [
    { value: 'protagonist', label: '主角', color: 'bg-red-100 text-red-800' },
    { value: 'antagonist', label: '反派', color: 'bg-purple-100 text-purple-800' },
    { value: 'supporting', label: '配角', color: 'bg-blue-100 text-blue-800' },
    { value: 'minor', label: '次要角色', color: 'bg-gray-100 text-gray-800' }
  ];

  const getRoleInfo = (role: Character['role']) => {
    return roles.find(r => r.value === role) || roles[3];
  };

  const filteredCharacters = characters.filter(character => 
    filterRole === 'all' || character.role === filterRole
  );

  const handleNewCharacter = () => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      bookId,
      name: '新角色',
      description: '',
      role: 'supporting',
      appearance: '',
      personality: '',
      background: '',
      motivations: '',
      relationships: [],
      developmentArc: '',
      notes: ''
    };
    
    setEditingCharacter(newCharacter);
    setIsEditing(true);
    setSelectedCharacter(null);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter({ ...character });
    setIsEditing(true);
    setSelectedCharacter(null);
  };

  const handleSaveCharacter = () => {
    if (!editingCharacter) return;
    
    if (characters.find(c => c.id === editingCharacter.id)) {
      onCharacterUpdate(editingCharacter);
    } else {
      onCharacterCreate(editingCharacter);
    }
    
    setIsEditing(false);
    setEditingCharacter(null);
    setSelectedCharacter(editingCharacter);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingCharacter(null);
  };

  const handleInputChange = (field: keyof Character, value: any) => {
    if (!editingCharacter) return;
    setEditingCharacter({ ...editingCharacter, [field]: value });
  };

  const addRelationship = () => {
    if (!editingCharacter) return;
    
    const newRelationship: CharacterRelationship = {
      characterId: '',
      relationshipType: '',
      description: ''
    };
    
    setEditingCharacter({
      ...editingCharacter,
      relationships: [...editingCharacter.relationships, newRelationship]
    });
  };

  const updateRelationship = (index: number, updates: Partial<CharacterRelationship>) => {
    if (!editingCharacter) return;
    
    const updatedRelationships = editingCharacter.relationships.map((rel, i) =>
      i === index ? { ...rel, ...updates } : rel
    );
    
    setEditingCharacter({
      ...editingCharacter,
      relationships: updatedRelationships
    });
  };

  const removeRelationship = (index: number) => {
    if (!editingCharacter) return;
    
    const updatedRelationships = editingCharacter.relationships.filter((_, i) => i !== index);
    setEditingCharacter({
      ...editingCharacter,
      relationships: updatedRelationships
    });
  };

  const exportCharacters = () => {
    const data = {
      characters,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'characters.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 角色列表 */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">角色列表</h3>
              <button
                onClick={handleNewCharacter}
                className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
              >
                新建角色
              </button>
            </div>
            
            <div className="mb-4">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">全部角色</option>
                <option value="protagonist">主角</option>
                <option value="antagonist">反派</option>
                <option value="supporting">配角</option>
                <option value="minor">次要角色</option>
              </select>
            </div>
            
            <button
              onClick={exportCharacters}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              导出角色数据
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredCharacters.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {characters.length === 0 ? '还没有创建任何角色' : '没有符合筛选条件的角色'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCharacters.map((character) => {
                  const roleInfo = getRoleInfo(character.role);
                  return (
                    <div
                      key={character.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedCharacter?.id === character.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedCharacter(character)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{character.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {character.description || '暂无描述'}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {character.relationships.length} 个关系
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCharacter(character);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-xs"
                          >
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('确定要删除这个角色吗？')) {
                                onCharacterDelete(character.id);
                                if (selectedCharacter?.id === character.id) {
                                  setSelectedCharacter(null);
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

      {/* 角色详情/编辑 */}
      <div className="lg:col-span-2">
        {isEditing && editingCharacter ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {characters.find(c => c.id === editingCharacter.id) ? '编辑角色' : '新建角色'}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveCharacter}
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
                      角色姓名 *
                    </label>
                    <input
                      type="text"
                      value={editingCharacter.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="输入角色姓名"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      角色定位
                    </label>
                    <select
                      value={editingCharacter.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {roles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    角色描述
                  </label>
                  <textarea
                    value={editingCharacter.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="简要描述角色的基本信息"
                  />
                </div>
              </div>

              {/* 详细设定 */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">详细设定</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      外貌特征
                    </label>
                    <textarea
                      value={editingCharacter.appearance}
                      onChange={(e) => handleInputChange('appearance', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="描述角色的外貌特征"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      性格特点
                    </label>
                    <textarea
                      value={editingCharacter.personality}
                      onChange={(e) => handleInputChange('personality', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="描述角色的性格特点和行为习惯"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      背景故事
                    </label>
                    <textarea
                      value={editingCharacter.background}
                      onChange={(e) => handleInputChange('background', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="描述角色的成长经历和背景故事"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      动机目标
                    </label>
                    <textarea
                      value={editingCharacter.motivations}
                      onChange={(e) => handleInputChange('motivations', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="描述角色的动机、目标和追求"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      发展弧线
                    </label>
                    <textarea
                      value={editingCharacter.developmentArc}
                      onChange={(e) => handleInputChange('developmentArc', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="描述角色在故事中的成长和变化"
                    />
                  </div>
                </div>
              </div>

              {/* 人物关系 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">人物关系</h4>
                  <button
                    onClick={addRelationship}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    添加关系
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editingCharacter.relationships.map((relationship, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={relationship.characterId}
                          onChange={(e) => updateRelationship(index, { characterId: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="">选择角色</option>
                          {characters
                            .filter(c => c.id !== editingCharacter.id)
                            .map(character => (
                              <option key={character.id} value={character.id}>
                                {character.name}
                              </option>
                            ))}
                        </select>
                        
                        <input
                          type="text"
                          value={relationship.relationshipType}
                          onChange={(e) => updateRelationship(index, { relationshipType: e.target.value })}
                          placeholder="关系类型（如：朋友、敌人、恋人）"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                        
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={relationship.description}
                            onChange={(e) => updateRelationship(index, { description: e.target.value })}
                            placeholder="关系描述"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                          <button
                            onClick={() => removeRelationship(index)}
                            className="px-2 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {editingCharacter.relationships.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      还没有添加人物关系
                    </div>
                  )}
                </div>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  创作备注
                </label>
                <textarea
                  value={editingCharacter.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="记录创作思路、灵感或其他备注"
                />
              </div>
            </div>
          </div>
        ) : selectedCharacter ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-medium text-gray-900">{selectedCharacter.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleInfo(selectedCharacter.role).color}`}>
                  {getRoleInfo(selectedCharacter.role).label}
                </span>
              </div>
              <button
                onClick={() => handleEditCharacter(selectedCharacter)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                编辑角色
              </button>
            </div>

            <div className="space-y-6">
              {selectedCharacter.description && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">角色描述</h4>
                  <p className="text-gray-700">{selectedCharacter.description}</p>
                </div>
              )}

              {selectedCharacter.appearance && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">外貌特征</h4>
                  <p className="text-gray-700">{selectedCharacter.appearance}</p>
                </div>
              )}

              {selectedCharacter.personality && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">性格特点</h4>
                  <p className="text-gray-700">{selectedCharacter.personality}</p>
                </div>
              )}

              {selectedCharacter.background && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">背景故事</h4>
                  <p className="text-gray-700">{selectedCharacter.background}</p>
                </div>
              )}

              {selectedCharacter.motivations && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">动机目标</h4>
                  <p className="text-gray-700">{selectedCharacter.motivations}</p>
                </div>
              )}

              {selectedCharacter.developmentArc && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">发展弧线</h4>
                  <p className="text-gray-700">{selectedCharacter.developmentArc}</p>
                </div>
              )}

              {selectedCharacter.relationships.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">人物关系</h4>
                  <div className="space-y-2">
                    {selectedCharacter.relationships.map((relationship, index) => {
                      const relatedCharacter = characters.find(c => c.id === relationship.characterId);
                      return (
                        <div key={index} className="p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {relatedCharacter?.name || '未知角色'}
                            </span>
                            <span className="text-gray-500">-</span>
                            <span className="text-indigo-600">{relationship.relationshipType}</span>
                          </div>
                          {relationship.description && (
                            <p className="text-sm text-gray-600 mt-1">{relationship.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCharacter.notes && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">创作备注</h4>
                  <p className="text-gray-700">{selectedCharacter.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg mb-4">
              请选择一个角色查看详情，或创建新角色
            </div>
            <button
              onClick={handleNewCharacter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              创建新角色
            </button>
          </div>
        )}
      </div>
    </div>
  );
}