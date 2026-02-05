import React, { useState, useEffect, useMemo } from 'react';
import { GameState, Level, AlphabetLetter, Language, TileState } from './types';
import { ALL_ALPHABET, URDU_LEVELS, ARABIC_LEVELS, ENGLISH_LEVELS, ITALIAN_LEVELS, PASHTO_LEVELS } from './constants';
import { alphabetVoiceService } from './services/alphabetVoiceService';

const NUM_EMPTY_SPACES = 2;

// Updated contact details
const CONTACT_EMAIL = "yasirkhan3ye@hotmail.com"; 
const WHATSAPP_NUMBER = "393273161783"; // International format for wa.me

const ConfettiBurst: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 5 + Math.random() * 15;
      return {
        id: i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: 8 + Math.random() * 12,
        color: ['#facc15', '#4ade80', '#60a5fa', '#f87171', '#c084fc', '#fb923c'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.2,
        rotation: Math.random() * 360,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[110]">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size / 2}px`,
            backgroundColor: p.color,
            '--vx': `${p.vx}vw`,
            '--vy': `${p.vy}vh`,
            '--rot': `${p.rotation}deg`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      <style>{`
        @keyframes confetti-burst {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--vx), var(--vy)) rotate(var(--rot)); opacity: 0; }
        }
        .animate-confetti-burst {
          animation: confetti-burst 2.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

const renderStars = (stars: number, sizeClass: string = 'text-2xl') => {
  return (
    <div className={`flex gap-1 ${sizeClass}`}>
      {[1, 2, 3].map(i => (
        <span 
          key={i} 
          className={`${i <= stars ? 'text-yellow-400 animate-star-pop' : 'text-gray-300'}`}
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const getCharSizeClass = (gridSize: number) => {
  if (gridSize <= 3) return 'text-4xl sm:text-6xl md:text-7xl';
  if (gridSize <= 4) return 'text-2xl sm:text-4xl md:text-5xl';
  if (gridSize <= 5) return 'text-xl sm:text-3xl md:text-4xl';
  if (gridSize <= 7) return 'text-lg sm:text-2xl';
  return 'text-base sm:text-xl';
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
  const [showHelp, setShowHelp] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
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

    const savedSound = localStorage.getItem('alphabet_sliding_sound_enabled');
    if (savedSound !== null) {
      setIsSoundEnabled(savedSound === 'true');
    }
  }, []);

  const toggleSound = () => {
    setIsSoundEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('alphabet_sliding_sound_enabled', String(newVal));
      return newVal;
    });
  };

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
    setShowHints(false);
    setShowHelp(false);
    setShowFeedback(false);
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

  const isMoveable = (currentPos: number) => {
    if (!currentLevel) return false;
    const size = currentLevel.gridSize;
    const row = Math.floor(currentPos / size);
    const col = currentPos % size;
    const emptyTiles = tiles.filter(t => t.letter === null);
    
    return emptyTiles.some(et => {
      const eRow = Math.floor(et.currentPos / size);
      const eCol = et.currentPos % size;
      return (Math.abs(row - eRow) === 1 && col === eCol) || (Math.abs(col - eCol) === 1 && row === eRow);
    });
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
      
      if (isSoundEnabled) {
        alphabetVoiceService.speak(clickedTile.letter.char, clickedTile.letter.language);
      }
      
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
        
        if (isSoundEnabled) {
          alphabetVoiceService.playWinMelody();
        }
        setTimeout(() => setGameState('complete'), 500);
      }
    }
  };

  const renderFeedbackModal = () => (
    <div className="fixed inset-0 bg-indigo-950/90 backdrop-blur-md z-[210] flex items-center justify-center p-6 pt-safe pb-safe px-safe">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-8 border-yellow-400 flex flex-col animate-success-pop">
        <div className="bg-yellow-400 p-6 sm:p-10 text-center">
          <h3 className="text-2xl sm:text-5xl font-kids text-indigo-900 uppercase">Feedback</h3>
        </div>
        
        <div className="p-8 sm:p-12 space-y-6">
          <p className="text-lg sm:text-3xl font-bold text-indigo-900 text-center">
            Help us make the app better! 🌟
          </p>
          
          <div className="space-y-4">
            <a 
              href={`mailto:${CONTACT_EMAIL}?subject=Feedback%20for%20Alphabet%20Slide`}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 sm:py-8 rounded-2xl flex items-center justify-center gap-4 text-lg sm:text-4xl shadow-md active:scale-95 transition-all no-underline"
            >
              ✉️ EMAIL US
            </a>
            
            <a 
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello!%20I%20have%20some%20feedback/suggestions%20for%20the%20Alphabet%20Slide%20app.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 sm:py-8 rounded-2xl flex items-center justify-center gap-4 text-lg sm:text-4xl shadow-md active:scale-95 transition-all no-underline"
            >
              💬 WHATSAPP
            </a>
          </div>
          
          <p className="text-sm sm:text-xl text-indigo-400 text-center italic">
            Suggestions for new levels or languages are always welcome!
          </p>
        </div>

        <div className="p-6 sm:p-10 border-t-4 border-indigo-50 bg-gray-50">
          <button 
            onClick={() => setShowFeedback(false)}
            className="w-full bg-indigo-600 text-white font-black py-4 sm:py-8 rounded-2xl text-xl sm:text-4xl shadow-lg active:scale-95 transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-6 sky-theme pt-safe pb-safe px-safe relative">
      <h1 className="text-4xl sm:text-8xl md:text-9xl font-kids text-white mb-6 drop-shadow-2xl">Alphabet Slide</h1>
      <p className="text-base sm:text-3xl text-blue-100 mb-8 max-w-lg font-kids uppercase tracking-widest px-4">Tap to Learn & Play</p>
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => setGameState('language-select')}
          className="bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-indigo-900 font-bold py-5 px-10 sm:py-8 sm:px-20 rounded-full text-xl sm:text-5xl shadow-[0_8px_0_rgb(180,130,0)] active:translate-y-2 active:shadow-none transition-all border-4 border-white"
        >
          PLAY NOW
        </button>
        
        <button 
          onClick={toggleSound}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full text-sm sm:text-2xl backdrop-blur-md border-2 border-white/30 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>SOUND: {isSoundEnabled ? 'ON' : 'OFF'}</span>
          <span className="text-lg sm:text-3xl">{isSoundEnabled ? '🔊' : '🔇'}</span>
        </button>
      </div>

      {/* Floating Feedback Button */}
      <button 
        onClick={() => setShowFeedback(true)}
        className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 bg-white/20 hover:bg-white/40 text-white p-3 sm:p-6 rounded-full backdrop-blur-md border-2 border-white/50 shadow-xl active:scale-90 transition-all text-xl sm:text-4xl"
        title="Feedback"
      >
        💬
      </button>

      {showFeedback && renderFeedbackModal()}
    </div>
  );

  const renderLanguageSelect = () => (
    <div className="flex flex-col items-center h-full w-full sky-theme pt-safe pb-safe px-safe overflow-hidden relative">
      <div className="flex flex-col items-center justify-between h-full w-full max-w-lg px-4 py-6">
        <h2 className="text-xl sm:text-4xl font-kids text-white mb-4 drop-shadow-lg text-center uppercase tracking-widest">PICK YOUR JOURNEY</h2>
        
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden mb-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-md no-scrollbar">
            {[
              { lang: 'Urdu', icon: '🇵🇰', label: 'اردو زبان' },
              { lang: 'Pashto', icon: '🇦🇫', label: 'پښتو' },
              { lang: 'Arabic', icon: '🇸🇦', label: 'اللغة العربية' },
              { lang: 'English', icon: '🇬🇧', label: 'English' },
              { lang: 'Italian', icon: '🇮🇹', label: 'Italiano' }
            ].map(({ lang, icon, label }, index) => (
              <button 
                key={lang}
                onClick={() => { setSelectedLanguage(lang as any); setGameState('level-select'); }}
                className={`bg-white w-full aspect-square sm:aspect-auto sm:min-h-[140px] rounded-2xl sm:rounded-[2.5rem] shadow-lg active:scale-95 transition-all border-4 group flex flex-col items-center justify-center p-2 text-center
                  ${lang === 'Urdu' ? 'border-blue-400' : lang === 'Arabic' ? 'border-orange-400' : lang === 'Pashto' ? 'border-amber-600' : 'border-indigo-400'}
                  ${index === 4 ? 'col-span-2 aspect-auto h-24 sm:h-auto' : ''}`}
              >
                <span className="text-2xl sm:text-5xl mb-1 transition-transform group-hover:scale-110" aria-hidden="true">{icon}</span>
                <div className="flex flex-col items-center justify-center w-full">
                  <span className={`text-sm sm:text-xl font-bold text-indigo-950 leading-tight ${lang === 'Urdu' || lang === 'Pashto' ? 'urdu-text' : lang === 'Arabic' ? 'arabic-text' : ''}`}>
                    {label}
                  </span>
                  <span className="text-[7px] sm:text-xs font-kids text-indigo-400 uppercase tracking-widest font-black opacity-60">
                    {lang}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={() => { setGameState('home'); setSelectedLanguage(null); }} className="text-white text-base sm:text-2xl font-bold underline hover:opacity-80 active:scale-95 decoration-2 underline-offset-4">← Go Back</button>
      </div>

      <button 
        onClick={() => setShowFeedback(true)}
        className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 bg-white/20 text-white p-3 sm:p-5 rounded-full backdrop-blur-md border-2 border-white/50 active:scale-90 transition-all text-lg sm:text-3xl"
      >
        💬
      </button>

      {showFeedback && renderFeedbackModal()}
    </div>
  );

  const renderLevelSelect = () => {
    const levels = selectedLanguage === 'Arabic' ? ARABIC_LEVELS : 
                   selectedLanguage === 'English' ? ENGLISH_LEVELS : 
                   selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                   selectedLanguage === 'Pashto' ? PASHTO_LEVELS : URDU_LEVELS;
    
    const themeClass = selectedLanguage === 'Arabic' ? 'desert-theme' : selectedLanguage === 'Pashto' ? 'pashto-theme' : 'sky-theme';

    return (
      <div className={`h-full w-full pt-safe pb-safe px-safe ${themeClass} flex flex-col items-center overflow-hidden relative`}>
        <div className="w-full max-w-6xl flex flex-col h-full p-4 sm:p-8">
          <button onClick={() => { setGameState('language-select'); setSelectedLanguage(null); }} className="mb-4 text-indigo-900 bg-white/80 backdrop-blur-lg self-start px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all text-[10px] sm:text-lg shadow-md border-2 border-white/50">← Change Language</button>
          <h2 className="text-xl sm:text-5xl font-kids text-white mb-4 text-center uppercase drop-shadow-md tracking-widest">{selectedLanguage} Fun</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8 overflow-y-auto flex-1 pb-12 px-2 no-scrollbar">
            {levels.map(level => {
              const stars = levelProgress[level.id] || 0;
              return (
                <button key={level.id} onClick={() => startLevel(level)} className="bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[3.5rem] shadow-xl active:scale-95 transition-all group flex flex-col items-center border-4 border-transparent hover:border-indigo-200">
                  <div className={`w-12 h-12 sm:w-28 sm:h-28 rounded-full mb-2 sm:mb-4 flex items-center justify-center text-lg sm:text-5xl font-black text-white shadow-xl border-4 border-white ${level.difficulty === 'easy' ? 'bg-green-400' : level.difficulty === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`}>{level.gridSize}x{level.gridSize}</div>
                  <h3 className="text-[10px] sm:text-2xl font-black text-indigo-900 mb-1 sm:mb-2 text-center truncate w-full px-2">{level.name.split(':')[1] || level.name}</h3>
                  <div className="mt-1">{renderStars(stars, 'text-xs sm:text-5xl')}</div>
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={() => setShowFeedback(true)}
          className="absolute bottom-6 right-6 sm:bottom-12 sm:right-12 bg-white/20 text-white p-3 sm:p-5 rounded-full backdrop-blur-md border-2 border-white/50 active:scale-90 transition-all text-lg sm:text-3xl"
        >
          💬
        </button>

        {showFeedback && renderFeedbackModal()}
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
        {/* Header with Help & Sound Buttons */}
        <div className="w-full max-w-xl flex justify-between items-center bg-white/95 backdrop-blur-xl p-2 sm:p-5 rounded-xl sm:rounded-3xl shadow-xl border-2 border-white/50 z-20 mx-auto mt-1 sm:mt-4">
          <button onClick={() => setGameState('level-select')} className="text-indigo-600 font-black text-[9px] sm:text-lg px-2 py-1.5 sm:px-4 sm:py-2.5 hover:bg-white hover:shadow-sm active:scale-90 transition-all rounded-lg border border-indigo-100 bg-indigo-50/50">MENU ←</button>
          <div className="text-[10px] sm:text-2xl font-kids text-indigo-900 px-2 flex-1 text-center font-black tracking-tight uppercase truncate">{currentLevel.name.split(':')[1] || currentLevel.name}</div>
          
          <div className="flex items-center gap-1 sm:gap-3">
            <button 
              onClick={toggleSound}
              className={`${isSoundEnabled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'} w-8 h-8 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-2xl shadow-md border-2 border-white active:scale-90 transition-all`}
              aria-label="Toggle Sound"
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </button>
            <button 
              onClick={() => setShowHelp(true)}
              className="bg-yellow-400 text-indigo-900 w-8 h-8 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-black text-lg sm:text-3xl shadow-md border-2 border-white active:scale-90 transition-all"
              aria-label="How to play"
            >
              ?
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex items-center justify-center w-full p-4 relative">
          <div className="game-board-container relative bg-indigo-950/20 p-1 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl border-[6px] sm:border-[12px] border-white/80" role="grid">
            {tiles.map((tile) => {
              const row = Math.floor(tile.currentPos / size);
              const col = tile.currentPos % size;
              const isCorrect = tile.targetPos === tile.currentPos;
              const canMove = isMoveable(tile.currentPos);
              const gap = 2;
              const cellStyle: React.CSSProperties = {
                position: 'absolute',
                width: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                height: `calc((100% - ${(size + 1) * gap}px) / ${size})`,
                top: `calc(${row * (100 / size)}% + ${gap}px)`,
                left: `calc(${col * (100 / size)}% + ${gap}px)`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              };
              
              if (!tile.letter) return <div key={`empty-${tile.targetPos}`} style={cellStyle} className="bg-black/10 border-2 border-dashed border-white/20 flex items-center justify-center" aria-hidden="true"></div>;
              
              const fontClass = (tile.letter.language === 'Urdu' || tile.letter.language === 'Pashto') ? 'urdu-text' : tile.letter.language === 'Arabic' ? 'arabic-text' : '';
              
              return (
                <button 
                  key={(tile.letter as any).instanceId} 
                  onClick={() => handleTileClick(tile.currentPos)} 
                  style={cellStyle} 
                  className={`flex flex-col items-center justify-center shadow-lg transition-all transform text-white border-2 border-white/40 ${tile.letter.color} 
                    ${isCorrect ? 'tile-correct brightness-105' : 'active:brightness-110 active:scale-95'}
                    ${showHints && canMove ? 'animate-pulse ring-4 ring-yellow-400 ring-inset ring-opacity-70' : ''}`} 
                >
                  <span className="absolute top-0.5 left-1 text-[7px] sm:text-[14px] opacity-40 font-black">{tile.targetPos + 1}</span>
                  <span className={`${fontClass} ${charSizeClass} pointer-events-none drop-shadow-xl leading-none`}>{tile.letter.char}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button Section */}
        <div className="w-full flex justify-center pb-4 sm:pb-16 pt-2 px-safe gap-4">
          <button onClick={() => startLevel(currentLevel)} className="bg-white text-indigo-600 font-black text-sm sm:text-4xl px-4 py-2 sm:px-16 sm:py-8 rounded-full shadow-lg hover:bg-indigo-50 active:translate-y-2 active:shadow-none transition-all border-2 sm:border-4 border-indigo-100 flex items-center gap-2 group">
            <span className="group-hover:rotate-12 transition-transform">SHUFFLE</span> <span className="text-lg sm:text-5xl" aria-hidden="true">🔀</span>
          </button>
          
          <button 
            onClick={() => setShowHints(!showHints)} 
            className={`${showHints ? 'bg-yellow-400 text-indigo-900 border-yellow-500' : 'bg-white text-gray-500 border-gray-100'} font-black text-sm sm:text-4xl px-4 py-2 sm:px-16 sm:py-8 rounded-full shadow-lg active:translate-y-2 transition-all border-2 sm:border-4 flex items-center gap-2`}
          >
            HINTS {showHints ? 'ON' : 'OFF'} 💡
          </button>
        </div>

        {/* Feedback Button inside Game (less prominent) */}
        <button 
          onClick={() => setShowFeedback(true)}
          className="absolute bottom-4 left-4 bg-white/20 text-white p-2 sm:p-4 rounded-full text-sm sm:text-xl active:scale-90 transition-all border border-white/30"
        >
          💬
        </button>

        {showFeedback && renderFeedbackModal()}

        {/* Small letter celebration toast */}
        {celebration.show && celebration.letter && (
          <div className="fixed bottom-24 sm:bottom-48 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-bounce">
            <div className="bg-white/98 backdrop-blur px-6 py-3 sm:px-16 sm:py-10 rounded-2xl sm:rounded-[4rem] shadow-2xl border-4 border-yellow-400 flex flex-col items-center">
              <span className={`text-3xl sm:text-8xl ${celebration.letter.language === 'Urdu' || celebration.letter.language === 'Pashto' ? 'urdu-text' : celebration.letter.language === 'Arabic' ? 'arabic-text' : ''} ${celebration.letter.color.replace('bg-', 'text-')}`}>{celebration.letter.char}</span>
              <p className="text-xs sm:text-3xl font-kids text-indigo-900 uppercase tracking-tighter mt-1 font-black">{celebration.letter.name}</p>
              <p className="text-[10px] sm:text-2xl font-kids text-green-600 font-black">{celebration.letter.exampleWord}</p>
            </div>
          </div>
        )}

        {/* Help Modal Overlay */}
        {showHelp && (
          <div className="fixed inset-0 bg-indigo-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 pt-safe pb-safe px-safe">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden shadow-2xl border-8 border-yellow-400 flex flex-col max-h-[90vh]">
              <div className="bg-yellow-400 p-6 sm:p-10 text-center">
                <h3 className="text-2xl sm:text-6xl font-kids text-indigo-900 uppercase">How to Play</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-6 sm:space-y-12">
                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="bg-indigo-100 w-12 h-12 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-5xl">👆</div>
                  <div>
                    <h4 className="text-lg sm:text-3xl font-black text-indigo-900 mb-1">TAP TO SLIDE</h4>
                    <p className="text-sm sm:text-2xl text-indigo-600 font-medium">Click any tile next to an <span className="font-black underline">empty square</span> to move it.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="bg-green-100 w-12 h-12 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-5xl">🔢</div>
                  <div>
                    <h4 className="text-lg sm:text-3xl font-black text-indigo-900 mb-1">FOLLOW THE NUMBERS</h4>
                    <p className="text-sm sm:text-2xl text-indigo-600 font-medium">Arrange letters 1, 2, 3... in order. Check the <span className="font-black">small number</span> in the corner!</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 sm:gap-8">
                  <div className="bg-orange-100 w-12 h-12 sm:w-24 sm:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-xl sm:text-5xl">💡</div>
                  <div>
                    <h4 className="text-lg sm:text-3xl font-black text-indigo-900 mb-1">SMART TIP</h4>
                    <p className="text-sm sm:text-2xl text-indigo-600 font-medium italic">Start with the top row first. Use the empty space like a "path" for other pieces!</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 sm:p-8 rounded-3xl border-2 border-blue-100">
                  <p className="text-xs sm:text-xl font-bold text-blue-800 text-center leading-relaxed italic">
                    "If you're stuck, turn on <span className="text-yellow-600">HINTS</span> to see which tiles can move right now!"
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-10 border-t-4 border-indigo-50 bg-gray-50">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full bg-indigo-600 text-white font-black py-4 sm:py-8 rounded-2xl sm:rounded-3xl text-xl sm:text-4xl shadow-lg active:scale-95 transition-all"
                >
                  GOT IT!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-indigo-950/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[100] text-center p-6 pt-safe pb-safe px-safe">
      <ConfettiBurst />
      <h2 className="text-6xl sm:text-[11rem] font-kids text-white mb-6 drop-shadow-[0_15px_15px_rgba(0,0,0,0.7)] uppercase tracking-tighter animate-success-pop scale-up-center">AWESOME!</h2>
      <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-6 sm:p-20 rounded-[3rem] sm:rounded-[6rem] mb-6 shadow-2xl border-4 border-white/20 w-full max-w-lg transition-all transform hover:scale-105 shimmer-card relative overflow-hidden">
        <p className="text-xl sm:text-6xl text-yellow-400 mb-2 font-kids uppercase tracking-widest font-black drop-shadow-md">PUZZLE SOLVED</p>
        <div className="flex gap-4 sm:gap-10 text-6xl sm:text-[10rem] mb-4">
          {[1, 2, 3].map(i => (
            <span 
              key={i} 
              className={`${i <= lastStars ? 'text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,1)]' : 'text-indigo-950/50'} animate-star-pop`}
              style={{ animationDelay: `${0.8 + i * 0.3}s` }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full max-w-md">
        <button onClick={() => {
          const levels = selectedLanguage === 'Arabic' ? ARABIC_LEVELS : 
                         selectedLanguage === 'English' ? ENGLISH_LEVELS : 
                         selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                         selectedLanguage === 'Pashto' ? PASHTO_LEVELS : URDU_LEVELS;
          const idx = levels.findIndex(l => l.id === currentLevel?.id);
          const next = levels[idx + 1];
          if (next) startLevel(next);
          else setGameState('level-select');
        }} className="bg-orange-500 text-white font-black py-5 sm:py-10 px-8 rounded-3xl text-2xl sm:text-6xl hover:bg-orange-400 active:translate-y-2 shadow-[0_10px_0_rgb(194,65,12)] active:shadow-none border-4 border-white/40 flex items-center justify-center gap-4 transition-all">NEXT LEVEL →</button>
        <button onClick={() => setGameState('level-select')} className="bg-indigo-600 text-white font-black py-5 sm:py-10 px-8 rounded-3xl text-2xl sm:text-6xl hover:bg-indigo-500 active:translate-y-2 shadow-[0_10px_0_rgb(30,64,175)] active:shadow-none border-4 border-white/40 uppercase tracking-widest transition-all">MENU</button>
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