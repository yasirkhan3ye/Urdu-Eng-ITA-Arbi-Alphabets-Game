
export type Language = 'Urdu' | 'Arabic' | 'English' | 'Italian' | 'Pashto';

export interface AlphabetLetter {
  id: string;
  char: string;
  name: string;
  exampleWord: string;
  exampleImage: string;
  color: string;
  language: Language;
}

export type GameState = 'home' | 'language-select' | 'level-select' | 'playing' | 'complete';

export interface Level {
  id: number;
  name: string;
  letters: string[]; // IDs of letters included
  gridSize: number;  // 3 for 3x3, 4 for 4x4, etc.
  difficulty: 'easy' | 'medium' | 'hard';
  language: Language;
}

export interface LevelProgress {
  levelId: number;
  stars: number;
  language: Language;
}

export interface TileState {
  letter: AlphabetLetter | null; // null represents the empty slot
  currentPos: number;
  targetPos: number;
}
