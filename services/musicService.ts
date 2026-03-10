
export class MusicService {
  private audioContext: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private loopInterval: any = null;

  constructor() {
    // Initialization happens on first play/warmup due to browser restrictions
  }

  private init() {
    if (this.audioContext) return;
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
  }

  public async start() {
    if (this.isPlaying) return;
    this.init();
    if (!this.audioContext || !this.gainNode) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isPlaying = true;
    this.gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 2);
    this.playLullabyLoop();
  }

  public stop() {
    if (!this.isPlaying) return;
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1);
    }
    setTimeout(() => {
      this.isPlaying = false;
      if (this.loopInterval) {
        clearTimeout(this.loopInterval);
        this.loopInterval = null;
      }
    }, 1000);
  }

  private playLullabyLoop() {
    if (!this.audioContext || !this.gainNode) return;

    const notes = [
      { f: 261.63, d: 0.5 }, // C4
      { f: 329.63, d: 0.5 }, // E4
      { f: 392.00, d: 0.5 }, // G4
      { f: 523.25, d: 1.0 }, // C5
      { f: 440.00, d: 0.5 }, // A4
      { f: 349.23, d: 0.5 }, // F4
      { f: 329.63, d: 1.0 }, // E4
      { f: 293.66, d: 1.0 }, // D4
    ];

    let noteIndex = 0;
    const playNextNote = () => {
      if (!this.isPlaying || !this.audioContext || !this.gainNode) return;
      
      const note = notes[noteIndex];
      const osc = this.audioContext.createOscillator();
      const noteGain = this.audioContext.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, this.audioContext.currentTime);
      
      noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + note.d);
      
      osc.connect(noteGain);
      noteGain.connect(this.gainNode);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + note.d);
      
      noteIndex = (noteIndex + 1) % notes.length;
      this.loopInterval = setTimeout(playNextNote, note.d * 1000);
    };

    playNextNote();
  }
}

export const musicService = new MusicService();
