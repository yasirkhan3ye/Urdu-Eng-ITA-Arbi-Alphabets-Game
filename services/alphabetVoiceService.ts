
import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

// Manual base64 decoding as required for raw PCM data
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual PCM decoding to AudioBuffer
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class AlphabetVoiceService {
  private localSynthesis: SpeechSynthesis | null = null;
  private audioContext: AudioContext | null = null;
  private isWarmedUp: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.localSynthesis = window.speechSynthesis;
      this.tryLoadLocalVoices();
      if (this.localSynthesis && this.localSynthesis.onvoiceschanged !== undefined) {
        this.localSynthesis.onvoiceschanged = () => this.tryLoadLocalVoices();
      }
    }
  }

  private tryLoadLocalVoices() {
    if (!this.localSynthesis) return;
    const fetched = this.localSynthesis.getVoices();
    if (fetched.length > 0) this.voices = fetched;
  }

  public async warmUp() {
    if (this.isWarmedUp) {
      if (this.audioContext?.state === 'suspended') await this.audioContext.resume();
      return;
    }
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (this.audioContext.state === 'suspended') await this.audioContext.resume();
      
      // Prime local TTS too
      if (this.localSynthesis) {
        this.localSynthesis.cancel();
        const silent = new SpeechSynthesisUtterance("");
        silent.volume = 0;
        this.localSynthesis.speak(silent);
      }
    } catch (e) {
      console.warn("Audio warm-up failed", e);
    }
    this.isWarmedUp = true;
  }

  /**
   * Primary high-accuracy speech using Gemini Neural TTS
   */
  private async speakNeural(text: string, language: Language): Promise<boolean> {
    try {
      if (!process.env.API_KEY) return false;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Speak the ${language} alphabet character clearly and slowly for a child: ${text}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is often cheerful and clear
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio || !this.audioContext) return false;

      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        this.audioContext,
        24000,
        1,
      );

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
      return true;
    } catch (error) {
      console.error("Neural TTS failed, falling back to local:", error);
      return false;
    }
  }

  /**
   * Local device fallback speech
   */
  private speakLocal(text: string, language: Language) {
    if (!this.localSynthesis) return;
    this.localSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap: Record<Language, string> = {
      'Urdu': 'ur-PK',
      'Arabic': 'ar-SA',
      'Pashto': 'ps-AF',
      'English': 'en-GB',
      'Italian': 'it-IT'
    };

    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 1.1;

    let voice = this.voices.find(v => v.lang === utterance.lang) || 
                this.voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) utterance.voice = voice;

    this.localSynthesis.speak(utterance);
  }

  public async speak(text: string, language: Language) {
    await this.warmUp();
    
    // Try the accurate neural online engine first
    const success = await this.speakNeural(text, language);
    
    // If neural fails (offline or API issue), use local synthesis
    if (!success) {
      this.speakLocal(text, language);
    }
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
