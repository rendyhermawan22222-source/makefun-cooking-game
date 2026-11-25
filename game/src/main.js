// Warung Rush — the game loop, the state, and the rules that tie the
// counter, the wok and the plate together. Rendering lives in render.js,
// input in input.js, sound in audio.js.

import { makeRng, pick } from './rng.js';
import { INGREDIENTS, DISHES, ingredientById } from './recipes.js';
import {
  makeOrder,
  maxTicketsForLevel,
  ticketTimeForLevel,
  spawnIntervalForLevel,
  cookOrder,
  orderIsComplete,
  orderScore,
  orderCoins,
  orderDish,
} from './orders.js';
import { makeSteam, updateSteam, makeCoinBurst, burstCoins, updateCoinBurst } from './wok.js';
import { render, W, H } from './render.js';
import { makeInput, toGameCoords, hotspotAt, keyAction } from './input.js';
import {
  ensureAudio,
  sfxClick,
  sfxToss,
  sfxWrong,
  sfxReady,
  sfxServe,
  sfxExpire,
  sfxTick,
  sfxStart,
  setSizzle,
  toggleMute,
  isMuted,
} from './audio.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const params = new URLSearchParams(window.location.search);
const seedParam = Number(params.get('seed') || Date.now() % 2147483647);
const rng = makeRng(seedParam);

const game = {
  screen: 'title',
  paused: false,
  time: 0,
  score: 0,
  coins: 0,
  served: 0,
  lost: 0,
  combo: 0,
  bestCombo: 0,
  bestScore: 0,
  hearts: 3,
  level: 1,
  orders: [],
  activeOrderId: null,
  plate: null,
  spawnTimer: 2.5,
  steam: makeSteam(rng),
  coinBurst: makeCoinBurst(),
  floaters: [],
  muted: false,
  staged: false,
};

const input = makeInput();
const statusEl = document.getElementById('status');

function activeOrder() {
  return game.orders.find((o) => o.id === game.activeOrderId) || null;
}

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function resetGame() {
  game.screen = 'playing';
  game.paused = false;
  game.time = 0;
  game.score = 0;
  game.coins = 0;
  game.served = 0;
  game.lost = 0;
  game.combo = 0;
  game.hearts = 3;
  game.level = 1;
  game.orders = [];
  game.activeOrderId = null;
  game.plate = null;
  game.spawnTimer = 1.2;
  game.floaters = [];
  spawnOrder();
  setStatus('Warung Rush dimulai. Pesanan pertama sudah di papan.');
}

function spawnOrder() {
  const order = makeOrder(rng, game.level);
  game.orders.push(order);
  if (!game.activeOrderId) game.activeOrderId = order.id;
}

function cycleTicket(dir) {
  if (game.orders.length === 0) return;
  const idx = game.orders.findIndex((o) => o.id === game.activeOrderId);
  const next = game.orders[(idx + dir + game.orders.length) % game.orders.length];
  game.activeOrderId = next.id;
  sfxClick();
}

function addIngredient(index) {
  const order = activeOrder();
  const ing = INGREDIENTS[index];
  if (!ing || !order || game.screen !== 'playing' || game.paused) return;
  if (order.ready || order.plated) return;
  if (order.added[ing.id] !== undefined) {
    sfxClick();
    return;
  }
  ensureAudio();
  if (!order.needs.includes(ing.id)) {
    order.wrong.push(ing.id);
    order.flash = 0.3;
    sfxWrong();
    setStatus(ing.name + ' bukan bahan ' + orderDish(order).name + '. Buang isi wajan dengan T.');
    return;
  }
  order.added[ing.id] = 0;
  sfxToss();
  setStatus(ing.name + ' masuk wajan untuk ' + orderDish(order).name + '.');
}

function emptyWok() {
  const order = activeOrder();
  if (!order || game.screen !== 'playing') return;
  if (Object.keys(order.added).length === 0 && order.wrong.length === 0) return;
  order.added = {};
  order.wrong = [];
  order.ready = false;
  sfxClick();
  setStatus('Wajan dikosongkan. Mulai lagi dari awal.');
}

function plateDish(order) {
  game.plate = { dishId: order.dishId };
  order.plated = true;
  sfxReady();
  setStatus(orderDish(order).name + ' matang! Sajikan dengan Spasi.');
}

function servePlate() {
  if (!game.plate || game.screen !== 'playing' || game.paused) return;
  const order = game.orders.find((o) => o.plated);
  if (!order) {
    game.plate = null;
    return;
  }
  ensureAudio();
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  const points = orderScore(order, game.combo);
  const coins = orderCoins(order);
  game.score += points;
  game.coins += coins;
  game.served += 1;
  game.floaters.push({ x: 985, y: 220, t: 0, text: '+' + points, color: '#f5b942' });
  burstCoins(game.coinBurst, 985, 285, 1000, 22, 6);
  sfxServe();
  setStatus(orderDish(order).name + ' tersaji! +' + points + ' poin, Rp' + coins + '.');
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.plate = null;
  if (game.activeOrderId === order.id) {
    game.activeOrderId = game.orders.length ? game.orders[0].id : null;
  }
  const newLevel = 1 + Math.floor(game.served / 6);
  if (newLevel > game.level) {
    game.level = newLevel;
    game.floaters.push({ x: 640, y: 160, t: 0, text: 'RUSH LEVEL ' + game.level + '!', color: '#ff8a7a' });
  }
}

