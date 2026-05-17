import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEYS = {
  coins: 'nonograms_code_picture_coins',
  progress: 'nonograms_code_picture_progress_v1',
  theme: 'nonograms_code_picture_theme',
  lang: 'nonograms_code_picture_lang',
};

const WIN_TARGET = 5;
const START_COINS = 120;
const BUY_LIFE_PRICE = 50;
const HINT_PRICE = 20;

const DIFFICULTIES = [
  { id: 'easy', size: 5, reward: 20, lives: 3, ru: 'Лёгкий', en: 'Easy', metaRu: '5×5 · быстрые рисунки', metaEn: '5×5 · quick pictures' },
  { id: 'medium', size: 7, reward: 30, lives: 3, ru: 'Средний', en: 'Medium', metaRu: '7×7 · больше логики', metaEn: '7×7 · more logic' },
  { id: 'hard', size: 10, reward: 45, lives: 3, ru: 'Сложный', en: 'Hard', metaRu: '10×10 · плотные подсказки', metaEn: '10×10 · dense clues' },
  { id: 'expert', size: 12, reward: 60, lives: 3, ru: 'Эксперт', en: 'Expert', metaRu: '12×12 · большой рисунок', metaEn: '12×12 · large picture' },
];

const PUZZLES = {
  easy: [
    {
      nameRu: 'Сердце',
      nameEn: 'Heart',
      rows: ['01010', '11111', '11111', '01110', '00100'],
    },
    {
      nameRu: 'Домик',
      nameEn: 'House',
      rows: ['00100', '01110', '11111', '10101', '11111'],
    },
    {
      nameRu: 'Улыбка',
      nameEn: 'Smile',
      rows: ['00000', '10101', '00000', '10001', '01110'],
    },
    {
      nameRu: 'Крест',
      nameEn: 'Cross',
      rows: ['00100', '00100', '11111', '00100', '00100'],
    },
  ],
  medium: [
    {
      nameRu: 'Цветок',
      nameEn: 'Flower',
      rows: ['0011100', '0111110', '1101011', '1111111', '0111110', '0011100', '0001000'],
    },
    {
      nameRu: 'Кот',
      nameEn: 'Cat',
      rows: ['1000001', '1100011', '1010101', '1111111', '0111110', '0100010', '0100010'],
    },
    {
      nameRu: 'Алмаз',
      nameEn: 'Diamond',
      rows: ['0001000', '0011100', '0111110', '1111111', '0111110', '0011100', '0001000'],
    },
    {
      nameRu: 'Ракета',
      nameEn: 'Rocket',
      rows: ['0001000', '0011100', '0111110', '0011100', '0011100', '0101010', '1000001'],
    },
  ],
  hard: [
    {
      nameRu: 'Кубок',
      nameEn: 'Cup',
      rows: ['0011111100', '0111111110', '1101111011', '1101111011', '0111111110', '0011111100', '0001111000', '0001111000', '0011111100', '0111111110'],
    },
    {
      nameRu: 'Ключ',
      nameEn: 'Key',
      rows: ['0001110000', '0010001000', '0100000100', '0100000100', '0010001000', '0001111111', '0000010010', '0000010010', '0000011110', '0000000000'],
    },
    {
      nameRu: 'Звезда',
      nameEn: 'Star',
      rows: ['0000110000', '0001111000', '1111111111', '0111111110', '0011111100', '0011111100', '0110110110', '1100110011', '0000110000', '0000110000'],
    },
    {
      nameRu: 'Призрак',
      nameEn: 'Ghost',
      rows: ['0011111100', '0111111110', '1111111111', '1101101111', '1111111011', '1111111111', '1111111111', '1101101101', '1001001001', '0000000000'],
    },
  ],
  expert: [
    {
      nameRu: 'Сова',
      nameEn: 'Owl',
      rows: ['001111111100', '011111111110', '111001100111', '110001100011', '111111111111', '111101101111', '011111111110', '001111111100', '000111111000', '001110011100', '011100001110', '110000000011'],
    },
    {
      nameRu: 'Корона',
      nameEn: 'Crown',
      rows: ['100000000001', '110000000011', '111000000111', '101100001101', '100110011001', '100011110001', '111111111111', '011111111110', '001111111100', '001111111100', '000111111000', '000000000000'],
    },
    {
      nameRu: 'Замок',
      nameEn: 'Castle',
      rows: ['101001100101', '111111111111', '111111111111', '011111111110', '011111111110', '011011110110', '011011110110', '011111111110', '011100001110', '011100001110', '111100001111', '111111111111'],
    },
    {
      nameRu: 'Черепаха',
      nameEn: 'Turtle',
      rows: ['000011110000', '001111111100', '011111111110', '111111111111', '110110110011', '111111111111', '011111111110', '001111111100', '010011110010', '100001100001', '000001100000', '000000000000'],
    },
  ],
};

