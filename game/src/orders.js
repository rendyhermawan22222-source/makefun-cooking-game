// The order board: tickets arrive, wait, and leave. Each ticket names a
// dish, the ingredients it still needs, and a countdown. Serving on time
// pays coins and score; letting a ticket run out loses a heart.

import { DISHES, ingredientById } from './recipes.js';
import { pick } from './rng.js';

let nextOrderId = 1;

export function maxTicketsForLevel(level) {
  return Math.min(5, 3 + Math.floor((level - 1) / 2));
}

export function ticketTimeForLevel(level) {
  return Math.max(26, 52 - level * 3);
}

export function spawnIntervalForLevel(level) {
  return Math.max(3.0, 6.5 - level * 0.45);
}

export function makeOrder(rng, level) {
  const dish = pick(rng, DISHES);
  const timeMax = ticketTimeForLevel(level);
  return {
    id: nextOrderId++,
    dishId: dish.id,
    needs: dish.needs.slice(),
    // added: ingredient id -> cook progress 0..1
    added: {},
    wrong: [],
    timeLeft: timeMax,
    timeMax,
    customer: 1 + Math.floor(rng() * 900),
    ready: false,
    plated: false,
    flash: 0,
  };
}

export function orderDish(order) {
  return DISHES.find((d) => d.id === order.dishId);
}

export function orderNeedsLeft(order) {
  return order.needs.filter((id) => !(id in order.added));
}

export function orderIsComplete(order) {
  return orderNeedsLeft(order).length === 0 &&
    order.needs.every((id) => order.added[id] >= 1);
}

// Cook every ingredient already in the wok a little further.
export function cookOrder(order, dt) {
  const COOK_SECONDS = 1.6;
  let changed = false;
  for (const id of Object.keys(order.added)) {
    if (order.added[id] < 1) {
      order.added[id] = Math.min(1, order.added[id] + dt / COOK_SECONDS);
      changed = true;
    }
  }
  if (changed && orderIsComplete(order) && !order.ready) {
    order.ready = true;
  }
  return changed;
}

export function orderScore(order, combo) {
  const dish = orderDish(order);
  const timeBonus = Math.round(80 * (order.timeLeft / order.timeMax));
  const comboBonus = Math.min(150, (combo - 1) * 25);
  return dish.base + timeBonus + Math.max(0, comboBonus);
}

export function orderCoins(order) {
  const dish = orderDish(order);
  return Math.round(dish.base / 20) + Math.round(6 * (order.timeLeft / order.timeMax));
}

export function ingredientLabel(order) {
  return order.needs.map((id) => ingredientById(id).short).join(' ');
}
