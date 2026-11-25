// All sound in Warung Rush is synthesized in code with WebAudio: short
// oscillator blips for actions and filtered noise for the wok sizzle.
// No audio files are loaded, and nothing starts until the player interacts.

let ctx = null;
let master = null;
let sizzleGain = null;
let sizzleSource = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

export function ensureAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
}

function blip(freq, dur, type, vol, slideTo) {
  if (!ctx || muted) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
  gain.gain.setValueAtTime(vol || 0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

export function sfxClick() {
  ensureAudio();
  blip(660, 0.06, 'triangle', 0.15);
}

export function sfxToss() {
  ensureAudio();
  blip(320, 0.12, 'sine', 0.3, 540);
}

export function sfxWrong() {
  ensureAudio();
  blip(180, 0.18, 'square', 0.12, 120);
}

export function sfxReady() {
  ensureAudio();
  blip(880, 0.12, 'triangle', 0.25);
  setTimeout(() => blip(1320, 0.16, 'triangle', 0.22), 90);
}

export function sfxServe() {
  ensureAudio();
  blip(1046, 0.1, 'triangle', 0.28);
  setTimeout(() => blip(1318, 0.1, 'triangle', 0.28), 80);
  setTimeout(() => blip(1568, 0.22, 'triangle', 0.3), 160);
}

export function sfxExpire() {
  ensureAudio();
  blip(392, 0.25, 'sawtooth', 0.14, 196);
}

export function sfxTick() {
  ensureAudio();
  blip(1200, 0.04, 'square', 0.07);
}

export function sfxStart() {
  ensureAudio();
  blip(523, 0.1, 'triangle', 0.25);
  setTimeout(() => blip(659, 0.1, 'triangle', 0.25), 100);
  setTimeout(() => blip(784, 0.2, 'triangle', 0.28), 200);
}

// The wok sizzle: a looped noise buffer through a band-pass filter whose
// gain follows how much food is cooking.
export function setSizzle(level) {
  if (!ctx) return;
  if (!sizzleSource) {
    const len = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    sizzleSource = ctx.createBufferSource();
    sizzleSource.buffer = buffer;
    sizzleSource.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4200;
    filter.Q.value = 0.6;
    sizzleGain = ctx.createGain();
    sizzleGain.gain.value = 0;
    sizzleSource.connect(filter);
    filter.connect(sizzleGain);
    sizzleGain.connect(master);
    sizzleSource.start();
  }
  const target = muted ? 0 : Math.min(0.12, level * 0.05);
  sizzleGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
}
