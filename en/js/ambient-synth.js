/* ============================================
 * 心灵感应环境音合成器 (Telepathic Ambient Synth)
 * 纯代码实时生成的宇宙深空低频环境音效
 * ============================================ */

(() => {
  'use strict';

  class AmbientSynth {
    constructor() {
      this.audioCtx = null;
      this.osc1 = null;
      this.osc2 = null;
      this.filter = null;
      this.gainNode = null;
      this.isPlaying = false;
      this.baseFreq1 = 55; // A1
      this.baseFreq2 = 110; // A2
      
      this.scrollTarget = 0;
      this.currentScroll = 0;
      
      // Bindings
      this.handleScroll = this.handleScroll.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.updateLoop = this.updateLoop.bind(this);
    }

    init() {
      if (this.audioCtx) return;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      this.audioCtx = new AudioContext();
      
      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 0;
      this.gainNode.connect(this.audioCtx.destination);
      
      // Lowpass Filter
      this.filter = this.audioCtx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 400;
      this.filter.Q.value = 5;
      this.filter.connect(this.gainNode);
      
      // Oscillator 1 (Sub)
      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sine';
      this.osc1.frequency.value = this.baseFreq1;
      this.osc1.connect(this.filter);
      
      // Oscillator 2 (Drone)
      this.osc2 = this.audioCtx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.value = this.baseFreq2;
      
      // Panner for Osc 2
      this.panner = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : this.audioCtx.createGain();
      this.osc2.connect(this.panner);
      this.panner.connect(this.filter);
      
      this.osc1.start();
      this.osc2.start();
      
      window.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
      requestAnimationFrame(this.updateLoop);
    }

    start() {
      this.init();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      this.gainNode.gain.setTargetAtTime(0.3, this.audioCtx.currentTime, 2);
      this.isPlaying = true;
    }

    stop() {
      if (!this.isPlaying) return;
      this.gainNode.gain.setTargetAtTime(0.001, this.audioCtx.currentTime, 1);
      setTimeout(() => {
        if (this.audioCtx && this.audioCtx.state === 'running') {
          this.audioCtx.suspend();
        }
        this.isPlaying = false;
      }, 2000);
    }

    handleScroll() {
      this.scrollTarget = 1;
    }

    handleMouseMove(e) {
      if (!this.isPlaying || !this.audioCtx) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      if (this.panner.pan) {
        this.panner.pan.setTargetAtTime((x * 2) - 1, this.audioCtx.currentTime, 0.1);
      }
      
      const newFreq = this.baseFreq2 + (1 - y) * 20;
      this.osc2.frequency.setTargetAtTime(newFreq, this.audioCtx.currentTime, 0.5);
    }

    updateLoop() {
      if (this.isPlaying && this.audioCtx) {
        // Decay scroll target
        this.scrollTarget *= 0.95;
        this.currentScroll += (this.scrollTarget - this.currentScroll) * 0.1;
        
        // Modulate filter based on scroll
        const minCutoff = 200;
        const maxCutoff = 1500;
        const cutoff = minCutoff + (maxCutoff - minCutoff) * this.currentScroll;
        this.filter.frequency.setTargetAtTime(cutoff, this.audioCtx.currentTime, 0.1);
      }
      requestAnimationFrame(this.updateLoop);
    }
  }

  window.AmbientSynth = new AmbientSynth();
})();
