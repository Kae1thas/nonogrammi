import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEYS = {
  coins: 'nonograms_code_picture_coins_v2',
  progress: 'nonograms_code_picture_progress_v2',
  theme: 'nonograms_code_picture_theme_v2',
  lang: 'nonograms_code_picture_lang_v2',
  solvedPictures: 'nonograms_code_picture_solved_pictures_v3',
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
  { id: 'abyss', size: 15, reward: 95, lives: 2, starterCrosses: false, hardcore: true, ru: 'Бездна', en: 'Abyss', metaRu: '15×15 · 2 жизни, подсказки платные', metaEn: '15×15 · 2 lives, paid hints' },
];

const PUZZLES = {
  warmup: [
    { id: 'warm_heart', nameRu: 'Сердце', nameEn: 'Heart', rows: ['01010', '11111', '11111', '01110', '00100'] },
    { id: 'warm_house', nameRu: 'Домик', nameEn: 'House', rows: ['00100', '01110', '11111', '10101', '11111'] },
    { id: 'warm_tree', nameRu: 'Ёлка', nameEn: 'Tree', rows: ['00100', '01110', '11111', '00100', '01110'] },
    { id: 'warm_cup', nameRu: 'Кубок', nameEn: 'Cup', rows: ['11111', '10101', '01110', '00100', '01110'] },
    { id: 'warm_flag', nameRu: 'Флажок', nameEn: 'Flag', rows: ['11100', '10100', '11100', '00100', '00100'] },
    { id: 'warm_bolt', nameRu: 'Молния', nameEn: 'Bolt', rows: ['00110', '01100', '11110', '00110', '01100'] },
    { id: 'warm_arrow', nameRu: 'Стрелка', nameEn: 'Arrow', rows: ['00100', '01100', '11111', '01100', '00100'] },
    { id: 'warm_boat', nameRu: 'Лодка', nameEn: 'Boat', rows: ['00100', '01110', '11111', '01110', '01010'] },
  ],
  easy: [
    { id: 'easy_heart', nameRu: 'Сердце', nameEn: 'Heart', rows: ['01010', '11111', '11111', '01110', '00100'] },
    { id: 'easy_house', nameRu: 'Домик', nameEn: 'House', rows: ['00100', '01110', '11111', '10101', '11111'] },
    { id: 'easy_tree', nameRu: 'Ёлка', nameEn: 'Tree', rows: ['00100', '01110', '11111', '00100', '01110'] },
    { id: 'easy_rocket', nameRu: 'Ракета', nameEn: 'Rocket', rows: ['00100', '01110', '00100', '01110', '10101'] },
    { id: 'easy_fish', nameRu: 'Рыбка', nameEn: 'Fish', rows: ['00110', '11101', '11110', '11101', '00110'] },
    { id: 'easy_key', nameRu: 'Ключ', nameEn: 'Key', rows: ['01100', '10111', '01100', '00100', '00111'] },
    { id: 'easy_star', nameRu: 'Звезда', nameEn: 'Star', rows: ['00100', '10101', '01110', '11111', '01010'] },
    { id: 'easy_crown', nameRu: 'Корона', nameEn: 'Crown', rows: ['10101', '11111', '11111', '01110', '11111'] },
    { id: 'easy_moon', nameRu: 'Луна', nameEn: 'Moon', rows: ['01110', '11100', '11000', '11100', '01110'] },
    { id: 'easy_flower', nameRu: 'Цветок', nameEn: 'Flower', rows: ['10101', '01110', '11111', '00100', '01110'] },
  ],
  medium: [
    { id: 'medium_question', nameRu: 'Вопрос', nameEn: 'Question', rows: ['0011111100', '0110000110', '0110000110', '0000000110', '0000001110', '0000111100', '0000110000', '0000000000', '0000110000', '0000110000'] },
    { id: 'medium_alarm', nameRu: 'Будильник', nameEn: 'Alarm', rows: ['0011111000', '0111111100', '1110011110', '1100000110', '1011001101', '1001001001', '1011111001', '1100000110', '0111111100', '1111111110'] },
    { id: 'medium_car', nameRu: 'Машина', nameEn: 'Car', rows: ['0001111000', '0011001100', '0110110110', '1111111111', '1111111111', '1100000011', '1111111111', '0110000110', '0110000110', '0000000000'] },
    { id: 'medium_umbrella', nameRu: 'Зонт', nameEn: 'Umbrella', rows: ['0001111000', '0011111100', '0111111110', '1111111111', '1010101011', '0000110000', '0000110000', '0000110000', '0000011000', '0000011110'] },
    { id: 'medium_teapot', nameRu: 'Чайник', nameEn: 'Teapot', rows: ['0000110000', '0011111100', '0111111110', '1111111111', '1011111111', '1011111111', '0111111110', '0011111100', '0001111000', '0000000000'] },
    { id: 'medium_fish', nameRu: 'Рыба', nameEn: 'Fish', rows: ['0000110000', '0011111101', '0111111111', '1110111111', '1111111111', '1111111111', '0111111111', '0011111101', '0000110000', '0000000000'] },
    { id: 'medium_key', nameRu: 'Ключ', nameEn: 'Key', rows: ['0011100000', '0100011110', '1000010000', '0100010100', '0011110100', '0000011110', '0000000000', '0000000000', '0000000000', '0000000000'] },
    { id: 'medium_ghost', nameRu: 'Призрак', nameEn: 'Ghost', rows: ['0001111000', '0011111100', '0111111110', '0110110110', '0111111110', '0111111110', '0111111110', '0111011110', '0111011110', '0000000000'] },
    { id: 'medium_anchor', nameRu: 'Якорь', nameEn: 'Anchor', rows: ['0000110000', '0001111000', '0000110000', '1111111111', '0000110000', '0000110000', '1000110001', '1100110011', '0111111110', '0001111000'] },
    { id: 'medium_cactus', nameRu: 'Кактус', nameEn: 'Cactus', rows: ['0001100000', '0001100110', '1101100110', '1101100110', '1111111110', '0001100000', '0001100000', '0001100000', '0011110000', '0000000000'] },
  ],
  hard: [
    { id: 'hard_sailboat', nameRu: 'Парусник', nameEn: 'Sailboat', baseRows: ['000000010000000','000000011000000','000000011100000','000000111100000','000001111110000','000001111111000','000011111111100','000111111111110','000111111111111','000000011111111','000000011111111','111111111111110','001111111111100','000000000000000','000000000000000'] },
    { id: 'hard_cat', nameRu: 'Кот', nameEn: 'Cat', baseRows: ['001100000000110','001100000000110','011101111111110','011111111111111','011111111111111','011111111111111','111100111100111','111100111100111','011111111111111','011111111111111','001111000011110','000111111111100','000011111111000','000000000000000','000000000000000'] },
    { id: 'hard_robot', nameRu: 'Робот', nameEn: 'Robot', baseRows: ['000011111111000','000011111111000','000010011001000','000010011001000','000011111111000','000111111111100','111111111111111','111111111111111','111111111111111','000111111111100','000001100110000','000001100110000','000001100110000','000000000000000','000000000000000'] },
    { id: 'hard_lighthouse', nameRu: 'Маяк', nameEn: 'Lighthouse', baseRows: ['000011111110000','111111111110000','000011111111111','000011111111111','000000111000000','000000111000000','000000111100000','000000111100000','000001111100000','000001111100000','000001111100000','000111111111000','000000000000000','000000000000000','000000000000000'] },
    { id: 'hard_mushroom', nameRu: 'Гриб', nameEn: 'Mushroom', baseRows: ['000000011000000','000111111111100','001111111111110','011100110001111','011000010001111','111000000001111','011100100011111','011111100011111','000111111111100','000000111100000','000000111100000','000000111100000','000000111100000','000000111100000','000000000000000'] },
    { id: 'hard_guitar', nameRu: 'Гитара', nameEn: 'Guitar', baseRows: ['000000000000011','000001111000011','000011111100100','000111111111000','000110011110000','001100001110000','011100001110000','011100001100000','111111111100000','111111111100000','011111111000000','011111111000000','001111111000000','000111110000000','000000000000000'] },
    { id: 'hard_panda', nameRu: 'Панда', nameEn: 'Panda', baseRows: ['000100000000100','011111111111111','111111111111111','111111111111111','011111111111111','011000111000111','011000111000111','011111111111111','011111000111111','001111111111110','001111111111110','000111111111100','000001111110000','000000000000000','000000000000000'] },
    { id: 'hard_dog', nameRu: 'Пёс', nameEn: 'Dog', baseRows: ['001101111110010','011111111111111','011111111111111','011111111111111','111111011011111','011111011011111','011111111111111','011111111111110','001111111111110','000111111111100','000011111111000','000001111110000','000000000000000','000000000000000','000000000000000'] },
  ],
  epic: [
    { id: 'epic_dragon', nameRu: 'Дракон', nameEn: 'Dragon', baseRows: ['000000000001110','000000000011110','000110000111111','000111100111111','000111111111110','001111111111000','111111111111100','111111111111100','111111111111000','110011111111000','000001111011000','000000011001000','000000000000000','000000000000000','000000000000000'] },
    { id: 'epic_camera', nameRu: 'Камера', nameEn: 'Camera', baseRows: ['000111111000000','001111111011100','111111111111111','111100000111111','111001110011111','111001010011111','111001110011111','111100000111111','111111111111111','111111111111111','000000000000000','000000000000000','000000000000000','000000000000000','000000000000000'] },
    { id: 'epic_wizard', nameRu: 'Волшебник', nameEn: 'Wizard', baseRows: ['000000010000111','000000111001111','000001111101111','000011111100110','000111111000110','111111111111110','001111111100110','001111111110110','000111111100110','000011111000110','000011111000110','000001111000110','000001111000110','000000000000000','000000000000000'] },
    { id: 'epic_rocket', nameRu: 'Ракета', nameEn: 'Rocket', baseRows: ['000000010000000','000000111000000','000001111100000','000011111110000','000011111110000','000011111110000','000011111110000','000011111110000','111111111111111','111111111111111','111110111011111','000001111100000','000011111110000','000000000000000','000000000000000'] },
    { id: 'epic_plant', nameRu: 'Росток', nameEn: 'Sprout', baseRows: ['000110000000000','001111000000000','011111001111000','111111111111100','011111111111110','000001111111110','000001000000000','000001000000000','001111111100000','001111111100000','001111111100000','000000000000000','000000000000000','000000000000000','000000000000000'] },
    { id: 'epic_sailboat', nameRu: 'Парусник', nameEn: 'Sailboat', baseRows: ['000000010000000','000000011000000','000000111100000','000001111110000','000011111111000','000111111111100','001111111111110','000000111111111','000000010000000','111111111111100','001111111111000','000000000000000','000000000000000','000000000000000','000000000000000'] },
    { id: 'epic_owl', nameRu: 'Сова', nameEn: 'Owl', baseRows: ['001100000001100','011111111111110','111111111111111','111000111000111','110000010000011','111000000000111','111100000001111','011100000001110','011110000011110','001111000111100','000111111111000','000011111110000','000000000000000','000000000000000','000000000000000'] },
    { id: 'epic_airship', nameRu: 'Дирижабль', nameEn: 'Airship', baseRows: ['000001111100000','000111111111000','001111111111100','111111111111110','111111111111111','111111111111111','111111111111111','001111111111110','111111111111100','111110001000000','000000001000000','000000001000000','000000000000000','000000000000000','000000000000000'] },
  ],
  abyss: [
    { id: 'abyss_dragon', nameRu: 'Дракон', nameEn: 'Dragon', baseRows: ['000000000001110','000000000011110','000110000111111','000111100111111','000111111111110','001111111111000','111111111111100','111111111111100','111111111111000','110011111111000','000001111011000','000000011001000','000000111000000','000001101100000','000011000110000'] },
    { id: 'abyss_owl', nameRu: 'Сова', nameEn: 'Owl', baseRows: ['001100000001100','011111111111110','111111111111111','111000111000111','110000010000011','111000000000111','111100000001111','011100000001110','011110000011110','001111000111100','000111111111000','000011111110000','000001111100000','000001000100000','000011000110000'] },
    { id: 'abyss_mecha', nameRu: 'Мех', nameEn: 'Mech', baseRows: ['000011111110000','000010011010000','000011111110000','001111111111100','011101111101110','111101111101111','111111111111111','000111111111000','000111111111000','000011111110000','000001100110000','000011000011000','000110000001100','001100000000110','000000000000000'] },
    { id: 'abyss_castle', nameRu: 'Крепость', nameEn: 'Fortress', baseRows: ['101010101010101','111111111111111','111111111111111','011101110111010','011101110111010','011111111111010','011111111111010','011110000111010','011110000111010','011110000111010','011111111111010','011111111111010','111111111111111','111111111111111','000000000000000'] },
    { id: 'abyss_wizard', nameRu: 'Маг', nameEn: 'Wizard', baseRows: ['000000010000111','000000111001111','000001111101111','000011111100110','000111111000110','111111111111110','001111111100110','001111111110110','000111111100110','000011111000110','000011111000110','000001111000110','000001111000110','000001101100000','000011000110000'] },
    { id: 'abyss_submarine', nameRu: 'Подлодка', nameEn: 'Submarine', baseRows: ['000000000111000','000000000100000','000000111110000','000011111111100','111111111111110','111111111111111','111110011011111','111110011011111','111111111111111','111111111111110','000011111111100','000001111111000','000000111100000','000000000000000','000000000000000'] },
    { id: 'abyss_guitar', nameRu: 'Гитара', nameEn: 'Guitar', baseRows: ['000000000000011','000001111000011','000011111100100','000111111111000','000110011110000','001100001110000','011100001110000','011100001100000','111111111100000','111111111100000','011111111000000','011111111000000','001111111000000','000111110000000','000011000000000'] },
    { id: 'abyss_lighthouse', nameRu: 'Маяк', nameEn: 'Lighthouse', baseRows: ['000011111110000','111111111110000','000011111111111','000011111111111','000000111000000','000000111000000','000000111100000','000000111100000','000001111100000','000001111100000','000001111100000','000111111111000','001111111111100','011111111111110','000000000000000'] },
    { id: 'abyss_airship', nameRu: 'Дирижабль', nameEn: 'Airship', baseRows: ['000001111100000','000111111111000','001111111111100','111111111111110','111111111111111','111111111111111','111111111111111','001111111111110','111111111111100','111110001000000','000000001000000','000000001000000','000000111000000','000001111100000','000000000000000'] },
    { id: 'abyss_phoenix', nameRu: 'Феникс', nameEn: 'Phoenix', baseRows: ['000000111000000','000001111100000','000011111110000','001111111111100','111111111111111','011111111111110','000111111111000','000000111000000','000000111000000','000000111000000','000001111100000','000011111110000','000111111111000','001100111001100','000000000000000'] },
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
    freeModeMetaOpen: 'Открывай оставшиеся рисунки этого уровня',
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
    winText: (name, reward) => reward > 0 ? `Это «${name}». Победа засчитана, награда: ${reward} монет.` : `Это «${name}». Свободный режим: награда и прогресс не начисляются.`,
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
    galleryText: 'Прогресс по каждому уровню: открытые картинки показаны, закрытые скрыты карточками.',
    galleryEmpty: 'Пока нет открытых картинок на этом уровне.',
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
    freeModeMetaOpen: 'Open the remaining pictures on this level',
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
    winText: (name, reward) => reward > 0 ? `This is “${name}”. Win recorded, reward: ${reward} coins.` : `This is “${name}”. Free mode: no extra reward or progress.`,
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
    galleryText: 'Progress by level: solved pictures are shown, locked cards stay hidden.',
    galleryEmpty: 'No finished pictures on this level yet.',
  },
};

