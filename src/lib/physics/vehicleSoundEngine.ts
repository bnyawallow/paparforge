// Synthesized Audio Engine for Vehicle Driving, Engine RPM, Tires, Horn and Collision Impacts
// Uses Web Audio API for zero-latency, realistic, responsive audio feedback.

class VehicleSoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineNoise: AudioBufferSourceNode | null = null;
  private engineGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isEngineRunning: boolean = false;
  private lastImpactTime: number = 0;
  private isHornPlaying: boolean = false;
  private hornOsc1: OscillatorNode | null = null;
  private hornOsc2: OscillatorNode | null = null;
  private hornGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Start or maintain synthesized engine audio loop
   */
  public startEngine() {
    try {
      this.initContext();
      if (!this.ctx || this.isEngineRunning) return;

      const now = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.01, now);
      this.engineGain.gain.linearRampToValueAtTime(0.12, now + 0.3);

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(320, now);
      this.filterNode.Q.setValueAtTime(2.5, now);

      // Low rumble cylinder oscillator
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, now);

      // Sub harmonic rumble
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'triangle';
      this.engineSubOsc.frequency.setValueAtTime(22.5, now);

      // White noise engine hiss/exhaust
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      this.engineNoise = this.ctx.createBufferSource();
      this.engineNoise.buffer = noiseBuffer;
      this.engineNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(280, now);
      noiseFilter.Q.setValueAtTime(3.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);

      this.engineNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.engineGain);

      this.engineOsc.connect(this.filterNode);
      this.engineSubOsc.connect(this.filterNode);
      this.filterNode.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
      this.engineSubOsc.start(now);
      this.engineNoise.start(now);

      this.isEngineRunning = true;
    } catch {
      // Ignore audio autoplay restrictions gracefully
    }
  }

  /**
   * Update engine RPM pitch and exhaust filter based on normalized vehicle speed (0 to 1) and throttle input
   */
  public updateRPM(speedRatio: number, isAccelerating: boolean) {
    if (!this.ctx || !this.isEngineRunning || !this.engineOsc || !this.engineSubOsc || !this.filterNode || !this.engineGain) return;

    try {
      const now = this.ctx.currentTime;
      const clampedRatio = Math.min(1.0, Math.max(0, speedRatio));
      
      // Idle pitch is ~45Hz, redline at ~280Hz
      const baseFreq = 48 + clampedRatio * 180 + (isAccelerating ? 25 : 0);
      this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.08);
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.08);

      // Lowpass cutoff opens up as revs increase
      const cutoff = 260 + clampedRatio * 900 + (isAccelerating ? 200 : 0);
      this.filterNode.frequency.setTargetAtTime(cutoff, now, 0.08);

      // Volume modulates slightly with load
      const targetGain = 0.08 + clampedRatio * 0.12 + (isAccelerating ? 0.05 : 0);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);
    } catch {
      // Catch any audio rate errors
    }
  }

  /**
   * Stop synthesized engine sound
   */
  public stopEngine() {
    if (!this.ctx || !this.isEngineRunning) return;
    try {
      const now = this.ctx.currentTime;
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, now + 0.2);
      }
      setTimeout(() => {
        try {
          this.engineOsc?.stop();
          this.engineSubOsc?.stop();
          this.engineNoise?.stop();
          this.engineOsc?.disconnect();
          this.engineSubOsc?.disconnect();
          this.engineNoise?.disconnect();
        } catch {}
        this.engineOsc = null;
        this.engineSubOsc = null;
        this.engineNoise = null;
        this.engineGain = null;
        this.filterNode = null;
        this.isEngineRunning = false;
      }, 250);
    } catch {
      this.isEngineRunning = false;
    }
  }

  /**
   * Play heavy or medium collision impact thud/crunch
   */
  public playCollisionImpact(intensity: number = 1.0) {
    const nowMs = performance.now();
    if (nowMs - this.lastImpactTime < 180) return; // Debounce rapid contacts
    this.lastImpactTime = nowMs;

    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const volume = Math.min(0.5, Math.max(0.1, intensity * 0.35));

      // 1. Low heavy thud
      const thudOsc = this.ctx.createOscillator();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      const thudGain = this.ctx.createGain();
      thudGain.gain.setValueAtTime(volume, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.25);

      // 2. High crunch/debris burst
      const bufferSize = this.ctx.sampleRate * 0.15;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(800, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseSource.start(now);
    } catch {}
  }

  /**
   * Play vehicle horn dual tone (European / US automotive dual 400Hz + 500Hz chord)
   */
  public startHorn() {
    if (this.isHornPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      this.hornGain = this.ctx.createGain();
      this.hornGain.gain.setValueAtTime(0.01, now);
      this.hornGain.gain.linearRampToValueAtTime(0.28, now + 0.05);

      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc1.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(415, now); // F4#

      this.hornOsc2 = this.ctx.createOscillator();
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc2.frequency.setValueAtTime(495, now); // B4

      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'lowpass';
      hornFilter.frequency.setValueAtTime(1400, now);

      this.hornOsc1.connect(hornFilter);
      this.hornOsc2.connect(hornFilter);
      hornFilter.connect(this.hornGain);
      this.hornGain.connect(this.ctx.destination);

      this.hornOsc1.start(now);
      this.hornOsc2.start(now);
      this.isHornPlaying = true;
    } catch {}
  }

  public stopHorn() {
    if (!this.ctx || !this.isHornPlaying) return;
    try {
      const now = this.ctx.currentTime;
      if (this.hornGain) {
        this.hornGain.gain.linearRampToValueAtTime(0.001, now + 0.08);
      }
      setTimeout(() => {
        try {
          this.hornOsc1?.stop();
          this.hornOsc2?.stop();
          this.hornOsc1?.disconnect();
          this.hornOsc2?.disconnect();
          this.hornGain?.disconnect();
        } catch {}
        this.hornOsc1 = null;
        this.hornOsc2 = null;
        this.hornGain = null;
        this.isHornPlaying = false;
      }, 100);
    } catch {
      this.isHornPlaying = false;
    }
  }

  /**
   * Play tire screech on hard braking or high-speed lateral drift
   */
  public playTireScreech(volume: number = 0.3) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.setValueAtTime(8.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(Math.min(0.35, volume), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }
}

export const vehicleSoundEngine = new VehicleSoundEngine();
