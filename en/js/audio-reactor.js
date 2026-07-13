/**
 * Audio-Reactor
 * Hooks into the global APlayer instance, extracts audio frequency data using Web Audio API,
 * and updates CSS variables to enable Audio-Reactive UI across the blog.
 * Features a fallback to "Synthetic Beat" if CORS restricts audio data extraction.
 */
(function() {
  'use strict';

  if (window.AudioReactor) return;

  const AudioReactor = {
    audioEl: null,
    ctx: null,
    analyser: null,
    freqData: null,
    source: null,
    
    // Extracted data
    data: {
      bass: 0,
      mid: 0,
      treble: 0,
      energy: 0,
      isPlaying: false
    },
    
    // Status
    isInitialized: false,
    useSynthetic: false,
    silentFrames: 0,
    subscribers: [],
    
    // Subscribe to real-time data
    subscribe: function(callback) {
      if (typeof callback === 'function') {
        this.subscribers.push(callback);
      }
    },
    
    unsubscribe: function(callback) {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    },
    
    init: function() {
      // Find the APlayer audio element
      const audioEls = document.querySelectorAll('audio');
      let targetAudio = null;
      
      // Prefer the one inside aplayer
      for (let i = 0; i < audioEls.length; i++) {
        if (audioEls[i].closest('.aplayer')) {
          targetAudio = audioEls[i];
          break;
        }
      }
      
      if (!targetAudio && audioEls.length > 0) {
        targetAudio = audioEls[0];
      }
      
      if (!targetAudio) return;
      
      this.audioEl = targetAudio;
      
      // We must initialize AudioContext after a user gesture.
      // APlayer's play event is a good time.
      this.audioEl.addEventListener('play', () => {
        this.data.isPlaying = true;
        this.setupAudioGraph();
        this.startLoop();
      });
      
      this.audioEl.addEventListener('pause', () => {
        this.data.isPlaying = false;
        this.resetCSSVars();
      });
      
      this.audioEl.addEventListener('ended', () => {
        this.data.isPlaying = false;
        this.resetCSSVars();
      });

      // If already playing when script loads (unlikely but possible)
      if (!this.audioEl.paused) {
        this.data.isPlaying = true;
        this.setupAudioGraph();
        this.startLoop();
      }
    },
    
    setupAudioGraph: function() {
      if (this.isInitialized) {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(console.error);
        }
        return;
      }
      
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          this.useSynthetic = true;
          this.isInitialized = true;
          return;
        }
        
        // Share context with music-universe if it exists to prevent double-hooking issues
        if (window.__msAudioGraph && window.__msAudioGraph.ctx) {
          this.ctx = window.__msAudioGraph.ctx;
          this.analyser = window.__msAudioGraph.analyser;
          this.freqData = window.__msAudioGraph.freq;
          this.isInitialized = true;
          return;
        }

        this.ctx = new AudioContext();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.82;
        this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
        
        // Try setting crossorigin to anonymous to allow CORS
        try { this.audioEl.crossOrigin = 'anonymous'; } catch(e) {}
        
        this.source = this.ctx.createMediaElementSource(this.audioEl);
        this.source.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
        
        this.isInitialized = true;
      } catch (e) {
        console.warn('AudioReactor: AudioContext creation failed, using synthetic beat', e);
        this.useSynthetic = true;
        this.isInitialized = true;
      }
    },
    
    updateData: function() {
      if (!this.data.isPlaying) return;
      
      let b = 0, m = 0, t = 0, e = 0;
      const now = performance.now() / 1000;
      
      if (this.analyser && this.freqData && !this.useSynthetic) {
        this.analyser.getByteFrequencyData(this.freqData);
        
        let sum = 0;
        let bc = 0, mc = 0, tc = 0;
        const n = this.freqData.length;
        
        for (let i = 0; i < n; i++) {
          const val = this.freqData[i] / 255;
          sum += this.freqData[i];
          
          if (i < n * 0.12) { b += val; bc++; }
          else if (i < n * 0.5) { m += val; mc++; }
          else { t += val; tc++; }
        }
        
        b = bc ? b / bc : 0;
        m = mc ? m / mc : 0;
        t = tc ? t / tc : 0;
        e = sum / (n * 255);
        
        if (sum < 2) {
          this.silentFrames++;
        } else {
          this.silentFrames = 0;
        }
        
        // If playing but no data for a while, assume CORS restriction
        if (this.silentFrames > 90) {
          this.useSynthetic = true;
        }
      }
      
      if (this.useSynthetic || (!this.analyser)) {
        b = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(now * 3.1));
        m = 0.3 + 0.25 * (0.5 + 0.5 * Math.sin(now * 1.7 + 1.0));
        t = 0.2 + 0.2 * (0.5 + 0.5 * Math.sin(now * 6.3 + 2.0));
        e = (b + m + t) / 3;
      }
      
      // Smooth updates
      this.data.bass = this.lerp(this.data.bass, b, 0.2);
      this.data.mid = this.lerp(this.data.mid, m, 0.2);
      this.data.treble = this.lerp(this.data.treble, t, 0.2);
      this.data.energy = this.lerp(this.data.energy, e, 0.2);
    },
    
    updateCSS: function() {
      // Throttle CSS updates slightly or directly apply
      const root = document.documentElement;
      // Use toFixed to prevent massive string generation and layout trashing
      root.style.setProperty('--music-bass', this.data.bass.toFixed(3));
      root.style.setProperty('--music-mid', this.data.mid.toFixed(3));
      root.style.setProperty('--music-treble', this.data.treble.toFixed(3));
      root.style.setProperty('--music-energy', this.data.energy.toFixed(3));
    },
    
    resetCSSVars: function() {
      const root = document.documentElement;
      root.style.setProperty('--music-bass', '0');
      root.style.setProperty('--music-mid', '0');
      root.style.setProperty('--music-treble', '0');
      root.style.setProperty('--music-energy', '0');
      this.data.bass = 0;
      this.data.mid = 0;
      this.data.treble = 0;
      this.data.energy = 0;
    },
    
    startLoop: function() {
      const loop = () => {
        if (!this.data.isPlaying) return;
        
        // Pause processing if page is hidden to save battery
        if (document.visibilityState === 'visible') {
          this.updateData();
          this.updateCSS();
          
          for (let i = 0; i < this.subscribers.length; i++) {
            this.subscribers[i](this.data);
          }
        }
        
        requestAnimationFrame(loop);
      };
      
      requestAnimationFrame(loop);
    },
    
    lerp: function(start, end, amt) {
      return (1 - amt) * start + amt * end;
    }
  };

  window.AudioReactor = AudioReactor;

  // Wait for APlayer / MetingJS to inject the audio element
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector('audio')) {
      AudioReactor.init();
      observer.disconnect();
    }
  });
  
  if (document.querySelector('audio')) {
    AudioReactor.init();
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
  }

})();
