import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEYS = {
  coins: 'nonograms_code_picture_coins_v2',
  progress: 'nonograms_code_picture_progress_v2',
  theme: 'nonograms_code_picture_theme_v2',
  lang: 'nonograms_code_picture_lang_v2',
};

const WIN_TARGET = 5;
const START_COINS = 180;
const BUY_LIFE_PRICE = 50;
const HINT_PRICE = 20;

const DIFFICULTIES = [
  { id: 'warmup', size: 5, reward: 12, lives: 3, starterCrosses: true, ru: 'Разминка', en: 'Warm-up', metaRu: '5×5 · часть пустых клеток уже отмечена', metaEn: '5×5 · some empty cells are marked' },
  { id: 'easy', size: 5, reward: 18, lives: 3, starterCrosses: false, ru: 'Лёгкий', en: 'Easy', metaRu: '5×5 · короткие рисунки', metaEn: '5×5 · small pictures' },
  { id: 'medium', size: 10, reward: 35, lives: 3, starterCrosses: false, ru: 'Средний', en: 'Medium', metaRu: '10×10 · полноценная логика', metaEn: '10×10 · full logic' },
  { id: 'hard', size: 15, reward: 55, lives: 3, starterCrosses: false, ru: 'Сложный', en: 'Hard', metaRu: '15×15 · крупный силуэт', metaEn: '15×15 · larger silhouette' },
  { id: 'epic', size: 20, reward: 85, lives: 3, starterCrosses: false, ru: 'Эпический', en: 'Epic', metaRu: '20×20 · большая картинка', metaEn: '20×20 · big picture' },
  { id: 'abyss', size: 30, reward: 130, lives: 3, starterCrosses: false, ru: 'Бездна', en: 'Abyss', metaRu: '30×30 · максимальный формат', metaEn: '30×30 · maximum format' },
];

const PUZZLES = {
  warmup: [
    { id: 'heart5', nameRu: 'Сердце', nameEn: 'Heart', rows: ['01010', '11111', '11111', '01110', '00100'] },
    { id: 'house5', nameRu: 'Домик', nameEn: 'House', rows: ['00100', '01110', '11111', '10101', '11111'] },
    { id: 'smile5', nameRu: 'Улыбка', nameEn: 'Smile', rows: ['00000', '10101', '00000', '10001', '01110'] },
    { id: 'tree5', nameRu: 'Ёлка', nameEn: 'Tree', rows: ['00100', '01110', '11111', '00100', '01110'] },
    { id: 'star5', nameRu: 'Звезда', nameEn: 'Star', rows: ['00100', '10101', '01110', '10101', '00100'] },
    { id: 'cup5', nameRu: 'Кубок', nameEn: 'Cup', rows: ['11111', '10101', '01110', '00100', '01110'] },
  ],
  easy: [
    { id: 'heart5', nameRu: 'Сердце', nameEn: 'Heart', rows: ['01010', '11111', '11111', '01110', '00100'] },
    { id: 'house5', nameRu: 'Домик', nameEn: 'House', rows: ['00100', '01110', '11111', '10101', '11111'] },
    { id: 'smile5', nameRu: 'Улыбка', nameEn: 'Smile', rows: ['00000', '10101', '00000', '10001', '01110'] },
    { id: 'tree5', nameRu: 'Ёлка', nameEn: 'Tree', rows: ['00100', '01110', '11111', '00100', '01110'] },
    { id: 'rocket5', nameRu: 'Ракета', nameEn: 'Rocket', rows: ['00100', '01110', '00100', '01110', '10101'] },
    { id: 'fish5', nameRu: 'Рыбка', nameEn: 'Fish', rows: ['00110', '11101', '11110', '11101', '00110'] },
  ],
  medium: [
    { id: 'flower10', nameRu: 'Цветок', nameEn: 'Flower', draw: 'flower' },
    { id: 'cat10', nameRu: 'Кот', nameEn: 'Cat', draw: 'cat' },
    { id: 'rocket10', nameRu: 'Ракета', nameEn: 'Rocket', draw: 'rocket' },
    { id: 'fish10', nameRu: 'Рыба', nameEn: 'Fish', draw: 'fish' },
    { id: 'key10', nameRu: 'Ключ', nameEn: 'Key', draw: 'key' },
    { id: 'diamond10', nameRu: 'Алмаз', nameEn: 'Diamond', draw: 'diamond' },
    { id: 'tree10', nameRu: 'Дерево', nameEn: 'Tree', draw: 'tree' },
    { id: 'ghost10', nameRu: 'Призрак', nameEn: 'Ghost', draw: 'ghost' },
  ],
  hard: [
    { id: 'crown15', nameRu: 'Корона', nameEn: 'Crown', draw: 'crown' },
    { id: 'castle15', nameRu: 'Замок', nameEn: 'Castle', draw: 'castle' },
    { id: 'owl15', nameRu: 'Сова', nameEn: 'Owl', draw: 'owl' },
    { id: 'turtle15', nameRu: 'Черепаха', nameEn: 'Turtle', draw: 'turtle' },
    { id: 'ship15', nameRu: 'Корабль', nameEn: 'Ship', draw: 'ship' },
    { id: 'robot15', nameRu: 'Робот', nameEn: 'Robot', draw: 'robot' },
    { id: 'anchor15', nameRu: 'Якорь', nameEn: 'Anchor', draw: 'anchor' },
    { id: 'butterfly15', nameRu: 'Бабочка', nameEn: 'Butterfly', draw: 'butterfly' },
  ],
  epic: [
    { id: 'dragon20', nameRu: 'Дракон', nameEn: 'Dragon', draw: 'dragon' },
    { id: 'skull20', nameRu: 'Череп', nameEn: 'Skull', draw: 'skull' },
    { id: 'castle20', nameRu: 'Большой замок', nameEn: 'Big Castle', draw: 'castle' },
    { id: 'owl20', nameRu: 'Сова', nameEn: 'Owl', draw: 'owl' },
    { id: 'cactus20', nameRu: 'Кактус', nameEn: 'Cactus', draw: 'cactus' },
    { id: 'spaceship20', nameRu: 'Космолёт', nameEn: 'Spaceship', draw: 'spaceship' },
    { id: 'butterfly20', nameRu: 'Бабочка', nameEn: 'Butterfly', draw: 'butterfly' },
    { id: 'trophy20', nameRu: 'Кубок', nameEn: 'Trophy', draw: 'trophy' },
  ],
  abyss: [
    { id: 'dragon30', nameRu: 'Большой дракон', nameEn: 'Big Dragon', draw: 'dragon' },
    { id: 'castle30', nameRu: 'Крепость', nameEn: 'Fortress', draw: 'castle' },
    { id: 'spaceship30', nameRu: 'Звездолёт', nameEn: 'Starship', draw: 'spaceship' },
    { id: 'owl30', nameRu: 'Мудрая сова', nameEn: 'Wise Owl', draw: 'owl' },
    { id: 'skull30', nameRu: 'Пиратский череп', nameEn: 'Pirate Skull', draw: 'skull' },
    { id: 'ship30', nameRu: 'Парусник', nameEn: 'Sailboat', draw: 'ship' },
    { id: 'robot30', nameRu: 'Большой робот', nameEn: 'Big Robot', draw: 'robot' },
    { id: 'phoenix30', nameRu: 'Феникс', nameEn: 'Phoenix', draw: 'phoenix' },
  ],
};

