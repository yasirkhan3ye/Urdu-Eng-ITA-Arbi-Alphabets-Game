
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Home, Volume2, Play } from "lucide-react";
import { GameState, Level, AlphabetLetter, Language, TileState } from './types';
import { 
  ALL_ALPHABET, 
  URDU_LEVELS, ARABIC_LEVELS, ENGLISH_LEVELS, ITALIAN_LEVELS, PASHTO_LEVELS, GERMAN_LEVELS,
  URDU_ALPHABET, ARABIC_ALPHABET, ENGLISH_ALPHABET, ITALIAN_ALPHABET, PASHTO_ALPHABET, GERMAN_ALPHABET
} from './constants';
import { alphabetVoiceService } from './services/alphabetVoiceService';
import { musicService } from './services/musicService';

const NUM_EMPTY_SPACES = 2;
const FEEDBACK_FORM_URL = "https://forms.gle/CWeuXGzWLu4VXkjdA";

const vibrate = (duration: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

const renderStars = (count: number, className: string = '') => (
  <div className={`flex gap-0.5 ${className}`}>
    {[1, 2, 3].map(i => (
      <span key={i} className={i <= count ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ))}
  </div>
);

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
        color: ['#818cf8', '#34d399', '#60a5fa', '#f87171', '#c084fc', '#fb923c'][Math.floor(Math.random() * 6)],
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
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[200] flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className={`absolute ${posClass} w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl border-2 border-indigo-50 animate-success-pop`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
          Step {step}
        </div>
        <p className="text-slate-800 font-bold text-center text-lg mb-8 leading-tight">
          {message}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={onNext}
            className="button-pop w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100"
          >
            GOT IT!
          </button>
          <button 
            onClick={onSkip}
            className="button-pop w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-bold text-xs tracking-widest uppercase"
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
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [selectedTilePos, setSelectedTilePos] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'alphabet' | 'numbers' | 'baby-slide'>('alphabet');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
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
    const savedMusic = localStorage.getItem('alphabet_sliding_music_enabled');
    if (savedMusic !== null) {
      setIsMusicEnabled(savedMusic === 'true');
    }
  }, []);

  useEffect(() => {
    if (isMusicEnabled && gameState === 'playing') {
      musicService.start();
    } else {
      musicService.stop();
    }
  }, [isMusicEnabled, gameState]);

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    localStorage.setItem('alphabet_sliding_music_enabled', String(newState));
    vibrate(10);
  };

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
    alphabetVoiceService.warmUp();
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
    alphabetVoiceService.warmUp();
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
      const neighbors: number[] = [];
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
      const neighbors: number[] = [];
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
    alphabetVoiceService.warmUp();
    const clickedTile = tiles.find(t => t.currentPos === clickedPos);
    
    if (selectedTilePos === null) {
      if (clickedTile?.letter) {
        setSelectedTilePos(clickedPos);
        vibrate(5);
        if (isSoundEnabled) {
          alphabetVoiceService.speak(clickedTile.letter.name, clickedTile.letter.language);
        }
      }
      return;
    }

    const selectedTile = tiles.find(t => t.currentPos === selectedTilePos);
    
    if (clickedPos === selectedTilePos) {
      setSelectedTilePos(null);
      return;
    }

    if (!clickedTile?.letter && selectedTile?.letter) {
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
        
        if (isSoundEnabled && selectedTile.letter && clickedPos === selectedTile.targetPos) {
           alphabetVoiceService.speak(selectedTile.letter.name, selectedTile.letter.language);
        }

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
      if (isSoundEnabled && clickedTile?.letter) {
        alphabetVoiceService.speak(clickedTile.letter.name, clickedTile.letter.language);
      }
    }
  };

  const repeatCurrentLetter = () => {
    if (selectedTilePos !== null) {
      const tile = tiles.find(t => t.currentPos === selectedTilePos);
      if (tile?.letter && isSoundEnabled) {
        alphabetVoiceService.speak(tile.letter.name, tile.letter.language);
        vibrate(5);
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
        if (isSoundEnabled) {
      alphabetVoiceService.playWinMelody();
      setTimeout(() => {
        const lang = selectedLanguage || 'English';
        const msg = lang === 'Urdu' ? 'بہت اچھے' : lang === 'Arabic' ? 'أحسنتم' : lang === 'German' ? 'Gut gemacht!' : 'Well done!';
        alphabetVoiceService.speak(msg, lang);
      }, 1000);
    }
    
    if (isTutorialActive) {
      completeTutorial();
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-full soft-theme text-slate-900 p-8">
      {isTutorialActive && tutorialStep === 1 && (
        <TutorialOverlay 
          step={1} 
          message="Welcome! Let's learn alphabets and numbers with fun puzzles!" 
          position="center"
          onNext={() => advanceTutorial(1)}
          onSkip={completeTutorial}
        />
      )}
      <div className="mb-12 text-center">
        <h1 className="text-6xl sm:text-8xl font-kids text-indigo-600 mb-4 tracking-tight">Kids Slide</h1>
        <p className="text-indigo-400 font-bold tracking-widest uppercase text-sm">Learn & Play Together</p>
      </div>
      
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <button 
          onClick={() => { 
            vibrate(20); 
            alphabetVoiceService.warmUp();
            setGameMode('alphabet');
            setGameState('language-select');
            if (tutorialStep === 1) advanceTutorial(1);
          }}
          className={`button-pop w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl sm:text-3xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 ${isTutorialActive && tutorialStep === 1 ? 'animate-pulse ring-8 ring-indigo-100' : ''}`}
        >
          <span>ALPHABETS</span>
          <span className="text-3xl">🔤</span>
        </button>

        <button 
          onClick={() => { 
            vibrate(20); 
            alphabetVoiceService.warmUp();
            setGameMode('numbers');
            setGameState('language-select');
          }}
          className="button-pop w-full py-6 bg-white border-4 border-indigo-600 text-indigo-600 rounded-[2.5rem] font-black text-2xl sm:text-3xl shadow-xl shadow-indigo-50 flex items-center justify-center gap-3"
        >
          <span>NUMBERS</span>
          <span className="text-3xl">🔢</span>
        </button>

        <button 
          onClick={() => { 
            vibrate(20); 
            alphabetVoiceService.warmUp();
            setGameMode('baby-slide');
            setGameState('language-select');
          }}
          className="button-pop w-full py-6 bg-emerald-500 text-white rounded-[2.5rem] font-black text-2xl sm:text-3xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3"
        >
          <span>LEARN ABC</span>
          <span className="text-3xl">👶</span>
        </button>
        
        <div className="flex flex-col items-center gap-6 w-full mt-4">
          <div className="flex gap-4">
            <button onClick={toggleSound} className="button-pop px-6 py-3 bg-white border-2 border-slate-100 rounded-full text-slate-600 font-bold flex items-center gap-3 shadow-sm">
              {isSoundEnabled ? '🔊 Sound' : '🔇 Sound'}
            </button>
            <button onClick={toggleMusic} className="button-pop px-6 py-3 bg-white border-2 border-slate-100 rounded-full text-slate-600 font-bold flex items-center gap-3 shadow-sm">
              {isMusicEnabled ? '🎵 Music' : '🔇 Music'}
            </button>
          </div>
          
          <button 
            onClick={() => { vibrate(10); setGameState('feedback'); }}
            className="button-pop px-8 py-3 bg-indigo-50 text-indigo-600 rounded-full font-bold text-xs tracking-widest uppercase flex items-center gap-2"
          >
            <span>Help & Feedback</span>
            <span>✨</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanguageSelect = () => {
    const langData = [
      { id: 'Pashto', flag: '🇦🇫', script: 'پښتو', label: 'PASHTO', color: 'bg-orange-50' },
      { id: 'Urdu', flag: '🇵🇰', script: 'اردو زبان', label: 'URDU', color: 'bg-indigo-50' },
      { id: 'English', flag: '🇬🇧', script: 'English', label: 'ENGLISH', color: 'bg-sky-50' },
      { id: 'Arabic', flag: '🇸🇦', script: 'اللغة العربية', label: 'ARABIC', color: 'bg-rose-50' },
      { id: 'Italian', flag: '🇮🇹', script: 'Italiano', label: 'ITALIAN', color: 'bg-emerald-50' },
      { id: 'German', flag: '🇩🇪', script: 'Deutsch', label: 'GERMAN', color: 'bg-amber-50' },
    ];

    return (
      <div className="h-full soft-theme px-8 py-12 flex flex-col items-center overflow-y-auto">
        {isTutorialActive && tutorialStep === 2 && (
          <TutorialOverlay 
            step={2} 
            message="Great! Now choose a language to see its alphabet." 
            position="top"
            onNext={() => advanceTutorial(2)}
            onSkip={completeTutorial}
          />
        )}
        <div className="mb-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-kids text-slate-800 mb-2 tracking-tight">
            {gameMode === 'numbers' ? 'Number Language' : gameMode === 'baby-slide' ? 'Baby ABC Language' : 'Alphabet Language'}
          </h2>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Select your journey</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-lg w-full mb-12">
          {langData.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { 
                vibrate(10); 
                alphabetVoiceService.warmUp();
                setSelectedLanguage(lang.id as Language); 
                if (gameMode === 'baby-slide') {
                  setGameState('alphabet-slide');
                  setCurrentSlideIndex(0);
                } else {
                  setGameState('level-select');
                }
                if (tutorialStep === 2) setTutorialStep(3);
              }}
              className={`
                button-pop ${lang.color} rounded-[2.5rem] p-6 flex flex-col items-center justify-center aspect-square
                border-2 border-white shadow-sm
                ${isTutorialActive && tutorialStep === 2 ? 'ring-4 ring-indigo-600' : ''}
              `}
            >
              <span className="text-4xl mb-3">{lang.flag}</span>
              <span className={`text-xl sm:text-2xl font-bold text-center leading-tight mb-1 ${lang.id === 'Urdu' || lang.id === 'Pashto' ? 'urdu-text' : lang.id === 'Arabic' ? 'arabic-text' : ''} text-slate-800`}>{lang.script}</span>
              <span className="text-[10px] font-black text-slate-400 tracking-widest">{lang.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => { alphabetVoiceService.warmUp(); setGameState('home'); }} className="button-pop px-8 py-3 bg-white border-2 border-slate-100 rounded-full text-slate-400 font-bold text-sm tracking-widest uppercase">Go Back</button>
      </div>
    );
  };

  const renderLevelSelect = () => {
    const allLevels = selectedLanguage === 'Urdu' ? URDU_LEVELS :
                     selectedLanguage === 'Arabic' ? ARABIC_LEVELS :
                     selectedLanguage === 'English' ? ENGLISH_LEVELS :
                     selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                     selectedLanguage === 'German' ? GERMAN_LEVELS : PASHTO_LEVELS;
    
    const levels = allLevels.filter(level => 
      gameMode === 'numbers' ? level.name.includes('Numbers') : !level.name.includes('Numbers')
    );

    return (
      <div className="h-full soft-theme p-6 flex flex-col relative">
        {isTutorialActive && tutorialStep === 3 && (
          <TutorialOverlay 
            step={3} 
            message={`Choose ${gameMode === 'numbers' ? 'Numbers' : 'Level 1'} to start your first puzzle!`} 
            position="top"
            onNext={() => advanceTutorial(3)}
            onSkip={completeTutorial}
          />
        )}
        <header className="flex items-center justify-between mb-8 pt-safe">
          <button onClick={() => { alphabetVoiceService.warmUp(); setGameState('language-select'); }} className="button-pop px-4 py-2 bg-white border border-slate-100 rounded-full text-slate-400 font-bold text-[10px] tracking-widest uppercase">← BACK</button>
          <div className="text-center">
            <h2 className="text-2xl font-kids text-slate-800">{selectedLanguage} {gameMode === 'numbers' ? 'Numbers' : ''}</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Select {gameMode === 'numbers' ? 'Challenge' : 'Level'}</p>
          </div>
          <div className="w-16"></div>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto flex-1 pb-safe">
          {levels.map((level, i) => {
            const stars = levelProgress[level.id] || 0;
            const isUnlocked = i === 0 || levelProgress[levels[i-1].id] > 0;
            const isTutorialFocus = isTutorialActive && tutorialStep === 3 && i === 0;
            return (
              <button
                key={level.id}
                disabled={!isUnlocked}
                onClick={() => { vibrate(10); startLevel(level); }}
                className={`button-pop p-5 rounded-[2.5rem] shadow-sm flex flex-col items-center gap-2 border-2 ${isUnlocked ? 'bg-white border-white' : 'bg-slate-50 border-slate-100 opacity-40'} ${isTutorialFocus ? 'ring-4 ring-indigo-600 animate-pulse' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm ${level.difficulty === 'easy' ? 'bg-emerald-400' : level.difficulty === 'medium' ? 'bg-amber-400' : 'bg-rose-400'}`}>{level.gridSize}</div>
                <div className="font-black text-[10px] text-slate-400 tracking-widest uppercase">
                  {level.name.includes('Numbers') ? 'Numbers' : `Level ${i + 1}`}
                </div>
                {renderStars(stars, 'text-xs')}
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
      <div className="h-full soft-theme flex flex-col p-6 pt-safe pb-safe overflow-hidden relative">
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

        <header className="flex items-center justify-between mb-6 bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
             <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentLevel.name.split(':')[0]}</h3>
                <p className="text-xs text-indigo-600 font-bold">MOVES: {moves}</p>
             </div>
             {selectedTilePos !== null && (
               <button 
                 onClick={repeatCurrentLetter}
                 className="w-10 h-10 bg-indigo-50 text-xl rounded-full flex items-center justify-center animate-pulse"
               >
                 🔊
               </button>
             )}
          </div>
          <div className="flex gap-3">
            <button onClick={toggleSound} className="button-pop w-10 h-10 bg-slate-50 text-lg rounded-full flex items-center justify-center">{isSoundEnabled ? '🔊' : '🔇'}</button>
            <button onClick={toggleMusic} className="button-pop w-10 h-10 bg-slate-50 text-lg rounded-full flex items-center justify-center">{isMusicEnabled ? '🎵' : '🔇'}</button>
            <button onClick={() => { alphabetVoiceService.warmUp(); setGameState('level-select'); }} className="button-pop px-4 py-2 bg-rose-50 text-rose-500 rounded-full text-[10px] font-black tracking-widest uppercase">QUIT</button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <div 
            className="grid gap-2 w-full aspect-square max-h-full bg-slate-100/50 p-3 rounded-[2.5rem] shadow-inner border-4 border-white relative"
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
                    relative rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center cursor-pointer select-none
                    ${tile?.letter ? `${tile.letter.color} text-white border-2 border-white/20` : 'bg-white/40 border-2 border-dashed border-slate-200'}
                    ${isSelected ? 'ring-4 ring-indigo-400 scale-95 z-10' : ''}
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
                    <span className="absolute top-1 left-2 text-[8px] opacity-40 font-black">{tile.targetPos + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <footer className="mt-8 flex justify-center gap-4">
          <button onClick={() => { vibrate(10); alphabetVoiceService.warmUp(); startLevel(currentLevel); }} className="button-pop flex-1 py-5 bg-white text-slate-600 rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-sm border border-slate-100">SHUFFLE 🔀</button>
          <button onClick={() => { vibrate(10); alphabetVoiceService.warmUp(); setShowHints(!showHints); if (tutorialStep === 5) completeTutorial(); }} className={`button-pop flex-1 py-5 ${showHints ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'} rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-sm border border-slate-100 ${isTutorialActive && tutorialStep === 5 ? 'ring-4 ring-indigo-600 animate-pulse' : ''}`}>{showHints ? 'HINTS ON 💡' : 'HINTS OFF 💡'}</button>
        </footer>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-8 z-[100]">
      <ConfettiBurst />
      <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl animate-success-pop text-center border-4 border-indigo-50">
        <h2 className="text-5xl font-kids text-indigo-600 mb-2">WOW!</h2>
        <p className="text-slate-400 font-bold mb-8 tracking-widest uppercase text-xs">Puzzle Solved!</p>
        <div className="mb-10 flex justify-center">{renderStars(lastStars, 'text-6xl')}</div>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => {
              vibrate(20);
              alphabetVoiceService.warmUp();
              const levels = selectedLanguage === 'Urdu' ? URDU_LEVELS :
                             selectedLanguage === 'Arabic' ? ARABIC_LEVELS :
                             selectedLanguage === 'English' ? ENGLISH_LEVELS :
                             selectedLanguage === 'Italian' ? ITALIAN_LEVELS : 
                             selectedLanguage === 'German' ? GERMAN_LEVELS : PASHTO_LEVELS;
              const curIdx = levels.findIndex(l => l.id === currentLevel?.id);
              if (curIdx < levels.length - 1) startLevel(levels[curIdx + 1]);
              else setGameState('level-select');
            }}
            className="button-pop w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-lg shadow-indigo-100"
          >
            NEXT →
          </button>
          <button onClick={() => { alphabetVoiceService.warmUp(); setGameState('level-select'); }} className="button-pop w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-sm tracking-widest uppercase">Menu</button>
        </div>
      </div>
    </div>
  );

  const renderFeedback = () => {
    return (
      <div className="h-full soft-theme p-8 flex flex-col items-center overflow-y-auto">
        <header className="w-full flex items-center justify-between mb-12 pt-safe">
          <button onClick={() => setGameState('home')} className="button-pop px-4 py-2 bg-white border border-slate-100 rounded-full text-slate-400 font-bold text-[10px] tracking-widest uppercase">← BACK</button>
          <h2 className="text-2xl font-kids text-slate-800">Help & Feedback</h2>
          <div className="w-16"></div>
        </header>

        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col gap-4">
            <h3 className="text-indigo-600 font-black text-sm tracking-widest uppercase mb-2">Support</h3>
            
            <button 
              onClick={() => window.open(FEEDBACK_FORM_URL, '_blank')}
              className="button-pop w-full p-8 bg-indigo-600 text-white rounded-[2rem] flex flex-col items-center gap-4 text-center shadow-lg shadow-indigo-100"
            >
              <span className="text-4xl">✨</span>
              <div>
                <p className="font-black text-lg">Send Feedback</p>
                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Bugs, Ideas & Questions</p>
              </div>
            </button>

            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              Your feedback helps us make the app better for everyone!
            </p>
          </div>

          <div className="bg-indigo-50 p-8 rounded-[2.5rem] flex flex-col items-center text-center gap-2">
            <p className="text-indigo-600 font-black text-xs tracking-widest uppercase">Version 3.3.0</p>
            <p className="text-indigo-400 text-[10px] font-bold">Made with ❤️ for young learners</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAlphabetSlide = () => {
    if (!selectedLanguage) return null;
    
    const alphabet = selectedLanguage === 'Urdu' ? URDU_ALPHABET :
                     selectedLanguage === 'Arabic' ? ARABIC_ALPHABET :
                     selectedLanguage === 'English' ? ENGLISH_ALPHABET :
                     selectedLanguage === 'Italian' ? ITALIAN_ALPHABET : 
                     selectedLanguage === 'German' ? GERMAN_ALPHABET : PASHTO_ALPHABET;
    
    const currentLetter = alphabet[currentSlideIndex];
    
    const nextSlide = () => {
      if (currentSlideIndex < alphabet.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
        vibrate(10);
      }
    };
    
    const prevSlide = () => {
      if (currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1);
        vibrate(10);
      }
    };
    
    const playLetterSound = () => {
      alphabetVoiceService.speak(currentLetter.char, selectedLanguage);
      vibrate(20);
    };
    
    const playWordSound = () => {
      if (currentLetter.exampleWord) {
        alphabetVoiceService.speak(currentLetter.exampleWord, selectedLanguage);
        vibrate(20);
      }
    };

    return (
      <div className="h-full soft-theme flex flex-col items-center justify-between p-6 relative overflow-hidden">
        {/* Header */}
        <header className="w-full flex items-center justify-between pt-safe">
          <button 
            onClick={() => setGameState('language-select')} 
            className="button-pop p-4 bg-white border-2 border-slate-100 rounded-full text-slate-400 shadow-sm"
          >
            <Home size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-kids text-slate-800">{selectedLanguage}</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              {currentSlideIndex + 1} / {alphabet.length}
            </p>
          </div>
          <div className="w-14"></div>
        </header>

        {/* Slide Content */}
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLetter.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex flex-col items-center gap-6"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) nextSlide();
                if (info.offset.x > 50) prevSlide();
              }}
            >
              {/* Big Letter */}
              <button 
                onClick={playLetterSound}
                className={`w-48 h-48 sm:w-64 sm:h-64 rounded-[3rem] ${currentLetter.color} flex items-center justify-center text-white shadow-2xl border-8 border-white/30 button-pop`}
              >
                <span className={`text-8xl sm:text-9xl font-black ${selectedLanguage === 'Urdu' || selectedLanguage === 'Pashto' ? 'urdu-text' : selectedLanguage === 'Arabic' ? 'arabic-text' : ''}`}>
                  {currentLetter.char}
                </span>
              </button>

              {/* Example Word */}
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={playWordSound}
                  className="button-pop bg-white border-4 border-indigo-50 px-12 py-8 rounded-[3rem] shadow-xl flex flex-col items-center justify-center min-w-[280px]"
                >
                  <p className="text-indigo-400 font-black text-xs tracking-widest uppercase mb-2">
                    {currentLetter.char} is for
                  </p>
                  <p className={`text-5xl sm:text-7xl font-black text-slate-800 ${selectedLanguage === 'Urdu' || selectedLanguage === 'Pashto' ? 'urdu-text' : selectedLanguage === 'Arabic' ? 'arabic-text' : ''}`}>
                    {currentLetter.exampleWord}
                  </p>
                  <div className="mt-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg shadow-indigo-100">
                    <Volume2 size={24} />
                  </div>
                </button>
                
                <div className="flex flex-col items-center">
                  <p className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase">
                    {currentLetter.name}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="w-full max-w-md flex items-center justify-between gap-4 pb-safe">
          <button 
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className={`flex-1 py-6 rounded-[2rem] flex items-center justify-center gap-2 font-black text-xl shadow-lg transition-all button-pop ${currentSlideIndex === 0 ? 'bg-slate-100 text-slate-300' : 'bg-white text-indigo-600 border-2 border-indigo-50'}`}
          >
            <ChevronLeft size={32} />
            <span className="hidden sm:inline">BACK</span>
          </button>

          <button 
            onClick={playLetterSound}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-200 button-pop"
          >
            <Volume2 size={40} />
          </button>

          <button 
            onClick={nextSlide}
            disabled={currentSlideIndex === alphabet.length - 1}
            className={`flex-1 py-6 rounded-[2rem] flex items-center justify-center gap-2 font-black text-xl shadow-lg transition-all button-pop ${currentSlideIndex === alphabet.length - 1 ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white shadow-indigo-200'}`}
          >
            <span className="hidden sm:inline">NEXT</span>
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full font-kids antialiased text-slate-900 overflow-hidden">
      {gameState === 'home' && renderHome()}
      {gameState === 'language-select' && renderLanguageSelect()}
      {gameState === 'level-select' && renderLevelSelect()}
      {gameState === 'playing' && renderPlaying()}
      {gameState === 'complete' && renderComplete()}
      {gameState === 'feedback' && renderFeedback()}
      {gameState === 'alphabet-slide' && renderAlphabetSlide()}
    </div>
  );
};

export default App;
