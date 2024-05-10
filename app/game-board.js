export default (function () {
  const board = Array(9);
  const usedCells = [];
  let gameEvents, computerCallbackTimeout, justStarted, hard, medium, easy;

  function resetState() {
    board.fill('', 0);
    usedCells.splice(0);
    clearTimeout(computerCallbackTimeout);
    justStarted = false;
  }

  function isWin(boardArr) {
    // For every set of board cells (row, column or diagonal),
    // check whether first cell is not empty
    // and is equal the other cells in the set.
    return (
      // 1st row
      (boardArr[0] &&
        boardArr[0] === boardArr[1] &&
        boardArr[1] === boardArr[2]) ||
      // 2nd row
      (boardArr[3] &&
        boardArr[3] === boardArr[4] &&
        boardArr[4] === boardArr[5]) ||
      // 3rd row
      (boardArr[6] &&
        boardArr[6] === boardArr[7] &&
        boardArr[7] === boardArr[8]) ||
      // 1st column
      (boardArr[0] &&
        boardArr[0] === boardArr[3] &&
        boardArr[3] === boardArr[6]) ||
      // 2nd column
      (boardArr[1] &&
        boardArr[1] === boardArr[4] &&
        boardArr[4] === boardArr[7]) ||
      // 3rd column
      (boardArr[2] &&
        boardArr[2] === boardArr[5] &&
        boardArr[5] === boardArr[8]) ||
      // Diagonal
      (boardArr[0] &&
        boardArr[0] === boardArr[4] &&
        boardArr[4] === boardArr[8]) ||
      // Diagonal
      (boardArr[6] &&
        boardArr[6] === boardArr[4] &&
        boardArr[4] === boardArr[2])
    );
  }

  function isValidPlace(placeIndex) {
    return !board[placeIndex];
  }

  function isEmptyPlace() {
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        return true;
      }
    }
  }

  function validateIndex(placeIndex) {
    const i = Number(placeIndex);
    if (Number.isInteger(i) && i >= 0 && i < 9) {
      return i;
    }
    return -1;
  }

  function checkForWin(type) {
    if (isWin(board)) {
      gameEvents.emit(gameEvents.WIN_EVENT_NAME, type);
    } else if (!isEmptyPlace()) {
      gameEvents.emit(gameEvents.TIE_EVENT_NAME);
    }
  }

  function mark(placeIndex, type) {
    justStarted = false;
    const i = validateIndex(placeIndex);
    if (i > -1) {
      if (isEmptyPlace() && isValidPlace(i)) {
        board[i] = type;
        usedCells.push(i);
        checkForWin(type);
        gameEvents.emit(gameEvents.MARKED_EVENT_NAME, i, type);
      }
    }
  }

  function selectRandomly() {
    let i;
    do {
      i = Math.floor(Math.random() * 9);
    } while (usedCells.includes(i));
    return i;
  }

  function shuffleArray(arr) {
    const newArr = [...arr];
    // Fisher-Yates shuffle algorithm
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      // Swap current element with random choice from left behind group of elements
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  function selectSpecial() {
    // Select cell in the middle/corners
    if (!usedCells.includes(4)) return 4;
    const specials = shuffleArray([0, 2, 6, 8]);
    for (let i = 0; i < specials.length; i++) {
      if (!usedCells.includes(specials[i])) return specials[i];
    }
    return null;
  }

  function selectWinningCellIndex(boardArr, type) {
    for (let i = 0; i < 9; i++) {
      if (!usedCells.includes(i)) {
        const oldValue = boardArr[i];
        boardArr[i] = type;
        if (isWin(boardArr)) return i;
        boardArr[i] = oldValue;
      }
    }
    return null;
  }

  function selectCleverly(computerType, userType) {
    const boardCopy = [...board];
    // If it is a hard game:
    return hard
      ? // Win, prevent user's win, select special cell or select any
        selectWinningCellIndex(boardCopy, computerType) ??
          selectWinningCellIndex(boardCopy, userType) ??
          selectSpecial() ??
          selectRandomly()
      : // Win, prevent user's win or select any
        selectWinningCellIndex(boardCopy, computerType) ??
          selectWinningCellIndex(boardCopy, userType) ??
          selectRandomly();
  }

  function selectEasily(computerType, userType) {
    const boardCopy = [...board];
    // Random the possibilities of preventing user's win
    const varDenominator = Math.floor(Math.random() * 2) + 2;
    return (
      // Win
      selectWinningCellIndex(boardCopy, computerType) ??
      // Prevent user's win, but not every time
      (usedCells.length % varDenominator === 0
        ? selectWinningCellIndex(boardCopy, userType)
        : null) ??
      // Select any
      selectRandomly()
    );
  }

  function onComputerTurn(computerType, userType) {
    let selectedCellIndex;
    if (hard || medium) {
      selectedCellIndex = selectCleverly(computerType, userType);
    } else {
      selectedCellIndex = selectEasily(computerType, userType);
    }
    computerCallbackTimeout = setTimeout(
      () => {
        mark(selectedCellIndex, computerType);
        gameEvents.emit(
          gameEvents.MARKED_EVENT_NAME,
          selectedCellIndex,
          computerType,
        );
        gameEvents.emit(gameEvents.USER_TURN_EVENT_NAME);
      },
      justStarted ? 1500 : 1000, // Respect start animation
    );
  }

  function onMarking(cellIndex, type) {
    mark(cellIndex, type);
  }

  function onResetBoard() {
    resetState();
  }

  function onStart() {
    justStarted = true;
  }

  function onHard() {
    hard = true;
  }

  function onMedium() {
    medium = true;
  }

  function onEasy() {
    easy = true;
  }

  function init(globalGameEvents) {
    gameEvents = globalGameEvents;
    hard = false;
    medium = false;
    easy = false;
    resetState();
    gameEvents.add(gameEvents.RESET_BOARD_EVENT_NAME, onResetBoard);
    gameEvents.add(gameEvents.START_EVENT_NAME, onStart);
    gameEvents.add(gameEvents.HARD_GAME_EVENT_NAME, onHard);
    gameEvents.add(gameEvents.MEDIUM_GAME_EVENT_NAME, onMedium);
    gameEvents.add(gameEvents.EASY_GAME_EVENT_NAME, onEasy);
    gameEvents.add(gameEvents.COMPUTER_TURN_EVENT_NAME, onComputerTurn);
    gameEvents.add(gameEvents.MARKING_EVENT_NAME, onMarking);
  }

  return { init };
})();
