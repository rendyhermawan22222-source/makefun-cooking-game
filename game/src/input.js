// Mouse and keyboard for Warung Rush. The renderer rebuilds a list of
// clickable hotspots every frame; input just maps a pointer position or a
// key to the action that hotspot names.

export function makeInput() {
  return {
    hotspots: [],
    mouseX: -1,
    mouseY: -1,
    mouseDown: false,
  };
}

export function toGameCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * 1280,
    y: ((clientY - rect.top) / rect.height) * 480,
  };
}

export function hotspotAt(input, x, y) {
  for (let i = input.hotspots.length - 1; i >= 0; i--) {
    const h = input.hotspots[i];
    if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h;
  }
  return null;
}

// Key map: 1-7 toss an ingredient, Space serves, T empties the wok,
// Tab / arrows move between tickets, P pauses, M mutes, R restarts.
export function keyAction(code, key) {
  if (key >= '1' && key <= '7') return { action: 'ingredient', arg: Number(key) - 1 };
  if (code === 'Space' || code === 'Enter') return { action: 'serve' };
  if (key === 't' || key === 'T') return { action: 'trash' };
  if (key === 'Tab' || code === 'ArrowRight') return { action: 'nextTicket' };
  if (code === 'ArrowLeft') return { action: 'prevTicket' };
  if (key === 'p' || key === 'P') return { action: 'pause' };
  if (key === 'm' || key === 'M') return { action: 'mute' };
  if (key === 'r' || key === 'R') return { action: 'restart' };
  return null;
}
