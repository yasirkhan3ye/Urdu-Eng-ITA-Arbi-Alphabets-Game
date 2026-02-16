
import { Language } from "../types";

export class AlphabetVoiceService {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isWarmedUp: boolean = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      if (this.synthesis && this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
      // Poll for voices (useful for Android WebViews)
      const interval = setInterval(() => {
        this.loadVoices();
        if (this.voices.length > 0) clearInterval(interval);
      }, 1000);
      setTimeout(() => clearInterval(interval), 10000);
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    const fetched = this.synthesis.getVoices();
    if (fetched.length > 0) {
      this.voices = fetched;
    }
  }

  /**
   * Unlocks audio hardware on mobile devices.
   */
  public async warmUp() {
    if (this.isWarmedUp) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      if (this.synthesis) {
        this.synthesis.cancel();
        const silent = new SpeechSynthesisUtterance("");
        silent.volume = 0;
        this.synthesis.speak(silent);
      }
    } catch (e) {
      console.warn("Audio warm-up failed", e);
    }
    this.isWarmedUp = true;
  }

  /**
   * Finds the best available offline voice for the given language.
   * Prioritizes Google, Samsung, and Apple "Premium" or "Enhanced" voices.
   */
  private findBestVoice(langCode: string): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) return null;

    // Filter voices matching the language code (e.g., 'ur-PK' or 'ur')
    const langVoices = this.voices.filter(v => 
      v.lang.toLowerCase() === langCode.toLowerCase() || 
      v.lang.toLowerCase().startsWith(langCode.toLowerCase().split('-')[0])
    );

    if (langVoices.length === 0) return null;

    // Priority 1: High quality/Natural sounding (Google or Samsung specifically)
    const premium = langVoices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Samsung') || 
      v.name.includes('Premium') || 
      v.name.includes('Enhanced')
    );
    if (premium) return premium;

    // Priority 2: Standard match
    const standard = langVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
    if (standard) return standard;

    // Priority 3: First available for that language family
    return langVoices[0];
  }

  public async speak(text: string, language: Language) {
    if (!this.synthesis) return;
    await this.warmUp();

    this.synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: Record<Language, string> = {
      'Urdu': 'ur-PK',
      'Arabic': 'ar-SA',
      'Pashto': 'ps-AF',
      'English': 'en-GB',
      'Italian': 'it-IT'
    };

    const targetLang = langMap[language];
    utterance.lang = targetLang;
    
    // Slow down slightly for educational clarity
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = this.findBestVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
    }

    // Small delay to ensure synthesis.cancel() has finished its cycle
    setTimeout(() => {
      this.synthesis?.speak(utterance);
    }, 50);
  }

  public playWinMelody() {
    if (!this.audioContext) return;
    const now = this.audioContext.currentTime;
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = this.audioContext!.createOscillator();
      const g = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.1, start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(g);
      g.connect(this.audioContext!.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    [261.63, 329.63, 392.00, 523.25].forEach((f, i) => playNote(f, now + i * 0.12, 0.4));
  }
}

export const alphabetVoiceService = new AlphabetVoiceService();
