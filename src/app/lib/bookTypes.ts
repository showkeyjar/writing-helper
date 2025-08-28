// 书籍相关的类型定义

export interface BookProject {
  id: string;
  title: string;
  description: string;
  genre: string;
  targetWordCount: number;
  currentWordCount: number;
  status: 'planning' | 'writing' | 'editing' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  outline?: BookOutline;
  chapters: Chapter[];
  characters: Character[];
  worldBuilding: WorldBuilding[];
  researchNotes: ResearchNote[];
}

export interface BookOutline {
  id: string;
  bookId: string;
  structure: OutlineNode[];
  theme: string;
  targetAudience: string;
  keyMessages: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OutlineNode {
  id: string;
  title: string;
  description: string;
  type: 'part' | 'chapter' | 'section' | 'scene';
  level: number;
  order: number;
  parentId?: string;
  children: OutlineNode[];
  estimatedWordCount: number;
  status: 'planned' | 'in_progress' | 'completed';
  notes: string;
  keyPoints: string[];
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: 'draft' | 'review' | 'final';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  outlineNodeId?: string;
}

export interface Character {
  id: string;
  bookId: string;
  name: string;
  description: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  appearance: string;
  personality: string;
  background: string;
  motivations: string;
  relationships: CharacterRelationship[];
  developmentArc: string;
  notes: string;
}

export interface CharacterRelationship {
  characterId: string;
  relationshipType: string;
  description: string;
}

export interface WorldBuilding {
  id: string;
  bookId: string;
  category: 'setting' | 'culture' | 'history' | 'technology' | 'magic' | 'politics' | 'economy' | 'other';
  title: string;
  description: string;
  details: string;
  relatedCharacters: string[];
  relatedChapters: string[];
  notes: string;
}

export interface ResearchNote {
  id: string;
  bookId: string;
  title: string;
  content: string;
  source: string;
  category: string;
  tags: string[];
  relatedChapters: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingGoal {
  id: string;
  bookId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'milestone';
  target: number;
  current: number;
  unit: 'words' | 'chapters' | 'scenes';
  deadline: Date;
  description: string;
  completed: boolean;
}

// 提纲生成相关的类型
export interface OutlineGenerationRequest {
  bookTitle: string;
  genre: string;
  theme: string;
  targetAudience: string;
  targetWordCount: number;
  keyElements: string[];
  structure: 'three-act' | 'hero-journey' | 'five-act' | 'custom';
  additionalRequirements: string;
}

export interface OutlineGenerationResponse {
  outline: OutlineNode[];
  summary: string;
  recommendations: string[];
}