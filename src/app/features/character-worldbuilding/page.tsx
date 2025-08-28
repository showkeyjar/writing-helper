"use client";

import { useState, useEffect } from 'react';
import FeatureLayout from '../../components/FeatureLayout';
import CharacterManager from './components/CharacterManager';
import WorldBuildingManager from './components/WorldBuildingManager';
import { Character, WorldBuilding, BookProject } from '../../lib/bookTypes';

export default function CharacterWorldBuildingPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [worldBuilding, setWorldBuilding] = useState<WorldBuilding[]>([]);
  const [activeTab, setActiveTab] = useState<'characters' | 'worldbuilding'>('characters');
  const [bookProject, setBookProject] = useState<BookProject | null>(null);

  // 从localStorage加载数据
  useEffect(() => {
    const savedCharacters = localStorage.getItem('writing-helper-characters');
    const savedWorldBuilding = localStorage.getItem('writing-helper-worldbuilding');
    const savedProject = localStorage.getItem('writing-helper-current-project');
    
    if (savedCharacters) {
      try {
        setCharacters(JSON.parse(savedCharacters));
      } catch (error) {
        console.error('加载角色数据失败:', error);
      }
    }
    
    if (savedWorldBuilding) {
      try {
        setWorldBuilding(JSON.parse(savedWorldBuilding));
      } catch (error) {
        console.error('加载世界设定数据失败:', error);
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
  const saveCharacters = (updatedCharacters: Character[]) => {
    setCharacters(updatedCharacters);
    localStorage.setItem('writing-helper-characters', JSON.stringify(updatedCharacters));
  };

  const saveWorldBuilding = (updatedWorldBuilding: WorldBuilding[]) => {
    setWorldBuilding(updatedWorldBuilding);
    localStorage.setItem('writing-helper-worldbuilding', JSON.stringify(updatedWorldBuilding));
  };

  const handleCharacterUpdate = (updatedCharacter: Character) => {
    const updatedCharacters = characters.map(ch => 
      ch.id === updatedCharacter.id ? updatedCharacter : ch
    );
    saveCharacters(updatedCharacters);
  };

  const handleCharacterCreate = (newCharacter: Character) => {
    const updatedCharacters = [...characters, newCharacter];
    saveCharacters(updatedCharacters);
  };

  const handleCharacterDelete = (characterId: string) => {
    const updatedCharacters = characters.filter(ch => ch.id !== characterId);
    saveCharacters(updatedCharacters);
  };

  const handleWorldBuildingUpdate = (updatedWorldBuilding: WorldBuilding) => {
    const updatedItems = worldBuilding.map(wb => 
      wb.id === updatedWorldBuilding.id ? updatedWorldBuilding : wb
    );
    saveWorldBuilding(updatedItems);
  };

  const handleWorldBuildingCreate = (newWorldBuilding: WorldBuilding) => {
    const updatedItems = [...worldBuilding, newWorldBuilding];
    saveWorldBuilding(updatedItems);
  };

  const handleWorldBuildingDelete = (worldBuildingId: string) => {
    const updatedItems = worldBuilding.filter(wb => wb.id !== worldBuildingId);
    saveWorldBuilding(updatedItems);
  };

  return (
    <FeatureLayout
      title="角色与世界观设定"
      description="创建和管理书籍中的角色设定和世界观构建"
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
                <div>{characters.length} 个角色</div>
                <div>{worldBuilding.length} 个世界设定</div>
              </div>
            </div>
          </div>
        )}

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('characters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'characters'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              角色管理
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {characters.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('worldbuilding')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'worldbuilding'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              世界观设定
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                {worldBuilding.length}
              </span>
            </button>
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="min-h-[600px]">
          {activeTab === 'characters' && (
            <CharacterManager
              characters={characters}
              onCharacterUpdate={handleCharacterUpdate}
              onCharacterCreate={handleCharacterCreate}
              onCharacterDelete={handleCharacterDelete}
              bookId={bookProject?.id || 'default'}
            />
          )}
          
          {activeTab === 'worldbuilding' && (
            <WorldBuildingManager
              worldBuilding={worldBuilding}
              onWorldBuildingUpdate={handleWorldBuildingUpdate}
              onWorldBuildingCreate={handleWorldBuildingCreate}
              onWorldBuildingDelete={handleWorldBuildingDelete}
              bookId={bookProject?.id || 'default'}
              characters={characters}
            />
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}