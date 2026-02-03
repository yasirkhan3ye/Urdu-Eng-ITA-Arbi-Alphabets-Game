
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Level, AlphabetLetter, Language, TileState } from './types';
import { ALL_ALPHABET, URDU_LEVELS, ARABIC_LEVELS, ENGLISH_LEVELS, ITALIAN_LEVELS, PASHTO_LEVELS } from './constants';
import { alphabetVoiceService } from './services/alphabetVoiceService';

const NUM_EMPTY_SPACES = 2;

const renderStars = (stars: number, sizeClass: string = 'text-2xl') => {
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3].map(i => (
        <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
};

const getCharSizeClass = (gridSize: number) => {
  if (gridSize <= 3) return 'text-5xl sm:text-6xl md:text-7xl';
  if (gridSize <= 4) return 'text-3xl sm:text-4xl md:text-5xl';
  if (gridSize <= 5) return 'text-2xl sm:text-3xl md:text-4xl';
  if (gridSize <= 7) return 'text-xl sm:text-2xl';
  return 'text-lg sm:text-xl';
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('home');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [levelProgress, setLevelProgress] = useState<Record<number, number>>({});
  const [lastStars, setLastStars] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [announcement, setAnnouncement] = useState<string>('');
  
  const [celebration, setCelebration] = useState<{ letter: AlphabetLetter | null; show: boolean }>({
    letter: null,
    show: false,
  });

  // Handle dynamic document direction based on language
  useEffect(() => {
    if (selectedLanguage) {
      const rtlLanguages: Language[] = ['Urdu', 'Arabic', 'Pashto'];
      const isRtl = rtlLanguages.includes(selectedLanguage);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      document.documentElement.lang = selectedLanguage === 'Urdu' ? 'ur' : 
                                       selectedLanguage === 'Arabic' ? 'ar' : 
                                       selectedLanguage === 'Pashto' ? 'ps' : 
                                       selectedLanguage === 'Italian' ? 'it' : 'en';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const saved = localStorage.getItem('alphabet_sliding_progress_multi_empty');
    if (saved) {
      try {
        setLevelProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse progress", e);
      }
    }
  }, []);

  const saveProgress = (levelId: number, stars: number) => {
    setLevelProgress(prev => {
      const currentBest = prev[levelId] || 0;
      if (stars > currentBest) {
        const next = { ...prev, [levelId]: stars };
        localStorage.setItem('alphabet_sliding_progress_multi_empty', JSON.stringify(next));
        return next;
      }
      return prev;
    });
  };

  const startLevel = (level: Level) => {
    setCurrentLevel(level);
    setMoves(0);
    setStartTime(Date.now());
    setAnnouncement(`Starting ${level.language} level ${level.name}.`);
    
    const size = level.gridSize;
    const totalSlots = size * size;
    const numLetters = totalSlots - NUM_EMPTY_SPACES;
    
    const levelLetters = level.letters.slice(0, numLetters).map((id, idx) => {
      const original = ALL_ALPHABET.find(l => l.id === id)!;
      return { ...original, instanceId: `${id}_${idx}` };
    });
    
    const initialTiles: TileState[] = [];

    for (let i = 0; i < levelLetters.length; i++) {
      initialTiles.push({
        letter: levelLetters[i] as any,
        currentPos: i,
        targetPos: i
      });
    }

    for (let i = 0; i < NUM_EMPTY_SPACES; i++) {
      initialTiles.push({
        letter: null,
        currentPos: numLetters + i,
        targetPos: numLetters + i
      });
    }

    let tempTiles = [...initialTiles];
    let shuffleSteps = size * size * 4;

    for (let i = 0; i < shuffleSteps; i++) {
      const emptyPositions = tempTiles.filter(t => t.letter === null).map(t => t.currentPos);
      const randomEmptyPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
      const row = Math.floor(randomEmptyPos / size);
      const col = randomEmptyPos % size;
      const neighbors = [];
      if (row > 0) neighbors.push(randomEmptyPos - size);
      if (row < size - 1) neighbors.push(randomEmptyPos + size);
      if (col > 0) neighbors.push(randomEmptyPos - 1);
      if (col < size - 1) neighbors.push(randomEmptyPos + 1);

      const neighborTiles = tempTiles.filter(t => neighbors.includes(t.currentPos) && t.letter !== null);
      if (neighborTiles.length > 0) {
        const targetTile = neighborTiles[Math.floor(Math.random() * neighborTiles.length)];
        const emptyTile = tempTiles.find(t => t.currentPos === randomEmptyPos)!;
        const tempPos = targetTile.currentPos;
        targetTile.currentPos = emptyTile.currentPos;
        emptyTile.currentPos = tempPos;
      }
    }

    setTiles(tempTiles);
    setGameState('playing');
  };

  const handleTileClick = (currentPos: number) => {
    if (!currentLevel) return;
    const size = currentLevel.gridSize;
    const clickedTile = tiles.find(t => t.currentPos === currentPos);
    if (!clickedTile || !clickedTile.letter) return;
    const emptyTiles = tiles.filter(t => t.letter === null);
    const row = Math.floor(currentPos / size);
    const col = currentPos % size;
    
    const targetEmptyTile = emptyTiles.find(et => {
      const eRow = Math.floor(et.currentPos / size);
      const eCol = et.currentPos % size;
      return (Math.abs(row - eRow) === 1 && col === eCol) || (Math.abs(col - eCol) === 1 && row === eRow);
    });

    if (targetEmptyTile) {
      const emptyPos = targetEmptyTile.currentPos;
      const newTiles = tiles.map(t => {
        if (t === clickedTile) return { ...t, currentPos: emptyPos };
        if (t === targetEmptyTile) return { ...t, currentPos: currentPos };
        return t;
      });
      setTiles(newTiles);
      setMoves(m => m + 1);
      alphabetVoiceService.speak(clickedTile.letter.char, clickedTile.letter.language);
      
      if (clickedTile.targetPos === emptyPos) {
        setCelebration({ letter: clickedTile.letter, show: true });
        setTimeout(() => setCelebration(prev => ({ ...prev, show: false })), 2000);
      }
      
      if (newTiles.every((t) => t.letter === null || t.targetPos === t.currentPos)) {
        let stars = 1;
        const sec = (Date.now() - startTime) / 1000;
        if (sec < (size * size * 15)) stars = 3;
        else if (sec < (size * size * 40)) stars = 2;
        setLastStars(stars);
        saveProgress(currentLevel.id, stars);
        setTimeout(() => setGameState('complete'), 1000);
      }
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-6 sky-theme overflow-hidden">
      <h1 className="text-5xl sm:text-7xl md:text-8xl font-kids text-white mb-4 sm:mb-8 drop-shadow-lg">Alphabet Slide</h1>
      <p className="text-lg sm:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-lg font-kids uppercase tracking-wider px-4">PLAY AND LEARN</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button 
          onClick={() => setGameState('language-select')}
          className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-indigo-900 font-bold py-5 px-8 sm:py-6 sm:px-12 rounded-full text-2xl sm:text-3xl shadow-xl transition-all border-4 border-white"
        >
          TAP TO PLAY
        </button>
      </div>
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="flex flex-col items-center justify-center h-full w-full sky-theme p-4 sm:p-6 overflow-hidden">
      <h2 className="text-3xl sm:text-5xl font-kids text-white mb-6 sm:mb-10 drop-shadow-lg text-center">Pick Your Journey</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 w-full max-w-4xl justify-items-center items-stretch max-h-[70vh] overflow-y-auto px-2">
        {[
          { lang: 'Urdu', icon: '🇵🇰', label: 'اردو زبان' },
          { lang: 'Pashto', icon: '🇦🇫', label: 'پښتو' },
          { lang: 'Arabic', icon: '🇸🇦', label: 'اللغة العربية' },
          { lang: 'English', icon: '🇬🇧', label: 'English' },
          { lang: 'Italian', icon: '🇮🇹', label: 'Italiano' }
        ].map(({ lang, icon, label }) => (
          <button 
            key={lang}
            onClick={() => { setSelectedLanguage(lang as any); setGameState('level-select'); }}
            className={`bg-white w-full h-32 sm:h-44 md:h-56 rounded-3xl sm:rounded-[2.5rem] shadow-lg active:scale-95 transition-all border-4 group flex flex-col items-center justify-center p-2 text-center
              ${lang === 'Urdu' ? 'border-blue-400' : lang === 'Arabic' ? 'border-orange-400' : lang === 'Pashto' ? 'border-amber-600' : 'border-indigo-400'}`}
          >
            <span className="text-3xl sm:text-5xl block mb-1 group-hover:rotate-12 transition-transform" aria-hidden="true">{icon}</span>
            <div className="flex flex-col items-center justify-center gap-0 w-full overflow-hidden">
              <span className={`text-lg sm:text-2xl block text-indigo-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 ${lang === 'Urdu' || lang === 'Pashto' ? 'urdu-text' : lang === 'Arabic' ? 'arabic-text' : ''}`}>
                {label}
              </span>
              <span className="text-[10px] sm:text-sm block text-indigo-400 font-kids uppercase tracking-wider">
                {lang}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => { setGameState('home'); setSelectedLanguage(null); }} className="mt-6 sm:mt-10 text-white text-lg sm:text-xl font-bold underline hover:opacity-80 active:scale-95">Go Back</button>
    </div>
  );

  const renderLevelSelect = () => {
    let levels = URDU_LEVELS;
    if (selectedLanguage === 'Arabic') levels = ARABIC_LEVELS;
    else if (selectedLanguage === 'English') levels = ENGLISH_LEVELS;
    else if (selectedLanguage === 'Italian') levels = ITALIAN_LEVELS;
    else if (selectedLanguage === 'Pashto') levels = PASHTO_LEVELS;
    
    let themeClass = 'sky-theme'; // Default
    if (selectedLanguage === 'Arabic') themeClass = 'desert-theme';
    if (selectedLanguage === 'Pashto') themeClass = 'pashto-theme';

    return (
      <div className={`h-full w-full p-4 sm:p-8 ${themeClass} flex flex-col items-center overflow-hidden`}>
        <div className="w-full max-w-6xl flex flex-col h-full">
          <button onClick={() => { setGameState('language-select'); setSelectedLanguage(null); }} className="mb-4 text-indigo-900 bg-white/50 backdrop-blur-sm self-start px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all text-sm sm:text-lg">← Change Language</button>
          <h2 className="text-2xl sm:text-4xl font-kids text-white mb-6 text-center uppercase drop-shadow-md">{selectedLanguage} Levels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 overflow-y-auto flex-1 pb-10 px-2 scroll-smooth">
            {levels.map(level => {
              const stars = levelProgress[level.id] || 0;
              return (
                <button key={level.id} onClick={() => startLevel(level)} className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-[2.5rem] shadow-md active:scale-95 transition-all group flex flex-col items-center border-2 border-transparent hover:border-indigo-200">
                  <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-full mb-3 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md border-2 border-white ${level.difficulty === 'easy' ? 'bg-green-400' : level.difficulty === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`}>{level.gridSize}x{level.gridSize}</div>
                  <h3 className="text-sm sm:text-lg font-bold text-indigo-800 mb-1 text-center line-clamp-1">{level.name.split(':')[1] || level.name}</h3>
                  <div className="mt-1">{renderStars(stars, 'text-xl sm:text-3xl')}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    if (!currentLevel) return null;
    const size = currentLevel.gridSize;
    const charSizeClass = getCharSizeClass(size);
    
    let themeClass = 'bg-blue-100';
    if (selectedLanguage === 'Arabic') themeClass = 'desert-theme';
    if (selectedLanguage === 'Pashto') themeClass = 'pashto-theme';

    return (
      <div className={`h-full w-full flex flex-col items-center justify-between p-2 sm:p-4 ${themeClass} relative overflow-hidden`}>
        {/* Header UI */}
        <div className="w-full max-w-xl flex justify-between items-center bg-white/90 backdrop-blur-md p-2 sm:p-3 rounded-2xl shadow-lg border-2 border-white/50 z-10">
          <button onClick={() => setGameState('level-select')} className="text-indigo-600 font-bold text-[10px] sm:text-xs px-3 py-2 hover:bg-white hover:shadow-sm active:scale-90 transition-all rounded-xl border border-indigo-50">Menu ←</button>
          <div className="text-xs sm:text-sm font-kids text-indigo-900 px-2 line-clamp-1 flex-1 text-center font-bold">{currentLevel.name.split(':')[1] || currentLevel.name}</div>
          <div className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-50/50 px-2 sm:px-3 py-2 rounded-xl border border-indigo-100 whitespace-nowrap">Moves: {moves}</div>
        </div>

        {/* Board Container */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="game-board-container relative bg-indigo-900/10 p-1 sm:p-2 rounded-none shadow-inner border-[6px] sm:border-8 border-white/40" role="grid">
            {tiles.map((tile) => {
              const row = Math.floor(tile.currentPos / size);
              const col = tile.currentPos % size;
              const isCorrect = tile.targetPos === tile.currentPos;
              
              const gap = 4; // Gap between tiles in pixels
              const cellStyle: React.CSSProperties = {
                position: 'absolute',
                width: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                height: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                top: `calc(${row * (100 / size)}% + ${gap}px)`,
                left: `calc(${col * (100 / size)}% + ${gap}px)`,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              };
              
              if (!tile.letter) return <div key={`empty-${tile.targetPos}`} style={cellStyle} className="rounded-none bg-black/5 border-2 border-dashed border-white/10 flex items-center justify-center pointer-events-none" aria-hidden="true"></div>;
              
              const fontClass = tile.letter.language === 'Urdu' || tile.letter.language === 'Pashto' ? 'urdu-text' : tile.letter.language === 'Arabic' ? 'arabic-text' : '';
              
              return (
                <button 
                  key={(tile.letter as any).instanceId} 
                  onClick={() => handleTileClick(tile.currentPos)} 
                  style={cellStyle} 
                  className={`rounded-none flex flex-col items-center justify-center shadow-md sm:shadow-lg transition-all transform text-white border-2 border-white/40 group ${tile.letter.color} ${isCorrect ? 'tile-correct brightness-105' : 'active:brightness-110 active:scale-95'}`} 
                  aria-label={`Tile ${tile.letter.name}`}
                >
                  <span className="absolute top-0.5 left-1 text-[6px] sm:text-[10px] opacity-40 font-bold" aria-hidden="true">{tile.targetPos + 1}</span>
                  <span className={`${fontClass} ${charSizeClass} pointer-events-none drop-shadow-md leading-none`} aria-hidden="true">{tile.letter.char}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="w-full flex justify-center pb-4 sm:pb-8 pt-2">
          <button onClick={() => startLevel(currentLevel)} className="bg-white text-indigo-600 font-bold text-lg sm:text-2xl px-10 py-4 sm:px-16 sm:py-6 rounded-3xl shadow-xl hover:bg-indigo-50 active:scale-95 transition-all border-4 border-indigo-200 flex items-center gap-3">
            <span>Shuffle</span> <span className="text-2xl sm:text-3xl" aria-hidden="true">🔀</span>
          </button>
        </div>

        {/* Individual Success Celebration */}
        {celebration.show && celebration.letter && (
          <div className="fixed bottom-24 sm:bottom-32 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-bounce">
            <div className="bg-white/95 backdrop-blur px-6 py-4 sm:px-8 sm:py-5 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 flex flex-col items-center">
              <span className={`text-4xl sm:text-5xl ${celebration.letter.language === 'Urdu' || celebration.letter.language === 'Pashto' ? 'urdu-text' : celebration.letter.language === 'Arabic' ? 'arabic-text' : ''} ${celebration.letter.color.replace('bg-', 'text-')}`}>{celebration.letter.char}</span>
              <p className="text-sm sm:text-xl font-kids text-indigo-900 uppercase tracking-tighter">{celebration.letter.name}</p>
              <p className="text-xs sm:text-lg font-kids text-green-600">{celebration.letter.exampleWord}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-indigo-900 bg-opacity-95 flex flex-col items-center justify-center z-[100] text-center p-6 overflow-hidden">
      <h2 className="text-6xl sm:text-9xl font-kids text-white mb-6 drop-shadow-xl uppercase">DONE</h2>
      <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[3rem] mb-8 sm:mb-12 shadow-2xl border-4 border-white/20 w-full max-w-sm">
        <p className="text-2xl sm:text-4xl text-yellow-400 mb-1 font-kids uppercase tracking-widest font-bold">VICTORY</p>
        <p className="text-sm sm:text-xl text-indigo-200 mb-6 sm:mb-8 font-kids uppercase font-bold">PUZZLE MASTER</p>
        <div className="flex gap-2 sm:gap-4 text-6xl sm:text-8xl mb-2">
          {[1, 2, 3].map(i => <span key={i} className={`${i <= lastStars ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'text-indigo-900/50'} transition-all duration-1000`}>★</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button onClick={() => {
          let levels = URDU_LEVELS;
          if (selectedLanguage === 'Arabic') levels = ARABIC_LEVELS;
          else if (selectedLanguage === 'English') levels = ENGLISH_LEVELS;
          else if (selectedLanguage === 'Italian') levels = ITALIAN_LEVELS;
          else if (selectedLanguage === 'Pashto') levels = PASHTO_LEVELS;
          const idx = levels.findIndex(l => l.id === currentLevel?.id);
          const next = levels[idx + 1];
          if (next) startLevel(next);
          else setGameState('level-select');
        }} className="bg-orange-500 text-white font-bold py-4 sm:py-5 px-8 rounded-2xl text-2xl sm:text-3xl hover:bg-orange-400 active:scale-95 transition-all shadow-[0_6px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none border-2 border-white/20 flex items-center justify-center gap-2"><span>NEXT</span><span>→</span></button>
        <button onClick={() => startLevel(currentLevel!)} className="bg-blue-600 text-white font-bold py-4 sm:py-5 px-8 rounded-2xl text-2xl sm:text-3xl hover:bg-blue-500 active:scale-95 transition-all shadow-[0_6px_0_rgb(30,64,175)] active:translate-y-1 active:shadow-none border-2 border-white/20 flex items-center justify-center gap-2"><span>AGAIN</span><span>↻</span></button>
        <button onClick={() => setGameState('level-select')} className="bg-white/10 text-white font-bold py-3 sm:py-4 px-8 rounded-2xl text-xl sm:text-2xl hover:bg-white/20 active:scale-95 transition-all border-2 border-white/20 uppercase">Menu</button>
      </div>
    </div>
  );

  return (
    <div className="select-none h-full w-full overflow-hidden fixed inset-0">
      <div className="sr-only" aria-live="polite">{announcement}</div>
      {gameState === 'home' && renderHome()}
      {gameState === 'language-select' && renderLanguageSelect()}
      {gameState === 'level-select' && renderLevelSelect()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'complete' && renderComplete()}
    </div>
  );
};

export default App;