const I18N = {
  ru: {
    title: 'Нонограммы Код Рисунка',
    subtitle: 'Логическая головоломка в стиле японских кроссвордов для Яндекс Игр.',
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
    freeModeMetaLocked: 'Откроется после 5 побед',
    freeModeMetaOpen: 'Без жизней: ошибки считаются при проверке',
    locked: 'Закрыт',
    enabled: 'Вкл',
    newGame: 'Новая игра',
    pause: 'Пауза',
    resume: 'Продолжить',
    erase: 'Стереть клетку',
    clearCrosses: 'Очистить крестики',
    hint: 'Подсказка',
    check: 'Проверить',
    surrender: 'Сдаться',
    paint: 'Закрасить',
    cross: 'Крестик',
    boardSub: 'Раскрась клетки по числам слева и сверху.',
    hintFree: '1-я подсказка бесплатно',
    hintPaid: 'Подсказка: 20 монет',
    wins: 'Побед',
    needUnlock: 'Закрыто',
    opensAfter: 'Откроется после побед на предыдущем уровне',
    progressShort: (wins) => `${Math.min(wins, WIN_TARGET)}/${WIN_TARGET}`,
    rule1: 'Числа показывают группы закрашенных клеток в строке или столбце.',
    rule2: 'Между двумя группами всегда есть хотя бы одна пустая клетка.',
    rule3: 'В обычном режиме неверная закраска снимает жизнь. Крестики можно ставить без штрафа.',
    rule4: 'В свободном режиме жизней нет: заполни рисунок и нажми «Проверить».',
    close: 'Закрыть',
    pauseTitle: 'Пауза',
    pauseText: 'Игра остановлена. Менять сложность и начинать новую игру во время паузы нельзя.',
    gameOverTitle: 'Жизни закончились',
    gameOverText: 'Можно продолжить за монеты или начать заново.',
    price: 'Цена',
    buyLife: 'Продолжить за 50 монет',
    restart: 'Рестарт',
    winTitle: 'Рисунок открыт',
    winText: (reward) => `Победа засчитана. Награда: ${reward} монет.`,
    nextLevel: 'Следующий уровень',
    playAgain: 'Играть снова',
    surrenderTitle: 'Ты сдался',
    surrenderText: 'Решение раскрыто полностью. Можно изучить рисунок и начать новую партию.',
    notEnoughCoins: 'Не хватает монет.',
    noSelected: 'Сначала выбери клетку.',
    noHints: 'Все нужные клетки уже открыты.',
    wrongCell: 'Эта клетка должна быть пустой.',
    solved: 'Готово. Рисунок совпадает с подсказками.',
    notSolved: (n) => `Пока не сходится. Нужно исправить: ${n}.`,
    freeLockedMessage: (title) => `Свободный режим для «${title}» откроется после 5 побед.`,
  },
  en: {
    title: 'Nonograms Code Picture',
    subtitle: 'A Japanese crossword-style logic puzzle for Yandex Games.',
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
    freeModeMetaLocked: 'Unlocks after 5 wins',
    freeModeMetaOpen: 'No lives: errors are counted on check',
    locked: 'Locked',
    enabled: 'On',
    newGame: 'New game',
    pause: 'Pause',
    resume: 'Resume',
    erase: 'Erase cell',
    clearCrosses: 'Clear crosses',
    hint: 'Hint',
    check: 'Check',
    surrender: 'Give up',
    paint: 'Paint',
    cross: 'Cross',
    boardSub: 'Fill cells using the numbers on the left and above.',
    hintFree: '1st hint is free',
    hintPaid: 'Hint: 20 coins',
    wins: 'Wins',
    needUnlock: 'Locked',
    opensAfter: 'Unlocks after wins on the previous level',
    progressShort: (wins) => `${Math.min(wins, WIN_TARGET)}/${WIN_TARGET}`,
    rule1: 'Numbers show groups of filled cells in a row or column.',
    rule2: 'There is always at least one empty cell between two groups.',
    rule3: 'In normal mode, a wrong filled cell costs one life. Crosses are safe.',
    rule4: 'In free mode there are no lives: complete the picture and press Check.',
    close: 'Close',
    pauseTitle: 'Paused',
    pauseText: 'The game is stopped. Difficulty and new game buttons are blocked while paused.',
    gameOverTitle: 'No lives left',
    gameOverText: 'Continue for coins or restart.',
    price: 'Price',
    buyLife: 'Continue for 50 coins',
    restart: 'Restart',
    winTitle: 'Picture solved',
    winText: (reward) => `Win recorded. Reward: ${reward} coins.`,
    nextLevel: 'Next level',
    playAgain: 'Play again',
    surrenderTitle: 'You gave up',
    surrenderText: 'The full solution is shown. Study it and start another game.',
    notEnoughCoins: 'Not enough coins.',
    noSelected: 'Select a cell first.',
    noHints: 'All filled cells are already revealed.',
    wrongCell: 'This cell must stay empty.',
    solved: 'Done. The picture matches the clues.',
    notSolved: (n) => `Not solved yet. Fix cells: ${n}.`,
    freeLockedMessage: (title) => `Free mode for “${title}” unlocks after 5 wins.`,
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
  if (index === 0) return true;
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

function installInteractionGuards(suppressClickRef) {
  const scrollHost = document.querySelector('.app') || document.scrollingElement || document.documentElement;
  let startX = 0;
  let startY = 0;
  let lastY = 0;
  let isTracking = false;
  let didScroll = false;

  const shouldIgnoreTarget = (target) => !!target.closest?.('.modal, .overlay, input, textarea, select');

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
    suppressClickRef.current = Date.now() + 450;

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const finishTracking = () => {
    if (didScroll) suppressClickRef.current = Date.now() + 450;
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

export default function App() {
  const initialProgress = useMemo(() => getLocalJson(STORAGE_KEYS.progress, {}), []);
  const [hydrated, setHydrated] = useState(false);
  const [lang, setLang] = useState(() => normalizeLang(localStorage.getItem(STORAGE_KEYS.lang) || 'ru'));
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.theme) || 'dark');
  const [coins, setCoins] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.coins) || START_COINS));
  const [progress, setProgress] = useState(initialProgress);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(() => pickPuzzle('easy').index);
  const [marks, setMarks] = useState(() => makeEmptyMarks(DIFFICULTIES[0].size));
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

  const stageRef = useRef(null);
  const suppressClickRef = useRef(0);
  const saveTimerRef = useRef(null);
  const notificationTimerRef = useRef(null);

  const t = I18N[lang];
  const difficulty = DIFFICULTIES[difficultyIndex];
  const puzzle = PUZZLES[difficulty.id][puzzleIndex] || PUZZLES[difficulty.id][0];
  const solution = useMemo(() => rowsToMatrix(puzzle.rows), [puzzle]);
  const { rowClues, colClues } = useMemo(() => buildClues(solution), [solution]);
  const remaining = useMemo(() => countRemaining(marks, solution), [marks, solution]);
  const mistakeCount = useMemo(() => countErrors(marks, solution), [marks, solution]);
  const timeText = formatTime(elapsed);

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

    setDifficultyIndex(nextDifficultyIndex);
    setPuzzleIndex(picked.index);
    setMarks(makeEmptyMarks(nextDifficulty.size));
    setLives(nextDifficulty.lives);
    setSelectedCell(null);
    setElapsed(0);
    setTimerActive(false);
    setIsPaused(false);
    setModal(null);
    setHintUsed(false);
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
    stopGameplay();
    setTimerActive(false);
    setModal('win');

    setProgress((prev) => {
      const next = { ...prev, [difficulty.id]: (prev[difficulty.id] || 0) + 1 };
      setCoins((coinValue) => {
        const nextCoins = coinValue + difficulty.reward;
        syncSave({ coins: nextCoins, progress: next });
        return nextCoins;
      });
      return next;
    });
  }, [difficulty.id, difficulty.reward, stopGameplay, syncSave]);

  const checkWinAfterMove = useCallback((nextMarks) => {
    if (isSolved(nextMarks, solution)) {
      window.setTimeout(finishWin, 80);
      return true;
    }
    return false;
  }, [finishWin, solution]);

  const handleCell = useCallback((row, col) => {
    if (Date.now() < suppressClickRef.current) return;
    if (isPaused || modal || lives <= 0) return;

    setSelectedCell({ row, col });
    startGameplay();

    setMarks((prev) => {
      const next = prev.map((line) => [...line]);
      const current = next[row][col];

      if (tool === 'cross') {
        next[row][col] = current === 'cross' ? 'empty' : 'cross';
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

      next[row][col] = current === 'filled' ? 'empty' : 'filled';
      checkWinAfterMove(next);
      return next;
    });
  }, [checkWinAfterMove, freeMode, isPaused, lives, modal, showNotification, solution, startGameplay, stopGameplay, t.wrongCell, tool]);

  const eraseSelected = useCallback(() => {
    if (isPaused || modal) return;
    if (!selectedCell) {
      showNotification(t.noSelected);
      return;
    }
    setMarks((prev) => {
      const next = prev.map((line) => [...line]);
      next[selectedCell.row][selectedCell.col] = 'empty';
      return next;
    });
  }, [isPaused, modal, selectedCell, showNotification, t.noSelected]);

  const clearCrosses = useCallback(() => {
    if (isPaused || modal) return;
    setMarks((prev) => prev.map((row) => row.map((cell) => (cell === 'cross' ? 'empty' : cell))));
  }, [isPaused, modal]);

  const useHint = useCallback(() => {
    if (isPaused || modal) return;

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
  }, [checkWinAfterMove, coins, hintUsed, isPaused, marks, modal, showNotification, solution, startGameplay, syncSave, t.noHints, t.notEnoughCoins]);

  const checkPuzzle = useCallback(() => {
    if (isPaused || modal) return;
    startGameplay();
    const errors = countErrors(marks, solution);
    if (errors === 0) {
      showNotification(t.solved);
      finishWin();
    } else {
      showNotification(t.notSolved(errors));
    }
  }, [finishWin, isPaused, marks, modal, showNotification, solution, startGameplay, t]);

  const surrender = useCallback(() => {
    if (isPaused || modal) return;
    stopGameplay();
    setTimerActive(false);
    setMarks(revealSolutionMarks(solution));
    setModal('surrender');
  }, [isPaused, modal, solution, stopGameplay]);

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
    if (isPaused || modal) return;
    if (!isFreeModeUnlocked(difficulty.id, progress)) {
      showNotification(t.freeLockedMessage(lang === 'ru' ? difficulty.ru : difficulty.en));
      return;
    }
    setFreeMode((value) => !value);
    resetGame(difficultyIndex, true);
  }, [difficulty, difficultyIndex, isPaused, lang, modal, progress, resetGame, showNotification, t]);

  const selectDifficulty = useCallback((index) => {
    if (isPaused || modal) return;
    if (!isDifficultyUnlocked(index, progress)) return;
    const nextDifficulty = DIFFICULTIES[index];
    setFreeMode((value) => (value && isFreeModeUnlocked(nextDifficulty.id, progress) ? value : false));
    resetGame(index, false);
  }, [isPaused, modal, progress, resetGame]);

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
      const maxByWidth = Math.floor((width - 92) / difficulty.size);
      const maxByHeight = Math.floor((window.innerHeight * 0.62 - 72) / difficulty.size);
      const max = difficulty.size <= 5 ? 56 : difficulty.size <= 7 ? 48 : difficulty.size <= 10 ? 38 : 32;
      const min = difficulty.size <= 7 ? 32 : 22;
      setCellSize(Math.max(min, Math.min(max, maxByWidth, maxByHeight)));
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
  const freeUnlocked = isFreeModeUnlocked(difficulty.id, progress);

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
                      disabled={!unlocked || isPaused}
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
                disabled={isPaused}
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
                  <div className="board-title">{lang === 'ru' ? difficulty.ru : difficulty.en} · {puzzle.nameRu && lang === 'ru' ? puzzle.nameRu : puzzle.nameEn} · {difficulty.size}×{difficulty.size}</div>
                  <div className="board-subtitle">{t.boardSub}</div>
                </div>
                <div className="mobile-time-card" aria-hidden="true">
                  <span className="mobile-time-label">{t.time}</span>
                  <span className="mobile-time-value">{timeText}</span>
                </div>
              </div>
              <div className="hint-meta">{hintUsed ? t.hintPaid : t.hintFree} · {remaining}</div>
            </div>

            <div className="board-wrap nonogram-wrap" ref={stageRef}>
              <div className="nonogram-stage" style={{ '--cell': `${cellSize}px` }}>
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
                      onClick={() => handleCell(r, c)}
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
              <div className="actions-list">
                <button className="tool-btn primary action-btn" type="button" disabled={isPaused} onClick={() => resetGame(difficultyIndex, false)}>{t.newGame}</button>
                <button className="tool-btn action-btn" type="button" onClick={togglePause}>{isPaused ? t.resume : t.pause}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused} onClick={eraseSelected}>{t.erase}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused} onClick={clearCrosses}>{t.clearCrosses}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused} onClick={useHint}>{t.hint}</button>
                <button className="tool-btn action-btn" type="button" disabled={isPaused} onClick={checkPuzzle}>{t.check}</button>
                <button className="tool-btn subtle action-btn" type="button" disabled={isPaused} onClick={surrender}>{t.surrender}</button>
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
          <div className="modal-card">
            <h2>{t.winTitle}</h2>
            <p className="modal-text">{t.winText(difficulty.reward)}</p>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={nextLevel}>{canGoNext ? t.nextLevel : t.playAgain}</button>
              <button className="tool-btn" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.playAgain}</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'surrender' && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>{t.surrenderTitle}</h2>
            <p className="modal-text">{t.surrenderText}</p>
            <div className="modal-actions">
              <button className="tool-btn primary" type="button" onClick={() => resetGame(difficultyIndex, false)}>{t.newGame}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
