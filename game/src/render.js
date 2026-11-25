// Every pixel of Warung Rush is drawn here in code: the night-market stall,
// the order board, the ingredient counter, the wok, the plate and the
// overlays. No images, no fonts from the network; the canvas font stack
// falls back to the system sans-serif.

import { INGREDIENTS, ingredientById, DISHES } from './recipes.js';
import { orderDish, orderNeedsLeft } from './orders.js';
import { coinPos } from './wok.js';

export const W = 1280;
export const H = 480;

const INK = '#241a12';
const CREAM = '#f6e3c5';
const GOLD = '#f5b942';
const RED = '#d9382b';
const TEAL = '#2f8f7b';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = (weight || 700) + ' ' + size + 'px "Trebuchet MS", Verdana, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

// ---- ingredient icons, drawn as small vector pictures --------------------

export function drawIngredientIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(2, r * 0.08);
  if (id === 'nasi') {
    ctx.fillStyle = '#fbf7ea';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.8, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    for (const [dx, dy] of [[-0.4, -0.1], [0, -0.35], [0.4, -0.05], [-0.15, -0.45], [0.25, -0.3]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#b98f2e';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.75, i * r * 0.42);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.42 - r * 0.45, r * 0.3, i * r * 0.42 + r * 0.45, r * 0.75, i * r * 0.42);
      ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7a83c';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e08a1e';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'ayam') {
    ctx.fillStyle = '#e08a5a';
    ctx.beginPath();
    ctx.ellipse(-r * 0.1, r * 0.05, r * 0.72, r * 0.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f6e3c5';
    ctx.lineWidth = r * 0.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.45, -r * 0.35);
    ctx.lineTo(r * 0.85, -r * 0.75);
    ctx.stroke();
    ctx.fillStyle = '#f6e3c5';
    ctx.beginPath();
    ctx.arc(r * 0.88, -r * 0.78, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a34d24';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.15, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cabai') {
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.2);
    ctx.quadraticCurveTo(0, r * 0.9, r * 0.85, -r * 0.45);
    ctx.quadraticCurveTo(r * 0.45, -r * 0.1, -r * 0.1, -r * 0.55);
    ctx.quadraticCurveTo(-r * 0.55, -r * 0.75, -r * 0.8, -r * 0.2);
    ctx.fill();
    ctx.strokeStyle = '#3f7d3a';
    ctx.lineWidth = r * 0.18;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.75, -r * 0.25);
    ctx.lineTo(-r * 1.0, -r * 0.6);
    ctx.stroke();
  } else if (id === 'bawang') {
    ctx.fillStyle = '#d9a7e8';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#8a5aa8';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#3f7d3a';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(0, -r * 0.95);
    ctx.stroke();
  } else if (id === 'kecap') {
    ctx.fillStyle = '#3a2415';
    rr(ctx, -r * 0.42, -r * 0.55, r * 0.84, r * 1.25, r * 0.22);
    ctx.fill();
    ctx.fillStyle = '#c0392b';
    rr(ctx, -r * 0.42, -r * 0.15, r * 0.84, r * 0.42, r * 0.08);
    ctx.fill();
    ctx.fillStyle = '#f6e3c5';
    ctx.font = '700 ' + Math.round(r * 0.34) + 'px "Trebuchet MS", Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('K', 0, r * 0.06);
    ctx.fillStyle = '#f5b942';
    rr(ctx, -r * 0.3, -r * 0.85, r * 0.6, r * 0.3, r * 0.1);
    ctx.fill();
  }
  ctx.restore();
}

function drawHeart(ctx, x, y, r, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = filled ? '#ff5a6e' : '#4a3a30';
  ctx.beginPath();
  ctx.moveTo(0, r * 0.7);
  ctx.bezierCurveTo(-r * 1.1, -r * 0.2, -r * 0.6, -r * 1.0, 0, -r * 0.35);
  ctx.bezierCurveTo(r * 0.6, -r * 1.0, r * 1.1, -r * 0.2, 0, r * 0.7);
  ctx.fill();
  ctx.restore();
}

function drawCoin(ctx, x, y, r) {
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b98f2e';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'Rp', x, y + 1, Math.round(r * 0.85), '#7a5a10', 800, 'center');
}

