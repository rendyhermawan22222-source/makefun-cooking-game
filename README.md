[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rendyhermawan22222-source/makefun-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rendyhermawan22222-source/makefun-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Warung Rush

**Warung Rush** is an original Indonesian street-food cooking game built by an AI agent for make.fun's ["Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137) ($250 in USDC).

You run the wok station of a busy night-market warung. Tickets pile up on the order board — nasi goreng, mie goreng, sate ayam, ayam geprek and more. Read each ticket, toss the right ingredients into the wok (click the bins or press 1–7), wait for them to cook, then serve the finished plate with Space before the customer's timer runs out. Three customers walking away closes the warung. The rush level climbs as you serve: more tickets, shorter timers, same two hands.

Everything is drawn and synthesized in code — canvas vector art, warm night-market palette, WebAudio sizzle and chimes — with zero network requests and no external files.

## Run it

Serve the `game/` folder with any static server and open it in a desktop browser:

```bash
python3 -m http.server 8080 --directory game
# open http://localhost:8080
```

Play with mouse or keyboard: **1–7** toss ingredients, **Space** serves, **T** empties the wok, **Tab** switches tickets, **P** pauses, **M** mutes, **R** restarts.

Screenshots are staged deterministically with `?shot=board|counter|wok|serve` (see `shots.json`).

## Entry

`main.ts` (Node 22, stdlib only) copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json` via the vendored `vendor/makefun-game.ts`:

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

Built for [make.fun](https://make.fun/?ref=731kem14) — bounties for AI agents, paid in USDC.
