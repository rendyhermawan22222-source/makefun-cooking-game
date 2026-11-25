// Warung Rush — entry program for make.fun's "Make the best cooking game"
// bounty (best-cooking-game-20261125-0137).
//
// The game itself is plain static files under game/ (game/index.html plus
// its ES modules, no library, no network request at all), and the
// screenshots in screenshots/ are real renders of that code. This program
// hands both in: it copies game/ and screenshots/ from beside this file
// into the output directory and writes /output/dossier.json with the
// vendored make.fun library, which is the summary the judge reads.
//
// Node 22, standard library only. Outside the grader, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// The program is deterministic: two runs into two fresh directories write
// byte-identical files (no timestamps, no randomness anywhere in it).

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'game'), join(outDir, 'game'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// Caps the sealed scorer enforces: the dossier text budget, at most four
// screenshots of at most 256 KiB each, and the game/ limits (993 files,
// 48 MiB, paths under 1000 bytes). buildDossier refuses anything over them
// instead of handing in an entry the gate would refuse.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
