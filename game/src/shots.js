// Deterministic staged states for screenshots. A `?shot=` query picks one
// of the four moments the bounty asks the screenshots to show, built from a
// fixed seed so the same URL always renders the same frame:
//   board   — kitchen at full rush, order board full
//   counter — ingredients on the counter, bins glowing
//   wok     — a dish mid-assembly in the wok, steam rising
//   serve   — a timer nearly out and a finished plate ready to serve
// `?seed=` changes the seed. Outside a shot, the game starts on its title
// screen like any normal load.

import { makeRng } from './rng.js';
import { makeOrder, orderDish } from './orders.js';
import { dishById } from './recipes.js';

const SHOT_SEED = 20261125;

function stageOrder(rng, level, dishId, timeLeft, addedIds, wrong) {
  const order = makeOrder(rng, level);
  if (dishId) {
    const dish = dishById(dishId);
    order.dishId = dishId;
    order.needs = dish.needs.slice();
  }
  order.timeLeft = timeLeft;
  order.added = {};
  for (const id of addedIds) order.added[id] = 1;
  if (wrong) order.wrong = wrong.slice();
  const dish = orderDish(order);
  order.ready = order.needs.every((id) => order.added[id] === 1);
  return order;
}

export function applyShot(game, query) {
  const shot = query.get('shot');
  if (!shot) return false;
  const seed = Number(query.get('seed') || SHOT_SEED);
  const rng = makeRng(seed);
  game.screen = 'playing';
  game.paused = false;
  game.level = 3;
  game.score = 1250;
  game.coins = 340;
  game.served = 9;
  game.combo = 3;
  game.hearts = 3;
  game.spawnTimer = 99;
  game.plate = null;

  if (shot === 'board') {
    game.orders = [
      stageOrder(rng, 3, 'nasi-goreng', 34, ['nasi']),
      stageOrder(rng, 3, 'mie-goreng', 27, []),
      stageOrder(rng, 3, 'sate-ayam', 41, ['ayam', 'bawang']),
      stageOrder(rng, 3, 'ayam-geprek', 19, ['ayam']),
    ];
    game.activeOrderId = game.orders[0].id;
  } else if (shot === 'counter') {
    game.level = 1;
    game.score = 180;
    game.coins = 40;
    game.served = 1;
    game.combo = 0;
    game.orders = [
      stageOrder(rng, 1, 'nasi-goreng', 44, []),
      stageOrder(rng, 1, 'telur-dadar', 38, []),
    ];
    game.activeOrderId = game.orders[0].id;
  } else if (shot === 'wok') {
    game.orders = [
      stageOrder(rng, 3, 'mie-goreng', 31, ['mie', 'telur', 'cabai']),
      stageOrder(rng, 3, 'nasi-ayam', 39, []),
    ];
    game.activeOrderId = game.orders[0].id;
    // Half-cooked, mid-assembly: steam and cook rings visible.
    game.orders[0].added = { mie: 1, telur: 0.55, cabai: 0.3 };
    game.orders[0].ready = false;
  } else if (shot === 'serve') {
    game.orders = [
      stageOrder(rng, 3, 'nasi-goreng', 8, ['nasi', 'telur', 'bawang', 'kecap']),
      stageOrder(rng, 3, 'sate-ayam', 36, []),
      stageOrder(rng, 3, 'mie-goreng', 22, ['mie']),
    ];
    game.activeOrderId = game.orders[0].id;
    game.plate = { dishId: 'nasi-goreng' };
    game.orders[0].plated = true;
  } else {
    return false;
  }
  return true;
}
