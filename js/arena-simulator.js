/**
 * SPIRIXTOTAL 2.0 — SIMULADOR INTERACTIVO DE TATAMI EN VIVO
 * Réplica exacta de la comunicación Juez (Mobile) <-> Pantalla Gigante (SmartTV)
 */

(function() {
  // Estado del combate en el simulador
  const state = {
    redScore: 0,
    blueScore: 0,
    redFouls: 0,
    blueFouls: 0,
    secondsLeft: 90, // 1:30
    timerRunning: false,
    timerInterval: null,
    soundEnabled: true,
    history: []
  };

  // Sintetizador Web Audio API nativo para feedback sonoro deportivo
  let audioCtx = null;
  function playBeep(freq = 880, duration = 0.08, type = 'sine') {
    if (!state.soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {
      // Audio no disponible o silenciado
    }
  }

  // Elementos del DOM
  const dom = {
    redScore: document.getElementById('sim-red-score'),
    blueScore: document.getElementById('sim-blue-score'),
    timerDigits: document.getElementById('sim-timer-digits'),
    btnToggleTimer: document.getElementById('sim-btn-timer-toggle'),
    btnResetTimer: document.getElementById('sim-btn-timer-reset'),
    soundToggle: document.getElementById('sim-sound-toggle'),
    redFouls: [
      document.getElementById('sim-red-foul-1'),
      document.getElementById('sim-red-foul-2'),
      document.getElementById('sim-red-foul-3')
    ],
    blueFouls: [
      document.getElementById('sim-blue-foul-1'),
      document.getElementById('sim-blue-foul-2'),
      document.getElementById('sim-blue-foul-3')
    ]
  };

  // Renderizar marcador
  function updateScores(bumpColor = null) {
    if (dom.redScore) {
      dom.redScore.textContent = state.redScore;
      if (bumpColor === 'red') {
        dom.redScore.classList.add('bump');
        setTimeout(() => dom.redScore.classList.remove('bump'), 160);
      }
    }
    if (dom.blueScore) {
      dom.blueScore.textContent = state.blueScore;
      if (bumpColor === 'blue') {
        dom.blueScore.classList.add('bump');
        setTimeout(() => dom.blueScore.classList.remove('bump'), 160);
      }
    }
  }

  // Renderizar faltas
  function updateFouls() {
    dom.redFouls.forEach((el, idx) => {
      if (el) el.classList.toggle('active', idx < state.redFouls);
    });
    dom.blueFouls.forEach((el, idx) => {
      if (el) el.classList.toggle('active', idx < state.blueFouls);
    });
  }

  // Formato del cronómetro MM:SS
  function formatTime(totalSeconds) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updateTimerDisplay() {
    if (dom.timerDigits) {
      dom.timerDigits.textContent = formatTime(state.secondsLeft);
      if (state.timerRunning) {
        dom.timerDigits.classList.remove('paused');
      } else {
        dom.timerDigits.classList.add('paused');
      }
    }
    if (dom.btnToggleTimer) {
      dom.btnToggleTimer.textContent = state.timerRunning ? 'Pausar' : 'Iniciar';
    }
  }

  // Métodos de control
  window.simAddPoint = function(corner, points) {
    state.history.push({ type: 'point', corner, points });
    if (corner === 'red') {
      state.redScore += points;
      playBeep(980, 0.09, 'triangle');
      updateScores('red');
    } else {
      state.blueScore += points;
      playBeep(1200, 0.09, 'triangle');
      updateScores('blue');
    }
  };

  window.simAddFoul = function(corner) {
    if (corner === 'red') {
      if (state.redFouls < 3) {
        state.redFouls++;
        state.history.push({ type: 'foul', corner });
        playBeep(440, 0.15, 'sawtooth');
        updateFouls();
      }
    } else {
      if (state.blueFouls < 3) {
        state.blueFouls++;
        state.history.push({ type: 'foul', corner });
        playBeep(440, 0.15, 'sawtooth');
        updateFouls();
      }
    }
  };

  window.simUndoLast = function() {
    const lastAction = state.history.pop();
    if (!lastAction) return;

    if (lastAction.type === 'point') {
      if (lastAction.corner === 'red') {
        state.redScore = Math.max(0, state.redScore - lastAction.points);
        updateScores();
      } else {
        state.blueScore = Math.max(0, state.blueScore - lastAction.points);
        updateScores();
      }
    } else if (lastAction.type === 'foul') {
      if (lastAction.corner === 'red') {
        state.redFouls = Math.max(0, state.redFouls - 1);
        updateFouls();
      } else {
        state.blueFouls = Math.max(0, state.blueFouls - 1);
        updateFouls();
      }
    }
    playBeep(600, 0.06, 'sine');
  };

  window.simResetMatch = function() {
    state.redScore = 0;
    state.blueScore = 0;
    state.redFouls = 0;
    state.blueFouls = 0;
    state.secondsLeft = 90;
    state.history = [];
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerRunning = false;
    updateScores();
    updateFouls();
    updateTimerDisplay();
    playBeep(520, 0.12, 'sine');
  };

  window.simToggleTimer = function() {
    if (state.timerRunning) {
      clearInterval(state.timerInterval);
      state.timerRunning = false;
    } else {
      if (state.secondsLeft <= 0) state.secondsLeft = 90;
      state.timerRunning = true;
      state.timerInterval = setInterval(() => {
        if (state.secondsLeft > 0) {
          state.secondsLeft--;
          updateTimerDisplay();
          if (state.secondsLeft === 10) {
            playBeep(880, 0.2, 'square'); // Alerta 10 segundos
          }
          if (state.secondsLeft === 0) {
            clearInterval(state.timerInterval);
            state.timerRunning = false;
            updateTimerDisplay();
            playBeep(330, 0.6, 'sawtooth'); // Campana final
          }
        }
      }, 1000);
    }
    updateTimerDisplay();
  };

  // Toggle sonido
  if (dom.soundToggle) {
    dom.soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      dom.soundToggle.classList.toggle('active', state.soundEnabled);
      dom.soundToggle.querySelector('.sound-status-text').textContent = state.soundEnabled ? 'Sonido: ON' : 'Sonido: OFF';
    });
  }

  // Inicialización
  updateScores();
  updateFouls();
  updateTimerDisplay();
})();
