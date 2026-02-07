import { Language } from "../types";

export class AlphabetVoiceService {
  private synthesis: SpeechSynthesis;
  private audioContext: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices();
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
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
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    // Use pre-loaded voices if available
    const voice = this.voices.find(v => v.lang.startsWith(langMap[language]));
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
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, start + duration);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    playNote(261.63, now, 0.4);       
    playNote(329.63, now + 0.15, 0.4); 
    playNote(392.00, now + 0.3, 0.4);  
    playNote(523.25, now + 0.45, 0.6); 

    const tadaTime = now + 0.7;
    playNote(261.63, tadaTime, 1.2, 0.15, 'sawtooth'); 
    playNote(329.63, tadaTime, 1.2, 0.1, 'triangle'); 
    playNote(392.00, tadaTime, 1.2, 0.1, 'triangle'); 
    playNote(523.25, tadaTime, 1.5, 0.2, 'square');   

    playNote(1046.50, tadaTime + 0.2, 0.4, 0.1);
    playNote(1318.51, tadaTime + 0.4, 0.4, 0.1);
    playNote(1567.98, tadaTime + 0.6, 0.5, 0.05);
  }
}

export const alphabetVoiceService = new AlphabetVoiceService();