const I18N = {
  ru: {
    title: 'Нонограммы Код Рисунка',
    subtitle: 'Раскрашивай клетки по числам слева и сверху. Без системного скролла, с быстрым управлением на телефоне.',
    theme: 'Тема',
    dark: 'Тёмная',
    light: 'Светлая',
    rules: 'Правила',
    difficulty: 'Сложность',
    progress: 'Прогресс',
    actions: 'Действия',
    coins: 'Монеты',
    time: 'Время',
    lives: 'Жизни',
    mistakes: 'Ошибки',
    freeMode: 'Свободный режим',
    freeModeMetaLocked: 'Откроется после 5 побед на уровне',
    freeModeMetaOpen: 'Без жизней: ошибки видны при проверке',
    locked: 'Закрыт',
    enabled: 'Вкл',
    newGame: 'Новая игра',
    pause: 'Пауза',
    resume: 'Продолжить',
    gallery: 'Галерея',
    hint: 'Подсказка',
    check: 'Проверить',
    surrender: 'Сдаться',
    paint: 'Закрасить',
    cross: 'Крестик',
    boardSub: 'Числа показывают подряд идущие группы закрашенных клеток.',
    cellsLeft: (n) => `Осталось закрасить: ${n}`,
    hintStateFree: 'Подсказка: бесплатно',
    hintStatePaid: 'Подсказка: 20 монет',
    wins: 'Побед',
    opensAfter: 'Откроется после 5 побед на предыдущем уровне',
    progressShort: (wins) => `${Math.min(wins, WIN_TARGET)}/${WIN_TARGET}`,
    rule1: 'Каждое число — длина группы закрашенных клеток в строке или столбце.',
    rule2: 'Между двумя группами всегда есть минимум одна пустая клетка.',
    rule3: 'Нажатие по клетке ставит выбранный инструмент. Повторное нажатие стирает эту же отметку.',
    rule4: 'Можно зажать палец или мышь и вести по полю: клетки будут ставиться сразу пачкой.',
    rule5: 'В разминке часть пустых клеток заранее отмечена крестиками. Это учебный режим.',
    close: 'Закрыть',
    pauseTitle: 'Пауза',
    pauseText: 'Игра остановлена. Менять сложность и начинать новую игру во время паузы нельзя.',
    gameOverTitle: 'Жизни закончились',
    gameOverText: 'Можно продолжить за монеты или начать заново.',
    price: 'Цена',
    buyLife: 'Продолжить за 50 монет',
    restart: 'Рестарт',
    winTitle: 'Рисунок открыт',
    winText: (name, reward) => `Это «${name}». Победа засчитана, награда: ${reward} монет.`,
    nextLevel: 'Следующий уровень',
    playAgain: 'Играть снова',
    surrenderTitle: 'Решение раскрыто',
    surrenderText: (name) => `Это «${name}». Можно рассмотреть картинку и начать новую партию.`,
    notEnoughCoins: 'Не хватает монет.',
    noHints: 'Все нужные клетки уже открыты.',
    wrongCell: 'Эта клетка должна быть пустой.',
    solved: 'Готово. Рисунок совпадает с подсказками.',
    notSolved: (n) => `Пока не сходится. Нужно исправить: ${n}.`,
    freeLockedMessage: (title) => `Свободный режим для «${title}» откроется после 5 побед.`,
    galleryTitle: 'Готовые картинки',
    galleryText: 'Здесь можно посмотреть силуэты и названия рисунков. В игре они не раскрывают текущую партию автоматически.',
  },
  en: {
    title: 'Nonograms Code Picture',
    subtitle: 'Fill cells using row and column clues. Fast mobile controls, no system scroll.',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    rules: 'Rules',
    difficulty: 'Difficulty',
    progress: 'Progress',
    actions: 'Actions',
    coins: 'Coins',
    time: 'Time',
    lives: 'Lives',
    mistakes: 'Errors',
    freeMode: 'Free mode',
    freeModeMetaLocked: 'Unlocks after 5 wins on this level',
    freeModeMetaOpen: 'No lives: errors show on check',
    locked: 'Locked',
    enabled: 'On',
    newGame: 'New game',
    pause: 'Pause',
    resume: 'Resume',
    gallery: 'Gallery',
    hint: 'Hint',
    check: 'Check',
    surrender: 'Give up',
    paint: 'Paint',
    cross: 'Cross',
    boardSub: 'Numbers show consecutive groups of filled cells.',
    cellsLeft: (n) => `Cells left: ${n}`,
    hintStateFree: 'Hint: free',
    hintStatePaid: 'Hint: 20 coins',
    wins: 'Wins',
    opensAfter: 'Unlocks after 5 wins on the previous level',
    progressShort: (wins) => `${Math.min(wins, WIN_TARGET)}/${WIN_TARGET}`,
    rule1: 'Each number is the length of a filled group in a row or column.',
    rule2: 'There is at least one empty cell between two groups.',
    rule3: 'Tap a cell to use the selected tool. Tap again to erase the same mark.',
    rule4: 'Hold and drag to paint or cross several cells at once.',
    rule5: 'Warm-up starts with several empty cells already crossed as a learning aid.',
    close: 'Close',
    pauseTitle: 'Paused',
    pauseText: 'The game is stopped. Difficulty and new game buttons are blocked while paused.',
    gameOverTitle: 'No lives left',
    gameOverText: 'Continue for coins or restart.',
    price: 'Price',
    buyLife: 'Continue for 50 coins',
    restart: 'Restart',
    winTitle: 'Picture solved',
    winText: (name, reward) => `This is “${name}”. Win recorded, reward: ${reward} coins.`,
    nextLevel: 'Next level',
    playAgain: 'Play again',
    surrenderTitle: 'Solution revealed',
    surrenderText: (name) => `This is “${name}”. Study the picture and start another round.`,
    notEnoughCoins: 'Not enough coins.',
    noHints: 'All filled cells are already revealed.',
    wrongCell: 'This cell must stay empty.',
    solved: 'Done. The picture matches the clues.',
    notSolved: (n) => `Not solved yet. Fix cells: ${n}.`,
    freeLockedMessage: (title) => `Free mode for “${title}” unlocks after 5 wins.`,
    galleryTitle: 'Finished pictures',
    galleryText: 'Preview silhouettes and names. The current puzzle is not automatically revealed during play.',
  },
};

function normalizeLang(value) {
  return String(value || '').toLowerCase().startsWith('en') ? 'en' : 'ru';
}

function getLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocalJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('localStorage write failed', err);
  }
}

function rowsToMatrix(rows) {
  return rows.map((row) => row.split('').map((cell) => cell === '1'));
}

function makeMatrix(size, predicate) {
  return Array.from({ length: size }, (_, r) => (
    Array.from({ length: size }, (_, c) => Boolean(predicate(r, c, size)))
  ));
}

function normCoord(index, size) {
  if (size <= 1) return 0;
  return (index / (size - 1)) * 2 - 1;
}

