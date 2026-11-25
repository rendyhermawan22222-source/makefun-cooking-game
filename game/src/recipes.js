// The menu of Warung Rush: every ingredient and every dish on the board.
// A dish is a set of ingredients the cook must toss into the wok; the order
// of tossing is free, so each ticket is a small route-planning puzzle across
// the counter bins.

export const INGREDIENTS = [
  { id: 'nasi',   name: 'Nasi',   short: 'N', color: '#f2ead8', dark: '#cbb98f', key: '1' },
  { id: 'mie',    name: 'Mie',    short: 'M', color: '#f0c95c', dark: '#b98f2e', key: '2' },
  { id: 'telur',  name: 'Telur',  short: 'T', color: '#fdf6d8', dark: '#e0a83c', key: '3' },
  { id: 'ayam',   name: 'Ayam',   short: 'A', color: '#e08a5a', dark: '#a34d24', key: '4' },
  { id: 'cabai',  name: 'Cabai',  short: 'C', color: '#d9382b', dark: '#8f1d15', key: '5' },
  { id: 'bawang', name: 'Bawang', short: 'B', color: '#d9a7e8', dark: '#8a5aa8', key: '6' },
  { id: 'kecap',  name: 'Kecap',  short: 'K', color: '#5a3a22', dark: '#2e1c10', key: '7' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((ing) => ing.id === id);
}

export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    needs: ['nasi', 'telur', 'bawang', 'kecap'],
    base: 120,
    plate: '#f2ead8',
    sauce: '#7a4a21',
  },
  {
    id: 'mie-goreng',
    name: 'Mie Goreng',
    needs: ['mie', 'telur', 'cabai', 'kecap'],
    base: 130,
    plate: '#f0c95c',
    sauce: '#8a3d16',
  },
  {
    id: 'sate-ayam',
    name: 'Sate Ayam',
    needs: ['ayam', 'bawang', 'kecap'],
    base: 150,
    plate: '#e08a5a',
    sauce: '#5a3a22',
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek',
    needs: ['ayam', 'cabai', 'bawang'],
    base: 140,
    plate: '#e08a5a',
    sauce: '#d9382b',
  },
  {
    id: 'telur-dadar',
    name: 'Telur Dadar',
    needs: ['telur', 'bawang', 'cabai'],
    base: 100,
    plate: '#f7d54d',
    sauce: '#d9382b',
  },
  {
    id: 'nasi-ayam',
    name: 'Nasi Ayam',
    needs: ['nasi', 'ayam', 'kecap'],
    base: 130,
    plate: '#f2ead8',
    sauce: '#e08a5a',
  },
];

export function dishById(id) {
  return DISHES.find((dish) => dish.id === id);
}
