
import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
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
};

export class AlphabetVoiceService {
  private audioContext: AudioContext | null = null;
  private cache: Map<string, AudioBuffer> = new Map();

  constructor() {}

  private async getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  async speak(text: string, language: Language) {
    const cacheKey = `${language}:${text}`;
    if (this.cache.has(cacheKey)) {
      this.playBuffer(this.cache.get(cacheKey)!);
      return;
    }

    try {
      // Fix: Instantiate GoogleGenAI right before API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say in clear, slow ${language}: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: language === 'Arabic' ? 'Puck' : 'Kore' },
            },
          },
        },
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) throw new Error("No candidates received");
      
      const parts = candidates[0].content?.parts;
      if (!parts) throw new Error("No parts in candidate content");

      const audioPart = parts.find(p => p.inlineData && p.inlineData.data);
      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) throw new Error("No audio data found in response parts");

      const ctx = await this.getAudioContext();
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1,
      );

      this.cache.set(cacheKey, audioBuffer);
      this.playBuffer(audioBuffer);
    } catch (error) {
      console.error("TTS Error:", error);
    }
  }

  private async playBuffer(buffer: AudioBuffer) {
    const ctx = await this.getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
}

export const alphabetVoiceService = new AlphabetVoiceService();