function drawByName(name, size) {
  const x = (c) => normCoord(c, size);
  const y = (r) => normCoord(r, size);
  const abs = Math.abs;
  const round = Math.round;
  const mid = (size - 1) / 2;

  const drawers = {
    diamond: () => makeMatrix(size, (r, c) => abs(x(c)) + abs(y(r)) < 0.82),
    flower: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const d1 = (nx * nx) / 0.28 + ((ny - 0.36) * (ny - 0.36)) / 0.13 < 1;
      const d2 = (nx * nx) / 0.28 + ((ny + 0.36) * (ny + 0.36)) / 0.13 < 1;
      const d3 = ((nx - 0.36) * (nx - 0.36)) / 0.13 + (ny * ny) / 0.28 < 1;
      const d4 = ((nx + 0.36) * (nx + 0.36)) / 0.13 + (ny * ny) / 0.28 < 1;
      const center = nx * nx + ny * ny < 0.12;
      const stem = abs(nx) < 0.08 && ny > 0.35;
      return d1 || d2 || d3 || d4 || center || stem;
    }),
    cat: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const head = (nx * nx) / 0.72 + ((ny + 0.02) * (ny + 0.02)) / 0.62 < 1;
      const ears = (ny < -0.45 && abs(nx) > 0.34 && abs(nx) < 0.78 && ny > -1 + abs(abs(nx) - 0.56) * 1.4);
      const eyes = ny > -0.16 && ny < 0.08 && (abs(nx + 0.28) < 0.08 || abs(nx - 0.28) < 0.08);
      const mouth = ny > 0.34 && abs(nx) < 0.2;
      return (head || ears) && !eyes && !mouth;
    }),
    rocket: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = abs(nx) < 0.28 && ny > -0.62 && ny < 0.62;
      const nose = ny < -0.45 && abs(nx) < (ny + 0.92) * 0.62;
      const fins = ny > 0.42 && abs(nx) > 0.18 && abs(nx) < 0.55 && ny < 0.85;
      const flame = ny > 0.64 && abs(nx) < 0.18 + (ny - 0.64) * 0.28;
      return body || nose || fins || flame;
    }),
    fish: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = ((nx + 0.15) * (nx + 0.15)) / 0.58 + (ny * ny) / 0.38 < 1;
      const tail = nx > 0.45 && abs(ny) < (nx - 0.35) * 1.25 && nx < 0.98;
      const eye = nx < -0.42 && nx > -0.58 && abs(ny + 0.16) < 0.1;
      return (body || tail) && !eye;
    }),
    key: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const ring = (nx + 0.45) * (nx + 0.45) + (ny + 0.12) * (ny + 0.12) < 0.20 && (nx + 0.45) * (nx + 0.45) + (ny + 0.12) * (ny + 0.12) > 0.055;
      const shaft = abs(ny + 0.12) < 0.09 && nx > -0.28 && nx < 0.72;
      const tooth1 = nx > 0.35 && nx < 0.48 && ny > -0.12 && ny < 0.34;
      const tooth2 = nx > 0.58 && nx < 0.72 && ny > -0.12 && ny < 0.22;
      return ring || shaft || tooth1 || tooth2;
    }),
    tree: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const crown1 = ny < -0.28 && ny > -0.92 && abs(nx) < (ny + 1.05) * 0.78;
      const crown2 = ny < 0.18 && ny > -0.42 && abs(nx) < (ny + 0.62) * 0.72;
      const trunk = abs(nx) < 0.14 && ny > 0.16 && ny < 0.78;
      const base = ny > 0.68 && ny < 0.86 && abs(nx) < 0.38;
      return crown1 || crown2 || trunk || base;
    }),
    ghost: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = ny > -0.56 && ny < 0.72 && abs(nx) < 0.62;
      const dome = (nx * nx) / 0.39 + ((ny + 0.54) * (ny + 0.54)) / 0.32 < 1;
      const waves = ny > 0.58 && (Math.floor((c / size) * 5) % 2 === 0);
      const eyes = ny > -0.34 && ny < -0.08 && (abs(nx + 0.26) < 0.08 || abs(nx - 0.26) < 0.08);
      return (body || dome || waves) && !eyes;
    }),
    crown: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const base = ny > 0.22 && ny < 0.76 && abs(nx) < 0.78;
      const points = (ny < 0.28 && ny > -0.68) && (
        abs(nx + 0.62) < (ny + 0.82) * 0.36 ||
        abs(nx) < (ny + 0.9) * 0.38 ||
        abs(nx - 0.62) < (ny + 0.82) * 0.36
      );
      return base || points;
    }),
    castle: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = ny > -0.08 && ny < 0.86 && abs(nx) < 0.78;
      const leftTower = abs(nx + 0.62) < 0.22 && ny > -0.58 && ny < 0.86;
      const rightTower = abs(nx - 0.62) < 0.22 && ny > -0.58 && ny < 0.86;
      const centerTower = abs(nx) < 0.22 && ny > -0.76 && ny < 0.86;
      const battlement = ny < -0.52 && (Math.floor(c / Math.max(1, size / 7)) % 2 === 0);
      const gate = ny > 0.45 && abs(nx) < 0.16;
      return (body || leftTower || rightTower || centerTower || battlement) && !gate;
    }),
    owl: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = (nx * nx) / 0.62 + ((ny - 0.05) * (ny - 0.05)) / 0.86 < 1;
      const ears = ny < -0.5 && abs(nx) > 0.34 && abs(nx) < 0.78 && ny > -1 + abs(abs(nx) - 0.56);
      const eyes = ny > -0.34 && ny < -0.06 && (abs(nx + 0.27) < 0.12 || abs(nx - 0.27) < 0.12);
      const belly = ny > 0.22 && ny < 0.48 && abs(nx) < 0.22;
      const feet = ny > 0.78 && (abs(nx + 0.2) < 0.15 || abs(nx - 0.2) < 0.15);
      return (body || ears || feet) && !eyes && !belly;
    }),
    turtle: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const shell = (nx * nx) / 0.62 + (ny * ny) / 0.36 < 1;
      const head = ((nx - 0.72) * (nx - 0.72)) / 0.08 + (ny * ny) / 0.08 < 1;
      const legs = ny > 0.28 && (abs(nx + 0.45) < 0.12 || abs(nx - 0.45) < 0.12);
      const tail = nx < -0.75 && abs(ny) < 0.12;
      return shell || head || legs || tail;
    }),
    ship: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const mast = abs(nx) < 0.04 && ny > -0.78 && ny < 0.36;
      const sail1 = nx > 0.04 && nx < 0.65 && ny > -0.72 && ny < 0.2 && nx < (ny + 0.85) * 0.85;
      const sail2 = nx < -0.04 && nx > -0.5 && ny > -0.48 && ny < 0.16 && abs(nx) < (ny + 0.64) * 0.7;
      const hull = ny > 0.36 && ny < 0.68 && abs(nx) < 0.76 - (ny - 0.36) * 0.65;
      return mast || sail1 || sail2 || hull;
    }),
    robot: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const head = abs(nx) < 0.52 && ny > -0.82 && ny < -0.25;
      const body = abs(nx) < 0.64 && ny > -0.12 && ny < 0.55;
      const arms = ny > -0.03 && ny < 0.38 && abs(nx) > 0.64 && abs(nx) < 0.86;
      const legs = ny > 0.55 && ny < 0.88 && (abs(nx + 0.25) < 0.14 || abs(nx - 0.25) < 0.14);
      const antenna = abs(nx) < 0.05 && ny < -0.82;
      const eyes = ny > -0.62 && ny < -0.46 && (abs(nx + 0.24) < 0.08 || abs(nx - 0.24) < 0.08);
      return (head || body || arms || legs || antenna) && !eyes;
    }),
    anchor: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const shaft = abs(nx) < 0.08 && ny > -0.72 && ny < 0.42;
      const ring = nx * nx + ((ny + 0.76) * (ny + 0.76)) < 0.08 && nx * nx + ((ny + 0.76) * (ny + 0.76)) > 0.025;
      const cross = abs(ny + 0.2) < 0.06 && abs(nx) < 0.48;
      const curve = ny > 0.24 && ny < 0.78 && abs(abs(nx) - 0.42) < (ny - 0.18) * 0.22;
      const hooks = ny > 0.55 && abs(nx) > 0.35 && abs(nx) < 0.72;
      return shaft || ring || cross || curve || hooks;
    }),
    butterfly: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = abs(nx) < 0.08 && abs(ny) < 0.78;
      const upper = ((abs(nx) - 0.36) ** 2) / 0.18 + ((ny + 0.28) ** 2) / 0.24 < 1;
      const lower = ((abs(nx) - 0.32) ** 2) / 0.16 + ((ny - 0.38) ** 2) / 0.2 < 1;
      const holes = ((abs(nx) - 0.34) ** 2) / 0.035 + ((ny + 0.25) ** 2) / 0.045 < 1;
      return (body || upper || lower) && !holes;
    }),
    skull: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const head = (nx * nx) / 0.54 + ((ny + 0.24) * (ny + 0.24)) / 0.62 < 1;
      const jaw = abs(nx) < 0.42 && ny > 0.16 && ny < 0.72;
      const eyes = ny > -0.28 && ny < 0.03 && (abs(nx + 0.25) < 0.13 || abs(nx - 0.25) < 0.13);
      const nose = ny > 0.08 && ny < 0.28 && abs(nx) < 0.1;
      const teeth = ny > 0.53 && ny < 0.72 && Math.floor((nx + 0.42) * 8) % 2 === 0;
      return (head || jaw) && !eyes && !nose && !teeth;
    }),
    cactus: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const trunk = abs(nx) < 0.16 && ny > -0.74 && ny < 0.82;
      const leftArm = nx < -0.16 && nx > -0.58 && ny > -0.2 && ny < 0.04;
      const leftUp = abs(nx + 0.58) < 0.13 && ny > -0.48 && ny < 0.05;
      const rightArm = nx > 0.16 && nx < 0.58 && ny > -0.42 && ny < -0.18;
      const rightUp = abs(nx - 0.58) < 0.13 && ny > -0.64 && ny < -0.18;
      const base = ny > 0.78 && abs(nx) < 0.36;
      return trunk || leftArm || leftUp || rightArm || rightUp || base;
    }),
    spaceship: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = (nx * nx) / 0.92 + (ny * ny) / 0.24 < 1;
      const dome = (nx * nx) / 0.28 + ((ny + 0.22) * (ny + 0.22)) / 0.18 < 1 && ny < 0.08;
      const beams = ny > 0.25 && ny < 0.78 && (abs(nx) < 0.08 || abs(nx + 0.36) < 0.06 || abs(nx - 0.36) < 0.06);
      return body || dome || beams;
    }),
    trophy: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const cup = abs(nx) < 0.48 - Math.max(0, ny + 0.28) * 0.2 && ny > -0.72 && ny < 0.2;
      const handles = ny > -0.52 && ny < -0.08 && abs(abs(nx) - 0.58) < 0.1;
      const stem = abs(nx) < 0.12 && ny > 0.16 && ny < 0.58;
      const base = abs(nx) < 0.48 && ny > 0.58 && ny < 0.78;
      return cup || handles || stem || base;
    }),
    dragon: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = ((nx + 0.15) * (nx + 0.15)) / 0.52 + ((ny - 0.18) * (ny - 0.18)) / 0.30 < 1;
      const neck = abs(nx - 0.28) < 0.13 && ny > -0.42 && ny < 0.1;
      const head = ((nx - 0.48) * (nx - 0.48)) / 0.16 + ((ny + 0.5) * (ny + 0.5)) / 0.12 < 1;
      const wing = nx < 0.05 && nx > -0.72 && ny < -0.08 && ny > -0.68 && abs(ny + 0.08) < (-nx + 0.12) * 0.75;
      const tail = nx < -0.42 && ny > 0.05 && ny < 0.26 + (-nx - 0.42) * 0.7;
      const leg = ny > 0.42 && (abs(nx + 0.14) < 0.09 || abs(nx - 0.32) < 0.08);
      return body || neck || head || wing || tail || leg;
    }),
    phoenix: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = abs(nx) < 0.16 && ny > -0.35 && ny < 0.55;
      const wings = ny > -0.55 && ny < 0.2 && abs(nx) > 0.12 && abs(nx) < 0.86 && abs(ny + 0.08) < (0.95 - abs(nx)) * 0.55;
      const head = nx * nx + ((ny + 0.58) * (ny + 0.58)) < 0.08;
      const tail = ny > 0.45 && abs(nx) < 0.12 + (ny - 0.45) * 0.9;
      return body || wings || head || tail;
    }),
  };

  return (drawers[name] || drawers.diamond)();
}