function expireOrder(order) {
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.hearts -= 1;
  game.lost += 1;
  game.combo = 0;
  sfxExpire();
  setStatus('Pelanggan #' + order.customer + ' kabur — ' + orderDish(order).name + ' tidak sempat disajikan.');
  if (game.plate && game.plate.dishId === order.dishId && order.plated) game.plate = null;
  if (game.activeOrderId === order.id) {
    game.activeOrderId = game.orders.length ? game.orders[0].id : null;
  }
  if (game.hearts <= 0) {
    game.screen = 'gameover';
    game.bestScore = Math.max(game.bestScore, game.score);
    setStatus('Warung tutup. Skor ' + game.score + ', ' + game.served + ' pesanan tersaji.');
  }
}

function doAction(action) {
  if (!action) return;
  if (action.action === 'mute') {
    game.muted = toggleMute();
    return;
  }
  if (game.screen === 'title') {
    if (action.action === 'start' || action.action === 'serve') {
      ensureAudio();
      sfxStart();
      resetGame();
    }
    return;
  }
  if (game.screen === 'gameover') {
    if (action.action === 'restart' || action.action === 'serve') resetGame();
    return;
  }
  switch (action.action) {
    case 'ingredient':
      addIngredient(action.arg);
      break;
    case 'ticket':
      game.activeOrderId = action.arg;
      sfxClick();
      break;
    case 'serve':
      servePlate();
      break;
    case 'trash':
      emptyWok();
      break;
    case 'nextTicket':
      cycleTicket(1);
      break;
    case 'prevTicket':
      cycleTicket(-1);
      break;
    case 'pause':
      game.paused = !game.paused;
      sfxClick();
      break;
    case 'restart':
      resetGame();
      break;
  }
}

canvas.addEventListener('pointerdown', (e) => {
  const p = toGameCoords(canvas, e.clientX, e.clientY);
  input.mouseX = p.x;
  input.mouseY = p.y;
  input.mouseDown = true;
  const hot = hotspotAt(input, p.x, p.y);
  if (hot) doAction(hot);
});

window.addEventListener('pointermove', (e) => {
  const p = toGameCoords(canvas, e.clientX, e.clientY);
  input.mouseX = p.x;
  input.mouseY = p.y;
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
  if (e.code === 'Space') e.preventDefault();
  const action = keyAction(e.code, e.key);
  if (action) doAction(action);
});

// The staged screenshot states freeze the timers so the frame is stable,
// but steam and flames keep their idle motion.
game.staged = applyShot(game, params);
if (game.staged) {
  setStatus('Warung Rush — staged screenshot state.');
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.time += dt;
  if (game.screen === 'playing' && !game.paused) {
    // Tickets count down; a running-out ticket ticks its last seconds.
    for (const order of game.orders.slice()) {
      if (!game.staged) order.timeLeft -= dt;
      if (order.timeLeft <= 10 && order.timeLeft > 0 && Math.ceil(order.timeLeft) !== Math.ceil(order.timeLeft + dt)) {
        sfxTick();
      }
      if (order.timeLeft <= 0 && !game.staged) expireOrder(order);
      if (order.flash > 0) order.flash -= dt;
    }
    // Cook what is in the wok; a finished dish plates itself, unless a
    // wrong ingredient is still sitting in it. Staged shots stay frozen.
    if (!game.staged) {
      for (const order of game.orders) {
        if (cookOrder(order, dt) && order.ready && !order.plated && !game.plate && order.wrong.length === 0) {
          plateDish(order);
        }
      }
    }
    // New tickets arrive on a timer that quickens as the rush level rises.
    if (!game.staged) {
      game.spawnTimer -= dt;
      if (game.spawnTimer <= 0 && game.orders.length < maxTicketsForLevel(game.level)) {
        spawnOrder();
        game.spawnTimer = spawnIntervalForLevel(game.level);
      }
    }
    // Steam follows the food that is cooking.
    const cooking = game.orders.reduce((n, o) => n + Object.keys(o.added).filter((id) => o.added[id] < 1).length, 0);
    updateSteam(game.steam, dt, cooking, 640, 268);
    setSizzle(cooking);
  }
  updateCoinBurst(game.coinBurst, dt);
  for (const f of game.floaters) f.t += dt;
  game.floaters = game.floaters.filter((f) => f.t < 1.2);
  render(ctx, game, input);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// A tiny handle for automated play-testing: the page exposes the live state
// so a test driver can read score, orders and plate without scraping pixels.
window.__warung = { game, INGREDIENTS, DISHES };