function normalizeLang(value) {
  return String(value || '').toLowerCase().startsWith('en') ? 'en' : 'ru';
}

function hasExplicitLanguageOverride() {
  return new URLSearchParams(window.location.search).has('lang');
}

function detectInitialLang() {
  const params = new URLSearchParams(window.location.search);
  return normalizeLang(
    params.get('lang')
    || localStorage.getItem(STORAGE_KEYS.lang)
    || document.documentElement.lang
    || navigator.language
    || 'ru'
  );
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

function scaleRows(rows, targetSize) {
  const source = rowsToMatrix(rows);
  const filled = [];

  source.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) filled.push([r, c]);
    });
  });

  if (!filled.length) return rows;

  const minR = Math.min(...filled.map(([r]) => r));
  const maxR = Math.max(...filled.map(([r]) => r));
  const minC = Math.min(...filled.map(([, c]) => c));
  const maxC = Math.max(...filled.map(([, c]) => c));
  const trimmed = source.slice(minR, maxR + 1).map((row) => row.slice(minC, maxC + 1));
  const sourceH = trimmed.length;
  const sourceW = trimmed[0].length;

  return Array.from({ length: targetSize }, (_, r) => {
    const sr = Math.min(sourceH - 1, Math.floor((r * sourceH) / targetSize));
    return Array.from({ length: targetSize }, (_, c) => {
      const sc = Math.min(sourceW - 1, Math.floor((c * sourceW) / targetSize));
      return trimmed[sr][sc] ? '1' : '0';
    }).join('');
  });
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

    lighthouse: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const tower = abs(nx) < 0.22 + Math.max(0, ny) * 0.12 && ny > -0.58 && ny < 0.88;
      const light = ny < -0.5 && abs(nx) < 0.52;
      const roof = ny < -0.72 && abs(nx) < (ny + 0.94) * 2.2;
      const beam = ny > -0.56 && ny < -0.12 && nx > 0.18 && nx < 0.92 && abs(ny + 0.34) < (nx - 0.08) * 0.22;
      const window = abs(nx) < 0.08 && ny > -0.12 && ny < 0.15;
      const base = ny > 0.7 && abs(nx) < 0.48;
      return (tower || light || roof || beam || base) && !window;
    }),
    mushroom: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const cap = (nx * nx) / 0.74 + ((ny + 0.35) * (ny + 0.35)) / 0.32 < 1 && ny < 0.05;
      const under = ny > -0.08 && ny < 0.18 && abs(nx) < 0.54;
      const stem = abs(nx) < 0.22 + Math.max(0, ny) * 0.10 && ny > 0.05 && ny < 0.82;
      const spot1 = ((nx + 0.34) ** 2) / 0.025 + ((ny + 0.42) ** 2) / 0.035 < 1;
      const spot2 = ((nx - 0.22) ** 2) / 0.03 + ((ny + 0.52) ** 2) / 0.03 < 1;
      const spot3 = (nx * nx) / 0.025 + ((ny + 0.25) ** 2) / 0.025 < 1;
      return (cap || under || stem) && !(spot1 || spot2 || spot3);
    }),
    guitar: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body1 = ((nx + 0.28) ** 2) / 0.32 + ((ny - 0.28) ** 2) / 0.28 < 1;
      const body2 = ((nx - 0.02) ** 2) / 0.23 + ((ny + 0.03) ** 2) / 0.20 < 1;
      const hole = ((nx - 0.03) ** 2) / 0.035 + ((ny + 0.02) ** 2) / 0.035 < 1;
      const neck = abs((ny + 0.48) - (nx - 0.1) * 0.55) < 0.08 && nx > 0.12 && nx < 0.82 && ny < -0.08;
      const head = nx > 0.68 && nx < 0.95 && ny < -0.55 && ny > -0.86;
      return (body1 || body2 || neck || head) && !hole;
    }),
    wizard: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const hat = ny < -0.35 && abs(nx + 0.12) < (ny + 1.02) * 0.42;
      const brim = ny > -0.42 && ny < -0.28 && abs(nx) < 0.62;
      const robe = ny > -0.2 && ny < 0.85 && abs(nx) < 0.24 + (ny + 0.2) * 0.42;
      const staff = abs(nx - 0.72) < 0.05 && ny > -0.74 && ny < 0.84;
      const star = abs(nx - 0.72) + abs(ny + 0.82) < 0.18;
      const face = abs(nx + 0.04) < 0.16 && ny > -0.18 && ny < 0.05;
      return (hat || brim || robe || staff || star) && !face;
    }),
    airship: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const hull = ((nx + 0.05) ** 2) / 0.92 + ((ny + 0.18) ** 2) / 0.28 < 1;
      const tail = nx < -0.72 && abs(ny + 0.16) < 0.28 + (nx + 0.72) * 0.5;
      const cabin = ny > 0.18 && ny < 0.42 && nx > -0.2 && nx < 0.38;
      const ropes = ny > 0.06 && ny < 0.28 && (abs(nx + 0.32) < 0.04 || abs(nx - 0.12) < 0.04 || abs(nx - 0.48) < 0.04);
      return hull || tail || cabin || ropes;
    }),
    submarine: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const body = (nx * nx) / 0.88 + ((ny - 0.08) ** 2) / 0.28 < 1;
      const tail = nx < -0.7 && abs(ny - 0.08) < 0.22 + (-nx - 0.7) * 0.9;
      const tower = nx > -0.1 && nx < 0.28 && ny > -0.45 && ny < -0.18;
      const periscope = nx > 0.08 && nx < 0.20 && ny > -0.72 && ny < -0.44;
      const eye1 = ((nx - 0.36) ** 2) / 0.025 + ((ny + 0.02) ** 2) / 0.025 < 1;
      const eye2 = ((nx - 0.02) ** 2) / 0.025 + ((ny + 0.02) ** 2) / 0.025 < 1;
      return (body || tail || tower || periscope) && !(eye1 || eye2);
    }),
    mecha: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const head = abs(nx) < 0.36 && ny > -0.78 && ny < -0.42;
      const body = abs(nx) < 0.52 && ny > -0.34 && ny < 0.32;
      const shoulders = ny > -0.28 && ny < -0.02 && abs(nx) < 0.78;
      const arms = ny > 0.0 && ny < 0.5 && abs(nx) > 0.52 && abs(nx) < 0.82;
      const legs = ny > 0.3 && ny < 0.9 && (abs(nx + 0.24) < 0.14 || abs(nx - 0.24) < 0.14);
      const visor = ny > -0.64 && ny < -0.55 && abs(nx) < 0.22;
      return (head || body || shoulders || arms || legs) && !visor;
    }),
    city: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const ground = ny > 0.78;
      const b1 = nx > -0.95 && nx < -0.62 && ny > -0.2;
      const b2 = nx > -0.58 && nx < -0.24 && ny > -0.62;
      const b3 = nx > -0.18 && nx < 0.18 && ny > -0.38;
      const b4 = nx > 0.24 && nx < 0.58 && ny > -0.72;
      const b5 = nx > 0.64 && nx < 0.94 && ny > -0.05;
      const windows = ((Math.floor((nx + 1) * size * 0.45) + Math.floor((ny + 1) * size * 0.45)) % 3 === 0) && ny > -0.6 && ny < 0.65;
      return (ground || b1 || b2 || b3 || b4 || b5) && !windows;
    }),
    train: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const engine = nx > -0.78 && nx < 0.78 && ny > -0.28 && ny < 0.42;
      const cabin = nx > 0.25 && nx < 0.68 && ny > -0.62 && ny < -0.24;
      const chimney = nx > -0.58 && nx < -0.42 && ny > -0.62 && ny < -0.28;
      const front = nx > 0.72 && nx < 0.95 && ny > -0.08 && ny < 0.42;
      const wheels = ny > 0.46 && ny < 0.78 && (abs(nx + 0.5) < 0.18 || abs(nx) < 0.18 || abs(nx - 0.5) < 0.18);
      const windows = ny > -0.12 && ny < 0.12 && (abs(nx + 0.24) < 0.08 || abs(nx - 0.05) < 0.08 || abs(nx - 0.36) < 0.08);
      return (engine || cabin || chimney || front || wheels) && !windows;
    }),
    plane: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const fuselage = abs(ny) < 0.12 && nx > -0.82 && nx < 0.78;
      const nose = nx > 0.68 && abs(ny) < (0.95 - nx) * 0.8;
      const tail = nx < -0.62 && abs(ny) < 0.28;
      const wing1 = ny < 0 && ny > -0.72 && nx > -0.26 && nx < 0.28 && abs(ny) < (0.38 - nx) * 0.9;
      const wing2 = ny > 0 && ny < 0.72 && nx > -0.3 && nx < 0.22 && ny < (0.34 - nx) * 0.75;
      return fuselage || nose || tail || wing1 || wing2;
    }),
    fortress: () => makeMatrix(size, (r, c) => {
      const nx = x(c); const ny = y(r);
      const wall = ny > -0.02 && ny < 0.84 && abs(nx) < 0.88;
      const towers = ny > -0.58 && ny < 0.84 && (abs(nx + 0.64) < 0.20 || abs(nx) < 0.20 || abs(nx - 0.64) < 0.20);
      const battlements = ny > -0.7 && ny < -0.5 && (Math.floor((nx + 1) * 7) % 2 === 0);
      const gate = ny > 0.42 && abs(nx) < 0.15;
      const slit = ny > -0.18 && ny < 0.05 && (abs(nx + 0.62) < 0.04 || abs(nx) < 0.04 || abs(nx - 0.62) < 0.04);
      return (wall || towers || battlements) && !gate && !slit;
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

function fitMatrixToCanvas(matrix, targetSize, padding = 0) {
  const filled = [];
  matrix.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell) filled.push([r, c]);
    });
  });

  if (!filled.length) return matrix;

  const minR = Math.min(...filled.map(([r]) => r));
  const maxR = Math.max(...filled.map(([r]) => r));
  const minC = Math.min(...filled.map(([, c]) => c));
  const maxC = Math.max(...filled.map(([, c]) => c));
  const trimmed = matrix.slice(minR, maxR + 1).map((row) => row.slice(minC, maxC + 1));
  const sourceH = trimmed.length;
  const sourceW = trimmed[0].length;
  const inner = Math.max(1, targetSize - padding * 2);

  return Array.from({ length: targetSize }, (_, r) => (
    Array.from({ length: targetSize }, (_, c) => {
      if (r < padding || c < padding || r >= targetSize - padding || c >= targetSize - padding) return false;
      const rr = r - padding;
      const cc = c - padding;
      const sr = Math.min(sourceH - 1, Math.floor((rr * sourceH) / inner));
      const sc = Math.min(sourceW - 1, Math.floor((cc * sourceW) / inner));
      return Boolean(trimmed[sr][sc]);
    })
  ));
}