function getSolution(puzzle, size) {
  if (puzzle.rows) return rowsToMatrix(puzzle.rows);
  return drawByName(puzzle.draw, size);
}

function buildClue(line) {
  const result = [];
  let count = 0;

  line.forEach((filled) => {
    if (filled) {
      count += 1;
    } else if (count > 0) {
      result.push(count);
      count = 0;
    }
  });

  if (count > 0) result.push(count);
  return result.length ? result : [0];
}

function buildClues(solution) {
  const rowClues = solution.map((row) => buildClue(row));
  const size = solution.length;
  const colClues = Array.from({ length: size }, (_, col) => buildClue(solution.map((row) => row[col])));
  return { rowClues, colClues };
}

function makeEmptyMarks(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 'empty'));
}

function starterMarksFor(solution) {
  const size = solution.length;
  const marks = makeEmptyMarks(size);
  const candidates = [];

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!solution[r][c]) candidates.push([r, c]);
    }
  }

  const limit = Math.min(candidates.length, Math.max(3, Math.round(size * size * 0.16)));
  candidates
    .sort(([r1, c1], [r2, c2]) => ((r1 * 17 + c1 * 31) % 101) - ((r2 * 17 + c2 * 31) % 101))
    .slice(0, limit)
    .forEach(([r, c]) => { marks[r][c] = 'cross'; });

  return marks;
}

function revealPictureMarks(solution) {
  return solution.map((row) => row.map((filled) => (filled ? 'filled' : 'empty')));
}

function revealSolutionMarks(solution) {
  return solution.map((row) => row.map((filled) => (filled ? 'filled' : 'cross')));
}

function countRemaining(marks, solution) {
  let remaining = 0;
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution.length; c += 1) {
      if (solution[r][c] && marks[r][c] !== 'filled') remaining += 1;
    }
  }
  return remaining;
}

function countErrors(marks, solution) {
  let errors = 0;
  for (let r = 0; r < solution.length; r += 1) {
    for (let c = 0; c < solution.length; c += 1) {
      if (solution[r][c] && marks[r][c] !== 'filled') errors += 1;
      if (!solution[r][c] && marks[r][c] === 'filled') errors += 1;
    }
  }
  return errors;
}