// ---- the stall itself -----------------------------------------------------

function drawBackground(ctx, game) {
  const sky = ctx.createLinearGradient(0, 0, 0, 480);
  sky.addColorStop(0, '#191f3d');
  sky.addColorStop(0.55, '#2c2140');
  sky.addColorStop(1, '#3d2438');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Distant rooftops and a moon, kept clear of the top bar's text.
  ctx.fillStyle = '#141830';
  ctx.beginPath();
  ctx.moveTo(0, 130);
  ctx.lineTo(90, 92);
  ctx.lineTo(180, 130);
  ctx.lineTo(270, 96);
  ctx.lineTo(360, 130);
  ctx.lineTo(360, 480);
  ctx.lineTo(0, 480);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f6e3c5';
  ctx.beginPath();
  ctx.arc(508, 24, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(246,227,197,0.25)';
  ctx.beginPath();
  ctx.arc(508, 24, 22, 0, Math.PI * 2);
  ctx.fill();
  // String lights tucked along the very top edge, above the title text.
  ctx.strokeStyle = '#3a2a1c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.quadraticCurveTo(640, 10, 1280, 2);
  ctx.stroke();
  for (let i = 0; i < 16; i++) {
    const t = i / 15;
    const x = t * 1280;
    const y = 2 + Math.sin(t * Math.PI) * 6;
    const glow = 0.75 + 0.25 * Math.sin(game.time * 3 + i * 1.7);
    ctx.fillStyle = i % 3 === 0 ? '#f5b942' : i % 3 === 1 ? '#ff7a5c' : '#7fd4c0';
    ctx.globalAlpha = glow;
    ctx.beginPath();
    ctx.arc(x, y + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Striped awning over the stall.
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c0392b' : CREAM;
    ctx.beginPath();
    ctx.moveTo(i * 80, 42);
    ctx.lineTo((i + 1) * 80, 42);
    ctx.lineTo((i + 1) * 80 + 14, 66);
    ctx.lineTo(i * 80 + 14, 66);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 62, W, 4);
  // Wooden counter band across the kitchen.
  const wood = ctx.createLinearGradient(0, 380, 0, 480);
  wood.addColorStop(0, '#8a5a33');
  wood.addColorStop(1, '#5e3a1e');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 380, W, 100);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 380, W, 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 2;
  for (let x = 120; x < W; x += 170) {
    ctx.beginPath();
    ctx.moveTo(x, 386);
    ctx.lineTo(x, 480);
    ctx.stroke();
  }
}

// ---- top bar ---------------------------------------------------------------

function drawTopBar(ctx, game, input) {
  text(ctx, 'WARUNG RUSH', 16, 25, 23, GOLD, 900);
  text(ctx, 'warung malam · masak cepat, sajikan hangat', 216, 26, 12, '#cbb8a0', 600);
  // Level badge.
  rr(ctx, 560, 10, 110, 24, 12);
  ctx.fillStyle = '#2f8f7b';
  ctx.fill();
  text(ctx, 'RUSH LV ' + game.level, 615, 23, 14, '#eafff6', 800, 'center');
  // Hearts.
  for (let i = 0; i < 3; i++) drawHeart(ctx, 720 + i * 30, 22, 11, i < game.hearts);
  // Score and coins.
  text(ctx, 'SKOR ' + game.score, 820, 24, 18, '#ffffff', 800);
  drawCoin(ctx, 950, 22, 11);
  text(ctx, String(game.coins), 967, 24, 18, GOLD, 800);
  // Combo pill, only while a streak is alive.
  if (game.combo >= 2) {
    rr(ctx, 1040, 10, 108, 24, 12);
    ctx.fillStyle = '#c0392b';
    ctx.fill();
    text(ctx, 'KOMBO x' + game.combo, 1094, 23, 14, '#ffe9b0', 800, 'center');
  }
  // Mute button.
  rr(ctx, 1180, 8, 84, 26, 8);
  ctx.fillStyle = '#3a2a1c';
  ctx.fill();
  text(ctx, game.muted ? 'SUARA: OFF' : 'SUARA: ON', 1222, 22, 12, CREAM, 700, 'center');
  input.hotspots.push({ x: 1180, y: 8, w: 84, h: 26, action: 'mute' });
}

// ---- order board -----------------------------------------------------------

function drawTickets(ctx, game, input) {
  const orders = game.orders;
  const gap = 8;
  const totalW = W - 16;
  const tw = Math.min(296, (totalW - gap * (orders.length - 1)) / Math.max(1, orders.length));
  const y = 46;
  const h = 80;
  orders.forEach((order, i) => {
    const x = 8 + i * (tw + gap);
    const dish = orderDish(order);
    const active = order.id === game.activeOrderId;
    const low = order.timeLeft <= 10;
    const pulse = low ? 0.5 + 0.5 * Math.sin(game.time * 8) : 0;
    rr(ctx, x, y, tw, h, 10);
    ctx.fillStyle = active ? '#fff3d6' : '#f6e3c5';
    ctx.fill();
    ctx.lineWidth = active ? 4 : 2;
    ctx.strokeStyle = active ? GOLD : low ? '#ff5a6e' : '#8a5a33';
    if (low) {
      ctx.globalAlpha = 0.55 + 0.45 * pulse;
      ctx.strokeStyle = '#ff5a6e';
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Customer number and dish name.
    text(ctx, '#' + order.customer, x + 12, y + 16, 12, '#8a5a33', 800);
    text(ctx, dish.name.toUpperCase(), x + 12, y + 38, 17, INK, 900);
    // Needed ingredients as dots; added ones are ticked.
    let ix = x + 12;
    for (const id of order.needs) {
      const ing = ingredientById(id);
      const done = order.added[id] !== undefined;
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(ix + 11, y + 62, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = done ? '#2f8f7b' : ing.dark;
      ctx.stroke();
      if (done) {
        ctx.strokeStyle = '#2f8f7b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ix + 5, y + 62);
        ctx.lineTo(ix + 10, y + 67);
        ctx.lineTo(ix + 18, y + 56);
        ctx.stroke();
      } else {
        text(ctx, ing.short, ix + 11, y + 63, 11, '#3a2a1c', 800, 'center');
      }
      ix += 28;
    }
    // Timer bar.
    const frac = Math.max(0, order.timeLeft / order.timeMax);
    rr(ctx, x + tw - 66, y + 12, 54, 10, 5);
    ctx.fillStyle = '#e0d0b8';
    ctx.fill();
    rr(ctx, x + tw - 66, y + 12, 54 * frac, 10, 5);
    ctx.fillStyle = frac > 0.5 ? TEAL : frac > 0.25 ? '#e08a1e' : '#ff5a6e';
    ctx.fill();
    text(ctx, Math.ceil(order.timeLeft) + 's', x + tw - 39, y + 38, 15, low ? '#ff5a6e' : INK, 800, 'center');
    if (order.ready) {
      rr(ctx, x + tw - 74, y + 50, 62, 22, 6);
      ctx.fillStyle = '#2f8f7b';
      ctx.fill();
      text(ctx, 'SIAP!', x + tw - 43, y + 62, 13, '#ffffff', 800, 'center');
    }
    input.hotspots.push({ x, y, w: tw, h, action: 'ticket', arg: order.id });
  });
  if (orders.length === 0) {
    text(ctx, 'Belum ada pesanan — pelanggan segera datang…', 640, 86, 16, '#cbb8a0', 600, 'center');
  }
}

// ---- ingredient counter ------------------------------------------------------

function drawCounter(ctx, game, input) {
  text(ctx, 'BAHAN  ·  klik atau tekan 1-7', 16, 146, 14, CREAM, 800);
  const bw = 94;
  const bh = 92;
  const gap = 8;
  INGREDIENTS.forEach((ing, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 8 + col * (bw + gap);
    const y = 158 + row * (bh + gap);
    const activeOrder = game.orders.find((o) => o.id === game.activeOrderId);
    const needed = activeOrder && activeOrder.needs.includes(ing.id) && !(ing.id in activeOrder.added);
    const glow = needed && game.screen === 'playing';
    rr(ctx, x, y, bw, bh, 12);
    ctx.fillStyle = glow ? '#ffe9b0' : '#f6e3c5';
    ctx.fill();
    ctx.lineWidth = glow ? 4 : 2;
    ctx.strokeStyle = glow ? GOLD : '#8a5a33';
    ctx.stroke();
    // Bin contents: a little pile of the ingredient.
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(x + bw / 2, y + 34, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = ing.dark;
    ctx.stroke();
    drawIngredientIcon(ctx, ing.id, x + bw / 2, y + 34, 24);
    text(ctx, ing.name, x + bw / 2, y + 70, 14, INK, 800, 'center');
    text(ctx, '[' + ing.key + ']', x + bw / 2, y + 86, 11, '#8a5a33', 700, 'center');
    input.hotspots.push({ x, y, w: bw, h: bh, action: 'ingredient', arg: i });
  });
  // Trash bin: empties the wok for the active ticket.
  const tx = 8;
  const ty = 362;
  rr(ctx, tx, ty, 120, 66, 10);
  ctx.fillStyle = '#4a3a30';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8a5a33';
  ctx.stroke();
  text(ctx, '🗑 BUANG [T]', tx + 60, ty + 33, 14, CREAM, 800, 'center');
  input.hotspots.push({ x: tx, y: ty, w: 120, h: 66, action: 'trash' });
  text(ctx, 'Salah bahan? Buang isi wajan,', 140, 388, 12, '#cbb8a0', 600);
  text(ctx, 'lalu mulai lagi dari awal.', 140, 406, 12, '#cbb8a0', 600);
}

// ---- wok station -------------------------------------------------------------

function drawWok(ctx, game) {
  const cx = 640;
  const cy = 300;
  // Stove body and flame.
  rr(ctx, cx - 190, 348, 380, 56, 12);
  ctx.fillStyle = '#3a3a44';
  ctx.fill();
  ctx.fillStyle = '#23232b';
  ctx.fillRect(cx - 190, 348, 380, 8);
  // Wok: dark bowl with a steel rim and two handles.
  ctx.fillStyle = '#2b2b33';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 185, 66, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c8c8d0';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#1d1d24';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 4, 168, 54, 0, 0, Math.PI * 2);
  ctx.fill();
  // Fire under the wok: a glow peeking out beneath the bowl and tongues
  // licking up at the sides, where the bowl curves away. The flicker
  // follows the game clock so the flame feels alive.
  const flame = 0.8 + 0.2 * Math.sin(game.time * 11);
  ctx.fillStyle = 'rgba(255,140,30,0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 62, 150, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const fx = cx + side * (138 + k * 26);
      const tip = cy + 44 - (k === 0 ? 26 : 14) * flame;
      ctx.fillStyle = 'rgba(255,150,40,0.92)';
      ctx.beginPath();
      ctx.moveTo(fx - 13, cy + 62);
      ctx.quadraticCurveTo(fx, tip, fx + 13, cy + 62);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,210,90,0.95)';
      ctx.beginPath();
      ctx.moveTo(fx - 6, cy + 62);
      ctx.quadraticCurveTo(fx, tip + 12, fx + 6, cy + 62);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Steam.
  for (const p of game.steam.particles) {
    ctx.globalAlpha = Math.max(0, 0.45 * (1 - p.life / p.maxLife));
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // Food in the wok, with a cook ring around each piece.
  const active = game.orders.find((o) => o.id === game.activeOrderId);
  if (active) {
    const ids = Object.keys(active.added);
    ids.forEach((id, i) => {
      const ing = ingredientById(id);
      const px = cx - (ids.length - 1) * 42 + i * 84;
      const py = cy - 6 + (i % 2) * 14 - 8;
      const prog = active.added[id];
      ctx.fillStyle = ing.color;
      ctx.beginPath();
      ctx.arc(px, py, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ing.dark;
      ctx.stroke();
      drawIngredientIcon(ctx, id, px, py, 20);
      if (prog < 1) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(px, py, 30, -Math.PI / 2, -Math.PI / 2 + prog * Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#7fd4c0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(px, py, 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    if (active.wrong.length > 0) {
      text(ctx, 'Bahan salah! Buang dulu [T]', cx, cy + 92, 14, '#ff8a7a', 800, 'center');
    }
  }
  text(ctx, 'WAJAN  ·  api besar, masak cepat', cx, 428, 13, '#cbb8a0', 700, 'center');
}

// ---- plate and serve -----------------------------------------------------------

function drawPlate(ctx, game, input) {
  const px = 985;
  const py = 285;
  text(ctx, 'PIRING SAJI', px, 150, 14, CREAM, 800, 'center');
  const active = game.orders.find((o) => o.id === game.activeOrderId);
  if (active) {
    const dish = orderDish(active);
    const left = orderNeedsLeft(active);
    text(ctx, dish.name, px, 172, 17, '#ffffff', 800, 'center');
    text(ctx, left.length === 0 ? 'Matang! Tinggal sajikan.' : 'Butuh: ' + left.map((id) => ingredientById(id).name).join(', '), px, 194, 12, '#cbb8a0', 600, 'center');
  }
  // The plate itself.
  ctx.fillStyle = '#fdf8ee';
  ctx.beginPath();
  ctx.arc(px, py, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c8a8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f0e6d2';
  ctx.beginPath();
  ctx.arc(px, py, 56, 0, Math.PI * 2);
  ctx.fill();
  if (game.plate) {
    const dish = DISHES.find((d) => d.id === game.plate.dishId);
    // A mound of the finished dish, sauce drizzle, garnish.
    ctx.fillStyle = dish.plate;
    ctx.beginPath();
    ctx.ellipse(px, py + 4, 48, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = dish.sauce;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(px - 34, py - 6);
    ctx.quadraticCurveTo(px, py - 26, px + 34, py - 4);
    ctx.stroke();
    ctx.fillStyle = '#3f7d3a';
    ctx.beginPath();
    ctx.arc(px - 18, py - 16, 5, 0, Math.PI * 2);
    ctx.arc(px + 14, py - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9382b';
    ctx.beginPath();
    ctx.arc(px + 26, py + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, dish.name, px, py + 52, 13, INK, 800, 'center');
  } else {
    text(ctx, '— kosong —', px, py, 13, '#a08a70', 600, 'center');
  }
  // Serve button.
  const bx = 1096;
  const by = 232;
  const bw = 172;
  const bh = 108;
  const ready = !!game.plate;
  const glow = ready ? 0.7 + 0.3 * Math.sin(game.time * 6) : 0;
  if (ready) {
    ctx.save();
    ctx.shadowColor = GOLD;
    ctx.shadowBlur = 24 * glow;
    rr(ctx, bx, by, bw, bh, 14);
    ctx.fillStyle = '#e08a1e';
    ctx.fill();
    ctx.restore();
  } else {
    rr(ctx, bx, by, bw, bh, 14);
    ctx.fillStyle = '#5e4a38';
    ctx.fill();
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = ready ? GOLD : '#8a7a68';
  ctx.stroke();
  text(ctx, 'SAJIKAN', bx + bw / 2, by + 42, 24, ready ? '#ffffff' : '#cbb8a0', 900, 'center');
  text(ctx, '[SPASI]', bx + bw / 2, by + 76, 13, ready ? '#ffe9b0' : '#a08a70', 700, 'center');
  input.hotspots.push({ x: bx, y: by, w: bw, h: bh, action: 'serve' });
  text(ctx, 'Sajikan selagi panas —', 1180, 366, 12, '#cbb8a0', 600, 'center');
  text(ctx, 'makin cepat, makin banyak Rp.', 1180, 384, 12, '#cbb8a0', 600, 'center');
}

// ---- banners, overlays ---------------------------------------------------------

function drawBanner(ctx, game) {
  if (game.orders.length >= 4 && game.screen === 'playing') {
    const a = 0.65 + 0.35 * Math.sin(game.time * 5);
    ctx.globalAlpha = a;
    text(ctx, '★ SERVICE RUSH! ★', 640, 138, 20, '#ff8a7a', 900, 'center');
    ctx.globalAlpha = 1;
  }
}

function drawFooter(ctx, game) {
  text(ctx, 'Tersaji: ' + game.served, 16, 462, 13, GOLD, 700);
  text(ctx, '1-7  bahan   ·   SPASI  sajikan   ·   T  buang isi wajan   ·   TAB  ganti pesanan   ·   P  jeda   ·   M  suara', 640, 462, 13, '#cbb8a0', 600, 'center');
}

function drawFloatingScores(ctx, game) {
  for (const f of game.floaters) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.2);
    text(ctx, f.text, f.x, f.y - f.t * 40, 20, f.color, 900, 'center');
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, game, input) {
  ctx.fillStyle = 'rgba(16,12,28,0.82)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'WARUNG RUSH', 640, 130, 64, GOLD, 900, 'center');
  text(ctx, 'Warung malam paling sibuk di kota', 640, 178, 20, CREAM, 600, 'center');
  text(ctx, 'Pesanan datang terus. Baca tiketnya, lempar bahan ke wajan,', 640, 226, 17, '#e8dcc0', 600, 'center');
  text(ctx, 'masak sampai matang, lalu sajikan sebelum pelanggan kabur.', 640, 250, 17, '#e8dcc0', 600, 'center');
  text(ctx, 'Tiga pelanggan kabur dan warungmu tutup!', 640, 274, 17, '#ff8a7a', 700, 'center');
  rr(ctx, 490, 310, 300, 56, 14);
  ctx.fillStyle = '#e08a1e';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = GOLD;
  ctx.stroke();
  text(ctx, 'MULAI MASAK  [SPASI]', 640, 339, 20, '#ffffff', 900, 'center');
  input.hotspots.push({ x: 490, y: 310, w: 300, h: 56, action: 'start' });
  text(ctx, 'Mouse atau keyboard — semua bisa. M untuk suara.', 640, 398, 14, '#cbb8a0', 600, 'center');
  if (game.bestScore > 0) text(ctx, 'Skor terbaik: ' + game.bestScore, 640, 424, 14, GOLD, 700, 'center');
}

function drawGameOver(ctx, game, input) {
  ctx.fillStyle = 'rgba(16,12,28,0.86)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'WARUNG TUTUP', 640, 150, 52, '#ff8a7a', 900, 'center');
  text(ctx, 'Tiga pelanggan kabur. Tapi malam ini tetap seru!', 640, 200, 18, CREAM, 600, 'center');
  text(ctx, 'Skor: ' + game.score + '   ·   Pesanan tersaji: ' + game.served + '   ·   Koin: Rp' + game.coins, 640, 244, 20, '#ffffff', 800, 'center');
  if (game.score >= game.bestScore && game.score > 0) {
    text(ctx, '★ Skor terbaik baru! ★', 640, 276, 18, GOLD, 800, 'center');
  }
  rr(ctx, 490, 310, 300, 56, 14);
  ctx.fillStyle = '#2f8f7b';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#7fd4c0';
  ctx.stroke();
  text(ctx, 'MASAK LAGI  [R]', 640, 339, 20, '#ffffff', 900, 'center');
  input.hotspots.push({ x: 490, y: 310, w: 300, h: 56, action: 'restart' });
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(16,12,28,0.7)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'JEDA  —  tekan P untuk lanjut', 640, 240, 30, CREAM, 800, 'center');
}

// ---- main render -----------------------------------------------------------------

export function render(ctx, game, input) {
  input.hotspots.length = 0;
  drawBackground(ctx, game);
  if (game.screen !== 'title') {
    drawTopBar(ctx, game, input);
    drawTickets(ctx, game, input);
    drawCounter(ctx, game, input);
    drawWok(ctx, game);
    drawPlate(ctx, game, input);
    drawBanner(ctx, game);
    drawFooter(ctx, game);
  }
  // Flying coins.
  for (const c of game.coinBurst.coins) {
    const pos = coinPos(c);
    drawCoin(ctx, pos.x, pos.y, c.r);
  }
  drawFloatingScores(ctx, game);
  if (game.screen === 'title') drawTitle(ctx, game, input);
  if (game.screen === 'gameover') drawGameOver(ctx, game, input);
  if (game.paused && game.screen === 'playing') drawPaused(ctx);
}
