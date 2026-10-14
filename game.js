/**
 * BIBENDUM RUNNER: MICHELIN 8-BIT
 * Retro 3-Lane Horizontal Runner
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER & MANAGER ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.bgMusic = document.getElementById('bgAudio');
      this.musicEnabled = true;
      this.sfxEnabled = true;
      this.musicStarted = false;
      this.masterGain = null;

      if (!this.bgMusic) {
        this.bgMusic = new Audio('One_More_Quarter.mp3');
      }

      this.bgMusic.volume = 0.75;
      this.bgMusic.loop = true;

      // Handle loop and fallback error
      this.bgMusic.addEventListener('ended', () => {
        if (this.musicEnabled) {
          this.bgMusic.currentTime = 0;
          this.bgMusic.play().catch(() => {});
        }
      });

      this.bgMusic.addEventListener('error', () => {
        console.warn('Audio tag error, trying fallback to assets/One_More_Quarter.mp3');
        if (this.bgMusic.src && !this.bgMusic.src.includes('assets/')) {
          this.bgMusic.src = 'assets/One_More_Quarter.mp3';
          this.bgMusic.load();
          if (this.musicEnabled) {
            this.bgMusic.play().catch(() => {});
          }
        }
      });

      // Global one-time unlocker on ANY interaction (click, key, touch)
      this.setupAutoUnlock();
    }

    setupAutoUnlock() {
      const unlock = () => {
        this.init();
        if (this.musicEnabled && (!this.bgMusic || this.bgMusic.paused)) {
          this.playMusic();
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playMusic() {
      if (!this.musicEnabled) return;
      if (!this.bgMusic) {
        this.bgMusic = document.getElementById('bgAudio') || new Audio('One_More_Quarter.mp3');
      }
      this.bgMusic.volume = 0.75;
      this.bgMusic.loop = true;
      const playPromise = this.bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.musicStarted = true;
        }).catch(err => {
          console.log('Audio autoplay waiting for user gesture:', err);
        });
      }
    }

    toggleMusic() {
      if (!this.bgMusic) {
        this.bgMusic = document.getElementById('bgAudio') || new Audio('One_More_Quarter.mp3');
      }
      // If paused or music disabled, user clicked to turn it ON!
      if (this.bgMusic.paused || !this.musicEnabled) {
        this.musicEnabled = true;
        this.init();
        this.bgMusic.volume = 0.75;
        this.bgMusic.play().catch(e => console.warn('play error:', e));
        return true;
      } else {
        this.musicEnabled = false;
        this.bgMusic.pause();
        return false;
      }
    }

    playTone(freq, duration, type = 'square', startGain = 0.25, endGain = 0.01) {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(startGain, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain), this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }

    playJump() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const now = this.ctx.currentTime;
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.16);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }

    playSlide() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        // Noise buffer for tire skid
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
      } catch (e) {}
    }

    playLaneChange() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (e) {}
    }

    playCoin() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        // Two quick chimes: B5 (987Hz) then E6 (1318Hz)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'square';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(987.77, now);
        osc2.frequency.setValueAtTime(1318.51, now + 0.06);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc1.stop(now + 0.06);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.22);
      } catch (e) {}
    }

    playHit() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
      } catch (e) {}
    }

    playPowerup() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [261.6, 329.6, 392.0, 523.2]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          gain.gain.setValueAtTime(0.15, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.09);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.09);
        });
      } catch (e) {}
    }

    playGameOver() {
      if (!this.ctx || !this.sfxEnabled) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [392.0, 349.2, 311.1, 261.6, 196.0]; // G4, F4, Eb4, C4, G3
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);

          gain.gain.setValueAtTime(0.2, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.2);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.2);
        });
      } catch (e) {}
    }
  }

  // --- ASSET LOADER ---
  const assets = {};
  const assetUrls = {
    skyline: 'assets/bg_skyline.png',
    bib_run1: 'assets/sprite_bibendum_run1.png',
    bib_run2: 'assets/sprite_bibendum_run2.png',
    bib_jump: 'assets/sprite_bibendum_jump.png',
    bib_slide: 'assets/sprite_bibendum_slide.png',
    bib_run_sheet: 'assets/bib-run-trimmed.png',
    car: 'assets/sprite_car.png',
    barricade: 'assets/sprite_barricade.png',
    nails: 'assets/sprite_nails.png',
    puddle: 'assets/sprite_puddle.png',
    pothole: 'assets/sprite_pothole.png',
    gold_tire_0: 'assets/sprite_gold_tire_0.png',
    gold_tire_1: 'assets/sprite_gold_tire_1.png',
    gold_tire_2: 'assets/sprite_gold_tire_2.png',
    bird_0: 'assets/sprite_bird_0.png',
    bird_1: 'assets/sprite_bird_1.png',
    powerup_shield: 'assets/sprite_powerup_shield.png',
    powerup_magnet: 'assets/sprite_powerup_magnet.png',
    tire_life: 'assets/sprite_tire.png'
  };

  let loadedAssetsCount = 0;
  const totalAssetsCount = Object.keys(assetUrls).length;

  for (const [key, url] of Object.entries(assetUrls)) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      assets[key] = img;
      loadedAssetsCount++;
    };
    img.onerror = () => {
      console.warn(`Could not load asset: ${url}, procedural fallback active`);
      loadedAssetsCount++;
    };
  }

  // --- GAME CONSTANTS ---
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;

  // Road & Lane coordinates
  const ROAD_TOP_Y = 180;
  const ROAD_BOTTOM_Y = 530;
  // Center Y for the 3 lanes:
  // Top: 250, Middle: 360, Bottom: 470
  const LANES_Y = [250, 360, 470];
  const LANE_HEIGHT = 110;

  // --- PARTICLE SYSTEM ---
  class Particle {
    constructor(x, y, vx, vy, size, color, life, gravity = 0) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.size = size;
      this.color = color;
      this.maxLife = life;
      this.life = life;
      this.gravity = gravity;
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += this.gravity * dt;
      this.life -= dt;
    }

    draw(ctx) {
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
      ctx.restore();
    }
  }

  // --- MAIN GAME CLASS ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      this.sound = new SoundManager();

      // Game States: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
      this.state = 'MENU';

      // Level configurations
      this.levels = {
        highway: {
          name: 'Autopista',
          displayName: '🚗 AUTOPISTA',
          speedAccelMult: 1.0,
          scoreMult: 1.0,
          startLives: 3,
          gravityMult: 1.0,
          jumpImpulse: -640
        },
        desert: {
          name: 'Desierto',
          displayName: '🏜️ DESIERTO',
          speedAccelMult: 2.0,
          scoreMult: 2.0,
          startLives: 3,
          gravityMult: 1.0,
          jumpImpulse: -640
        },
        jungle: {
          name: 'Jungla',
          displayName: '🌴 JUNGLA',
          speedAccelMult: 1.0,
          scoreMult: 3.0,
          startLives: 1,
          gravityMult: 1.0,
          jumpImpulse: -640
        },
        moon: {
          name: 'Luna',
          displayName: '🌕 LUNA',
          speedAccelMult: 1.0,
          scoreMult: 0.5,
          startLives: 3,
          gravityMult: 0.1,
          jumpImpulse: -280
        }
      };
      this.currentLevelKey = 'highway';

      // High scores with 3-letter initials support & migration
      this.highScoresList = this.loadHighScores();
      this.highScore = this.highScoresList.length > 0 ? this.highScoresList[0].score : 5000;

      // Player
      this.player = {
        x: 140,
        lane: 1, // 0: Top, 1: Middle, 2: Bottom
        currentY: LANES_Y[1],
        targetY: LANES_Y[1],
        width: 82,
        height: 92,
        jumpOffset: 0,
        jumpVy: 0,
        isJumping: false,
        isSliding: false,
        slideTimer: 0,
        runFrame: 0,
        runTimer: 0,
        lives: 3,
        maxLives: 3,
        invulnerableTimer: 0,
        shieldActive: false,
        magnetTimer: 0
      };

      // Game progression & mechanics
      this.baseSpeed = 330;
      this.currentSpeed = 330;
      this.distanceMeters = 0;
      this.score = 0;
      this.goldenTiresCount = 0;
      this.gameTime = 0;

      // Obstacles & Collectibles
      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.spawnTimer = 0;
      this.nextSpawnInterval = 1.8;

      // Parallax offsets
      this.skylineOffset = 0;
      this.roadDashesOffset = 0;

      // Screen shake
      this.shakeDuration = 0;
      this.shakeIntensity = 0;

      // Input tracking
      this.keys = {};

      this.initDom();
      this.initInput();
      this.updateHud();

      // Start RAF loop
      this.lastTime = performance.now();
      requestAnimationFrame(this.loop.bind(this));
    }

    loadHighScores() {
      const defaultScores = [
        { name: 'BIB', score: 5000, level: 'Autopista' },
        { name: 'MCH', score: 3500, level: 'Desierto' },
        { name: 'RUN', score: 2000, level: 'Luna' }
      ];

      try {
        const raw = localStorage.getItem('bibendum_high_scores_list');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(item => {
              if (typeof item === 'number') {
                return { name: 'BIB', score: item, level: 'Autopista' };
              }
              return {
                name: ((item && item.name) || 'BIB').toString().toUpperCase().slice(0, 3),
                score: typeof item.score === 'number' ? item.score : parseInt(item.score || 0, 10),
                level: (item && item.level) || 'Autopista'
              };
            });
          }
        }
      } catch (e) {
        console.warn('Could not parse stored scores:', e);
      }
      return defaultScores;
    }

    initDom() {
      this.dom = {
        hudOverlay: document.getElementById('hudOverlay'),
        hudScore: document.getElementById('hudScore'),
        hudTires: document.getElementById('hudTires'),
        hudHighScore: document.getElementById('hudHighScore'),
        hudSpeed: document.getElementById('hudSpeed'),
        hudLevelBadge: document.getElementById('hudLevelBadge'),
        powerupBadges: document.getElementById('powerupBadges'),
        lifeTire1: document.getElementById('lifeTire1'),
        lifeTire2: document.getElementById('lifeTire2'),
        lifeTire3: document.getElementById('lifeTire3'),

        menuOverlay: document.getElementById('menuOverlay'),
        menuSelectedLevelBadge: document.getElementById('menuSelectedLevelBadge'),
        levelModal: document.getElementById('levelModal'),
        recordModal: document.getElementById('recordModal'),
        helpModal: document.getElementById('helpModal'),
        scoresModal: document.getElementById('scoresModal'),
        pauseOverlay: document.getElementById('pauseOverlay'),
        gameOverOverlay: document.getElementById('gameOverOverlay'),
        crtOverlay: document.getElementById('crtOverlay'),

        finalLevelName: document.getElementById('finalLevelName'),
        finalScore: document.getElementById('finalScore'),
        finalTires: document.getElementById('finalTires'),
        finalDistance: document.getElementById('finalDistance'),
        finalHighScore: document.getElementById('finalHighScore'),
        newRecordBanner: document.getElementById('newRecordBanner'),
        highScoresList: document.getElementById('highScoresList'),

        recordInitials: document.getElementById('recordInitials'),
        recordScoreVal: document.getElementById('recordScoreVal'),
        recordLevelVal: document.getElementById('recordLevelVal'),
        btnSaveRecord: document.getElementById('btnSaveRecord'),

        btnStartGame: document.getElementById('btnStartGame'),
        btnSelectLevel: document.getElementById('btnSelectLevel'),
        btnCloseLevelModal: document.getElementById('btnCloseLevelModal'),
        btnHowToPlay: document.getElementById('btnHowToPlay'),
        btnHighScores: document.getElementById('btnHighScores'),
        btnCloseHelp: document.getElementById('btnCloseHelp'),
        btnCloseScores: document.getElementById('btnCloseScores'),
        btnResume: document.getElementById('btnResume'),
        btnRestartPause: document.getElementById('btnRestartPause'),
        btnQuitMenu: document.getElementById('btnQuitMenu'),
        btnPlayAgain: document.getElementById('btnPlayAgain'),
        btnMenuFromOver: document.getElementById('btnMenuFromOver'),

        btnScanlines: document.getElementById('btnScanlines'),
        btnSound: document.getElementById('btnSound'),
        btnFullscreen: document.getElementById('btnFullscreen'),

        btnCtrlUp: document.getElementById('btnCtrlUp'),
        btnCtrlDown: document.getElementById('btnCtrlDown'),
        btnCtrlLeft: document.getElementById('btnCtrlLeft'),
        btnCtrlRight: document.getElementById('btnCtrlRight'),
        btnCtrlJump: document.getElementById('btnCtrlJump'),
        btnCtrlSlide: document.getElementById('btnCtrlSlide')
      };

      // Event listeners
      this.dom.btnStartGame.onclick = () => this.startGame();
      this.dom.btnPlayAgain.onclick = () => this.startGame();

      this.dom.btnHowToPlay.onclick = () => {
        this.dom.helpModal.classList.remove('hidden');
      };
      this.dom.btnCloseHelp.onclick = () => {
        this.dom.helpModal.classList.add('hidden');
      };

      this.dom.btnHighScores.onclick = () => {
        this.renderHighScores();
        this.dom.scoresModal.classList.remove('hidden');
      };
      this.dom.btnCloseScores.onclick = () => {
        this.dom.scoresModal.classList.add('hidden');
      };

      this.dom.btnResume.onclick = () => this.togglePause();
      this.dom.btnRestartPause.onclick = () => {
        this.dom.pauseOverlay.classList.add('hidden');
        this.startGame();
      };
      this.dom.btnQuitMenu.onclick = () => {
        this.dom.pauseOverlay.classList.add('hidden');
        this.goToMenu();
      };
      this.dom.btnMenuFromOver.onclick = () => {
        this.dom.gameOverOverlay.classList.add('hidden');
        this.goToMenu();
      };

      // Level selection modal handlers
      if (this.dom.btnSelectLevel) {
        this.dom.btnSelectLevel.onclick = () => {
          this.dom.levelModal.classList.remove('hidden');
        };
      }
      if (this.dom.menuSelectedLevelBadge) {
        this.dom.menuSelectedLevelBadge.onclick = () => {
          this.dom.levelModal.classList.remove('hidden');
        };
      }
      if (this.dom.btnCloseLevelModal) {
        this.dom.btnCloseLevelModal.onclick = () => {
          this.dom.levelModal.classList.add('hidden');
        };
      }

      // Level card selection
      const levelCards = document.querySelectorAll('.level-card');
      levelCards.forEach(card => {
        card.onclick = () => {
          const levelKey = card.getAttribute('data-level');
          if (this.levels[levelKey]) {
            this.currentLevelKey = levelKey;
            levelCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const lvl = this.levels[levelKey];
            if (this.dom.menuSelectedLevelBadge) {
              this.dom.menuSelectedLevelBadge.textContent = `NIVEL ACTIVO: ${lvl.displayName}`;
            }
            if (this.dom.hudLevelBadge) {
              this.dom.hudLevelBadge.textContent = lvl.displayName;
            }
          }
        };
      });

      // Record modal initials and button handlers
      if (this.dom.btnSaveRecord) {
        this.dom.btnSaveRecord.onclick = () => this.saveHighScoreRecord();
      }
      if (this.dom.recordInitials) {
        this.dom.recordInitials.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 3);
        });
        this.dom.recordInitials.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.saveHighScoreRecord();
          }
        });
      }

      // Sound toggle
      this.dom.btnSound.onclick = (e) => {
        e.stopPropagation();
        this.sound.init();
        const active = this.sound.toggleMusic();
        this.dom.btnSound.textContent = active ? '🔊 MÚSICA: ON' : '🔇 MÚSICA: OFF';
      };

      // Scanline toggle
      this.dom.btnScanlines.onclick = () => {
        const isHidden = this.dom.crtOverlay.classList.toggle('hidden');
        this.dom.btnScanlines.textContent = isHidden ? 'CRT: OFF' : 'CRT: ON';
      };

      // Fullscreen
      this.dom.btnFullscreen.onclick = () => {
        const container = document.querySelector('.game-container');
        if (!document.fullscreenElement) {
          container.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      };

      // Touch / mouse buttons
      this.dom.btnCtrlUp.onpointerdown = (e) => {
        e.preventDefault();
        this.handleLaneUp();
      };
      this.dom.btnCtrlDown.onpointerdown = (e) => {
        e.preventDefault();
        this.handleLaneDown();
      };
      if (this.dom.btnCtrlLeft) {
        this.dom.btnCtrlLeft.onpointerdown = (e) => {
          e.preventDefault();
          this.keys['KeyA'] = true;
        };
        this.dom.btnCtrlLeft.onpointerup = (e) => {
          e.preventDefault();
          this.keys['KeyA'] = false;
        };
        this.dom.btnCtrlLeft.onpointerleave = () => {
          this.keys['KeyA'] = false;
        };
      }
      if (this.dom.btnCtrlRight) {
        this.dom.btnCtrlRight.onpointerdown = (e) => {
          e.preventDefault();
          this.keys['KeyD'] = true;
        };
        this.dom.btnCtrlRight.onpointerup = (e) => {
          e.preventDefault();
          this.keys['KeyD'] = false;
        };
        this.dom.btnCtrlRight.onpointerleave = () => {
          this.keys['KeyD'] = false;
        };
      }
      this.dom.btnCtrlJump.onpointerdown = (e) => {
        e.preventDefault();
        this.handleJump();
      };
      this.dom.btnCtrlSlide.onpointerdown = (e) => {
        e.preventDefault();
        this.handleSlideStart();
      };
      this.dom.btnCtrlSlide.onpointerup = (e) => {
        e.preventDefault();
        this.handleSlideEnd();
      };
    }

    initInput() {
      window.addEventListener('keydown', (e) => {
        // If typing initials in record modal, prevent game shortcuts
        if (this.dom.recordModal && !this.dom.recordModal.classList.contains('hidden')) {
          return;
        }

        this.sound.init(); // Initialize audio on first keypress

        if (this.state === 'PLAYING') {
          // Horizontal movement: Flechas Izquierda/Derecha (o A/D) = atrás/adelante
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            this.keys['KeyA'] = true;
          }
          if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            this.keys['KeyD'] = true;
          }

          if (e.repeat) return;

          // Lane changes: Flecha Arriba (o W) = carril arriba, Flecha Abajo (o S) = carril abajo
          if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            e.preventDefault();
            this.handleLaneUp();
          } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            e.preventDefault();
            this.handleLaneDown();
          } else if (e.code === 'KeyO' || e.code === 'Space') {
            // O o Barra Espaciadora = saltar
            e.preventDefault();
            this.handleJump();
          } else if (e.code === 'KeyP' || e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
            // P o Alt = agacharse (mantener presionado)
            e.preventDefault();
            if (!this.player.isSliding) {
              this.handleSlideStart();
            }
          } else if (e.code === 'Escape') {
            e.preventDefault();
            this.togglePause();
          }
        } else if (this.state === 'MENU') {
          if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyO') {
            e.preventDefault();
            this.startGame();
          }
        } else if (this.state === 'GAMEOVER') {
          if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyO') {
            e.preventDefault();
            this.startGame();
          }
        } else if (this.state === 'PAUSED') {
          if (e.code === 'Escape' || e.code === 'Space' || e.code === 'KeyO') {
            e.preventDefault();
            this.togglePause();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        // Horizontal movement stop
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          this.keys['KeyA'] = false;
        }
        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          this.keys['KeyD'] = false;
        }

        // Stop crouching on release of P or Alt
        if (e.code === 'KeyP' || e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
          e.preventDefault();
          this.handleSlideEnd();
        }
      });

      // Clear keys when window loses focus
      window.addEventListener('blur', () => {
        this.keys = {};
        this.handleSlideEnd();
      });
    }

    handleLaneUp() {
      if (this.player.lane > 0) {
        this.player.lane--;
        this.player.targetY = LANES_Y[this.player.lane];
        this.sound.playLaneChange();
        this.createLanePuff();
      }
    }

    handleLaneDown() {
      if (this.player.lane < 2) {
        this.player.lane++;
        this.player.targetY = LANES_Y[this.player.lane];
        this.sound.playLaneChange();
        this.createLanePuff();
      }
    }

    handleJump() {
      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;
      if (!this.player.isJumping) {
        this.player.isJumping = true;
        this.player.jumpVy = lvl.jumpImpulse;
        this.sound.playJump();
        this.createJumpParticles();
      }
    }

    handleSlideStart() {
      if (!this.player.isSliding) {
        this.player.isSliding = true;
        this.sound.playSlide();
        this.createSlidePuff();
      }
    }

    handleSlideEnd() {
      this.player.isSliding = false;
    }

    createJumpParticles() {
      const px = this.player.x + 35;
      const py = this.player.currentY + 30;
      for (let i = 0; i < 7; i++) {
        this.particles.push(
          new Particle(px + (Math.random() * 20 - 10), py, -this.currentSpeed * 0.4 + (Math.random() * 60 - 30), (Math.random() * -60 - 20), 4, '#ffffff', 0.25, 120)
        );
      }
    }

    createSlidePuff() {
      const px = this.player.x + 10;
      const py = this.player.currentY + 35;
      for (let i = 0; i < 10; i++) {
        this.particles.push(
          new Particle(px, py + Math.random() * 10, -this.currentSpeed * 0.6 + Math.random() * 40, (Math.random() * -40 - 10), 5, '#e0e0e0', 0.35, 100)
        );
      }
    }

    createLanePuff() {
      const px = this.player.x + 35;
      const py = this.player.currentY + 30;
      for (let i = 0; i < 6; i++) {
        this.particles.push(
          new Particle(px + Math.random() * 30, py, -this.currentSpeed * 0.3, Math.random() * 40 - 20, 4, '#cfcfcf', 0.25)
        );
      }
    }

    createGoldSparkles(x, y) {
      const colors = ['#ffd700', '#fff3a8', '#ffffff', '#ffaa00'];
      for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 160 + 60;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.particles.push(
          new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 4, color, 0.4, 150)
        );
      }
    }

    createHitDebris(x, y) {
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 250 + 80;
        this.particles.push(
          new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 6, '#ffffff', 0.5, 300)
        );
      }
    }

    triggerShake(duration = 0.35, intensity = 9) {
      this.shakeDuration = duration;
      this.shakeIntensity = intensity;
    }

    startGame() {
      this.sound.init();
      this.sound.musicEnabled = true;
      this.sound.playMusic();
      this.dom.btnSound.textContent = '🔊 MÚSICA: ON';
      this.state = 'PLAYING';

      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;

      // Reset player
      this.player.x = 140;
      this.keys = {};
      this.player.lane = 1;
      this.player.currentY = LANES_Y[1];
      this.player.targetY = LANES_Y[1];
      this.player.jumpOffset = 0;
      this.player.jumpVy = 0;
      this.player.isJumping = false;
      this.player.isSliding = false;
      this.player.lives = lvl.startLives;
      this.player.maxLives = lvl.startLives;
      this.player.invulnerableTimer = 0;
      this.player.shieldActive = false;
      this.player.magnetTimer = 0;

      // Reset world
      this.baseSpeed = 330;
      this.currentSpeed = 330;
      this.distanceMeters = 0;
      this.score = 0;
      this.goldenTiresCount = 0;
      this.gameTime = 0;

      this.obstacles = [];
      this.collectibles = [];
      this.particles = [];
      this.spawnTimer = 0.8;
      this.nextSpawnInterval = 1.8;

      // DOM updates
      this.dom.menuOverlay.classList.add('hidden');
      this.dom.gameOverOverlay.classList.add('hidden');
      if (this.dom.recordModal) this.dom.recordModal.classList.add('hidden');
      this.dom.pauseOverlay.classList.add('hidden');
      this.dom.hudOverlay.classList.remove('hidden');
      this.dom.newRecordBanner.style.display = 'none';

      this.updateLivesUi();
      this.updateHud();
    }

    goToMenu() {
      this.state = 'MENU';
      if (this.sound.musicEnabled) {
        this.sound.playMusic();
      }
      this.dom.menuOverlay.classList.remove('hidden');
      this.dom.gameOverOverlay.classList.add('hidden');
      if (this.dom.recordModal) this.dom.recordModal.classList.add('hidden');
      this.dom.pauseOverlay.classList.add('hidden');
      this.dom.hudOverlay.classList.add('hidden');
    }

    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        if (this.sound.bgMusic && !this.sound.bgMusic.paused) {
          this.sound.bgMusic.pause();
        }
        this.dom.pauseOverlay.classList.remove('hidden');
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        if (this.sound.musicEnabled && this.sound.bgMusic) {
          this.sound.bgMusic.play().catch(() => {});
        }
        this.dom.pauseOverlay.classList.add('hidden');
        this.lastTime = performance.now();
      }
    }

    gameOver() {
      this.state = 'GAMEOVER';
      if (this.sound.bgMusic) {
        this.sound.bgMusic.pause();
      }
      this.sound.playGameOver();

      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;
      const qualifiesForLeaderboard = this.score > 0 && (
        this.highScoresList.length < 5 ||
        this.score > this.highScoresList[this.highScoresList.length - 1].score
      );

      if (qualifiesForLeaderboard) {
        // Show Record Initials Modal
        if (this.dom.recordScoreVal) this.dom.recordScoreVal.textContent = this.pad(this.score, 5);
        if (this.dom.recordLevelVal) this.dom.recordLevelVal.textContent = lvl.displayName;
        if (this.dom.recordInitials) this.dom.recordInitials.value = '';
        if (this.dom.recordModal) {
          this.dom.recordModal.classList.remove('hidden');
          setTimeout(() => {
            if (this.dom.recordInitials) this.dom.recordInitials.focus();
          }, 100);
        }
      } else {
        this.showGameOverScreen(false);
      }
    }

    saveHighScoreRecord() {
      let initials = 'AAA';
      if (this.dom.recordInitials && this.dom.recordInitials.value) {
        initials = this.dom.recordInitials.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
      }
      if (!initials) initials = 'AAA';
      while (initials.length < 3) initials += 'A';

      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;
      const newEntry = {
        name: initials,
        score: this.score,
        level: lvl.name
      };

      this.highScoresList.push(newEntry);
      this.highScoresList.sort((a, b) => b.score - a.score);
      this.highScoresList = this.highScoresList.slice(0, 5);
      this.highScore = this.highScoresList[0].score;

      localStorage.setItem('bibendum_high_scores_list', JSON.stringify(this.highScoresList));
      localStorage.setItem('bibendum_high_score', this.highScore.toString());

      if (this.dom.recordModal) {
        this.dom.recordModal.classList.add('hidden');
      }
      this.showGameOverScreen(true);
    }

    showGameOverScreen(isNewRecord) {
      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;
      if (this.dom.finalLevelName) {
        this.dom.finalLevelName.textContent = lvl.displayName;
      }
      this.dom.finalScore.textContent = this.pad(this.score, 5);
      this.dom.finalTires.textContent = this.goldenTiresCount.toString();
      this.dom.finalDistance.textContent = `${Math.floor(this.distanceMeters)} m`;
      this.dom.finalHighScore.textContent = this.pad(this.highScore, 5);

      if (isNewRecord || this.score >= this.highScore) {
        this.dom.newRecordBanner.style.display = 'block';
      } else {
        this.dom.newRecordBanner.style.display = 'none';
      }

      this.dom.gameOverOverlay.classList.remove('hidden');
    }

    renderHighScores() {
      let html = '';
      this.highScoresList.forEach((entry, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '★';
        const name = (entry.name || 'BIB').toUpperCase();
        const level = entry.level || 'Autopista';
        const score = typeof entry.score === 'number' ? entry.score : 0;
        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; background: rgba(0,0,0,0.45); padding: 7px 12px; border-radius: 4px; border-left: 3px solid ${idx === 0 ? '#ffd700' : '#00f0ff'};">
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 11px;">${medal} #${idx + 1}</span>
            <span style="color: #00f0ff; letter-spacing: 2px; font-weight: bold;">${name}</span>
            <span style="color: #9c8fb8; font-size: 8px;">(${level})</span>
          </div>
          <span style="color: #ffd700; font-weight: bold;">${this.pad(score, 5)} PTS</span>
        </div>`;
      });
      this.dom.highScoresList.innerHTML = html;
    }

    updateLivesUi() {
      const tires = [this.dom.lifeTire1, this.dom.lifeTire2, this.dom.lifeTire3];
      tires.forEach((tireEl, idx) => {
        if (!tireEl) return;
        if (idx >= this.player.maxLives) {
          tireEl.style.display = 'none';
        } else {
          tireEl.style.display = 'inline-block';
          if (idx < this.player.lives) {
            tireEl.classList.remove('hud-tire-lost');
          } else {
            tireEl.classList.add('hud-tire-lost');
          }
        }
      });
    }

    updateHud() {
      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;
      this.dom.hudScore.textContent = this.pad(this.score, 5);
      this.dom.hudTires.textContent = this.pad(this.goldenTiresCount, 3);
      this.dom.hudHighScore.textContent = this.pad(this.highScore, 5);
      if (this.dom.hudLevelBadge) {
        this.dom.hudLevelBadge.textContent = lvl.displayName;
      }
      const speedMult = (this.currentSpeed / this.baseSpeed).toFixed(1);
      this.dom.hudSpeed.textContent = `${speedMult}x`;

      // Powerup badges
      let badgesHtml = '';
      if (this.player.shieldActive) {
        badgesHtml += `<div class="badge-powerup" style="border-color: #00f0ff;">🛡️ ESCUDO</div>`;
      }
      if (this.player.magnetTimer > 0) {
        badgesHtml += `<div class="badge-powerup" style="border-color: #ffd700;">🧲 IMÁN ${Math.ceil(this.player.magnetTimer)}s</div>`;
      }
      this.dom.powerupBadges.innerHTML = badgesHtml;
    }

    pad(num, size) {
      let s = num + '';
      while (s.length < size) s = '0' + s;
      return s;
    }

    // --- PROCEDURAL OBSTACLES & POWERUPS SPAWNER ---
    updateSpawning(dt) {
      this.spawnTimer += dt;
      if (this.spawnTimer < this.nextSpawnInterval) return;

      this.spawnTimer = 0;
      // Progressive difficulty: intervals get tighter, speed increases
      const progressFactor = Math.min(1.0, this.distanceMeters / 3000);
      this.nextSpawnInterval = Math.max(0.72, 1.8 - progressFactor * 0.95);

      // Choose spawn pattern
      this.spawnPattern();
    }

    spawnPattern() {
      // Possible lanes: 0, 1, 2
      const lanes = [0, 1, 2];
      const r = Math.random();

      // Ensure at least one lane is safe to traverse, jump, or slide!
      if (r < 0.4) {
        // Pattern 1: Single ground hazard + Golden tire in another lane
        const obsLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnObstacle(obsLane);

        // Tire in one of the other lanes
        const otherLanes = lanes.filter(l => l !== obsLane);
        const tireLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
        this.spawnTireCluster(tireLane, 3);
      } else if (r < 0.7) {
        // Pattern 2: Two lanes blocked, but with at least one jumpable or slidable route!
        const safeLane = lanes[Math.floor(Math.random() * lanes.length)];
        const blockedLanes = lanes.filter(l => l !== safeLane);

        // One can be a car or ground hazard
        blockedLanes.forEach(lane => {
          this.spawnObstacle(lane);
        });

        // Golden tire arc or cluster in the safe lane
        this.spawnTireCluster(safeLane, 3);
      } else if (r < 0.85) {
        // Pattern 3: Bird flying in one lane (requires crouching with Alt or switching lane)
        const birdLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnBird(birdLane);

        // Tires underneath the bird to reward staying crouched!
        this.spawnTireCluster(birdLane, 3);
      } else {
        // Pattern 4: Car in one lane, plus powerup or tire trail!
        const carLane = lanes[Math.floor(Math.random() * lanes.length)];
        this.spawnCar(carLane);

        // Rare powerup check
        if (Math.random() < 0.35) {
          const powerLane = lanes.filter(l => l !== carLane)[Math.floor(Math.random() * 2)];
          this.spawnPowerup(powerLane);
        }
      }
    }

    spawnObstacle(lane) {
      // Ground hazards: nails, puddle, pothole, barricade
      const types = ['nails', 'puddle', 'pothole', 'barricade'];
      const chosen = types[Math.floor(Math.random() * types.length)];

      let width = 70;
      let height = 35;
      let offsetY = 15;

      if (chosen === 'nails') {
        width = 65;
        height = 30;
      } else if (chosen === 'puddle') {
        width = 110;
        height = 28;
      } else if (chosen === 'pothole') {
        width = 90;
        height = 35;
      } else if (chosen === 'barricade') {
        width = 50;
        height = 60;
        offsetY = 0;
      }

      this.obstacles.push({
        type: chosen,
        lane: lane,
        x: CANVAS_WIDTH + 50,
        y: LANES_Y[lane] + offsetY,
        width: width,
        height: height,
        speedMultiplier: 1.0,
        jumpable: true,
        slidable: false,
        isCar: false,
        isBird: false
      });
    }

    spawnCar(lane) {
      // Retro car incoming at higher relative speed!
      this.obstacles.push({
        type: 'car',
        lane: lane,
        x: CANVAS_WIDTH + 80,
        y: LANES_Y[lane] - 15,
        width: 145,
        height: 62,
        speedMultiplier: 1.45, // Moves faster than road speed!
        jumpable: false, // Cannot jump over a car!
        slidable: false,
        isCar: true,
        isBird: false
      });
    }

    spawnBird(lane) {
      // Flying bird obstacle at head level (dodge by holding Alt or changing lanes)
      this.obstacles.push({
        type: 'bird',
        lane: lane,
        x: CANVAS_WIDTH + 60,
        y: LANES_Y[lane] - 36,
        width: 54,
        height: 34,
        speedMultiplier: 1.25, // Flaps towards player faster than road
        jumpable: false, // Cannot jump over flying bird
        slidable: true,  // Can crouch under it!
        isCar: false,
        isBird: true,
        frame: 0,
        flapTimer: 0
      });
    }

    spawnTireCluster(lane, count = 3) {
      const spacing = 55;
      for (let i = 0; i < count; i++) {
        this.collectibles.push({
          type: 'gold_tire',
          lane: lane,
          x: CANVAS_WIDTH + 60 + i * spacing,
          y: LANES_Y[lane] + 5,
          width: 32,
          height: 32,
          frame: Math.floor(Math.random() * 4),
          animTimer: 0,
          points: 100
        });
      }
    }

    spawnPowerup(lane) {
      // Shield, Magnet, or Extra Tire
      const r = Math.random();
      let type = 'shield';
      if (r < 0.45) {
        type = 'shield';
      } else if (r < 0.8) {
        type = 'magnet';
      } else if (this.player.lives < this.player.maxLives) {
        type = 'life';
      } else {
        type = 'shield';
      }

      this.collectibles.push({
        type: type,
        lane: lane,
        x: CANVAS_WIDTH + 50,
        y: LANES_Y[lane] - 5,
        width: 36,
        height: 36,
        frame: 0,
        animTimer: 0
      });
    }

    // --- GAME LOOP & UPDATES ---
    loop(timestamp) {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.08); // cap dt at 80ms
      this.lastTime = timestamp;

      if (this.state === 'PLAYING') {
        this.update(dt);
      }

      this.render();
      requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
      this.gameTime += dt;

      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;

      // Progressive speed increase: accelerates with level speedAccelMult
      this.currentSpeed = Math.min(840, this.baseSpeed + this.distanceMeters * 0.12 * lvl.speedAccelMult);
      this.distanceMeters += (this.currentSpeed * dt) / 10;
      this.score = Math.floor((this.distanceMeters * 2 + this.goldenTiresCount * 100) * lvl.scoreMult);

      // Parallax scrolling
      this.skylineOffset = (this.skylineOffset + this.currentSpeed * 0.18 * dt) % (assets.skyline ? assets.skyline.width / 2 : 1200);
      this.roadDashesOffset = (this.roadDashesOffset + this.currentSpeed * dt) % 120;

      // Screen shake decay
      if (this.shakeDuration > 0) {
        this.shakeDuration -= dt;
      }

      // Player update
      this.updatePlayer(dt);

      // Spawning
      this.updateSpawning(dt);

      // Obstacles update & collision
      this.updateObstacles(dt);

      // Collectibles update & collection
      this.updateCollectibles(dt);

      // Particles update
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update(dt);
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }

      this.updateHud();
    }

    updatePlayer(dt) {
      const lvl = this.levels[this.currentLevelKey] || this.levels.highway;

      // Horizontal movement: A = atrás (izquierda), D = adelante (derecha)
      let moveDir = 0;
      if (this.keys['KeyA']) moveDir -= 1;
      if (this.keys['KeyD']) moveDir += 1;

      if (moveDir !== 0) {
        const hSpeed = 400; // pixels per second
        this.player.x += moveDir * hSpeed * dt;
        // Clamp player X so character stays safely within visible highway bounds
        this.player.x = Math.max(60, Math.min(CANVAS_WIDTH - 160, this.player.x));
      }

      // Smooth lane transition
      this.player.currentY += (this.player.targetY - this.player.currentY) * 14 * dt;

      // Jump physics (level gravity multiplier: e.g. 10% on Moon)
      if (this.player.isJumping) {
        this.player.jumpOffset -= this.player.jumpVy * dt;
        this.player.jumpVy += 1750 * lvl.gravityMult * dt; // gravity

        if (this.player.jumpOffset <= 0) {
          this.player.jumpOffset = 0;
          this.player.jumpVy = 0;
          this.player.isJumping = false;
          // Landing puff
          this.createSlidePuff();
        }
      }

      // Continuous slide particles while crouched on the ground
      if (this.player.isSliding && !this.player.isJumping) {
        if (Math.random() < 0.45) {
          this.createSlidePuff();
        }
      }

      // Run frame animation across 14 frames from sprite sheet (accelerates with speed)
      const frameDuration = Math.max(0.024, 0.046 * (this.baseSpeed / this.currentSpeed));
      this.player.runTimer += dt;
      if (this.player.runTimer >= frameDuration) {
        this.player.runTimer = 0;
        this.player.runFrame = (this.player.runFrame + 1) % 14;

        // Running dust puff at foot plant (frame 0 and frame 7)
        if (!this.player.isJumping && !this.player.isSliding && (this.player.runFrame === 0 || this.player.runFrame === 7)) {
          this.particles.push(
            new Particle(
              this.player.x + 20,
              this.player.currentY + 36,
              -this.currentSpeed * 0.35,
              Math.random() * -20 - 5,
              3,
              '#e0e0e0',
              0.2
            )
          );
        }
      }

      // Invulnerability timer decay
      if (this.player.invulnerableTimer > 0) {
        this.player.invulnerableTimer -= dt;
      }

      // Magnet timer decay
      if (this.player.magnetTimer > 0) {
        this.player.magnetTimer -= dt;
      }
    }

    updateObstacles(dt) {
      const playerBox = this.getPlayerHitbox();

      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= this.currentSpeed * obs.speedMultiplier * dt;

        // Animate bird flapping
        if (obs.isBird) {
          obs.flapTimer = (obs.flapTimer || 0) + dt;
          if (obs.flapTimer >= 0.12) {
            obs.flapTimer = 0;
            obs.frame = (obs.frame + 1) % 2;
          }
        }

        // Check collision if player is not invulnerable
        if (this.player.invulnerableTimer <= 0) {
          // Obstacle bounding box
          const obsBox = {
            x: obs.x,
            y: obs.y,
            width: obs.width,
            height: obs.height
          };

          // Can player evade by jumping?
          const isJumpingOver = obs.jumpable && (this.player.jumpOffset > 32);
          // Can player evade by sliding?
          const isSlidingUnder = obs.slidable && this.player.isSliding;

          const isSafe = isJumpingOver || isSlidingUnder;

          if (!isSafe && this.checkAABB(playerBox, obsBox)) {
            // Collision occurred!
            this.handlePlayerHit(obs);
          }
        }

        // Remove offscreen obstacles
        if (obs.x + obs.width < -100) {
          this.obstacles.splice(i, 1);
        }
      }
    }

    updateCollectibles(dt) {
      const px = this.player.x + 35;
      const py = this.player.currentY - this.player.jumpOffset;

      for (let i = this.collectibles.length - 1; i >= 0; i--) {
        const item = this.collectibles[i];
        item.x -= this.currentSpeed * dt;

        // Magnet attraction
        if (this.player.magnetTimer > 0 && item.type === 'gold_tire') {
          const dx = px - item.x;
          const dy = py - item.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            item.x += (dx / dist) * 450 * dt;
            item.y += (dy / dist) * 450 * dt;
          }
        }

        // Animate rotating golden tire
        item.animTimer += dt;
        if (item.animTimer >= 0.12) {
          item.animTimer = 0;
          item.frame = (item.frame + 1) % 4;
        }

        // Check collection
        const itemBox = {
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height
        };

        const playerBox = this.getPlayerHitbox();

        if (this.checkAABB(playerBox, itemBox)) {
          // Collect item!
          this.handleCollectItem(item);
          this.collectibles.splice(i, 1);
          continue;
        }

        // Remove offscreen
        if (item.x + item.width < -60) {
          this.collectibles.splice(i, 1);
        }
      }
    }

    handleCollectItem(item) {
      if (item.type === 'gold_tire') {
        this.goldenTiresCount++;
        this.score += item.points;
        this.sound.playCoin();
        this.createGoldSparkles(item.x + 16, item.y + 16);
      } else if (item.type === 'shield') {
        this.player.shieldActive = true;
        this.sound.playPowerup();
        this.createGoldSparkles(item.x + 16, item.y + 16);
      } else if (item.type === 'magnet') {
        this.player.magnetTimer = 8.0;
        this.sound.playPowerup();
        this.createGoldSparkles(item.x + 16, item.y + 16);
      } else if (item.type === 'life') {
        if (this.player.lives < this.player.maxLives) {
          this.player.lives++;
          this.updateLivesUi();
        }
        this.sound.playPowerup();
        this.createGoldSparkles(item.x + 16, item.y + 16);
      }
    }

    handlePlayerHit(obs) {
      if (this.player.shieldActive) {
        // Shield absorbs the blow!
        this.player.shieldActive = false;
        this.player.invulnerableTimer = 1.0;
        this.triggerShake(0.2, 5);
        this.sound.playHit();
        this.createGoldSparkles(this.player.x + 40, this.player.currentY);
        return;
      }

      // Lose 1 tire life
      this.player.lives--;
      this.updateLivesUi();
      this.triggerShake(0.4, 12);
      this.sound.playHit();
      this.createHitDebris(this.player.x + 40, this.player.currentY);

      if (this.player.lives <= 0) {
        this.gameOver();
      } else {
        // Grant temporary invulnerability
        this.player.invulnerableTimer = 1.5;
      }
    }

    getPlayerHitbox() {
      // Adjust hitbox for jump and slide
      const x = this.player.x + 15;
      let y = this.player.currentY - this.player.jumpOffset - 40;
      let width = 52;
      let height = 75;

      if (this.player.isSliding && !this.player.isJumping) {
        y = this.player.currentY - 2;
        height = 38;
        width = 68;
      }

      return { x, y, width, height };
    }

    checkAABB(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }

    // --- RENDERING ---
    render() {
      this.ctx.save();

      // Screen shake translation
      if (this.shakeDuration > 0) {
        const shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
        const shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
        this.ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Skyline & Sunset (Layer 1)
      this.renderSkyline();

      // 2. Draw Highway & Lanes (Layer 2)
      this.renderRoad();

      // 3. Draw Collectibles (under player)
      this.renderCollectibles();

      // 4. Draw Obstacles (ground level)
      this.renderObstacles();

      // 5. Draw Player (Bibendum with ground shadow)
      this.renderPlayer();

      // 6. Draw Flying Obstacles (Birds)
      this.renderFlyingObstacles();

      // 7. Draw Particles
      this.renderParticles();

      this.ctx.restore();
    }

    renderSkyline() {
      const lvl = this.currentLevelKey;
      const skylineHeight = 180;

      if (lvl === 'desert') {
        // --- DESERT THEME ---
        // Warm desert sunset gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, skylineHeight);
        grad.addColorStop(0, '#2e0e00');
        grad.addColorStop(0.35, '#872800');
        grad.addColorStop(0.7, '#d65500');
        grad.addColorStop(1, '#ff9e24');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, skylineHeight);

        // Blazing scorching sun
        this.ctx.fillStyle = '#fff4cc';
        this.ctx.beginPath();
        this.ctx.arc(CANVAS_WIDTH * 0.65, skylineHeight * 0.62, 54, 0, Math.PI * 2);
        this.ctx.fill();

        // Layer 1 Sand dunes (distant, slower parallax)
        this.ctx.fillStyle = '#5c2000';
        this.ctx.beginPath();
        this.ctx.moveTo(0, skylineHeight);
        const duneOffset1 = (this.skylineOffset * 0.4) % CANVAS_WIDTH;
        for (let x = -duneOffset1; x < CANVAS_WIDTH + 200; x += 180) {
          this.ctx.quadraticCurveTo(x + 90, skylineHeight - 55, x + 180, skylineHeight);
        }
        this.ctx.lineTo(CANVAS_WIDTH, skylineHeight);
        this.ctx.lineTo(0, skylineHeight);
        this.ctx.fill();

        // Layer 2 Sand dunes (closer, faster parallax)
        this.ctx.fillStyle = '#3a1200';
        this.ctx.beginPath();
        this.ctx.moveTo(0, skylineHeight);
        const duneOffset2 = (this.skylineOffset * 0.75) % CANVAS_WIDTH;
        for (let x = -duneOffset2 - 60; x < CANVAS_WIDTH + 240; x += 220) {
          this.ctx.quadraticCurveTo(x + 110, skylineHeight - 38, x + 220, skylineHeight);
        }
        this.ctx.lineTo(CANVAS_WIDTH, skylineHeight);
        this.ctx.lineTo(0, skylineHeight);
        this.ctx.fill();

        // Desert gravel shoulder strip
        this.ctx.fillStyle = '#8a4c16';
        this.ctx.fillRect(0, skylineHeight, CANVAS_WIDTH, 14);
        this.ctx.fillStyle = '#b56d2f';
        this.ctx.fillRect(0, skylineHeight + 4, CANVAS_WIDTH, 4);

        // Top curb
        this.ctx.fillStyle = '#edd19d';
        this.ctx.fillRect(0, skylineHeight + 14, CANVAS_WIDTH, 4);

      } else if (lvl === 'jungle') {
        // --- JUNGLE THEME ---
        // Rainforest misty twilight gradient
        const grad = this.ctx.createLinearGradient(0, 0, 0, skylineHeight);
        grad.addColorStop(0, '#04160d');
        grad.addColorStop(0.4, '#0a321e');
        grad.addColorStop(0.75, '#125232');
        grad.addColorStop(1, '#258250');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, skylineHeight);

        // Misty moon/sun filtered through dense canopy
        this.ctx.fillStyle = 'rgba(215, 255, 225, 0.45)';
        this.ctx.beginPath();
        this.ctx.arc(CANVAS_WIDTH * 0.3, skylineHeight * 0.5, 44, 0, Math.PI * 2);
        this.ctx.fill();

        // Distant mountains / tree canopy silhouettes
        this.ctx.fillStyle = '#072415';
        this.ctx.beginPath();
        this.ctx.moveTo(0, skylineHeight);
        const treeOffset1 = (this.skylineOffset * 0.35) % CANVAS_WIDTH;
        for (let x = -treeOffset1; x < CANVAS_WIDTH + 200; x += 150) {
          this.ctx.quadraticCurveTo(x + 75, skylineHeight - 65, x + 150, skylineHeight);
        }
        this.ctx.lineTo(CANVAS_WIDTH, skylineHeight);
        this.ctx.lineTo(0, skylineHeight);
        this.ctx.fill();

        // Closer dense tropical foliage silhouettes
        this.ctx.fillStyle = '#03140b';
        this.ctx.beginPath();
        this.ctx.moveTo(0, skylineHeight);
        const treeOffset2 = (this.skylineOffset * 0.65) % CANVAS_WIDTH;
        for (let x = -treeOffset2; x < CANVAS_WIDTH + 140; x += 90) {
          this.ctx.lineTo(x + 30, skylineHeight - 45);
          this.ctx.lineTo(x + 45, skylineHeight - 55);
          this.ctx.lineTo(x + 60, skylineHeight - 40);
          this.ctx.lineTo(x + 90, skylineHeight);
        }
        this.ctx.lineTo(CANVAS_WIDTH, skylineHeight);
        this.ctx.lineTo(0, skylineHeight);
        this.ctx.fill();

        // Lush moss shoulder strip
        this.ctx.fillStyle = '#184d28';
        this.ctx.fillRect(0, skylineHeight, CANVAS_WIDTH, 14);
        this.ctx.fillStyle = '#267a3f';
        this.ctx.fillRect(0, skylineHeight + 4, CANVAS_WIDTH, 4);

        // Top curb
        this.ctx.fillStyle = '#bee0a4';
        this.ctx.fillRect(0, skylineHeight + 14, CANVAS_WIDTH, 4);

      } else if (lvl === 'moon') {
        // --- MOON THEME ---
        // Deep cosmos background
        this.ctx.fillStyle = '#020208';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, skylineHeight);

        // Twinkling stars
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 45; i++) {
          const starX = (i * 73 + this.skylineOffset * 0.05) % CANVAS_WIDTH;
          const starY = (i * 37) % (skylineHeight - 25);
          const starSize = (i % 3 === 0) ? 2 : 1;
          const alpha = 0.4 + 0.6 * Math.sin(this.gameTime * 3 + i);
          this.ctx.globalAlpha = Math.max(0.2, alpha);
          this.ctx.fillRect(starX, starY, starSize, starSize);
        }
        this.ctx.globalAlpha = 1.0;

        // Planet Earth hanging in space
        const earthX = CANVAS_WIDTH * 0.78;
        const earthY = 70;
        const earthR = 38;
        // Earth glow
        const earthGlow = this.ctx.createRadialGradient(earthX, earthY, earthR * 0.8, earthX, earthY, earthR * 1.5);
        earthGlow.addColorStop(0, 'rgba(0, 180, 255, 0.45)');
        earthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = earthGlow;
        this.ctx.beginPath();
        this.ctx.arc(earthX, earthY, earthR * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Earth globe body
        const earthGrad = this.ctx.createRadialGradient(earthX - 10, earthY - 10, 4, earthX, earthY, earthR);
        earthGrad.addColorStop(0, '#53b4ff');
        earthGrad.addColorStop(0.6, '#0f62c9');
        earthGrad.addColorStop(1, '#05184f');
        this.ctx.fillStyle = earthGrad;
        this.ctx.beginPath();
        this.ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
        this.ctx.fill();

        // Lunar crater horizon
        this.ctx.fillStyle = '#1b1d24';
        this.ctx.beginPath();
        this.ctx.moveTo(0, skylineHeight);
        const moonOffset = (this.skylineOffset * 0.3) % CANVAS_WIDTH;
        for (let x = -moonOffset; x < CANVAS_WIDTH + 200; x += 140) {
          this.ctx.quadraticCurveTo(x + 70, skylineHeight - 25, x + 140, skylineHeight);
        }
        this.ctx.lineTo(CANVAS_WIDTH, skylineHeight);
        this.ctx.lineTo(0, skylineHeight);
        this.ctx.fill();

        // Lunar surface shoulder strip
        this.ctx.fillStyle = '#2d303a';
        this.ctx.fillRect(0, skylineHeight, CANVAS_WIDTH, 14);
        this.ctx.fillStyle = '#444857';
        this.ctx.fillRect(0, skylineHeight + 4, CANVAS_WIDTH, 4);

        // Top curb
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.fillRect(0, skylineHeight + 14, CANVAS_WIDTH, 4);

      } else {
        // --- HIGHWAY THEME (Default) ---
        if (assets.skyline && assets.skyline.complete) {
          const img = assets.skyline;
          const w = (skylineHeight / img.height) * img.width;
          let startX = -this.skylineOffset % w;
          if (startX > 0) startX -= w;

          for (let x = startX; x < CANVAS_WIDTH + w; x += w) {
            this.ctx.drawImage(img, x, 0, w, skylineHeight);
          }
        } else {
          // Sunset fallback
          const grad = this.ctx.createLinearGradient(0, 0, 0, skylineHeight);
          grad.addColorStop(0, '#2e1c4e');
          grad.addColorStop(0.4, '#872b6b');
          grad.addColorStop(0.7, '#d3523d');
          grad.addColorStop(1, '#ff9933');
          this.ctx.fillStyle = grad;
          this.ctx.fillRect(0, 0, CANVAS_WIDTH, skylineHeight);

          this.ctx.fillStyle = '#ffec99';
          this.ctx.beginPath();
          this.ctx.arc(CANVAS_WIDTH * 0.45, skylineHeight * 0.75, 45, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.fillStyle = '#1c132b';
          this.ctx.fillRect(0, skylineHeight - 45, CANVAS_WIDTH, 45);
        }

        // Road shoulder green verge strip
        this.ctx.fillStyle = '#267b57';
        this.ctx.fillRect(0, skylineHeight, CANVAS_WIDTH, 14);
        this.ctx.fillStyle = '#4da875';
        this.ctx.fillRect(0, skylineHeight + 4, CANVAS_WIDTH, 4);

        // Top white curb line
        this.ctx.fillStyle = '#e8e5c4';
        this.ctx.fillRect(0, skylineHeight + 14, CANVAS_WIDTH, 4);
      }
    }

    renderRoad() {
      const lvl = this.currentLevelKey;

      if (lvl === 'moon') {
        this.drawMoonRoad();
      } else if (lvl === 'desert') {
        this.drawDesertRoad();
      } else if (lvl === 'jungle') {
        this.drawJungleRoad();
      } else {
        // Highway: classic asphalt road
        this.ctx.fillStyle = '#6a7178';
        this.ctx.fillRect(0, ROAD_TOP_Y + 18, CANVAS_WIDTH, CANVAS_HEIGHT - (ROAD_TOP_Y + 18));

        const dividerY1 = 305;
        const dividerY2 = 415;
        const bottomCurbY = 525;
        const dashWidth = 65;
        const dashGap = 55;
        const totalDash = dashWidth + dashGap;

        this.ctx.fillStyle = '#ece8cb';
        let startX = -this.roadDashesOffset;
        while (startX < CANVAS_WIDTH + totalDash) {
          this.ctx.fillRect(startX, dividerY1, dashWidth, 8);
          this.ctx.fillRect(startX, dividerY2, dashWidth, 8);
          startX += totalDash;
        }

        // Bottom curb
        this.ctx.fillStyle = '#dcd8ba';
        this.ctx.fillRect(0, bottomCurbY, CANVAS_WIDTH, 6);
      }
    }

    drawMoonRoad() {
      // Dark lunar regolith terrain (NO standard road/asphalt!)
      this.ctx.fillStyle = '#1c1e28';
      this.ctx.fillRect(0, ROAD_TOP_Y + 18, CANVAS_WIDTH, CANVAS_HEIGHT - (ROAD_TOP_Y + 18));

      // Scrolling terrain impact craters of various sizes
      const craterSpacing = 300;
      const offset = (this.roadDashesOffset * 2.2) % craterSpacing;
      for (let x = -offset - 60; x < CANVAS_WIDTH + 160; x += craterSpacing) {
        this.drawTerrainCrater(x + 50, ROAD_TOP_Y + 45, 26, 12);
        this.drawTerrainCrater(x + 200, ROAD_TOP_Y + 150, 38, 16);
        this.drawTerrainCrater(x + 110, ROAD_TOP_Y + 250, 30, 13);
      }

      // Floating holographic cyan laser pulse beacons marking the lanes
      const dividerY1 = 305;
      const dividerY2 = 415;
      const dashWidth = 42;
      const dashGap = 78;
      const totalDash = dashWidth + dashGap;

      let startX = -this.roadDashesOffset;
      this.ctx.save();
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 8;
      while (startX < CANVAS_WIDTH + totalDash) {
        // Glowing laser pulse line
        this.ctx.fillRect(startX, dividerY1 + 2, dashWidth, 4);
        this.ctx.fillRect(startX, dividerY2 + 2, dashWidth, 4);
        // Diamond crystal tip
        this.ctx.beginPath();
        this.ctx.arc(startX + dashWidth, dividerY1 + 4, 3, 0, Math.PI * 2);
        this.ctx.arc(startX + dashWidth, dividerY2 + 4, 3, 0, Math.PI * 2);
        this.ctx.fill();
        startX += totalDash;
      }
      this.ctx.restore();

      // Bottom lunar rock ridge
      this.ctx.fillStyle = '#2d3242';
      this.ctx.fillRect(0, 525, CANVAS_WIDTH, 6);
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
      this.ctx.fillRect(0, 524, CANVAS_WIDTH, 2);
    }

    drawTerrainCrater(cx, cy, rx, ry) {
      this.ctx.save();
      // Sunlit rim highlight
      this.ctx.fillStyle = '#3a3f52';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 1, rx + 2, ry + 1, 0, 0, Math.PI * 2);
      this.ctx.fill();
      // Dark shadowed crater basin
      this.ctx.fillStyle = '#101116';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      this.ctx.fill();
      // Inner dust texture
      this.ctx.fillStyle = '#161822';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - rx * 0.2, cy - ry * 0.2, rx * 0.6, ry * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    drawDesertRoad() {
      // Sun-baked desert earth and sand
      const grad = this.ctx.createLinearGradient(0, ROAD_TOP_Y + 18, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#ab8859');
      grad.addColorStop(1, '#8f6e43');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, ROAD_TOP_Y + 18, CANVAS_WIDTH, CANVAS_HEIGHT - (ROAD_TOP_Y + 18));

      // Desert sand ruts and double tire tracks
      const dividerY1 = 305;
      const dividerY2 = 415;
      const dashWidth = 65;
      const dashGap = 55;
      const totalDash = dashWidth + dashGap;

      let startX = -this.roadDashesOffset;
      while (startX < CANVAS_WIDTH + totalDash) {
        this.ctx.fillStyle = '#6e5130';
        this.ctx.fillRect(startX, dividerY1, dashWidth, 3);
        this.ctx.fillRect(startX, dividerY1 + 5, dashWidth, 3);
        this.ctx.fillRect(startX, dividerY2, dashWidth, 3);
        this.ctx.fillRect(startX, dividerY2 + 5, dashWidth, 3);
        this.ctx.fillStyle = '#cfb084';
        this.ctx.fillRect(startX, dividerY1 + 8, dashWidth, 2);
        this.ctx.fillRect(startX, dividerY2 + 8, dashWidth, 2);
        startX += totalDash;
      }

      this.ctx.fillStyle = '#bfa177';
      this.ctx.fillRect(0, 525, CANVAS_WIDTH, 6);
    }

    drawJungleRoad() {
      // Wet rainforest soil
      const grad = this.ctx.createLinearGradient(0, ROAD_TOP_Y + 18, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#2b3829');
      grad.addColorStop(1, '#1b2419');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, ROAD_TOP_Y + 18, CANVAS_WIDTH, CANVAS_HEIGHT - (ROAD_TOP_Y + 18));

      // Creeping jungle vine lane markers
      const dividerY1 = 305;
      const dividerY2 = 415;
      const dashWidth = 60;
      const dashGap = 60;
      const totalDash = dashWidth + dashGap;

      let startX = -this.roadDashesOffset;
      while (startX < CANVAS_WIDTH + totalDash) {
        this.ctx.fillStyle = '#3a5732';
        this.ctx.fillRect(startX, dividerY1 + 1, dashWidth, 6);
        this.ctx.fillRect(startX, dividerY2 + 1, dashWidth, 6);
        this.ctx.fillStyle = '#7db86a';
        this.ctx.fillRect(startX + 10, dividerY1, 14, 3);
        this.ctx.fillRect(startX + 35, dividerY1 + 4, 12, 3);
        this.ctx.fillRect(startX + 15, dividerY2, 14, 3);
        this.ctx.fillRect(startX + 40, dividerY2 + 4, 12, 3);
        startX += totalDash;
      }

      this.ctx.fillStyle = '#1c4520';
      this.ctx.fillRect(0, 525, CANVAS_WIDTH, 6);
    }

    renderPlayer() {
      const p = this.player;

      // Ground Shadow underneath Bibendum
      const shadowY = p.currentY + 38;
      const shadowScale = Math.max(0.4, 1 - p.jumpOffset / 200);
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(57, 57, 95, 0.7)';
      this.ctx.beginPath();
      this.ctx.ellipse(p.x + 35, shadowY, 32 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Flicker when invulnerable
      if (p.invulnerableTimer > 0) {
        if (Math.floor(this.gameTime * 20) % 2 === 0) {
          return; // Skip rendering frame for 8-bit blinking
        }
      }

      const drawX = p.x;
      const drawY = p.currentY - p.jumpOffset - 46;

      // Golden Shield Glow
      if (p.shieldActive) {
        this.ctx.save();
        const glowPulse = Math.sin(this.gameTime * 8) * 4;
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.ellipse(drawX + 38, drawY + 45, 48 + glowPulse, 52 + glowPulse, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Select sprite and render
      if (p.isJumping) {
        // Airborne leaping pose (frame 3 from sheet or jump sprite)
        const sheet = assets.bib_run_sheet;
        if (sheet && sheet.complete) {
          const jumpFrame = 3;
          const col = jumpFrame % 5;
          const row = Math.floor(jumpFrame / 5);
          const drawW = 118;
          const drawH = 118;
          const sprX = p.x - 18;
          const sprY = p.currentY - p.jumpOffset - 68;
          this.ctx.drawImage(sheet, col * 256, row * 256, 256, 256, sprX, sprY, drawW, drawH);
        } else {
          const sprite = assets.bib_jump || assets.bib_run1;
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, drawX, drawY, p.width, p.height);
          }
        }
      } else if (p.isSliding) {
        // Sliding / crouched pose
        const sprite = assets.bib_slide;
        const w = p.width * 1.25;
        const h = p.height * 0.55;
        const offsetY = 40;
        if (sprite && sprite.complete) {
          this.ctx.drawImage(sprite, drawX, drawY + offsetY, w, h);
        } else {
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(drawX, drawY + offsetY, w, h);
        }
      } else {
        // 14-frame fluid running cycle from sheet
        const sheet = assets.bib_run_sheet;
        if (sheet && sheet.complete) {
          const frameIdx = p.runFrame % 14;
          const col = frameIdx % 5;
          const row = Math.floor(frameIdx / 5);
          const drawW = 118;
          const drawH = 118;
          const sprX = p.x - 18;
          const sprY = p.currentY - 68;
          this.ctx.drawImage(sheet, col * 256, row * 256, 256, 256, sprX, sprY, drawW, drawH);
        } else {
          const sprite = p.runFrame % 2 === 0 ? assets.bib_run1 : assets.bib_run2;
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, drawX, drawY, p.width, p.height);
          }
        }
      }

      // Astronaut bubble helmet on Moon
      if (this.currentLevelKey === 'moon') {
        this.ctx.save();
        const headCenterX = drawX + 38;
        const headCenterY = drawY + 20;

        // Semi-transparent visor
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
        this.ctx.beginPath();
        this.ctx.arc(headCenterX, headCenterY, 32, 0, Math.PI * 2);
        this.ctx.fill();

        // Neon cyan helmet border
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 8;
        this.ctx.stroke();

        // White curved glare reflection
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(headCenterX - 8, headCenterY - 8, 18, -Math.PI * 0.7, -Math.PI * 0.2);
        this.ctx.stroke();

        this.ctx.restore();
      }
    }

    renderCollectibles() {
      const lvl = this.currentLevelKey;

      this.collectibles.forEach(item => {
        if (item.type === 'gold_tire') {
          this.drawThemedGoldTire(item, lvl);
        } else if (item.type === 'shield') {
          const sprite = assets.powerup_shield;
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, item.x, item.y, item.width, item.height);
          } else {
            this.ctx.fillStyle = '#00f0ff';
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
          }
        } else if (item.type === 'magnet') {
          const sprite = assets.powerup_magnet;
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, item.x, item.y, item.width, item.height);
          } else {
            this.ctx.fillStyle = '#ff0055';
            this.ctx.fillRect(item.x, item.y, item.width, item.height);
          }
        } else if (item.type === 'life') {
          const sprite = assets.tire_life;
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, item.x, item.y, item.width, item.height);
          }
        }
      });
    }

    drawThemedGoldTire(item, lvl) {
      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const r = 14;

      this.ctx.save();

      if (lvl === 'moon') {
        // Zero-G cosmic tire with cyan gravitational ring
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.ellipse(cx, cy, 18, 7, this.gameTime * 2.5, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.shadowBlur = 4;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#0b0c10';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        this.ctx.fill();

      } else if (lvl === 'desert') {
        // Solar-forged desert relic tire
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ff9900';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = '#5c3500';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(cx - 2, cy - r + 3, 4, 3);

      } else if (lvl === 'jungle') {
        // Ancient gold tire with emerald crystal
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#00ff88';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(cx - 1, cy - 3, 2, 2);

      } else {
        // Highway: original animated sprite
        const spriteKey = `gold_tire_${item.frame}`;
        const sprite = assets[spriteKey] || assets.gold_tire_0;
        if (sprite && sprite.complete) {
          this.ctx.drawImage(sprite, item.x, item.y, item.width, item.height);
        } else {
          this.ctx.fillStyle = '#ffd700';
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      this.ctx.restore();
    }

    renderObstacles() {
      const lvl = this.currentLevelKey;

      this.obstacles.forEach(obs => {
        if (obs.isBird) return; // Handled in renderFlyingObstacles

        if (lvl === 'moon') {
          if (obs.isCar) {
            this.drawMoonUFO(obs);
          } else if (obs.type === 'nails') {
            this.drawMoonRocks(obs);
          } else if (obs.type === 'puddle') {
            this.drawPlasmaCrater(obs);
          } else if (obs.type === 'pothole') {
            this.drawMoonCrater(obs);
          } else if (obs.type === 'barricade') {
            this.drawMoonLander(obs);
          }
        } else if (lvl === 'desert') {
          if (obs.isCar) {
            this.drawDesertBuggy(obs);
          } else if (obs.type === 'nails') {
            this.drawCactus(obs);
          } else if (obs.type === 'puddle') {
            this.drawQuicksand(obs);
          } else if (obs.type === 'pothole') {
            this.drawFissure(obs);
          } else if (obs.type === 'barricade') {
            this.drawDesertSkull(obs);
          }
        } else if (lvl === 'jungle') {
          if (obs.isCar) {
            this.drawSafariJeep(obs);
          } else if (obs.type === 'nails') {
            this.drawJungleThorns(obs);
          } else if (obs.type === 'puddle') {
            this.drawMudPool(obs);
          } else if (obs.type === 'pothole') {
            this.drawHollowLog(obs);
          } else if (obs.type === 'barricade') {
            this.drawJungleTotem(obs);
          }
        } else {
          // Highway: classic sprites
          const sprite = assets[obs.type];
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, obs.x, obs.y, obs.width, obs.height);
          } else {
            this.ctx.fillStyle = obs.isCar ? '#cc2233' : '#444444';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          }
        }
      });
    }

    renderFlyingObstacles() {
      const lvl = this.currentLevelKey;

      this.obstacles.forEach(obs => {
        if (!obs.isBird) return;

        if (lvl === 'moon') {
          this.drawMoonShootingStar(obs);
        } else if (lvl === 'desert') {
          this.drawDesertVulture(obs);
        } else if (lvl === 'jungle') {
          this.drawToucan(obs);
        } else {
          // Highway: retro city bird
          const spriteKey = obs.frame === 0 ? 'bird_0' : 'bird_1';
          const sprite = assets[spriteKey];
          if (sprite && sprite.complete) {
            this.ctx.drawImage(sprite, obs.x, obs.y, obs.width, obs.height);
          } else {
            this.ctx.fillStyle = '#2d2d3c';
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          }
        }
      });
    }

    // --- MOON THEMED DRAWING METHODS ---
    drawMoonUFO(obs) {
      const x = obs.x;
      const y = obs.y;
      const w = obs.width;
      const h = obs.height;
      const cx = x + w * 0.48;
      const cy = y + h * 0.58;

      this.ctx.save();

      // Thruster plasma flames
      const flameLength = 26 + Math.sin(this.gameTime * 24) * 8;
      const jetGrad = this.ctx.createLinearGradient(x + w * 0.85, cy, x + w * 0.85 + flameLength, cy);
      jetGrad.addColorStop(0, '#00f0ff');
      jetGrad.addColorStop(0.5, '#9d4edd');
      jetGrad.addColorStop(1, 'rgba(157, 78, 221, 0)');
      this.ctx.fillStyle = jetGrad;
      this.ctx.beginPath();
      this.ctx.ellipse(x + w * 0.88 + flameLength * 0.4, cy, flameLength * 0.5, 9, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Glass bubble dome
      this.ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
      this.ctx.strokeStyle = '#00f0ff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy - 14, 28, 20, 0, Math.PI, 0); // upper half dome
      this.ctx.fill();
      this.ctx.stroke();

      // ALIEN inside dome!
      // Green alien head
      this.ctx.fillStyle = '#39e75f';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 2, cy - 16, 11, 13, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Antennae
      this.ctx.strokeStyle = '#39e75f';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx - 6, cy - 26);
      this.ctx.lineTo(cx - 10, cy - 32);
      this.ctx.moveTo(cx + 2, cy - 26);
      this.ctx.lineTo(cx + 6, cy - 32);
      this.ctx.stroke();
      // Glowing antenna tips
      this.ctx.fillStyle = '#ff00ff';
      this.ctx.beginPath();
      this.ctx.arc(cx - 10, cy - 32, 2.5, 0, Math.PI * 2);
      this.ctx.arc(cx + 6, cy - 32, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Big black oval alien eyes
      this.ctx.fillStyle = '#050505';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 6, cy - 16, 4, 6, -0.25, 0, Math.PI * 2);
      this.ctx.ellipse(cx + 2, cy - 16, 4, 6, 0.25, 0, Math.PI * 2);
      this.ctx.fill();
      // Eye shine
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx - 6, cy - 18, 1.2, 0, Math.PI * 2);
      this.ctx.arc(cx + 2, cy - 18, 1.2, 0, Math.PI * 2);
      this.ctx.fill();

      // Alien hands gripping the UFO control wheel
      this.ctx.fillStyle = '#39e75f';
      this.ctx.fillRect(cx - 10, cy - 5, 5, 5);
      this.ctx.fillRect(cx + 2, cy - 5, 5, 5);
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx - 1, cy - 3, 8, Math.PI * 0.9, Math.PI * 0.1, true);
      this.ctx.stroke();

      // Metallic saucer disc
      const saucerGrad = this.ctx.createLinearGradient(0, cy - 10, 0, cy + 16);
      saucerGrad.addColorStop(0, '#e2e8f0');
      saucerGrad.addColorStop(0.5, '#94a3b8');
      saucerGrad.addColorStop(1, '#475569');
      this.ctx.fillStyle = saucerGrad;
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 64, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Rotating UFO rim lights
      const lights = ['#ffd700', '#00f0ff', '#ff007f', '#00ff88', '#ffd700', '#00f0ff'];
      const timeShift = Math.floor(this.gameTime * 12);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI + (timeShift * 0.3) % (Math.PI * 2);
        const lx = cx + Math.cos(angle) * 52;
        const ly = cy + Math.sin(angle) * 8;
        const col = lights[(i + timeShift) % lights.length];
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        this.ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    drawMoonShootingStar(obs) {
      const x = obs.x;
      const y = obs.y;
      const cx = x + 18;
      const cy = y + 17;

      this.ctx.save();

      // Shimmering cosmic comet tail
      const tailLength = 48;
      const tailGrad = this.ctx.createLinearGradient(cx, cy, cx + tailLength, cy);
      tailGrad.addColorStop(0, 'rgba(255, 230, 100, 0.9)');
      tailGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
      tailGrad.addColorStop(0.7, 'rgba(157, 78, 221, 0.5)');
      tailGrad.addColorStop(1, 'rgba(157, 78, 221, 0)');

      this.ctx.fillStyle = tailGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - 7);
      this.ctx.lineTo(cx + tailLength, cy - 1);
      this.ctx.lineTo(cx + tailLength, cy + 1);
      this.ctx.lineTo(cx, cy + 7);
      this.ctx.closePath();
      this.ctx.fill();

      // Sparkles along tail
      this.ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const sx = cx + 8 + i * 9;
        const sy = cy + Math.sin(this.gameTime * 20 + i) * 4;
        this.ctx.fillRect(sx, sy, 2, 2);
      }

      // Glowing 5-point brilliant shooting star
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 12;
      this.drawStar(cx, cy, 5, 15, 7, '#ffd700');

      // Inner white star core
      this.ctx.shadowBlur = 0;
      this.drawStar(cx, cy, 5, 8, 4, '#ffffff');

      this.ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        this.ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        this.ctx.lineTo(x, y);
        rot += step;
      }
      this.ctx.lineTo(cx, cy - outerRadius);
      this.ctx.closePath();
      this.ctx.fill();
    }

    drawMoonRocks(obs) {
      // Jagged sharp lunar meteorite shards (replaces nails)
      this.ctx.save();
      const x = obs.x;
      const y = obs.y;

      // Rock 1
      this.ctx.fillStyle = '#4e5467';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 5, y + 28);
      this.ctx.lineTo(x + 18, y + 4);
      this.ctx.lineTo(x + 28, y + 28);
      this.ctx.fill();
      this.ctx.fillStyle = '#838ca6';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 18, y + 4);
      this.ctx.lineTo(x + 24, y + 16);
      this.ctx.lineTo(x + 18, y + 28);
      this.ctx.fill();

      // Rock 2 (tall center)
      this.ctx.fillStyle = '#393e4f';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 25, y + 28);
      this.ctx.lineTo(x + 40, y);
      this.ctx.lineTo(x + 52, y + 28);
      this.ctx.fill();
      this.ctx.fillStyle = '#00f0ff'; // glowing crystal vein
      this.ctx.fillRect(x + 38, y + 8, 3, 14);

      // Rock 3
      this.ctx.fillStyle = '#4e5467';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 48, y + 28);
      this.ctx.lineTo(x + 58, y + 9);
      this.ctx.lineTo(x + 64, y + 28);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawPlasmaCrater(obs) {
      // Radioactive cosmic plasma pool (replaces puddle)
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      this.ctx.save();

      // Dark rim
      this.ctx.fillStyle = '#2b2d38';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 55, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Glowing plasma core
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 46, 10, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner electric purple
      this.ctx.fillStyle = '#b5179e';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 32, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Energy bubbles
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx - 15, cy - 2, 2.5, 0, Math.PI * 2);
      this.ctx.arc(cx + 12, cy + 1, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawMoonCrater(obs) {
      // Deep 3D impact crater (replaces pothole)
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      this.ctx.save();

      // Sun-highlighted ridge
      this.ctx.fillStyle = '#4f556b';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy + 2, 45, 17, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Shadowed interior
      this.ctx.fillStyle = '#0b0c10';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 42, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Crater bottom dust
      this.ctx.fillStyle = '#161922';
      this.ctx.beginPath();
      this.ctx.ellipse(cx - 10, cy - 3, 26, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawMoonLander(obs) {
      // Lunar exploration lander / beacon probe (replaces barricade)
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Gold foil insulated core
      this.ctx.fillStyle = '#d4af37';
      this.ctx.fillRect(x + 10, y + 25, 30, 24);
      this.ctx.fillStyle = '#fff08a';
      this.ctx.fillRect(x + 12, y + 27, 10, 8);

      // Probe antenna & satellite dish
      this.ctx.strokeStyle = '#e2e8f0';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 25, y + 25);
      this.ctx.lineTo(x + 25, y + 6);
      this.ctx.stroke();

      // Dish
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 25, y + 10, 10, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Blinking red beacon on top
      this.ctx.fillStyle = Math.floor(this.gameTime * 6) % 2 === 0 ? '#ff0055' : '#55001a';
      this.ctx.beginPath();
      this.ctx.arc(x + 25, y + 5, 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Landing struts / tripod feet
      this.ctx.strokeStyle = '#94a3b8';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 10, y + 45);
      this.ctx.lineTo(x + 2, y + 58);
      this.ctx.moveTo(x + 40, y + 45);
      this.ctx.lineTo(x + 48, y + 58);
      this.ctx.stroke();

      // Foot pads
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(x, y + 56, 8, 3);
      this.ctx.fillRect(x + 44, y + 56, 8, 3);

      this.ctx.restore();
    }

    // --- DESERT THEMED DRAWING METHODS ---
    drawDesertBuggy(obs) {
      const x = obs.x;
      const y = obs.y;
      const w = obs.width;
      const h = obs.height;
      this.ctx.save();

      // Giant knobby off-road wheels
      const wheelR = 15;
      const frontWheelX = x + 35;
      const rearWheelX = x + w - 35;
      const wheelY = y + h - 12;

      // Exhaust dust puff
      this.ctx.fillStyle = 'rgba(210, 180, 140, 0.7)';
      this.ctx.beginPath();
      this.ctx.arc(x + w + 10, wheelY - 5, 12, 0, Math.PI * 2);
      this.ctx.arc(x + w + 22, wheelY - 8, 8, 0, Math.PI * 2);
      this.ctx.fill();

      // Chassis body (Bright desert orange)
      this.ctx.fillStyle = '#ff6600';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 15, y + h - 18);
      this.ctx.lineTo(x + 35, y + 25);
      this.ctx.lineTo(x + w - 30, y + 25);
      this.ctx.lineTo(x + w - 10, y + h - 18);
      this.ctx.closePath();
      this.ctx.fill();

      // Yellow racing stripe
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillRect(x + 35, y + 30, w - 65, 6);

      // Black tubular roll cage
      this.ctx.strokeStyle = '#1a1a1a';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 42, y + 25);
      this.ctx.lineTo(x + 55, y + 8);
      this.ctx.lineTo(x + w - 45, y + 8);
      this.ctx.lineTo(x + w - 35, y + 25);
      this.ctx.stroke();

      // Driver helmet
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x + 75, y + 18, 7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(x + 70, y + 16, 8, 3); // visor

      // Wheels
      [frontWheelX, rearWheelX].forEach(wx => {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.beginPath();
        this.ctx.arc(wx, wheelY, 6, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.ctx.restore();
    }

    drawDesertVulture(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      const wingUp = obs.frame === 0;

      // Dark brown/black plumage wings
      this.ctx.fillStyle = '#2b211a';
      this.ctx.beginPath();
      if (wingUp) {
        this.ctx.moveTo(x + 27, y + 16);
        this.ctx.lineTo(x + 5, y + 2);
        this.ctx.lineTo(x + 22, y + 18);
        this.ctx.lineTo(x + 48, y + 2);
        this.ctx.lineTo(x + 33, y + 16);
      } else {
        this.ctx.moveTo(x + 27, y + 16);
        this.ctx.lineTo(x + 5, y + 30);
        this.ctx.lineTo(x + 22, y + 18);
        this.ctx.lineTo(x + 48, y + 30);
        this.ctx.lineTo(x + 33, y + 16);
      }
      this.ctx.fill();

      // Body
      this.ctx.fillStyle = '#1a1410';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 27, y + 18, 12, 6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Red bald neck
      this.ctx.fillStyle = '#d90429';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 14, y + 18, 5, 4, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Hooked yellow beak
      this.ctx.fillStyle = '#ffb703';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 10, y + 17);
      this.ctx.lineTo(x + 4, y + 21);
      this.ctx.lineTo(x + 10, y + 21);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawCactus(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Green Saguaro cactus
      this.ctx.fillStyle = '#2d7a3f';
      this.ctx.fillRect(x + 26, y + 4, 12, 24);
      // Arms
      this.ctx.fillRect(x + 14, y + 10, 12, 5);
      this.ctx.fillRect(x + 14, y + 6, 5, 8);
      this.ctx.fillRect(x + 38, y + 14, 12, 5);
      this.ctx.fillRect(x + 45, y + 9, 5, 9);

      // Yellow needles
      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillRect(x + 24, y + 8, 2, 2);
      this.ctx.fillRect(x + 38, y + 18, 2, 2);
      this.ctx.fillRect(x + 30, y + 15, 2, 2);

      // Pink desert blossoms
      this.ctx.fillStyle = '#ff007f';
      this.ctx.beginPath();
      this.ctx.arc(x + 32, y + 3, 3, 0, Math.PI * 2);
      this.ctx.arc(x + 16, y + 5, 2.5, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawQuicksand(obs) {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      this.ctx.save();

      // Swirling sand vortex
      this.ctx.fillStyle = '#825e36';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 55, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#5c4122';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 38, 9, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#3d2813';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 20, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawFissure(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Deep sun-baked ground fissure
      this.ctx.fillStyle = '#241408';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 4, y + 16);
      this.ctx.lineTo(x + 22, y + 4);
      this.ctx.lineTo(x + 45, y + 26);
      this.ctx.lineTo(x + 65, y + 6);
      this.ctx.lineTo(x + 85, y + 18);
      this.ctx.lineTo(x + 75, y + 28);
      this.ctx.lineTo(x + 40, y + 34);
      this.ctx.lineTo(x + 18, y + 24);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }

    drawDesertSkull(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Rock pile
      this.ctx.fillStyle = '#876947';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 25, y + 45, 22, 12, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Steer skull (white)
      this.ctx.fillStyle = '#f8f9fa';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 16, y + 22);
      this.ctx.lineTo(x + 34, y + 22);
      this.ctx.lineTo(x + 28, y + 38);
      this.ctx.lineTo(x + 22, y + 38);
      this.ctx.closePath();
      this.ctx.fill();

      // Horns
      this.ctx.strokeStyle = '#e9ecef';
      this.ctx.lineWidth = 3.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 20, y + 24);
      this.ctx.quadraticCurveTo(x + 4, y + 18, x + 2, y + 8);
      this.ctx.moveTo(x + 30, y + 24);
      this.ctx.quadraticCurveTo(x + 46, y + 18, x + 48, y + 8);
      this.ctx.stroke();

      // Eye sockets
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(x + 20, y + 26, 3, 3);
      this.ctx.fillRect(x + 27, y + 26, 3, 3);

      this.ctx.restore();
    }

    // --- JUNGLE THEMED DRAWING METHODS ---
    drawSafariJeep(obs) {
      const x = obs.x;
      const y = obs.y;
      const w = obs.width;
      const h = obs.height;
      this.ctx.save();

      // Olive-green safari body
      this.ctx.fillStyle = '#3d5a31';
      this.ctx.fillRect(x + 16, y + 18, w - 32, 28);
      // Yellow safari accent stripe
      this.ctx.fillStyle = '#ffd166';
      this.ctx.fillRect(x + 16, y + 34, w - 32, 4);

      // Safari roof rack & canopy
      this.ctx.strokeStyle = '#1e281b';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x + 32, y + 6, w - 64, 14);
      // Spare tire on roof
      this.ctx.fillStyle = '#111';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 55, y + 10, 12, 5, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Glowing round yellow headlights
      this.ctx.fillStyle = '#ffee32';
      this.ctx.shadowColor = '#ffee32';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(x + 16, y + 28, 5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Heavy mud-terrain wheels
      const wheelY = y + h - 12;
      [x + 38, x + w - 38].forEach(wx => {
        this.ctx.fillStyle = '#111';
        this.ctx.beginPath();
        this.ctx.arc(wx, wheelY, 14, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#6c757d';
        this.ctx.beginPath();
        this.ctx.arc(wx, wheelY, 5, 0, Math.PI * 2);
        this.ctx.fill();
      });

      this.ctx.restore();
    }

    drawToucan(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      const wingUp = obs.frame === 0;

      // Black body
      this.ctx.fillStyle = '#111';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 28, y + 18, 14, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Wing
      this.ctx.fillStyle = '#1e242b';
      this.ctx.beginPath();
      if (wingUp) {
        this.ctx.ellipse(x + 28, y + 8, 12, 6, -0.3, 0, Math.PI * 2);
      } else {
        this.ctx.ellipse(x + 28, y + 26, 12, 6, 0.3, 0, Math.PI * 2);
      }
      this.ctx.fill();

      // White chest ruff
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(x + 20, y + 17, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Giant colorful toucan beak!
      this.ctx.fillStyle = '#ffb703';
      this.ctx.beginPath();
      this.ctx.moveTo(x + 16, y + 13);
      this.ctx.quadraticCurveTo(x + 2, y + 12, x, y + 19);
      this.ctx.quadraticCurveTo(x + 6, y + 24, x + 16, y + 21);
      this.ctx.closePath();
      this.ctx.fill();

      // Red beak tip
      this.ctx.fillStyle = '#e63946';
      this.ctx.beginPath();
      this.ctx.arc(x + 4, y + 18, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Eye
      this.ctx.fillStyle = '#00f0ff';
      this.ctx.beginPath();
      this.ctx.arc(x + 19, y + 15, 2, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawJungleThorns(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Carnivorous thorn vines
      this.ctx.strokeStyle = '#2d5a27';
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 4, y + 28);
      this.ctx.quadraticCurveTo(x + 20, y + 6, x + 35, y + 26);
      this.ctx.quadraticCurveTo(x + 48, y + 8, x + 60, y + 28);
      this.ctx.stroke();

      // Purple thorns
      this.ctx.fillStyle = '#7b2cbf';
      for (let i = 0; i < 4; i++) {
        const tx = x + 12 + i * 12;
        const ty = y + 12 + (i % 2 === 0 ? -4 : 6);
        this.ctx.beginPath();
        this.ctx.moveTo(tx, ty);
        this.ctx.lineTo(tx + 4, ty - 8);
        this.ctx.lineTo(tx + 8, ty);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    drawMudPool(obs) {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      this.ctx.save();

      // Thick brown jungle mud
      this.ctx.fillStyle = '#3a2b1c';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, 55, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Floating lily pad
      this.ctx.fillStyle = '#40916c';
      this.ctx.beginPath();
      this.ctx.arc(cx - 16, cy - 2, 8, 0, Math.PI * 1.8);
      this.ctx.fill();

      // Pink tropical water blossom
      this.ctx.fillStyle = '#ff758f';
      this.ctx.beginPath();
      this.ctx.arc(cx - 16, cy - 2, 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Mud bubbles
      this.ctx.fillStyle = '#523d28';
      this.ctx.beginPath();
      this.ctx.arc(cx + 18, cy + 1, 4, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawHollowLog(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Fallen hollow tree trunk
      this.ctx.fillStyle = '#4a3728';
      this.ctx.beginPath();
      this.ctx.roundRect(x + 4, y + 8, 82, 22, 6);
      this.ctx.fill();

      // Hollow dark hole in center
      this.ctx.fillStyle = '#1c130c';
      this.ctx.beginPath();
      this.ctx.ellipse(x + 14, y + 19, 8, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Moss top
      this.ctx.fillStyle = '#52b788';
      this.ctx.fillRect(x + 18, y + 8, 52, 4);

      // Orange mushrooms
      this.ctx.fillStyle = '#ff7b00';
      this.ctx.beginPath();
      this.ctx.arc(x + 45, y + 6, 4, Math.PI, 0);
      this.ctx.arc(x + 55, y + 7, 3, Math.PI, 0);
      this.ctx.fill();

      this.ctx.restore();
    }

    drawJungleTotem(obs) {
      const x = obs.x;
      const y = obs.y;
      this.ctx.save();

      // Ancient carved stone idol
      this.ctx.fillStyle = '#405342';
      this.ctx.fillRect(x + 8, y + 8, 34, 50);

      // Stone headdress
      this.ctx.fillStyle = '#2f3e31';
      this.ctx.fillRect(x + 4, y + 4, 42, 8);

      // Glowing emerald eyes
      this.ctx.fillStyle = '#00ff88';
      this.ctx.shadowColor = '#00ff88';
      this.ctx.shadowBlur = 8;
      this.ctx.fillRect(x + 14, y + 20, 7, 5);
      this.ctx.fillRect(x + 29, y + 20, 7, 5);
      this.ctx.shadowBlur = 0;

      // Carved mouth and teeth
      this.ctx.fillStyle = '#1c241d';
      this.ctx.fillRect(x + 16, y + 36, 18, 8);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(x + 18, y + 36, 4, 4);
      this.ctx.fillRect(x + 26, y + 36, 4, 4);

      this.ctx.restore();
    }

    renderParticles() {
      this.particles.forEach(p => p.draw(this.ctx));
    }
  }

  // Initialize game on window load
  window.addEventListener('DOMContentLoaded', () => {
    window.bibendumGame = new Game();
  });
})();