function isSolved(marks, solution) {
  return countErrors(marks, solution) === 0;
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function classNames(...items) {
  return items.filter(Boolean).join(' ');
}

function isDifficultyUnlocked(index, progress) {
  if (index <= 1) return true;
  const prev = DIFFICULTIES[index - 1];
  return (progress[prev.id] || 0) >= WIN_TARGET;
}

function isFreeModeUnlocked(diffId, progress) {
  return (progress[diffId] || 0) >= WIN_TARGET;
}

function pickPuzzle(diffId, exceptIndex = -1) {
  const list = PUZZLES[diffId];
  if (!list || !list.length) return { puzzle: PUZZLES.easy[0], index: 0 };
  if (list.length === 1) return { puzzle: list[0], index: 0 };

  let index = Math.floor(Math.random() * list.length);
  if (index === exceptIndex) index = (index + 1) % list.length;
  return { puzzle: list[index], index };
}

function getPuzzleName(puzzle, lang) {
  return lang === 'ru' ? puzzle.nameRu : puzzle.nameEn;
}

function installInteractionGuards(suppressClickRef) {
  const scrollHost = document.querySelector('.app') || document.scrollingElement || document.documentElement;
  let startX = 0;
  let startY = 0;
  let lastY = 0;
  let isTracking = false;
  let didScroll = false;

  const shouldIgnoreTarget = (target) => !!target.closest?.('.modal, .overlay, input, textarea, select, button, .nonogram-stage, .gallery-grid');

  const startTracking = (event) => {
    if (event.touches.length !== 1 || shouldIgnoreTarget(event.target)) {
      isTracking = false;
      return;
    }

    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    lastY = touch.clientY;
    isTracking = true;
    didScroll = false;
  };

  const moveTracking = (event) => {
    if (!isTracking || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absY < 6) return;
    if (absX > absY * 1.15) return;

    const deltaY = lastY - touch.clientY;
    lastY = touch.clientY;
    scrollHost.scrollTop += deltaY;
    didScroll = true;
    suppressClickRef.current = Date.now() + 220;

    if (event.cancelable) event.preventDefault();
  };

  const finishTracking = () => {
    if (didScroll) suppressClickRef.current = Date.now() + 220;
    isTracking = false;
    didScroll = false;
  };

  const blockEvent = (event) => {
    if (event.target.closest?.('.app, .modal, .overlay, .notification') || event.target === document.body) {
      event.preventDefault();
    }
  };

  const blockClickAfterSwipe = (event) => {
    if (Date.now() < suppressClickRef.current) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const blockGesture = (event) => event.preventDefault();

  ['contextmenu', 'selectstart', 'dragstart'].forEach((name) => {
    document.addEventListener(name, blockEvent, { capture: true });
  });

  if (scrollHost) {
    scrollHost.addEventListener('touchstart', startTracking, { passive: true, capture: true });
    scrollHost.addEventListener('touchmove', moveTracking, { passive: false, capture: true });
    scrollHost.addEventListener('touchend', finishTracking, { passive: true, capture: true });
    scrollHost.addEventListener('touchcancel', finishTracking, { passive: true, capture: true });
  }

  document.addEventListener('click', blockClickAfterSwipe, true);
  document.addEventListener('gesturestart', blockGesture, { passive: false });

  return () => {
    ['contextmenu', 'selectstart', 'dragstart'].forEach((name) => {
      document.removeEventListener(name, blockEvent, { capture: true });
    });

    if (scrollHost) {
      scrollHost.removeEventListener('touchstart', startTracking, { capture: true });
      scrollHost.removeEventListener('touchmove', moveTracking, { capture: true });
      scrollHost.removeEventListener('touchend', finishTracking, { capture: true });
      scrollHost.removeEventListener('touchcancel', finishTracking, { capture: true });
    }

    document.removeEventListener('click', blockClickAfterSwipe, true);
    document.removeEventListener('gesturestart', blockGesture, { passive: false });
  };
}


const INITIAL_PICK = pickPuzzle('warmup');

function Preview({ solution, label, compact = false }) {
  const size = solution.length;
  return (
    <div className={classNames('picture-preview', compact && 'compact-preview')}>
      <div className="preview-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {solution.map((row, r) => row.map((filled, c) => (
          <span key={`${r}-${c}`} className={filled ? 'preview-cell on' : 'preview-cell'} />
        )))}
      </div>
      {label && <div className="preview-label">{label}</div>}
    </div>
  );
}

