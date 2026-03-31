/**
 * 8-bit chiptune audio engine using Web Audio API
 * Provides retro game BGM and sound effects
 */

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ─── Sound Effects ─────────────────────────────────

export function sfxCast() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain).connect(ctx.destination)
  osc.type = 'square'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.15)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
}

export function sfxBite() {
  const ctx = getCtx()
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(600, ctx.currentTime + i * 0.08)
    osc.frequency.setValueAtTime(800, ctx.currentTime + i * 0.08 + 0.04)
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.06)
    osc.start(ctx.currentTime + i * 0.08)
    osc.stop(ctx.currentTime + i * 0.08 + 0.06)
  }
}

export function sfxCatch() {
  const ctx = getCtx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.12)
    osc.start(ctx.currentTime + i * 0.1)
    osc.stop(ctx.currentTime + i * 0.1 + 0.12)
  })
}

export function sfxEscape() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain).connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(400, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.35)
}

export function sfxCollect() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain).connect(ctx.destination)
  osc.type = 'square'
  osc.frequency.setValueAtTime(880, ctx.currentTime)
  osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05)
  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

export function sfxHit() {
  const ctx = getCtx()
  const osc = ctx.createOscillator()
  const noise = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain).connect(ctx.destination)
  noise.connect(gain)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(150, ctx.currentTime)
  osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.15)
  noise.type = 'square'
  noise.frequency.setValueAtTime(80, ctx.currentTime)
  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2)
  osc.start(ctx.currentTime)
  noise.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.2)
  noise.stop(ctx.currentTime + 0.2)
}

export function sfxPlant() {
  const ctx = getCtx()
  const notes = [262, 330, 392]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12)
    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.12 + 0.15)
    osc.start(ctx.currentTime + i * 0.12)
    osc.stop(ctx.currentTime + i * 0.12 + 0.15)
  })
}

export function sfxStart() {
  const ctx = getCtx()
  const notes = [392, 523, 659, 784]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain).connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.08 + 0.1)
    osc.start(ctx.currentTime + i * 0.08)
    osc.stop(ctx.currentTime + i * 0.08 + 0.1)
  })
}

// ─── 8-bit Engine Sound ───────────────────────────

interface EngineState {
  running: boolean
  osc1: OscillatorNode | null
  osc2: OscillatorNode | null
  gain: GainNode | null
  lfo: OscillatorNode | null
}

const engineState: EngineState = {
  running: false,
  osc1: null,
  osc2: null,
  gain: null,
  lfo: null,
}

/** Start a continuous 8-bit engine hum. Call updateEngineSpeed to change pitch. */
export function startEngine() {
  if (engineState.running) return
  const ctx = getCtx()
  engineState.running = true

  // Main engine tone — square wave for 8-bit feel
  const osc1 = ctx.createOscillator()
  osc1.type = 'square'
  osc1.frequency.setValueAtTime(55, ctx.currentTime)

  // Sub-bass rumble
  const osc2 = ctx.createOscillator()
  osc2.type = 'sawtooth'
  osc2.frequency.setValueAtTime(28, ctx.currentTime)

  // LFO for putter / idle vibration
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(8, ctx.currentTime)
  const lfoGain = ctx.createGain()
  lfoGain.gain.setValueAtTime(6, ctx.currentTime)
  lfo.connect(lfoGain)
  lfoGain.connect(osc1.frequency) // modulate main pitch slightly

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.06, ctx.currentTime)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start()
  osc2.start()
  lfo.start()

  engineState.osc1 = osc1
  engineState.osc2 = osc2
  engineState.gain = gain
  engineState.lfo = lfo
}

/** Update engine pitch based on speed (40-180 range). */
export function updateEngineSpeed(speed: number) {
  if (!engineState.running || !engineState.osc1 || !engineState.osc2 || !engineState.lfo || !engineState.gain) return
  const ctx = getCtx()
  // Map speed 40-180 → base freq 45-120
  const t = Math.max(0, Math.min(1, (speed - 40) / 140))
  const baseFreq = 45 + t * 75
  engineState.osc1.frequency.linearRampToValueAtTime(baseFreq, ctx.currentTime + 0.1)
  engineState.osc2.frequency.linearRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.1)
  // LFO rate: faster at higher speed (8-25 Hz)
  engineState.lfo.frequency.linearRampToValueAtTime(8 + t * 17, ctx.currentTime + 0.1)
  // Volume slightly louder at speed
  engineState.gain.gain.linearRampToValueAtTime(0.04 + t * 0.04, ctx.currentTime + 0.1)
}

/** Stop the engine sound. */
export function stopEngine() {
  if (!engineState.running) return
  engineState.running = false
  try {
    engineState.osc1?.stop()
    engineState.osc2?.stop()
    engineState.lfo?.stop()
  } catch (_) { /* already stopped */ }
  engineState.osc1 = null
  engineState.osc2 = null
  engineState.gain = null
  engineState.lfo = null
}

// ─── 8-bit BGM Engine ─────────────────────────────

interface BGMState {
  playing: boolean
  oscillators: OscillatorNode[]
  gains: GainNode[]
  intervalId: ReturnType<typeof setInterval> | null
}

const bgmState: BGMState = {
  playing: false,
  oscillators: [],
  gains: [],
  intervalId: null,
}

// Calm retro melody (pentatonic scale)
const MELODY = [
  392, 440, 523, 587, 659, 523, 440, 392,
  330, 392, 440, 523, 587, 523, 440, 392,
  294, 330, 392, 440, 523, 440, 392, 330,
  262, 294, 330, 392, 440, 392, 330, 294,
]
const BASS = [
  131, 131, 165, 165, 196, 196, 165, 165,
  131, 131, 147, 147, 165, 165, 147, 147,
  110, 110, 131, 131, 147, 147, 131, 131,
  98, 98, 110, 110, 131, 131, 110, 110,
]

export function startBGM() {
  if (bgmState.playing) return
  const ctx = getCtx()
  bgmState.playing = true

  let step = 0
  const bpm = 140
  const interval = (60 / bpm) * 1000

  bgmState.intervalId = setInterval(() => {
    const now = ctx.currentTime
    const dur = interval / 1000 * 0.8

    // Melody voice
    const osc1 = ctx.createOscillator()
    const g1 = ctx.createGain()
    osc1.connect(g1).connect(ctx.destination)
    osc1.type = 'square'
    osc1.frequency.setValueAtTime(MELODY[step % MELODY.length], now)
    g1.gain.setValueAtTime(0.06, now)
    g1.gain.linearRampToValueAtTime(0, now + dur)
    osc1.start(now)
    osc1.stop(now + dur)

    // Bass voice
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.connect(g2).connect(ctx.destination)
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(BASS[step % BASS.length], now)
    g2.gain.setValueAtTime(0.05, now)
    g2.gain.linearRampToValueAtTime(0, now + dur)
    osc2.start(now)
    osc2.stop(now + dur)

    step++
  }, interval)
}

export function stopBGM() {
  if (!bgmState.playing) return
  bgmState.playing = false
  if (bgmState.intervalId) {
    clearInterval(bgmState.intervalId)
    bgmState.intervalId = null
  }
}

export function isBGMPlaying() {
  return bgmState.playing
}
