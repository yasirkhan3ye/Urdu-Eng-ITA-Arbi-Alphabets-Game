import { Language } from "../types";

export class AlphabetVoiceService {
  private synthesis: SpeechSynthesis;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.synthesis = window.speechSynthesis;
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume context if it was suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  speak(text: string, language: Language) {
    if (!this.synthesis) return;

    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<Language, string> = {
      'Urdu': 'ur-PK',
      'Arabic': 'ar-SA',
      'Pashto': 'ps-AF',
      'English': 'en-US',
      'Italian': 'it-IT'
    };

    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.2;

    const voices = this.synthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(langMap[language]));
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  playWinMelody() {
    this.initAudioContext();
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number, volume: number = 0.2, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      // Cheerful subtle slide up
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, start + duration);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // --- Cheerful Arpeggio (Rising Action) ---
    playNote(261.63, now, 0.4);       // C4
    playNote(329.63, now + 0.15, 0.4); // E4
    playNote(392.00, now + 0.3, 0.4);  // G4
    playNote(523.25, now + 0.45, 0.6); // C5

    // --- Triumphant "TA-DA!" Chord (Impact) ---
    const tadaTime = now + 0.7;
    // Layered C Major chord for richness
    playNote(261.63, tadaTime, 1.2, 0.15, 'sawtooth'); // Bass C
    playNote(329.63, tadaTime, 1.2, 0.1, 'triangle'); // E
    playNote(392.00, tadaTime, 1.2, 0.1, 'triangle'); // G
    playNote(523.25, tadaTime, 1.5, 0.2, 'square');   // High C

    // --- Magical Sparkle (High freq notes) ---
    playNote(1046.50, tadaTime + 0.2, 0.4, 0.1);
    playNote(1318.51, tadaTime + 0.4, 0.4, 0.1);
    playNote(1567.98, tadaTime + 0.6, 0.5, 0.05);
  }
}

export const alphabetVoiceService = new AlphabetVoiceService();