export default function App() {
  const initialProgress = useMemo(() => getLocalJson(STORAGE_KEYS.progress, {}), []);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState(() => normalizeLang(localStorage.getItem(STORAGE_KEYS.lang) || 'ru'));
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'dark');
  const [coins, setCoins] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.coins) || START_COINS));
  const [progress, setProgress] = useState(initialProgress);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(() => INITIAL_PICK.index);
  const [marks, setMarks] = useState(() => starterMarksFor(getSolution(INITIAL_PICK.puzzle, DIFFICULTIES[0].size)));
  const [tool, setTool] = useState('fill');
  const [selectedCell, setSelectedCell] = useState(null);
  const [lives, setLives] = useState(DIFFICULTIES[0].lives);
  const [freeMode, setFreeMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modal, setModal] = useState(null);
  const [notification, setNotification] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [cellSize, setCellSize] = useState(38);
  const [clueWidth, setClueWidth] = useState(96);
  const [isCompleting, setIsCompleting] = useState(false);

  const stageRef = useRef(null);
  const suppressClickRef = useRef(0);
  const saveTimerRef = useRef(null);
  const notificationTimerRef = useRef(null);
  const dragRef = useRef({ active: false, target: 'filled', pointerId: null, touched: new Set() });
  const winLockRef = useRef(false);

  const t = I18N[lang];
  const difficulty = DIFFICULTIES[difficultyIndex];
  const puzzle = PUZZLES[difficulty.id][puzzleIndex] || PUZZLES[difficulty.id][0];
  const puzzleName = getPuzzleName(puzzle, lang);
  const solution = useMemo(() => getSolution(puzzle, difficulty.size), [puzzle, difficulty.size]);
  const { rowClues, colClues } = useMemo(() => buildClues(solution), [solution]);
  const remaining = useMemo(() => countRemaining(marks, solution), [marks, solution]);
  const mistakeCount = useMemo(() => countErrors(marks, solution), [marks, solution]);
  const timeText = formatTime(elapsed);
  const freeUnlocked = isFreeModeUnlocked(difficulty.id, progress);

  const showNotification = useCallback((text) => {
    setNotification(text);
    if (notificationTimerRef.current) window.clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = window.setTimeout(() => setNotification(''), 1900);
  }, []);

  const syncSave = useCallback((next = {}) => {
    const payload = {
      coins: next.coins ?? coins,
      progress: next.progress ?? progress,
      theme: next.theme ?? theme,
      lang: next.lang ?? lang,
    };

    localStorage.setItem(STORAGE_KEYS.coins, String(payload.coins));
    setLocalJson(STORAGE_KEYS.progress, payload.progress);
    localStorage.setItem(STORAGE_KEYS.theme, payload.theme);
    localStorage.setItem(STORAGE_KEYS.lang, payload.lang);

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      window.YandexStorage?.saveGameState?.(payload);
    }, 250);
  }, [coins, progress, theme, lang]);

  const resetGame = useCallback((nextDifficultyIndex = difficultyIndex, keepPuzzleIndex = false) => {
    const nextDifficulty = DIFFICULTIES[nextDifficultyIndex];
    const picked = keepPuzzleIndex
      ? { index: puzzleIndex }
      : pickPuzzle(nextDifficulty.id, nextDifficultyIndex === difficultyIndex ? puzzleIndex : -1);
    const nextPuzzle = PUZZLES[nextDifficulty.id][picked.index] || PUZZLES[nextDifficulty.id][0];
    const nextSolution = getSolution(nextPuzzle, nextDifficulty.size);

    setDifficultyIndex(nextDifficultyIndex);
    setPuzzleIndex(picked.index);
    setMarks(nextDifficulty.starterCrosses ? starterMarksFor(nextSolution) : makeEmptyMarks(nextDifficulty.size));
    setLives(nextDifficulty.lives);
    setSelectedCell(null);
    setElapsed(0);
    setTimerActive(false);
    setIsPaused(false);
    setModal(null);
    setHintUsed(false);
    setIsCompleting(false);
    winLockRef.current = false;
    dragRef.current = { active: false, target: 'filled', pointerId: null, touched: new Set() };
  }, [difficultyIndex, puzzleIndex]);

  const stopGameplay = useCallback(() => {
    window.YandexStorage?.stopGameplay?.();
  }, []);

  const startGameplay = useCallback(() => {
    setTimerActive((wasActive) => {
      if (!wasActive) window.YandexStorage?.startGameplay?.();
      return true;
    });
  }, []);

  const finishWin = useCallback(() => {
    if (winLockRef.current) return;
    winLockRef.current = true;
    setIsCompleting(true);
    stopGameplay();
    setTimerActive(false);
    setMarks(revealPictureMarks(solution));

    setProgress((prev) => {
      const next = { ...prev, [difficulty.id]: (prev[difficulty.id] || 0) + 1 };
      setCoins((coinValue) => {
        const nextCoins = coinValue + difficulty.reward;
        syncSave({ coins: nextCoins, progress: next });
        return nextCoins;
      });
      return next;
    });

    window.setTimeout(() => {
      setModal('win');
    }, 950);
  }, [difficulty.id, difficulty.reward, solution, stopGameplay, syncSave]);

  const checkWinAfterMove = useCallback((nextMarks) => {
    if (isSolved(nextMarks, solution)) {
      window.setTimeout(finishWin, 40);
      return true;
    }
    return false;
  }, [finishWin, solution]);

  const applyCell = useCallback((row, col, targetOverride = null) => {
    if (Date.now() < suppressClickRef.current) return;
    if (isPaused || modal || lives <= 0 || isCompleting) return;

    setSelectedCell({ row, col });
    startGameplay();

    setMarks((prev) => {
      const next = prev.map((line) => [...line]);
      const current = next[row][col];
      const target = targetOverride || (tool === 'cross'
        ? (current === 'cross' ? 'empty' : 'cross')
        : (current === 'filled' ? 'empty' : 'filled'));

      if (target === 'empty') {
        next[row][col] = 'empty';
        return next;
      }

      if (target === 'cross') {
        next[row][col] = 'cross';
        return next;
      }

      if (!freeMode && !solution[row][col] && current !== 'filled') {
        next[row][col] = 'cross';
        setLives((value) => {
          const nextLives = Math.max(0, value - 1);
          if (nextLives <= 0) {
            stopGameplay();
            setTimerActive(false);
            setModal('gameOver');
          }
          return nextLives;
        });
        showNotification(t.wrongCell);
        return next;
      }

      next[row][col] = 'filled';
      checkWinAfterMove(next);
      return next;
    });
  }, [checkWinAfterMove, freeMode, isCompleting, isPaused, lives, modal, showNotification, solution, startGameplay, stopGameplay, t.wrongCell, tool]);

  const handlePointerDown = useCallback((event, row, col, currentMark) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const target = tool === 'cross'
      ? (currentMark === 'cross' ? 'empty' : 'cross')
      : (currentMark === 'filled' ? 'empty' : 'filled');

    dragRef.current = { active: true, target, pointerId: event.pointerId, touched: new Set([`${row}:${col}`]) };
    applyCell(row, col, target);
  }, [applyCell, tool]);

  const handlePointerEnter = useCallback((event, row, col) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const key = `${row}:${col}`;
    if (drag.touched.has(key)) return;
    drag.touched.add(key);
    applyCell(row, col, drag.target);
  }, [applyCell]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = { active: false, target: 'filled', pointerId: null, touched: new Set() };
  }, []);

  const useHint = useCallback(() => {
    if (isPaused || modal || isCompleting) return;

    const hidden = [];
    solution.forEach((row, r) => {
      row.forEach((filled, c) => {
        if (filled && marks[r][c] !== 'filled') hidden.push([r, c]);
      });
    });

    if (!hidden.length) {
      showNotification(t.noHints);
      return;
    }

    if (hintUsed && coins < HINT_PRICE) {
      showNotification(t.notEnoughCoins);
      return;
    }

    const [r, c] = hidden[Math.floor(Math.random() * hidden.length)];
    const nextCoins = hintUsed ? coins - HINT_PRICE : coins;
    setCoins(nextCoins);
    setHintUsed(true);
    startGameplay();
    setMarks((prev) => {
      const next = prev.map((line) => [...line]);
      next[r][c] = 'filled';
      checkWinAfterMove(next);
      return next;
    });
    syncSave({ coins: nextCoins });
  }, [checkWinAfterMove, coins, hintUsed, isCompleting, isPaused, marks, modal, showNotification, solution, startGameplay, syncSave, t.noHints, t.notEnoughCoins]);

  const checkPuzzle = useCallback(() => {
    if (isPaused || modal || isCompleting) return;
    startGameplay();
    const errors = countErrors(marks, solution);
    if (errors === 0) {
      showNotification(t.solved);
      finishWin();
    } else {
      showNotification(t.notSolved(errors));
    }
  }, [finishWin, isCompleting, isPaused, marks, modal, showNotification, solution, startGameplay, t]);

  const surrender = useCallback(() => {
    if (isPaused || modal || isCompleting) return;
    stopGameplay();
    setTimerActive(false);
    setMarks(revealSolutionMarks(solution));
    setModal('surrender');
  }, [isCompleting, isPaused, modal, solution, stopGameplay]);

  const togglePause = useCallback(() => {
    if (modal && modal !== 'pause') return;

    setIsPaused((paused) => {
      if (paused) {
        setModal(null);
        if (timerActive) window.YandexStorage?.startGameplay?.();
        return false;
      }

      stopGameplay();
      setModal('pause');
      return true;
    });
  }, [modal, stopGameplay, timerActive]);

  const toggleFreeMode = useCallback(() => {
    if (isPaused || modal || isCompleting) return;
    if (!isFreeModeUnlocked(difficulty.id, progress)) {
      showNotification(t.freeLockedMessage(lang === 'ru' ? difficulty.ru : difficulty.en));
      return;
    }
    setFreeMode((value) => !value);
    resetGame(difficultyIndex, true);
  }, [difficulty, difficultyIndex, isCompleting, isPaused, lang, modal, progress, resetGame, showNotification, t]);

  const selectDifficulty = useCallback((index) => {
    if (isPaused || modal || isCompleting) return;
    if (!isDifficultyUnlocked(index, progress)) return;
    const nextDifficulty = DIFFICULTIES[index];
    setFreeMode((value) => (value && isFreeModeUnlocked(nextDifficulty.id, progress) ? value : false));
    resetGame(index, false);
  }, [isCompleting, isPaused, modal, progress, resetGame]);

  const nextLevel = useCallback(() => {
    const nextIndex = Math.min(difficultyIndex + 1, DIFFICULTIES.length - 1);
    if (nextIndex !== difficultyIndex && isDifficultyUnlocked(nextIndex, progress)) {
      resetGame(nextIndex, false);
      return;
    }
    resetGame(difficultyIndex, false);
  }, [difficultyIndex, progress, resetGame]);

  const buyLife = useCallback(() => {
    if (coins < BUY_LIFE_PRICE) {
      showNotification(t.notEnoughCoins);
      return;
    }
    const nextCoins = coins - BUY_LIFE_PRICE;
    setCoins(nextCoins);
    setLives(1);
    setModal(null);
    setTimerActive(true);
    startGameplay();
    syncSave({ coins: nextCoins });
  }, [coins, showNotification, startGameplay, syncSave, t.notEnoughCoins]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await window.YandexStorage?.init?.();

      const hasManualLang = Boolean(localStorage.getItem(STORAGE_KEYS.lang));
      const sdkLang = window.YandexStorage?.getLanguage?.();
      const defaultState = {
        coins: Number(localStorage.getItem(STORAGE_KEYS.coins) || START_COINS),
        progress: getLocalJson(STORAGE_KEYS.progress, {}),
        theme: localStorage.getItem(STORAGE_KEYS.theme) || 'dark',
        lang: hasManualLang ? normalizeLang(localStorage.getItem(STORAGE_KEYS.lang)) : normalizeLang(sdkLang || 'ru'),
      };
      const loaded = await window.YandexStorage?.loadGameState?.(defaultState) || defaultState;

      if (cancelled) return;
      setCoins(loaded.coins);
      setProgress(loaded.progress || {});
      setTheme(loaded.theme || 'dark');
      setLang(hasManualLang ? defaultState.lang : normalizeLang(sdkLang || loaded.lang || 'ru'));
      setHydrated(true);

      window.requestAnimationFrame(() => {
        window.YandexStorage?.ready?.();
      });
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.lang = lang;
    document.body.dataset.boardSize = String(difficulty.size);
    document.documentElement.lang = lang;
  }, [difficulty.size, lang, theme]);

  useEffect(() => {
    const cleanup = installInteractionGuards(suppressClickRef);
    return cleanup;
  }, []);

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerUp]);

  useEffect(() => {
    if (!timerActive || isPaused || modal === 'pause') return undefined;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [isPaused, modal, timerActive]);

  useEffect(() => {
    const pauseHandler = () => {
      stopGameplay();
      setIsPaused(true);
      setModal((current) => current || 'pause');
    };
    const resumeHandler = () => {};

    window.YandexStorage?.onPause?.(pauseHandler);
    window.YandexStorage?.onResume?.(resumeHandler);
  }, [stopGameplay]);

  useEffect(() => {
    if (hydrated) syncSave();
  }, [coins, progress, theme, lang, hydrated]);

  useEffect(() => {
    const recalc = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const size = difficulty.size;
      const nextClueWidth = size >= 30 ? 50 : size >= 20 ? 58 : size >= 15 ? 68 : size >= 10 ? 82 : 96;
      const maxByWidth = Math.floor((width - nextClueWidth - 26) / size);
      const max = size <= 5 ? 56 : size <= 10 ? 38 : size <= 15 ? 28 : size <= 20 ? 23 : 17;
      const min = size <= 5 ? 34 : size <= 10 ? 24 : size <= 15 ? 17 : size <= 20 ? 13 : 9;
      setClueWidth(nextClueWidth);
      setCellSize(Math.max(min, Math.min(max, maxByWidth)));
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    if (stageRef.current) observer.observe(stageRef.current);
    window.addEventListener('resize', recalc);
    window.setTimeout(recalc, 150);
    window.setTimeout(recalc, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [difficulty.size]);

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    if (notificationTimerRef.current) window.clearTimeout(notificationTimerRef.current);
  }, []);

  const canGoNext = difficultyIndex < DIFFICULTIES.length - 1 && isDifficultyUnlocked(difficultyIndex + 1, progress);

  if (!hydrated) {
    return (
      <div className="app app-loading">
        <div className="loading-card">Нонограммы загружаются...</div>
      </div>
    );
  }

  return (
    <>
      <div className="app">
        <header className="topbar">
          <div className="brand-row">
            <div className="brand-wrap">
              <h1 className="brand">{t.title}</h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>

            <div className="utility-controls" aria-label="Settings">
              <button
                className="rules-open-btn top-control-btn theme-top-btn"
                type="button"
                onClick={() => {
                  const next = theme === 'dark' ? 'light' : 'dark';
                  setTheme(next);
                  syncSave({ theme: next });
                }}
              >
                <span className="control-icon" aria-hidden="true">{theme === 'dark' ? '☾' : '☀'}</span>
                <span className="top-control-main">{t.theme}</span>
                <span className="top-lang-badge">{theme === 'dark' ? t.dark : t.light}</span>
              </button>

              <button
                className="rules-open-btn lang-top-btn top-control-btn"
                type="button"
                aria-label="Русский / English"
                onClick={() => {
                  const next = lang === 'ru' ? 'en' : 'ru';
                  setLang(next);
                  syncSave({ lang: next });
                }}
              >
                <span className="lang-segment lang-segment-ru">RU</span>
                <span className="lang-divider" aria-hidden="true" />
                <span className="lang-segment lang-segment-en">EN</span>
              </button>
            </div>
          </div>

          <div className="top-actions">
            <div className="stats">
              <div className="stat life-stat">
                <span className="stat-icon" aria-hidden="true">❤</span>
                <span className="stat-label">{freeMode ? t.mistakes : t.lives}</span>
                <span className="stat-value lives">{freeMode ? mistakeCount : '❤ '.repeat(lives).trim() || '0'}</span>
              </div>
              <div className="stat coin-stat">
                <span className="stat-icon" aria-hidden="true">◉</span>
                <span className="stat-label">{t.coins}</span>
                <span className="stat-value">{coins}</span>
              </div>
              <div className="stat time-stat">
                <span className="stat-icon" aria-hidden="true">◷</span>
                <span className="stat-label">{t.time}</span>
                <span className="stat-value">{timeText}</span>
              </div>
            </div>

            <div className="top-controls">
              <button className="rules-open-btn top-control-btn rules-chip" type="button" onClick={() => setModal('rules')}>
                <span className="control-icon" aria-hidden="true">ⓘ</span>
                <span className="top-control-main">{t.rules}</span>
              </button>
            </div>
          </div>
        </header>

        <section className="game-shell">
          <aside className="side side-left">
            <div className="side-card difficulty-card">
              <div className="side-title side-title-with-icon">
                <span className="side-title-icon" aria-hidden="true">▦</span>
                <span>{t.difficulty}</span>
              </div>
              <div className="difficulty-list">
                {DIFFICULTIES.map((diff, index) => {
                  const unlocked = isDifficultyUnlocked(index, progress);
                  return (
                    <button
                      key={diff.id}
                      className={classNames('difficulty-item', index === difficultyIndex && 'active', !unlocked && 'locked', isPaused && 'paused-locked')}
                      type="button"
                      disabled={!unlocked || isPaused || isCompleting}
                      onClick={() => selectDifficulty(index)}
                    >
                      <span className="difficulty-main">
                        <span className="difficulty-name">{lang === 'ru' ? diff.ru : diff.en}</span>
                        <span className="difficulty-meta">{unlocked ? (lang === 'ru' ? diff.metaRu : diff.metaEn) : t.opensAfter}</span>
                      </span>
                      <span className="difficulty-badge">{unlocked ? `${diff.size}×${diff.size}` : '🔒'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="side-card progress-card">
              <div className="side-title side-title-with-icon">
                <span className="side-title-icon" aria-hidden="true">▰</span>
                <span>{t.progress}</span>
              </div>
              <div className="progress-list">
                {DIFFICULTIES.map((diff) => {
                  const wins = progress[diff.id] || 0;
                  const done = wins >= WIN_TARGET;
                  return (
                    <div key={diff.id} className={classNames('progress-item', done && 'done')}>
                      <div className="progress-main">
                        <div className="progress-name">{lang === 'ru' ? diff.ru : diff.en}</div>
                        <div className="progress-meta">{t.wins}: {wins}</div>
                      </div>
                      <div className="progress-badge">{done ? '∞' : t.progressShort(wins)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          <main className="center">
            <div className="mode-row">
              <button
                className={classNames('mode-switch endless-switch', freeMode && 'active', !freeUnlocked && 'locked')}
                type="button"
                disabled={isPaused || isCompleting}
                onClick={toggleFreeMode}
              >
                <span className="endless-icon" aria-hidden="true">∞</span>
                <span className="endless-copy">
                  <span className="endless-title">{t.freeMode}</span>
                  <span className="endless-meta">{freeUnlocked ? t.freeModeMetaOpen : t.freeModeMetaLocked}</span>
                </span>
                <span className="endless-badge">{freeMode ? t.enabled : freeUnlocked ? 'OK' : t.locked}</span>
              </button>
            </div>

            <div className="board-head">
              <div className="board-head-main">
                <div>
                  <div className="board-title">{lang === 'ru' ? difficulty.ru : difficulty.en} · {puzzleName} · {difficulty.size}×{difficulty.size}</div>
                  <div className="board-subtitle">{t.boardSub}</div>
                </div>
                <div className="mobile-time-card" aria-hidden="true">
                  <span className="mobile-time-label">{t.time}</span>
                  <span className="mobile-time-value">{timeText}</span>
                </div>
              </div>
              <div className="hint-meta"><span>{t.cellsLeft(remaining)}</span><span>{hintUsed ? t.hintStatePaid : t.hintStateFree}</span></div>
            </div>

            <div className="board-wrap nonogram-wrap" ref={stageRef}>
              <div className="nonogram-stage" style={{ '--cell': `${cellSize}px`, '--clueW': `${clueWidth}px` }}>
                <div className="clue-corner">▥</div>
                <div className="col-clues" style={{ gridTemplateColumns: `repeat(${difficulty.size}, var(--cell))` }}>
                  {colClues.map((clue, col) => (
                    <div key={`col-${col}`} className={classNames('col-clue', clue.length === 1 && clue[0] === 0 && 'empty-clue')}>
                      {clue.map((value, i) => <span key={`${col}-${i}`}>{value}</span>)}
                    </div>
                  ))}
                </div>
                <div className="row-clues">
                  {rowClues.map((clue, row) => (
                    <div key={`row-${row}`} className={classNames('row-clue', clue.length === 1 && clue[0] === 0 && 'empty-clue')} style={{ height: 'var(--cell)' }}>
                      {clue.map((value, i) => <span key={`${row}-${i}`}>{value}</span>)}
                    </div>
                  ))}
                </div>
                <div className="nonogram-board" style={{ gridTemplateColumns: `repeat(${difficulty.size}, var(--cell))` }}>
                  {marks.map((row, r) => row.map((cell, c) => (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      className={classNames(
                        'nono-cell',
                        cell === 'filled' && 'filled',
                        cell === 'cross' && 'crossed',
                        selectedCell?.row === r && selectedCell?.col === c && 'selected',
                        (c + 1) % 5 === 0 && c !== difficulty.size - 1 && 'chunk-right',
                        (r + 1) % 5 === 0 && r !== difficulty.size - 1 && 'chunk-bottom',
                      )}
                      onPointerDown={(event) => handlePointerDown(event, r, c, cell)}
                      onPointerEnter={(event) => handlePointerEnter(event, r, c)}
                      onPointerUp={handlePointerUp}
                      aria-label={`cell ${r + 1}-${c + 1}`}
                    />
                  )))}
                </div>
              </div>
            </div>

            <div className="number-pad tool-pad">
              <button className={classNames('number-btn tool-choice', tool === 'fill' && 'active')} type="button" onClick={() => setTool('fill')}>
                <span className="tool-choice-icon fill-icon" />
                {t.paint}
              </button>
              <button className={classNames('number-btn tool-choice', tool === 'cross' && 'active')} type="button" onClick={() => setTool('cross')}>
                <span className="tool-choice-icon cross-icon">×</span>
                {t.cross}
              </button>
            </div>
          </main>

          <aside className="side side-right">
            <div className="side-card actions-card">
              <div className="side-title side-title-with-icon">
                <span className="side-title-icon" aria-hidden="true">▣</span>
                <span>{t.actions}</span>
              </div>
              <div className="actions-list actions-list-compact">
                <button className="tool-btn primary action-btn" type="button" disabled={isPaused || isCompleting} onClick={() => resetGame(difficultyIndex, false)}>{t.newGame}</button>
                <button className="tool-btn action-btn" type="button" disabled={isCompleting} onClick={togglePause}>{isPaused ? t.resume : t.pause}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused || isCompleting} onClick={() => setModal('gallery')}>{t.gallery}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused || isCompleting} onClick={useHint}>{t.hint}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused || isCompleting} onClick={checkPuzzle}>{t.check}</button>
                <button className="tool-btn subtle action-btn" type="button" disabled={isPaused || isCompleting} onClick={surrender}>{t.surrender}</button>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <div className={classNames('notification', !notification && 'hidden')} role="status" aria-live="polite">{notification}</div>
      <div className={classNames('overlay', !modal && 'hidden')} />

      {modal === 'rules' && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rulesTitle">
          <div className="modal-card rules-modal-card">
            <div className="rules-head">
              <h2 id="rulesTitle">{t.rules}</h2>
              <button className="modal-close-btn" type="button" onClick={() => setModal(null)}>{t.close}</button>
            </div>
            <div className="rules-grid">
              <div className="rule-item">{t.rule1}</div>
              <div className="rule-item">{t.rule2}</div>
              <div className="rule-item">{t.rule3}</div>
              <div className="rule-item">{t.rule4}</div>
              <div className="rule-item">{t.rule5}</div>
            </div>
          </div>
        </div>
      )}

      {modal === 'gallery' && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="galleryTitle">
          <div className="modal-card gallery-modal-card">
            <div className="rules-head">
              <div>
                <h2 id="galleryTitle">{t.galleryTitle}</h2>
                <p className="modal-text gallery-text">{t.galleryText}</p>
              </div>
              <button className="modal-close-btn" type="button" onClick={() => setModal(null)}>{t.close}</button>
            </div>
            <div className="gallery-grid">
              {DIFFICULTIES.map((diff) => (
                <section key={diff.id} className="gallery-section">
                  <h3>{lang === 'ru' ? diff.ru : diff.en} · {diff.size}×{diff.size}</h3>
                  <div className="gallery-cards">
                    {PUZZLES[diff.id].map((item) => {
                      const itemSolution = getSolution(item, diff.size);
                      return (
                        <div className="gallery-card" key={item.id}>
                          <Preview solution={itemSolution} label={getPuzzleName(item, lang)} compact />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {modal === 'pause' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t.pauseTitle}</h2>
            <p className="modal-text">{t.pauseText}</p>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={togglePause}>{t.resume}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'gameOver' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t.gameOverTitle}</h2>
            <p className="modal-text">{t.gameOverText}</p>
            <div className="modal-info">
              <div className="modal-info-item"><span>{t.coins}</span><strong>{coins}</strong></div>
              <div className="modal-info-item"><span>{t.price}</span><strong>{BUY_LIFE_PRICE}</strong></div>
            </div>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={buyLife}>{t.buyLife}</button>
              <button className="tool-btn danger" type="button" onClick={() => resetGame(difficultyIndex, true)}>{t.restart}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'win' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card result-modal-card">
            <h2>{t.winTitle}</h2>
            <Preview solution={solution} label={puzzleName} />
            <p className="modal-text">{t.winText(puzzleName, difficulty.reward)}</p>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={nextLevel}>{canGoNext ? t.nextLevel : t.playAgain}</button>
              <button className="tool-btn" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.playAgain}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'surrender' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card result-modal-card">
            <h2>{t.surrenderTitle}</h2>
            <Preview solution={solution} label={puzzleName} />
            <p className="modal-text">{t.surrenderText(puzzleName)}</p>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.newGame}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