function getSolution(puzzle, size) {
  if (puzzle.rows) return rowsToMatrix(puzzle.rows);
  const padding = size >= 20 ? 0 : size >= 15 ? 1 : 0;
  if (puzzle.baseRows) return fitMatrixToCanvas(rowsToMatrix(puzzle.baseRows), size, 0);
  return fitMatrixToCanvas(drawByName(puzzle.draw, size), size, padding);
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

function getFixedClueSlots(size) {
  if (size <= 5) return 2;
  if (size <= 10) return 3;
  if (size <= 15) return 4;
  return 5;
}

function pickPuzzle(diffId, exceptIndex = -1, solvedIds = []) {
  const list = PUZZLES[diffId];
  if (!list || !list.length) return { puzzle: PUZZLES.easy[0], index: 0 };

  const solvedSet = new Set(solvedIds || []);
  let candidates = list.map((item, index) => ({ item, index }));

  const freshCandidates = candidates.filter(({ item }) => !solvedSet.has(item.id));
  if (freshCandidates.length) candidates = freshCandidates;

  if (candidates.length > 1 && exceptIndex >= 0) {
    const withoutCurrent = candidates.filter(({ index }) => index !== exceptIndex);
    if (withoutCurrent.length) candidates = withoutCurrent;
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)] || { item: list[0], index: 0 };
  return { puzzle: selected.item, index: selected.index };
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

  const shouldIgnoreTarget = (target) => !!target.closest?.('.modal, .overlay, input, textarea, select, button, .gallery-grid');

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
    if (document.body.dataset.nonogramPainting === 'true') return;

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
  const [lang, setLang] = useState(() => detectInitialLang());
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'dark');
  const [coins, setCoins] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.coins) || START_COINS));
  const [progress, setProgress] = useState(initialProgress);
  const [solvedPictures, setSolvedPictures] = useState(() => getLocalJson(STORAGE_KEYS.solvedPictures, {}));
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
  const [clueToken, setClueToken] = useState(18);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastReward, setLastReward] = useState(0);

  const stageRef = useRef(null);
  const suppressClickRef = useRef(0);
  const saveTimerRef = useRef(null);
  const notificationTimerRef = useRef(null);
  const dragRef = useRef({ active: false, target: 'filled', pointerId: null, touched: new Set(), axis: null });
  const winLockRef = useRef(false);

  const t = I18N[lang];
  const difficulty = DIFFICULTIES[difficultyIndex];
  const puzzle = PUZZLES[difficulty.id][puzzleIndex] || PUZZLES[difficulty.id][0];
  const puzzleName = getPuzzleName(puzzle, lang);
  const solution = useMemo(() => getSolution(puzzle, difficulty.size), [puzzle, difficulty.size]);
  const { rowClues, colClues } = useMemo(() => buildClues(solution), [solution]);
  const rowClueDepth = useMemo(() => Math.max(
    getFixedClueSlots(difficulty.size),
    ...rowClues.map((clue) => clue.length),
  ), [difficulty.size, rowClues]);
  const colClueDepth = useMemo(() => Math.max(
    getFixedClueSlots(difficulty.size),
    ...colClues.map((clue) => clue.length),
  ), [colClues, difficulty.size]);
  const remaining = useMemo(() => countRemaining(marks, solution), [marks, solution]);
  const timeText = formatTime(elapsed);
  const freeUnlocked = isFreeModeUnlocked(difficulty.id, progress);
  const hintIsPaid = Boolean(hintUsed || difficulty.hardcore);

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
      solvedPictures: next.solvedPictures ?? solvedPictures,
    };

    localStorage.setItem(STORAGE_KEYS.coins, String(payload.coins));
    setLocalJson(STORAGE_KEYS.progress, payload.progress);
    localStorage.setItem(STORAGE_KEYS.theme, payload.theme);
    localStorage.setItem(STORAGE_KEYS.lang, payload.lang);
    setLocalJson(STORAGE_KEYS.solvedPictures, payload.solvedPictures);

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      window.YandexStorage?.saveGameState?.(payload);
    }, 250);
  }, [coins, progress, theme, lang, solvedPictures]);

  const resetGame = useCallback((nextDifficultyIndex = difficultyIndex, keepPuzzleIndex = false, options = {}) => {
    const nextDifficulty = DIFFICULTIES[nextDifficultyIndex];
    const unlockedFreeMode = isFreeModeUnlocked(nextDifficulty.id, progress);
    const nextFreeMode = unlockedFreeMode ? true : Boolean(options.freeMode ?? freeMode);
    const solvedIds = solvedPictures[nextDifficulty.id] || [];
    const picked = keepPuzzleIndex
      ? { index: puzzleIndex }
      : pickPuzzle(
        nextDifficulty.id,
        nextDifficultyIndex === difficultyIndex ? puzzleIndex : -1,
        solvedIds,
      );
    const nextPuzzle = PUZZLES[nextDifficulty.id][picked.index] || PUZZLES[nextDifficulty.id][0];
    const nextSolution = getSolution(nextPuzzle, nextDifficulty.size);

    setDifficultyIndex(nextDifficultyIndex);
    setPuzzleIndex(picked.index);
    setMarks(nextDifficulty.starterCrosses && !nextFreeMode ? starterMarksFor(nextSolution) : makeEmptyMarks(nextDifficulty.size));
    setLives(nextDifficulty.lives);
    setSelectedCell(null);
    setElapsed(0);
    setTimerActive(false);
    setIsPaused(false);
    setModal(null);
    setHintUsed(false);
    setIsCompleting(false);
    setLastReward(0);
    winLockRef.current = false;
    dragRef.current = { active: false, target: 'filled', pointerId: null, touched: new Set(), axis: null };
  }, [difficultyIndex, freeMode, progress, puzzleIndex, solvedPictures]);

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
    setLives(difficulty.lives);
    setMarks(revealPictureMarks(solution));

    const alreadySolved = (solvedPictures[difficulty.id] || []).includes(puzzle.id);
    const nextSolvedPictures = {
      ...solvedPictures,
      [difficulty.id]: Array.from(new Set([...(solvedPictures[difficulty.id] || []), puzzle.id])),
    };
    setSolvedPictures(nextSolvedPictures);

    if (alreadySolved || freeMode) {
      setLastReward(0);
      syncSave({ solvedPictures: nextSolvedPictures });
    } else {
      setLastReward(difficulty.reward);
      setProgress((prev) => {
        const next = { ...prev, [difficulty.id]: (prev[difficulty.id] || 0) + 1 };
        setCoins((coinValue) => {
          const nextCoins = coinValue + difficulty.reward;
          syncSave({ coins: nextCoins, progress: next, solvedPictures: nextSolvedPictures });
          return nextCoins;
        });
        return next;
      });
    }

    window.setTimeout(() => {
      setModal('win');
    }, 950);
  }, [difficulty.id, difficulty.reward, freeMode, puzzle.id, solution, solvedPictures, stopGameplay, syncSave]);

  const checkWinAfterMove = useCallback((nextMarks) => {
    if (isSolved(nextMarks, solution)) {
      window.setTimeout(finishWin, 40);
      return true;
    }
    return false;
  }, [finishWin, solution]);

  const applyCell = useCallback((row, col, targetOverride = null, options = {}) => {
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

      if (options.fromDrag) {
        if (target === 'filled' && current === 'cross') return prev;
        if (target === 'cross' && current === 'filled') return prev;
      }

      if (target === 'empty') {
        if (options.fromDrag && current !== dragRef.current.sourceMark) return prev;
        next[row][col] = 'empty';
        return next;
      }

      if (target === 'cross') {
        next[row][col] = 'cross';
        return next;
      }

      if (!solution[row][col] && current !== 'filled') {
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
  }, [checkWinAfterMove, isCompleting, isPaused, lives, modal, showNotification, solution, startGameplay, stopGameplay, t.wrongCell, tool]);

  const startDragPainting = useCallback((drag, event = null) => {
    if (!drag || drag.started || drag.cancelled) return false;
    drag.started = true;
    document.body.dataset.nonogramPainting = 'true';
    if (event?.currentTarget && drag.pointerType !== 'touch') {
      event.currentTarget.setPointerCapture?.(drag.pointerId);
    }
    applyCell(drag.startRow, drag.startCol, drag.target, { fromDrag: false });
    if (event?.cancelable) event.preventDefault();
    return true;
  }, [applyCell]);

  const handlePointerDown = useCallback((event, row, col, currentMark) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const target = tool === 'cross'
      ? (currentMark === 'filled' ? 'empty' : currentMark === 'cross' ? 'empty' : 'cross')
      : (currentMark === 'cross' ? 'empty' : currentMark === 'filled' ? 'empty' : 'filled');

    const drag = {
      active: true,
      started: false,
      cancelled: false,
      target,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startRow: row,
      startCol: col,
      lastRow: row,
      lastCol: col,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
      sourceMark: currentMark,
      touched: new Set([`${row}:${col}`]),
      holdTimer: null,
    };

    dragRef.current = drag;

    if (event.pointerType === 'mouse') {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      startDragPainting(drag, event);
      return;
    }

    // На телефоне не включаем рисование мгновенно: быстрый вертикальный свайп
    // должен скроллить страницу, а вертикальное рисование запускается после короткого удержания.
    drag.holdTimer = window.setTimeout(() => {
      if (dragRef.current === drag && drag.active && !drag.cancelled) {
        startDragPainting(drag);
      }
    }, 85);
  }, [startDragPainting, tool]);

  const applyDragPath = useCallback((row, col, event = null) => {
    const drag = dragRef.current;
    if (!drag.active || drag.cancelled) return;

    if (!drag.started) {
      const dx = (event?.clientX ?? drag.startX) - drag.startX;
      const dy = (event?.clientY ?? drag.startY) - drag.startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (drag.pointerType === 'touch') {
        if (absY > 8 && absY > absX * 1.18) {
          window.clearTimeout(drag.holdTimer);
          drag.cancelled = true;
          drag.active = false;
          delete document.body.dataset.nonogramPainting;
          return;
        }
        if (absX > 5 && absX > absY * 1.05) {
          drag.axis = 'horizontal';
          window.clearTimeout(drag.holdTimer);
          startDragPainting(drag, event);
        } else {
          return;
        }
      } else {
        startDragPainting(drag, event);
      }
    }

    let axis = drag.axis;
    if (!axis && (row !== drag.startRow || col !== drag.startCol)) {
      const dRow = Math.abs(row - drag.startRow);
      const dCol = Math.abs(col - drag.startCol);
      axis = dRow >= dCol ? 'vertical' : 'horizontal';
      drag.axis = axis;
    }

    if (axis === 'vertical') col = drag.startCol;
    if (axis === 'horizontal') row = drag.startRow;

    const fromRow = drag.lastRow;
    const fromCol = drag.lastCol;
    const stepR = Math.sign(row - fromRow);
    const stepC = Math.sign(col - fromCol);
    const steps = Math.max(Math.abs(row - fromRow), Math.abs(col - fromCol));

    for (let i = 1; i <= steps; i += 1) {
      const nextRow = fromRow + stepR * i;
      const nextCol = fromCol + stepC * i;
      const key = `${nextRow}:${nextCol}`;
      if (drag.touched.has(key)) continue;
      drag.touched.add(key);
      applyCell(nextRow, nextCol, drag.target, { fromDrag: true });
    }

    drag.lastRow = row;
    drag.lastCol = col;
    if (event?.cancelable) event.preventDefault();
  }, [applyCell, startDragPainting]);

  const handlePointerEnter = useCallback((event, row, col) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    applyDragPath(row, col, event);
  }, [applyDragPath]);

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    if (!drag.started) {
      applyDragPath(drag.startRow, drag.startCol, event);
      return;
    }

    const element = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.nono-cell');
    if (!element) return;

    const row = Number(element.dataset.row);
    const col = Number(element.dataset.col);
    if (!Number.isInteger(row) || !Number.isInteger(col)) return;

    applyDragPath(row, col, event);
  }, [applyDragPath]);

  const handlePointerUp = useCallback((event = null) => {
    const drag = dragRef.current;
    if (drag?.holdTimer) window.clearTimeout(drag.holdTimer);

    if (drag?.active && !drag.started && !drag.cancelled) {
      applyCell(drag.startRow, drag.startCol, drag.target, { fromDrag: false });
      if (event?.cancelable) event.preventDefault();
    }

    delete document.body.dataset.nonogramPainting;
    dragRef.current = { active: false, target: 'filled', pointerId: null, touched: new Set(), axis: null };
  }, [applyCell]);

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

    const paidHint = Boolean(hintUsed || difficulty.hardcore);

    if (paidHint && coins < HINT_PRICE) {
      showNotification(t.notEnoughCoins);
      return;
    }

    const [r, c] = hidden[Math.floor(Math.random() * hidden.length)];
    const nextCoins = paidHint ? coins - HINT_PRICE : coins;
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
  }, [checkWinAfterMove, coins, difficulty.hardcore, hintUsed, isCompleting, isPaused, marks, modal, showNotification, solution, startGameplay, syncSave, t.noHints, t.notEnoughCoins]);

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
    if (!freeMode) {
      setFreeMode(true);
      resetGame(difficultyIndex, false, { freeMode: true });
    }
  }, [difficulty, difficultyIndex, freeMode, isCompleting, isPaused, lang, modal, progress, resetGame, showNotification, t]);

  const selectDifficulty = useCallback((index) => {
    if (isPaused || modal || isCompleting) return;
    if (!isDifficultyUnlocked(index, progress)) return;
    const nextDifficulty = DIFFICULTIES[index];
    const nextFreeMode = isFreeModeUnlocked(nextDifficulty.id, progress);
    setFreeMode(nextFreeMode);
    resetGame(index, false, { freeMode: nextFreeMode });
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

      const params = new URLSearchParams(window.location.search);
      const explicitLang = hasExplicitLanguageOverride();
      const sdkLang = window.YandexStorage?.getLanguage?.();
      const defaultLang = detectInitialLang();
      const defaultState = {
        coins: Number(localStorage.getItem(STORAGE_KEYS.coins) || START_COINS),
        progress: getLocalJson(STORAGE_KEYS.progress, {}),
        theme: localStorage.getItem(STORAGE_KEYS.theme) || 'dark',
        lang: defaultLang,
        solvedPictures: getLocalJson(STORAGE_KEYS.solvedPictures, {}),
      };
      const loaded = await window.YandexStorage?.loadGameState?.(defaultState) || defaultState;

      if (cancelled) return;
      setCoins(loaded.coins);
      setProgress(loaded.progress || {});
      setSolvedPictures(loaded.solvedPictures || {});
      setTheme(loaded.theme || 'dark');
      setLang(explicitLang ? normalizeLang(params.get('lang')) : normalizeLang(sdkLang || defaultLang || 'ru'));
      setHydrated(true);

      window.requestAnimationFrame(() => {
        window.YandexStorage?.ready?.();
      });
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (hydrated && freeUnlocked && !freeMode && !isCompleting && !modal) {
      setFreeMode(true);
      resetGame(difficultyIndex, false, { freeMode: true });
    }
  }, [difficultyIndex, freeMode, freeUnlocked, hydrated, isCompleting, modal, resetGame]);

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
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

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
  }, [coins, progress, theme, lang, solvedPictures, hydrated]);

  useLayoutEffect(() => {
    if (!hydrated) return undefined;
    let rafId = 0;
    const timers = [];

    const recalc = () => {
      const stage = stageRef.current;
      if (!stage) return;

      const size = difficulty.size;
      const stageRect = stage.getBoundingClientRect();
      const style = window.getComputedStyle(stage);
      const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const isPhoneLayout = window.innerWidth <= 900;
      const isDesktopLayout = window.innerWidth > 1180;
      const availableWidth = Math.max(
        220,
        Math.floor((stage.clientWidth || stageRect.width || window.innerWidth) - padX),
      );

      // 0.0.11: поле считается и по ширине, и по высоте. На телефоне оно
      // стремится к краям, а на ПК не раздувается так, чтобы приходилось
      // скроллить страницу ради кнопок и боковых панелей.
      const nextToken = size >= 15 ? (isPhoneLayout ? 11 : 13)
        : size >= 10 ? (isPhoneLayout ? 14 : 16)
          : (isPhoneLayout ? 18 : 20);

      const minClueWidth = size >= 15 ? (isPhoneLayout ? 46 : 52)
        : size >= 10 ? 54
          : 58;

      const nextClueWidth = Math.max(
        minClueWidth,
        rowClueDepth * nextToken + (isPhoneLayout ? 6 : 9),
      );

      const stageGap = size >= 15 ? 2 : 3;
      const maxByWidth = Math.floor((availableWidth - nextClueWidth - stageGap) / size);

      let maxByHeight = Number.POSITIVE_INFINITY;
      if (isDesktopLayout) {
        const app = document.querySelector('.app');
        const topbar = document.querySelector('.topbar');
        const modeRow = document.querySelector('.mode-row');
        const boardHead = document.querySelector('.board-head');
        const numberPad = document.querySelector('.number-pad');
        const appStyle = app ? window.getComputedStyle(app) : null;
        const appPadY = appStyle
          ? (parseFloat(appStyle.paddingTop) || 0) + (parseFloat(appStyle.paddingBottom) || 0)
          : 36;
        const topbarH = topbar?.getBoundingClientRect().height || 0;
        const modeH = modeRow?.getBoundingClientRect().height || 0;
        const headH = boardHead?.getBoundingClientRect().height || 0;
        const padH = numberPad?.getBoundingClientRect().height || 0;
        const centerGaps = 52;
        const platformReserve = window.innerHeight < 900 ? 34 : 18;
        const availableHeight = Math.max(
          180,
          window.innerHeight - appPadY - topbarH - modeH - headH - padH - centerGaps - platformReserve,
        );
        const topCluesHeight = colClueDepth * nextToken + 12;
        maxByHeight = Math.floor((availableHeight - topCluesHeight - stageGap) / size);
      }

      const hardMin = size <= 5 ? 34 : size <= 10 ? 22 : 14;
      const softMax = size <= 5 ? (isDesktopLayout ? 104 : 96)
        : size <= 10 ? (isDesktopLayout ? 62 : 58)
          : (isDesktopLayout ? 44 : 42);
      const nextCell = Math.max(hardMin, Math.min(softMax, maxByWidth, maxByHeight));

      setClueToken(nextToken);
      setClueWidth(nextClueWidth);
      setCellSize(nextCell);
    };

    const scheduleRecalc = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(recalc);
    };

    scheduleRecalc();
    timers.push(window.setTimeout(scheduleRecalc, 60));
    timers.push(window.setTimeout(scheduleRecalc, 180));
    timers.push(window.setTimeout(scheduleRecalc, 420));
    timers.push(window.setTimeout(scheduleRecalc, 900));

    const observer = new ResizeObserver(scheduleRecalc);
    if (stageRef.current) observer.observe(stageRef.current);
    const center = document.querySelector('.center');
    const shell = document.querySelector('.game-shell');
    if (center) observer.observe(center);
    if (shell) observer.observe(shell);
    window.addEventListener('resize', scheduleRecalc);
    window.addEventListener('orientationchange', scheduleRecalc);

    return () => {
      window.cancelAnimationFrame(rafId);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.removeEventListener('resize', scheduleRecalc);
      window.removeEventListener('orientationchange', scheduleRecalc);
    };
  }, [hydrated, difficultyIndex, difficulty.size, puzzleIndex, rowClueDepth, colClueDepth, freeMode]);

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    if (notificationTimerRef.current) window.clearTimeout(notificationTimerRef.current);
  }, []);

  const canGoNext = difficultyIndex < DIFFICULTIES.length - 1 && isDifficultyUnlocked(difficultyIndex + 1, progress);

  const closeModalByBackdrop = () => {
    if (!modal) return;
    if (modal === 'rules' || modal === 'gallery') {
      setModal(null);
      return;
    }
    if (modal === 'pause') {
      togglePause();
      return;
    }
    if (modal === 'surrender') {
      resetGame(difficultyIndex, false);
      return;
    }
    if (modal === 'gameOver') {
      resetGame(difficultyIndex, false);
      return;
    }
    if (modal === 'win') {
      if (canGoNext) nextLevel();
      else resetGame(difficultyIndex, false);
    }
  };

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
                <span className="stat-label">{t.lives}</span>
                <span className="stat-value lives">{'❤ '.repeat(lives).trim() || '0'}</span>
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
                disabled={isPaused || isCompleting || freeUnlocked}
                onClick={toggleFreeMode}
              >
                <span className="endless-icon" aria-hidden="true">∞</span>
                <span className="endless-copy">
                  <span className="endless-title">{t.freeMode}</span>
                  <span className="endless-meta">{freeUnlocked ? t.freeModeMetaOpen : t.freeModeMetaLocked}</span>
                </span>
                <span className="endless-badge">{freeUnlocked ? t.enabled : t.locked}</span>
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
              <div className="hint-meta"><span>{t.cellsLeft(remaining)}</span><span>{hintIsPaid ? t.hintStatePaid : t.hintStateFree}</span></div>
            </div>

            <div className="board-wrap nonogram-wrap" ref={stageRef}>
              <div className="nonogram-stage" style={{ '--cell': `${cellSize}px`, '--clueW': `${clueWidth}px`, '--rowSlots': rowClueDepth, '--colSlots': colClueDepth, '--clueToken': `${clueToken}px` }}>
                <div className="clue-corner" aria-hidden="true" />
                <div className="col-clues" style={{ gridTemplateColumns: `repeat(${difficulty.size}, var(--cell))` }}>
                  {colClues.map((clue, col) => {
                    const pad = Math.max(0, colClueDepth - clue.length);
                    return (
                      <div key={`col-${col}`} className={classNames('col-clue', clue.length === 1 && clue[0] === 0 && 'empty-clue')}>
                        {Array.from({ length: pad }, (_, i) => <span key={`pad-${col}-${i}`} className="clue-token ghost-token" />)}
                        {clue.map((value, i) => <span key={`${col}-${i}`} className="clue-token">{value}</span>)}
                      </div>
                    );
                  })}
                </div>
                <div className="row-clues">
                  {rowClues.map((clue, row) => {
                    const pad = Math.max(0, rowClueDepth - clue.length);
                    return (
                      <div key={`row-${row}`} className={classNames('row-clue', clue.length === 1 && clue[0] === 0 && 'empty-clue')} style={{ height: 'var(--cell)' }}>
                        {Array.from({ length: pad }, (_, i) => <span key={`pad-${row}-${i}`} className="clue-token ghost-token" />)}
                        {clue.map((value, i) => <span key={`${row}-${i}`} className="clue-token">{value}</span>)}
                      </div>
                    );
                  })}
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
                      data-row={r}
                      data-col={c}
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
                <button className="tool-btn subtle action-btn" type="button" disabled={isPaused || isCompleting} onClick={surrender}>{t.surrender}</button>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <div className={classNames('notification', !notification && 'hidden')} role="status" aria-live="polite">{notification}</div>
      <div className={classNames('overlay', !modal && 'hidden')} onClick={closeModalByBackdrop} />

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
              {DIFFICULTIES.map((diff) => {
                const openedIds = new Set(solvedPictures[diff.id] || []);
                const items = PUZZLES[diff.id];
                const openedCount = items.filter((item) => openedIds.has(item.id)).length;
                const percent = Math.round((openedCount / items.length) * 100);

                return (
                  <section key={diff.id} className="gallery-section">
                    <div className="gallery-section-head">
                      <h3>{lang === 'ru' ? diff.ru : diff.en} · {diff.size}×{diff.size}</h3>
                      <span className="gallery-counter">{openedCount}/{items.length} · {percent}%</span>
                    </div>
                    <div className="gallery-progressbar" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
                    <div className="gallery-cards">
                      {items.map((item, index) => {
                        const isOpened = openedIds.has(item.id);
                        if (!isOpened) {
                          return (
                            <div className="gallery-card gallery-card-locked" key={item.id}>
                              <div className="locked-preview"><span>🔒</span></div>
                              <div className="preview-label">{lang === 'ru' ? `Рисунок ${index + 1}` : `Picture ${index + 1}`}</div>
                            </div>
                          );
                        }
                        const itemSolution = getSolution(item, diff.size);
                        return (
                          <div className="gallery-card" key={item.id}>
                            <Preview solution={itemSolution} label={getPuzzleName(item, lang)} compact />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
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
              <button className="tool-btn danger" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.restart}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'win' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card result-modal-card">
            <h2>{t.winTitle}</h2>
            <Preview solution={solution} label={puzzleName} />
            <p className="modal-text">{t.winText(puzzleName, lastReward)}</p>
            <div className="modal-actions">
              {canGoNext ? (
                <>
                  <button className="tool-btn primary" type="button" onClick={nextLevel}>{t.nextLevel}</button>
                  <button className="tool-btn" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.playAgain}</button>
                </>
              ) : (
                <button className="tool-btn primary" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.playAgain}</button>
              )}
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
