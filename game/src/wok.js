// The wok station: what is cooking, the steam it throws off, and the
// little coins that fly to the till when a plate is served.

import { makeRng } from './rng.js';

export function makeSteam(rng) {
  return {
    particles: [],
    rng,
    spawnAcc: 0,
  };
}

// Steam rises while food cooks; the hotter the wok, the more of it.
export function updateSteam(steam, dt, cookingCount, wokX, wokY) {
  steam.spawnAcc += dt * cookingCount * 14;
  while (steam.spawnAcc >= 1) {
    steam.spawnAcc -= 1;
    steam.particles.push({
      x: wokX + (steam.rng() - 0.5) * 170,
      y: wokY - 8,
      r: 5 + steam.rng() * 9,
      vy: 34 + steam.rng() * 30,
      vx: (steam.rng() - 0.5) * 14,
      life: 0,
      maxLife: 1.1 + steam.rng() * 0.7,
    });
  }
  for (const p of steam.particles) {
    p.life += dt;
    p.x += p.vx * dt + Math.sin(p.life * 6) * 8 * dt;
    p.y -= p.vy * dt;
    p.r += 7 * dt;
  }
  steam.particles = steam.particles.filter((p) => p.life < p.maxLife);
}

export function makeCoinBurst() {
  return { coins: [], rng: makeRng(987654321) };
}

export function burstCoins(burst, fromX, fromY, toX, toY, count) {
  for (let i = 0; i < count; i++) {
    burst.coins.push({
      x: fromX,
      y: fromY,
      tx: toX + (burst.rng() - 0.5) * 30,
      ty: toY + (burst.rng() - 0.5) * 12,
      t: 0,
      dur: 0.55 + burst.rng() * 0.25,
      delay: i * 0.05,
      r: 7 + burst.rng() * 3,
    });
  }
}

export function updateCoinBurst(burst, dt) {
  for (const c of burst.coins) {
    c.t += dt;
  }
  burst.coins = burst.coins.filter((c) => c.t < c.delay + c.dur);
}

export function coinPos(c) {
  const p = Math.max(0, Math.min(1, (c.t - c.delay) / c.dur));
  const eased = 1 - (1 - p) * (1 - p);
  return {
    x: c.x + (c.tx - c.x) * eased,
    y: c.y + (c.ty - c.y) * eased - Math.sin(p * Math.PI) * 46,
    p,
  };
}
