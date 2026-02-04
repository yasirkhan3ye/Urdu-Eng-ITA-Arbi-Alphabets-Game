
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (selectedLanguage) {
      const rtlLanguages: Language[] = ['Urdu', 'Arabic', 'Pashto'];
      const isRtl = rtlLanguages.includes(selectedLanguage);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [selectedLanguage]);

  useEffect(() => {
    const saved = localStorage.getItem('alphabet_sliding_progress_multi_empty');
    if (saved) {
      try {
        setLevelProgress(JSON.parse(saved));
      } catch (e) { console.error(e); }
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
      initialTiles.push({ letter: levelLetters[i] as any, currentPos: i, targetPos: i });
    }
    for (let i = 0; i < NUM_EMPTY_SPACES; i++) {
      initialTiles.push({ letter: null, currentPos: numLetters + i, targetPos: numLetters + i });
    }

    let tempTiles = [...initialTiles];
    let shuffleSteps = size * size * 8;
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
        setTimeout(() => setCelebration(prev => ({ ...prev, show: false })), 1500);
      }
      
      if (newTiles.every((t) => t.letter === null || t.targetPos === t.currentPos)) {
        let stars = 1;
        const sec = (Date.now() - startTime) / 1000;
        if (sec < (size * size * 10)) stars = 3;
        else if (sec < (size * size * 25)) stars = 2;
        setLastStars(stars);
        saveProgress(currentLevel.id, stars);
        setTimeout(() => setGameState('complete'), 800);
      }
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-6 sky-theme overflow-hidden pt-safe pb-safe px-safe">
      <h1 className="text-6xl sm:text-8xl md:text-9xl font-kids text-white mb-6 drop-shadow-2xl">Alphabet Slide</h1>
      <p className="text-xl sm:text-3xl text-blue-100 mb-12 max-w-lg font-kids uppercase tracking-widest px-4">Tap to Learn & Play</p>
      <button 
        onClick={() => setGameState('language-select')}
        className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-indigo-900 font-bold py-6 px-12 sm:py-8 sm:px-20 rounded-full text-3xl sm:text-5xl shadow-[0_12px_0_rgb(180,130,0)] active:translate-y-2 active:shadow-none transition-all border-4 border-white"
      >
        PLAY NOW
      </button>
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="flex flex-col items-center h-full w-full sky-theme pt-safe pb-safe px-safe overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl px-4 py-4 sm:py-8">
        <h2 className="text-3xl sm:text-5xl font-kids text-white mb-6 sm:mb-10 drop-shadow-lg text-center uppercase tracking-wider">Pick Your Journey</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full justify-items-center items-stretch max-h-[65vh] overflow-y-auto pr-1">
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
              className={`bg-white w-full h-auto min-h-[140px] sm:min-h-[200px] rounded-[2rem] sm:rounded-[3rem] shadow-xl active:scale-95 transition-all border-4 group flex flex-col items-center justify-center p-4 text-center
                ${lang === 'Urdu' ? 'border-blue-400' : lang === 'Arabic' ? 'border-orange-400' : lang === 'Pashto' ? 'border-amber-600' : 'border-indigo-400'}`}
            >
              <span className="text-4xl sm:text-6xl mb-2 sm:mb-3 transition-transform group-hover:scale-110" aria-hidden="true">{icon}</span>
              <div className="flex flex-col items-center justify-center w-full">
                <span className={`text-lg sm:text-2xl font-bold text-indigo-950 leading-tight mb-1 ${lang === 'Urdu' || lang === 'Pashto' ? 'urdu-text' : lang === 'Arabic' ? 'arabic-text' : ''}`}>
                  {label}
                </span>
                <span className="text-[10px] sm:text-sm font-kids text-indigo-400 uppercase tracking-widest font-black opacity-60">
                  {lang}
                </span>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => { setGameState('home'); setSelectedLanguage(null); }} className="mt-6 sm:mt-10 text-white text-lg sm:text-2xl font-bold underline hover:opacity-80 active:scale-95 decoration-2 underline-offset-4">← Go Back</button>
      </div>
    </div>
  );

  const renderLevelSelect = () => {
    const levels = selectedLanguage === 'Arabic' ? ARABIC_LEVELS : 
                   selectedLanguage === 'English' ? ENGLISH_LEVELS : 
                   selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                   selectedLanguage === 'Pashto' ? PASHTO_LEVELS : URDU_LEVELS;
    
    const themeClass = selectedLanguage === 'Arabic' ? 'desert-theme' : selectedLanguage === 'Pashto' ? 'pashto-theme' : 'sky-theme';

    return (
      <div className={`h-full w-full pt-safe pb-safe px-safe ${themeClass} flex flex-col items-center overflow-hidden`}>
        <div className="w-full max-w-6xl flex flex-col h-full p-4 sm:p-8">
          <button onClick={() => { setGameState('language-select'); setSelectedLanguage(null); }} className="mb-4 text-indigo-900 bg-white/80 backdrop-blur-lg self-start px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all text-sm sm:text-lg shadow-md border-2 border-white/50">← Change Language</button>
          <h2 className="text-3xl sm:text-5xl font-kids text-white mb-6 text-center uppercase drop-shadow-md tracking-widest">{selectedLanguage} Adventure</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 overflow-y-auto flex-1 pb-12 px-2">
            {levels.map(level => {
              const stars = levelProgress[level.id] || 0;
              return (
                <button key={level.id} onClick={() => startLevel(level)} className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl active:scale-95 transition-all group flex flex-col items-center border-4 border-transparent hover:border-indigo-200">
                  <div className={`w-16 h-16 sm:w-28 sm:h-28 rounded-full mb-4 flex items-center justify-center text-2xl sm:text-5xl font-black text-white shadow-xl border-4 border-white ${level.difficulty === 'easy' ? 'bg-green-400' : level.difficulty === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`}>{level.gridSize}x{level.gridSize}</div>
                  <h3 className="text-lg sm:text-2xl font-black text-indigo-900 mb-2 text-center">{level.name.split(':')[1] || level.name}</h3>
                  <div className="mt-1">{renderStars(stars, 'text-2xl sm:text-5xl')}</div>
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
    const themeClass = selectedLanguage === 'Arabic' ? 'desert-theme' : selectedLanguage === 'Pashto' ? 'pashto-theme' : 'bg-blue-100';

    return (
      <div className={`h-full w-full flex flex-col items-center justify-between pt-safe pb-safe px-safe ${themeClass} relative overflow-hidden`}>
        {/* Header respects notification bar via pt-safe */}
        <div className="w-full max-w-xl flex justify-between items-center bg-white/95 backdrop-blur-xl p-3 sm:p-5 rounded-3xl shadow-2xl border-2 border-white/50 z-20 mx-auto mt-2 sm:mt-4">
          <button onClick={() => setGameState('level-select')} className="text-indigo-600 font-black text-xs sm:text-lg px-4 py-2.5 hover:bg-white hover:shadow-sm active:scale-90 transition-all rounded-2xl border border-indigo-100 bg-indigo-50/50">MENU ←</button>
          <div className="text-sm sm:text-2xl font-kids text-indigo-900 px-2 flex-1 text-center font-black tracking-tight uppercase">{currentLevel.name.split(':')[1] || currentLevel.name}</div>
          <div className="text-xs sm:text-lg font-black text-white bg-indigo-600 px-4 py-2.5 rounded-2xl border border-indigo-700 shadow-lg">MOVES: {moves}</div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full p-6">
          <div className="game-board-container relative bg-indigo-950/20 p-1.5 sm:p-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-[8px] sm:border-[12px] border-white/80" role="grid">
            {tiles.map((tile) => {
              const row = Math.floor(tile.currentPos / size);
              const col = tile.currentPos % size;
              const isCorrect = tile.targetPos === tile.currentPos;
              const gap = 4;
              const cellStyle: React.CSSProperties = {
                position: 'absolute',
                width: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                height: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                top: `calc(${row * (100 / size)}% + ${gap}px)`,
                left: `calc(${col * (100 / size)}% + ${gap}px)`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              };
              
              if (!tile.letter) return <div key={`empty-${tile.targetPos}`} style={cellStyle} className="bg-black/20 border-2 border-dashed border-white/30 flex items-center justify-center" aria-hidden="true"></div>;
              
              const fontClass = (tile.letter.language === 'Urdu' || tile.letter.language === 'Pashto') ? 'urdu-text' : tile.letter.language === 'Arabic' ? 'arabic-text' : '';
              
              return (
                <button 
                  key={(tile.letter as any).instanceId} 
                  onClick={() => handleTileClick(tile.currentPos)} 
                  style={cellStyle} 
                  className={`flex flex-col items-center justify-center shadow-2xl transition-all transform text-white border-2 border-white/60 ${tile.letter.color} ${isCorrect ? 'tile-correct brightness-105 scale-[1.02]' : 'active:brightness-110 active:scale-95'}`} 
                >
                  <span className="absolute top-1 left-1.5 text-[10px] sm:text-[14px] opacity-60 font-black">{tile.targetPos + 1}</span>
                  <span className={`${fontClass} ${charSizeClass} pointer-events-none drop-shadow-2xl leading-none`}>{tile.letter.char}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full flex justify-center pb-8 sm:pb-16 pt-2 px-safe">
          <button onClick={() => startLevel(currentLevel)} className="bg-white text-indigo-600 font-black text-2xl sm:text-4xl px-14 py-6 sm:px-24 sm:py-10 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:bg-indigo-50 active:translate-y-2 active:shadow-none transition-all border-4 border-indigo-100 flex items-center gap-4 group">
            <span className="group-hover:rotate-12 transition-transform">SHUFFLE</span> <span className="text-4xl sm:text-6xl" aria-hidden="true">🔀</span>
          </button>
        </div>

        {celebration.show && celebration.letter && (
          <div className="fixed bottom-36 sm:bottom-48 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-bounce">
            <div className="bg-white/98 backdrop-blur px-10 py-6 sm:px-16 sm:py-10 rounded-[3rem] sm:rounded-[4rem] shadow-[0_20px_60px_rgba(0,0,0,0.4)] border-4 border-yellow-400 flex flex-col items-center">
              <span className={`text-6xl sm:text-8xl ${celebration.letter.language === 'Urdu' || celebration.letter.language === 'Pashto' ? 'urdu-text' : celebration.letter.language === 'Arabic' ? 'arabic-text' : ''} ${celebration.letter.color.replace('bg-', 'text-')}`}>{celebration.letter.char}</span>
              <p className="text-xl sm:text-3xl font-kids text-indigo-900 uppercase tracking-tighter mt-2 font-black">{celebration.letter.name}</p>
              <p className="text-lg sm:text-2xl font-kids text-green-600 font-black">{celebration.letter.exampleWord}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-indigo-950/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[100] text-center p-6 pt-safe pb-safe px-safe">
      <h2 className="text-8xl sm:text-[12rem] font-kids text-white mb-8 drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)] uppercase tracking-tighter">SUCCESS!</h2>
      <div className="flex flex-col items-center bg-white/15 backdrop-blur-md p-10 sm:p-20 rounded-[4rem] sm:rounded-[5rem] mb-12 shadow-2xl border-4 border-white/20 w-full max-w-lg">
        <p className="text-4xl sm:text-6xl text-yellow-400 mb-2 font-kids uppercase tracking-widest font-black">PUZZLE SOLVED</p>
        <div className="flex gap-4 sm:gap-8 text-8xl sm:text-[11rem] mb-6">
          {[1, 2, 3].map(i => <span key={i} className={`${i <= lastStars ? 'text-yellow-400 scale-110 drop-shadow-[0_0_30px_rgba(250,204,21,1)]' : 'text-indigo-950/50'} transition-all duration-1000`}>★</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-md">
        <button onClick={() => {
          const levels = selectedLanguage === 'Arabic' ? ARABIC_LEVELS : 
                         selectedLanguage === 'English' ? ENGLISH_LEVELS : 
                         selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                         selectedLanguage === 'Pashto' ? PASHTO_LEVELS : URDU_LEVELS;
          const idx = levels.findIndex(l => l.id === currentLevel?.id);
          const next = levels[idx + 1];
          if (next) startLevel(next);
          else setGameState('level-select');
        }} className="bg-orange-500 text-white font-black py-6 sm:py-8 px-12 rounded-[2rem] text-3xl sm:text-5xl hover:bg-orange-400 active:translate-y-2 shadow-[0_12px_0_rgb(194,65,12)] active:shadow-none border-4 border-white/30 flex items-center justify-center gap-4">NEXT ADVENTURE →</button>
        <button onClick={() => setGameState('level-select')} className="bg-white/20 text-white font-black py-5 sm:py-7 px-12 rounded-[2rem] text-2xl sm:text-4xl hover:bg-white/30 active:scale-95 transition-all border-4 border-white/30 uppercase tracking-widest">MENU</button>
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
