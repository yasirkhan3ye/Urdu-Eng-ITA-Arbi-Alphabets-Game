
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
  if (gridSize <= 3) return 'text-6xl sm:text-7xl';
  if (gridSize <= 4) return 'text-4xl sm:text-5xl';
  if (gridSize <= 5) return 'text-3xl sm:text-4xl';
  return 'text-xl sm:text-2xl';
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
    setAnnouncement(`Starting ${level.language} level ${level.name}. Size ${level.gridSize}x${level.gridSize}.`);
    
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
    let shuffleSteps = 40;
    if (size >= 6) shuffleSteps *= 2;

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
        if (sec < (size * size * 20)) stars = 3;
        else if (sec < (size * size * 50)) stars = 2;
        setLastStars(stars);
        saveProgress(currentLevel.id, stars);
        setTimeout(() => setGameState('complete'), 1500);
      }
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 sky-theme">
      <h1 className="text-6xl md:text-8xl font-kids text-white mb-8 drop-shadow-lg">Alphabet Slide</h1>
      <p className="text-2xl text-blue-100 mb-12 max-w-lg font-kids uppercase tracking-wider">PLAY AND LEARN</p>
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => setGameState('language-select')}
          className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold py-6 px-12 rounded-full text-3xl shadow-xl hover:scale-110 transition-transform border-4 border-white"
        >
          TAP TO PLAY
        </button>
      </div>
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen sky-theme p-4 overflow-hidden">
      <h2 className="text-4xl md:text-5xl font-kids text-white mb-10 drop-shadow-lg">Pick Your Journey</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 w-full max-w-4xl justify-items-center items-stretch px-4">
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
            className={`bg-white w-full h-44 md:h-56 rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all border-4 md:border-8 group flex flex-col items-center justify-center p-4 text-center
              ${lang === 'Urdu' ? 'border-blue-400' : lang === 'Arabic' ? 'border-orange-400' : lang === 'Pashto' ? 'border-amber-600' : 'border-indigo-400'}`}
          >
            <span className="text-4xl md:text-5xl block mb-2 group-hover:rotate-12 transition-transform" aria-hidden="true">{icon}</span>
            <div className="flex flex-col items-center justify-center gap-1 w-full overflow-visible">
              <span className={`text-xl md:text-3xl block text-indigo-900 leading-relaxed font-normal whitespace-nowrap ${lang === 'Urdu' || lang === 'Pashto' ? 'urdu-text' : lang === 'Arabic' ? 'arabic-text' : ''}`}>
                {label}
              </span>
              <span className="text-xs md:text-sm block text-indigo-400 font-kids uppercase tracking-wider">
                {lang}
              </span>
            </div>
          </button>
        ))}
      </div>
      <button onClick={() => { setGameState('home'); setSelectedLanguage(null); }} className="mt-12 text-white text-xl font-bold underline hover:opacity-80">Go Back</button>
    </div>
  );

  const renderLevelSelect = () => {
    let levels = URDU_LEVELS;
    if (selectedLanguage === 'Arabic') levels = ARABIC_LEVELS;
    else if (selectedLanguage === 'English') levels = ENGLISH_LEVELS;
    else if (selectedLanguage === 'Italian') levels = ITALIAN_LEVELS;
    else if (selectedLanguage === 'Pashto') levels = PASHTO_LEVELS;
    
    let themeClass = 'bg-blue-50';
    if (selectedLanguage === 'Arabic') themeClass = 'desert-theme';
    if (selectedLanguage === 'Pashto') themeClass = 'pashto-theme';

    return (
      <div className={`h-screen w-full p-8 ${themeClass} overflow-y-auto pb-24`}>
        <div className="max-w-6xl mx-auto">
          <button onClick={() => { setGameState('language-select'); setSelectedLanguage(null); }} className="mb-8 text-indigo-600 font-normal flex items-center gap-2 hover:underline text-xl">← Change Language</button>
          <h2 className="text-4xl font-kids text-indigo-900 mb-12 text-center uppercase">{selectedLanguage} Fun Levels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {levels.map(level => {
              const stars = levelProgress[level.id] || 0;
              return (
                <button key={level.id} onClick={() => startLevel(level)} className="bg-white p-8 rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center border-4 border-transparent hover:border-indigo-200">
                  <div className={`w-24 h-24 rounded-full mb-4 flex items-center justify-center text-4xl font-normal text-white shadow-lg border-4 border-white ${level.difficulty === 'easy' ? 'bg-green-400' : level.difficulty === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`}>{level.gridSize}x{level.gridSize}</div>
                  <h3 className="text-xl font-normal text-indigo-800 mb-2">{level.name}</h3>
                  <div className="mb-4">{renderStars(stars, 'text-4xl')}</div>
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
      <div className={`min-h-screen p-4 flex flex-col items-center ${themeClass} relative overflow-hidden`}>
        <div className="w-full max-w-xl flex justify-between items-center mb-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border-2 border-white/50">
          <button onClick={() => setGameState('level-select')} className="text-indigo-600 font-bold text-xs px-4 py-2 hover:bg-white hover:shadow-md transition-all rounded-xl border border-indigo-50">Menu ←</button>
          <div className="text-sm font-kids text-indigo-900 px-2 line-clamp-1 flex-1 text-center font-bold">{currentLevel.name}</div>
          <div className="text-xs font-bold text-indigo-500 bg-indigo-50/50 px-3 py-2 rounded-xl border border-indigo-100 whitespace-nowrap">Moves: {moves}</div>
        </div>
        <div className="relative bg-indigo-900/10 p-2 sm:p-4 rounded-none shadow-inner border-8 border-white/40" style={{ width: '95vw', maxWidth: '600px', aspectRatio: '1/1' }} role="grid">
          {tiles.map((tile) => {
            const row = Math.floor(tile.currentPos / size);
            const col = tile.currentPos % size;
            const isCorrect = tile.targetPos === tile.currentPos;
            
            const cellStyle: React.CSSProperties = {
              position: 'absolute',
              width: `calc((100% - ${(size + 1) * 8}px) / ${size})`,
              height: `calc((100% - ${(size + 1) * 8}px) / ${size})`,
              top: `calc(${row * (100 / size)}% + 8px)`,
              left: `calc(${col * (100 / size)}% + 8px)`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            };
            
            if (!tile.letter) return <div key={`empty-${tile.targetPos}`} style={cellStyle} className="rounded-none bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center pointer-events-none" aria-hidden="true"><span className="text-xl opacity-10">🕳️</span></div>;
            
            const fontClass = tile.letter.language === 'Urdu' || tile.letter.language === 'Pashto' ? 'urdu-text' : tile.letter.language === 'Arabic' ? 'arabic-text' : '';
            
            return (
              <button 
                key={(tile.letter as any).instanceId} 
                onClick={() => handleTileClick(tile.currentPos)} 
                style={cellStyle} 
                className={`rounded-none flex flex-col items-center justify-center shadow-lg transition-all duration-300 transform text-white border-2 sm:border-4 border-white/40 group ${tile.letter.color} ${isCorrect ? 'tile-correct brightness-105' : 'hover:brightness-110 active:scale-95'}`} 
                aria-label={`Tile ${tile.letter.name}`}
              >
                <div className="invisible group-hover:visible absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-indigo-900 text-sm font-bold px-3 py-1.5 rounded-xl shadow-2xl z-50 whitespace-nowrap border-2 border-indigo-100 pointer-events-none transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100">
                  {tile.letter.name}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                </div>
                <span className="absolute top-1 left-2 text-[8px] sm:text-xs opacity-60 font-bold" aria-hidden="true">{tile.targetPos + 1}</span>
                <span className={`${fontClass} ${charSizeClass} pointer-events-none drop-shadow-lg`} aria-hidden="true">{tile.letter.char}</span>
              </button>
            );
          })}
        </div>
        <button onClick={() => startLevel(currentLevel)} className="mt-10 bg-white text-indigo-600 font-bold text-2xl px-16 py-6 rounded-3xl shadow-2xl hover:bg-indigo-50 transition-all border-4 border-indigo-200 flex items-center gap-4 active:scale-95">
          <span>Shuffle</span> <span className="text-3xl" aria-hidden="true">🔀</span>
        </button>
        {celebration.show && celebration.letter && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-bounce">
            <div className="bg-white px-8 py-5 rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 flex flex-col items-center">
              <span className={`text-5xl ${celebration.letter.language === 'Urdu' || celebration.letter.language === 'Pashto' ? 'urdu-text' : celebration.letter.language === 'Arabic' ? 'arabic-text' : ''} ${celebration.letter.color.replace('bg-', 'text-')}`}>{celebration.letter.char}</span>
              <p className="text-xl font-kids text-indigo-900 uppercase tracking-tighter">{celebration.letter.name}</p>
              <p className="text-lg font-kids text-green-600">{celebration.letter.exampleWord}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-indigo-900 bg-opacity-95 flex flex-col items-center justify-center z-[100] text-center p-6 overflow-y-auto">
      <h2 className="text-7xl md:text-9xl font-kids text-white mb-8 drop-shadow-xl uppercase">DONE</h2>
      <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] mb-12 shadow-2xl border-4 border-white/20 w-full max-sm:px-4 max-w-sm">
        <p className="text-4xl text-yellow-400 mb-2 font-kids uppercase tracking-widest font-bold">VICTORY</p>
        <p className="text-xl text-indigo-200 mb-8 font-kids uppercase font-bold">PUZZLE MASTER</p>
        <div className="flex gap-4 text-8xl mb-4">
          {[1, 2, 3].map(i => <span key={i} className={`${i <= lastStars ? 'text-yellow-400 scale-110 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]' : 'text-indigo-900/50'} transition-all duration-1000`}>★</span>)}
        </div>
      </div>
      <div className="flex flex-col gap-6 w-full max-w-xs">
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
        }} className="bg-orange-500 text-white font-bold py-5 px-8 rounded-2xl text-3xl hover:bg-orange-400 transition-all shadow-[0_6px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none border-2 border-white/20 flex items-center justify-center gap-2"><span>NEXT</span><span>→</span></button>
        <button onClick={() => startLevel(currentLevel!)} className="bg-blue-600 text-white font-bold py-5 px-8 rounded-2xl text-3xl hover:bg-blue-500 transition-all shadow-[0_6px_0_rgb(30,64,175)] active:translate-y-1 active:shadow-none border-2 border-white/20 flex items-center justify-center gap-2"><span>AGAIN</span><span>↻</span></button>
        <button onClick={() => setGameState('level-select')} className="bg-white/10 text-white font-bold py-4 px-8 rounded-2xl text-2xl hover:bg-white/20 transition-all border-2 border-white/20">BACK</button>
      </div>
    </div>
  );

  return (
    <div className="select-none h-screen overflow-hidden">
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
