
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { GameState, Level, AlphabetLetter, Language, TileState } from './types';
import { ALL_ALPHABET, URDU_LEVELS, ARABIC_LEVELS, ENGLISH_LEVELS, ITALIAN_LEVELS, PASHTO_LEVELS } from './constants';
import { alphabetVoiceService } from './services/alphabetVoiceService';

const NUM_EMPTY_SPACES = 2;
const CONTACT_EMAIL = "yasirkhan3ye@hotmail.com"; 
const WHATSAPP_NUMBER = "393273161783";

const vibrate = (duration: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

// Helper function to render star rating
const renderStars = (count: number, className: string = '') => (
  <div className={`flex gap-0.5 ${className}`}>
    {[1, 2, 3].map(i => (
      <span key={i} className={i <= count ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
);

// Helper function to get appropriate character size for different grid sizes
const getCharSizeClass = (size: number) => {
  if (size <= 2) return 'text-5xl sm:text-7xl';
  if (size <= 3) return 'text-4xl sm:text-5xl';
  if (size <= 4) return 'text-2xl sm:text-4xl';
  if (size <= 5) return 'text-xl sm:text-3xl';
  if (size <= 6) return 'text-lg sm:text-2xl';
  return 'text-base sm:text-xl';
};

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
            opacity: 0,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const TutorialOverlay: React.FC<{
  step: number;
  onNext: () => void;
  onSkip: () => void;
  message: string;
  position: 'top' | 'bottom' | 'center';
}> = ({ step, onNext, onSkip, message, position }) => {
  const posClass = position === 'top' ? 'top-20' : position === 'bottom' ? 'bottom-32' : 'top-1/2 -translate-y-1/2';
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className={`absolute ${posClass} w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 animate-success-pop`}>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-indigo-900 px-4 py-1 rounded-full font-black text-xs uppercase">
          Tutorial Step {step}
        </div>
        <p className="text-indigo-900 font-bold text-center text-lg mb-6 leading-tight">
          {message}
        </p>
        <div className="flex flex-col gap-2">
          <button 
            onClick={onNext}
            className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg active:scale-95 transition-transform"
          >
            GOT IT! 👍
          </button>
          <button 
            onClick={onSkip}
            className="w-full py-2 text-indigo-400 font-bold text-xs hover:underline"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
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
  const [showHints, setShowHints] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedTilePos, setSelectedTilePos] = useState<number | null>(null);
  
  // Tutorial State
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('alphabet_slide_tutorial_done');
    if (!tutorialCompleted) {
      setIsTutorialActive(true);
      setTutorialStep(1);
    }
    
    const saved = localStorage.getItem('alphabet_sliding_progress_multi_empty');
    if (saved) {
      try { setLevelProgress(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    const savedSound = localStorage.getItem('alphabet_sliding_sound_enabled');
    if (savedSound !== null) {
      setIsSoundEnabled(savedSound === 'true');
    }
  }, []);

  const completeTutorial = () => {
    setIsTutorialActive(false);
    setTutorialStep(0);
    localStorage.setItem('alphabet_slide_tutorial_done', 'true');
  };

  const advanceTutorial = (fromStep: number) => {
    if (isTutorialActive && tutorialStep === fromStep) {
      setTutorialStep(fromStep + 1);
    }
  };

  useEffect(() => {
    if (selectedLanguage) {
      const rtlLanguages: Language[] = ['Urdu', 'Arabic', 'Pashto'];
      const isRtl = rtlLanguages.includes(selectedLanguage);
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [selectedLanguage]);

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
    setSelectedTilePos(null);
    setStartTime(Date.now());
    
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
    let shuffleSteps = size * size * 15;
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
    
    if (isTutorialActive && tutorialStep === 3) {
      setTutorialStep(4);
    }
  };

  const findPath = useCallback((startPos: number, endPos: number) => {
    if (!currentLevel) return null;
    const size = currentLevel.gridSize;
    const queue: number[][] = [[startPos]];
    const visited = new Set<number>([startPos]);

    while (queue.length > 0) {
      const path = queue.shift()!;
      const curr = path[path.length - 1];

      if (curr === endPos) return path;

      const r = Math.floor(curr / size);
      const c = curr % size;
      const neighbors = [];
      if (r > 0) neighbors.push(curr - size);
      if (r < size - 1) neighbors.push(curr + size);
      if (c > 0) neighbors.push(curr - 1);
      if (c < size - 1) neighbors.push(curr + 1);

      for (const neighbor of neighbors) {
        const tile = tiles.find(t => t.currentPos === neighbor);
        if (!visited.has(neighbor) && (neighbor === endPos || !tile?.letter)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  }, [currentLevel, tiles]);

  const handleTileClick = (clickedPos: number) => {
    const clickedTile = tiles.find(t => t.currentPos === clickedPos);
    
    if (selectedTilePos === null) {
      if (clickedTile?.letter) {
        setSelectedTilePos(clickedPos);
        vibrate(5);
        if (isSoundEnabled) {
          alphabetVoiceService.speak(clickedTile.letter.char, clickedTile.letter.language);
        }
      }
      return;
    }

    const selectedTile = tiles.find(t => t.currentPos === selectedTilePos);
    
    if (clickedPos === selectedTilePos) {
      setSelectedTilePos(null);
      return;
    }

    if (!clickedTile?.letter) {
      const path = findPath(selectedTilePos, clickedPos);
      if (path) {
        const newTiles = tiles.map(t => {
          if (t.currentPos === selectedTilePos) return { ...t, currentPos: clickedPos };
          if (t.currentPos === clickedPos) return { ...t, currentPos: selectedTilePos };
          return t;
        });
        setTiles(newTiles);
        setMoves(m => m + 1);
        setSelectedTilePos(null);
        vibrate(15);
        
        if (isTutorialActive && tutorialStep === 4) {
          setTutorialStep(5);
        }

        const allLettersInPlace = newTiles.filter(t => t.letter !== null).every(t => t.currentPos === t.targetPos);
        if (allLettersInPlace) {
          setTimeout(handleWin, 400);
        }
      } else {
        setSelectedTilePos(null);
      }
    } else {
      setSelectedTilePos(clickedPos);
      vibrate(5);
      if (isSoundEnabled) {
        alphabetVoiceService.speak(clickedTile.letter.char, clickedTile.letter.language);
      }
    }
  };

  const handleWin = () => {
    vibrate([50, 50, 50]);
    const timeTaken = (Date.now() - startTime) / 1000;
    const size = currentLevel?.gridSize || 3;
    let stars = 1;
    if (timeTaken < (size * 20)) stars = 3;
    else if (timeTaken < (size * 60)) stars = 2;
    
    setLastStars(stars);
    if (currentLevel) saveProgress(currentLevel.id, stars);
    setGameState('complete');
    if (isSoundEnabled) alphabetVoiceService.playWinMelody();
    
    if (isTutorialActive) {
      completeTutorial();
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full sky-theme text-white p-4">
      {isTutorialActive && tutorialStep === 1 && (
        <TutorialOverlay 
          step={1} 
          message="Welcome! Let's start by picking a language to learn." 
          position="center"
          onNext={() => advanceTutorial(1)}
          onSkip={completeTutorial}
        />
      )}
      <h1 className="text-5xl sm:text-7xl font-kids mb-8 text-center drop-shadow-2xl animate-bounce">Alphabet Slide</h1>
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 border-4 border-white/20 w-full max-sm:w-full max-w-sm">
        <button 
          onClick={() => { 
            vibrate(20); 
            setGameState('language-select');
            if (tutorialStep === 1) advanceTutorial(1);
          }}
          className={`w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 rounded-full font-black text-2xl sm:text-3xl transition-all active:scale-95 shadow-[0_8px_0_rgb(180,130,0)] ${isTutorialActive && tutorialStep === 1 ? 'animate-pulse ring-8 ring-white' : ''}`}
        >
          START GAME
        </button>
        <button onClick={toggleSound} className="text-xl flex items-center gap-2 opacity-90 hover:opacity-100 font-bold">
          {isSoundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
        </button>
        <div className="flex flex-col items-center text-xs opacity-70 gap-1 text-center font-bold mt-4">
          <p>Support:</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">{CONTACT_EMAIL}</a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp Support</a>
        </div>
      </div>
    </div>
  );

  const renderLanguageSelect = () => {
    const langFlags: Record<Language, string> = {
      'Urdu': '🇵🇰',
      'Arabic': '🇸🇦',
      'English': '🇺🇸',
      'Italian': '🇮🇹',
      'Pashto': '🇦🇫'
    };

    return (
      <div className="h-full sky-theme p-6 flex flex-col items-center justify-center relative">
        {isTutorialActive && tutorialStep === 2 && (
          <TutorialOverlay 
            step={2} 
            message="Great! Now choose a language to see its alphabet." 
            position="top"
            onNext={() => advanceTutorial(2)}
            onSkip={completeTutorial}
          />
        )}
        <h2 className="text-3xl sm:text-4xl font-kids text-white mb-8 text-center drop-shadow-md">SELECT LANGUAGE</h2>
        <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
          {(['Urdu', 'Arabic', 'English', 'Italian', 'Pashto'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => { 
                vibrate(10); 
                setSelectedLanguage(lang); 
                setGameState('level-select');
                if (tutorialStep === 2) setTutorialStep(3);
              }}
              className={`relative p-6 bg-white rounded-[2rem] shadow-xl active:scale-95 transition-all border-4 border-transparent hover:border-yellow-400 flex flex-col items-center gap-2 ${isTutorialActive && tutorialStep === 2 ? 'ring-4 ring-yellow-400' : ''}`}
            >
              <span className="absolute top-3 left-3 text-xl">{langFlags[lang]}</span>
              <span className={`text-4xl mt-4 ${lang === 'Urdu' || lang === 'Pashto' ? 'urdu-text' : lang === 'Arabic' ? 'arabic-text' : ''}`}>
                {lang === 'Urdu' ? 'اردو' : lang === 'Arabic' ? 'العربية' : lang === 'Pashto' ? 'پښتو' : lang[0]}
              </span>
              <span className="text-lg font-black text-indigo-900">{lang}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setGameState('home')} className="mt-10 text-white font-bold underline text-lg">← Back</button>
      </div>
    );
  };

  const renderLevelSelect = () => {
    const levels = selectedLanguage === 'Urdu' ? URDU_LEVELS :
                   selectedLanguage === 'Arabic' ? ARABIC_LEVELS :
                   selectedLanguage === 'English' ? ENGLISH_LEVELS :
                   selectedLanguage === 'Italian' ? ITALIAN_LEVELS : PASHTO_LEVELS;
    return (
      <div className="h-full bg-indigo-50 p-4 flex flex-col relative">
        {isTutorialActive && tutorialStep === 3 && (
          <TutorialOverlay 
            step={3} 
            message="Choose Level 1 to start your first alphabet puzzle!" 
            position="top"
            onNext={() => advanceTutorial(3)}
            onSkip={completeTutorial}
          />
        )}
        <header className="flex items-center justify-between mb-6 pt-safe">
          <button onClick={() => setGameState('language-select')} className="text-indigo-600 font-black">← LANGUAGES</button>
          <h2 className="text-xl font-kids text-indigo-900">{selectedLanguage} LEVELS</h2>
          <div className="w-12"></div>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto flex-1 pb-safe">
          {levels.map((level, i) => {
            const stars = levelProgress[level.id] || 0;
            const isUnlocked = i === 0 || levelProgress[levels[i-1].id] > 0;
            const isTutorialFocus = isTutorialActive && tutorialStep === 3 && i === 0;
            return (
              <button
                key={level.id}
                disabled={!isUnlocked}
                onClick={() => { vibrate(10); startLevel(level); }}
                className={`p-4 rounded-[2rem] shadow-md transition-all flex flex-col items-center gap-1 border-4 ${isUnlocked ? 'bg-white border-white active:scale-95' : 'bg-gray-200 border-gray-300 opacity-50'} ${isTutorialFocus ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm ${level.difficulty === 'easy' ? 'bg-green-400' : level.difficulty === 'medium' ? 'bg-orange-400' : 'bg-red-400'}`}>
                  {level.gridSize}
                </div>
                <div className="font-black text-xs text-indigo-900">Level {i + 1}</div>
                {renderStars(stars, 'text-[10px]')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPlaying = () => {
    if (!currentLevel) return null;
    const size = currentLevel.gridSize;
    const emptyPosList = tiles.filter(t => !t.letter).map(t => t.currentPos);

    return (
      <div className="h-full bg-slate-100 flex flex-col p-4 pt-safe pb-safe overflow-hidden relative">
        {isTutorialActive && tutorialStep === 4 && (
          <TutorialOverlay 
            step={4} 
            message="Slide letters! Tap a letter to pick it up, then tap an empty spot to move it." 
            position="top"
            onNext={() => advanceTutorial(4)}
            onSkip={completeTutorial}
          />
        )}
        {isTutorialActive && tutorialStep === 5 && (
          <TutorialOverlay 
            step={5} 
            message="Use the HINTS button if you get stuck to see where the letters go!" 
            position="bottom"
            onNext={() => completeTutorial()}
            onSkip={completeTutorial}
          />
        )}

        <header className="flex items-center justify-between mb-4 bg-white p-3 rounded-2xl shadow-md border-2 border-indigo-50">
          <div>
            <h3 className="text-xs font-black text-indigo-900 uppercase">{currentLevel.name.split(':')[0]}</h3>
            <p className="text-[10px] text-indigo-400 font-bold">MOVES: {moves}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSound} className="w-10 h-10 bg-indigo-50 text-lg rounded-full flex items-center justify-center">{isSoundEnabled ? '🔊' : '🔇'}</button>
            <button onClick={() => setGameState('level-select')} className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black border border-red-100">QUIT</button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div 
            className="grid gap-1 w-full aspect-square max-h-full bg-indigo-900/10 p-2 rounded-2xl shadow-xl border-4 border-white relative"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {Array.from({ length: size * size }).map((_, slotIndex) => {
              const tile = tiles.find(t => t.currentPos === slotIndex);
              const isSelected = selectedTilePos === slotIndex;
              const isCorrect = tile?.letter && tile.currentPos === tile.targetPos;
              const charClass = (tile?.letter?.language === 'Urdu' || tile?.letter?.language === 'Pashto') ? 'urdu-text' : tile?.letter?.language === 'Arabic' ? 'arabic-text' : '';
              
              const isMoveable = tile?.letter && emptyPosList.some(ep => findPath(slotIndex, ep));
              const shouldShowBlink = showHints && !isCorrect && isMoveable;

              return (
                <button
                  key={slotIndex}
                  onClick={() => handleTileClick(slotIndex)}
                  className={`
                    relative rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center cursor-pointer select-none
                    ${tile?.letter ? `${tile.letter.color} text-white border-2 border-white/30` : 'bg-indigo-950/5 border-2 border-dashed border-indigo-200'}
                    ${isSelected ? 'ring-4 ring-yellow-400 scale-95 z-10' : ''}
                    ${isCorrect ? 'tile-correct' : ''}
                    ${shouldShowBlink ? 'animate-hint-blink' : ''}
                  `}
                >
                  {tile?.letter && (
                    <div className="flex flex-col items-center">
                      <span className={`${getCharSizeClass(size)} ${charClass} font-bold drop-shadow-sm`}>{tile.letter.char}</span>
                    </div>
                  )}
                  {(showHints || (isTutorialActive && tutorialStep >= 4)) && tile?.letter && (
                    <span className="absolute top-0.5 left-1 text-[8px] opacity-40 font-black">{tile.targetPos + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <footer className="mt-6 flex justify-center gap-4">
          <button 
            onClick={() => { vibrate(10); startLevel(currentLevel); }}
            className="flex-1 py-4 bg-white text-indigo-600 rounded-full text-sm font-black shadow-lg active:scale-95 border-2 border-indigo-100"
          >
            SHUFFLE 🔀
          </button>
          <button 
            onClick={() => { 
              vibrate(10); 
              setShowHints(!showHints); 
              if (tutorialStep === 5) completeTutorial();
            }}
            className={`flex-1 py-4 ${showHints ? 'bg-yellow-400 text-indigo-900' : 'bg-white text-indigo-600'} rounded-full text-sm font-black shadow-lg active:scale-95 border-2 border-indigo-100 ${isTutorialActive && tutorialStep === 5 ? 'ring-4 ring-indigo-600 animate-pulse' : ''}`}
          >
            {showHints ? 'HINTS ON 💡' : 'HINTS OFF 💡'}
          </button>
        </footer>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
      <ConfettiBurst />
      <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl animate-success-pop text-center border-8 border-yellow-400">
        <h2 className="text-5xl font-kids text-indigo-900 mb-2">WOW!</h2>
        <p className="text-indigo-400 font-bold mb-6 tracking-widest uppercase">PUZZLE SOLVED!</p>
        <div className="mb-8 flex justify-center">{renderStars(lastStars, 'text-6xl')}</div>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => {
              vibrate(20);
              const levels = selectedLanguage === 'Urdu' ? URDU_LEVELS :
                             selectedLanguage === 'Arabic' ? ARABIC_LEVELS :
                             selectedLanguage === 'English' ? ENGLISH_LEVELS :
                             selectedLanguage === 'Italian' ? ITALIAN_LEVELS : PASHTO_LEVELS;
              const curIdx = levels.findIndex(l => l.id === currentLevel?.id);
              if (curIdx < levels.length - 1) startLevel(levels[curIdx + 1]);
              else setGameState('level-select');
            }}
            className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black text-2xl shadow-[0_8px_0_rgb(194,65,12)] active:translate-y-1 active:shadow-none transition-all"
          >
            NEXT →
          </button>
          <button 
            onClick={() => setGameState('level-select')}
            className="w-full py-4 bg-indigo-100 text-indigo-600 rounded-2xl font-black text-lg"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full font-kids antialiased text-slate-900 overflow-hidden">
      {gameState === 'home' && renderHome()}
      {gameState === 'language-select' && renderLanguageSelect()}
      {gameState === 'level-select' && renderLevelSelect()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'complete' && renderComplete()}
    </div>
  );
};

export default App;
