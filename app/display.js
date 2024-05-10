wexport default (function () {
  const dialog = document.createElement('dialog'),
    boardCells = [];
  let gameEvents,
    gameUI,
    playersNum,
    xScore,
    oScore,
    ties,
    currentPlayer,
    resetBtn;

  function startAnimation(element) {
    element.setAttribute('style', 'opacity: 0; transform: scale(75%);');
  }

  function endAnimation(element) {
    setTimeout(() => {
      element.setAttribute('style', 'opacity: 1; transform: scale(100%);');
      element.removeAttribute('style');
    }, 200);
  }

  function createElement(tagName, className, textContent, attrs) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    if (Array.isArray(attrs) && attrs.length > 0) {
      for (let i = 0; i < attrs.length; i++) {
        if (Array.isArray(attrs[i]) && attrs[i].length === 2) {
          element.setAttribute(attrs[i][0], attrs[i][1]);
        }
      }
    }
    return element;
  }

  function createGameUI() {
    // Game control section
    const settings = createElement('div', 'settings');
    playersNum = createElement('div', 'players-num', '2 Players');
    resetBtn = createElement('button', 'reset circle-btn', '↺', [
      ['type', 'button'],
    ]);
    resetBtn.addEventListener('click', () =>
      gameEvents.emit(gameEvents.RESET_EVENT_NAME),
    );
    settings.append(playersNum, resetBtn);
    const scores = createElement('div', 'scores');
    const xScoreDiv = createElement('div');
    xScore = createElement('span', 'x-score', '0');
    xScoreDiv.append(document.createTextNode('X: '), xScore);
    const tiesDiv = createElement('div');
    ties = createElement('span', 'ties', '0');
    tiesDiv.append(document.createTextNode('Ties: '), ties);
    const oScoreDiv = createElement('div');
    oScore = createElement('span', 'o-score', '0');
    oScoreDiv.append(document.createTextNode('O: '), oScore);
    scores.append(xScoreDiv, tiesDiv, oScoreDiv);
    const control = createElement('div', 'control');
    control.append(settings, scores);
    // Game board section
    const playerTurn = createElement('div', 'player-turn');
    currentPlayer = createElement('span', 'current-player', 'X');
    playerTurn.append(currentPlayer, document.createTextNode(' Turn'));
    const board = createElement('div', 'board-container');
    for (let i = 0; i < 9; i++) {
      const cell = createElement('div', 'board-cell');
      cell.addEventListener('click', () => {
        gameEvents.emit(gameEvents.MARK_EVENT_NAME, i);
      });
      board.appendChild(cell);
      boardCells.push(cell);
    }
    board.append(
      createElement('div', 'horizontal-divider first-h-div'),
      createElement('div', 'horizontal-divider last-h-div'),
      createElement('div', 'vertical-divider first-v-div'),
      createElement('div', 'vertical-divider last-v-div'),
    );
    const game = createElement('div', 'game');
    game.append(playerTurn, board);
    // Game container
    gameUI = createElement('div', 'container');
    gameUI.append(control, game);
  }

  function showGameUI() {
    startAnimation(gameUI);
    document.body.appendChild(gameUI);
    endAnimation(gameUI);
  }

  function createChoicesButtons(className, textContentArr, clickHandler) {
    const buttons = [];
    // Loop for the length of text content array
    for (let i = 0; i < textContentArr.length; i++) {
      buttons[i] = createElement('button', className, textContentArr[i], [
        ['type', 'button'],
        ['value', textContentArr[i].slice(0, 1).toLowerCase()],
      ]);
      buttons[i].addEventListener('click', clickHandler);
    }
    return buttons;
  }

  function createDialog(contentsArr) {
    if (dialog.children.length > 0) {
      // Empty the dialog
      [...dialog.children].forEach((child) => child.remove());
    }
    const dialogContentDiv = createElement('div', 'dialog-content');
    dialogContentDiv.append(...contentsArr);
    dialog.appendChild(dialogContentDiv);
  }

  function showDialog() {
    document.body.appendChild(dialog);
    startAnimation(dialog);
    dialog.showModal();
    endAnimation(dialog);
  }

  function terminateDialog() {
    dialog.close();
    setTimeout(() => dialog.remove(), 500);
  }

  function showMessage(message) {
    const closeButton = createElement(
      'button',
      'dialog-close circle-btn',
      'x',
      [['type', 'button']],
    );
    closeButton.addEventListener('click', terminateDialog);
    const messageDiv = createElement('div', 'message', message);
    createDialog([closeButton, messageDiv]);
    setTimeout(showDialog, 500);
  }

  function askForDifficultyLevel(playerType) {
    createDialog(
      createChoicesButtons(
        'difficulty-level',
        ['Easy', 'Medium', 'Hard'],
        (event) => {
          const difficultyLevel = event.target.value;
          terminateDialog();
          showGameUI();
          gameEvents.emit(
            gameEvents.ONE_PLAYER_GAME_EVENT_NAME,
            playerType,
            difficultyLevel,
          );
        },
      ),
    );
  }

  function askForPlayerType() {
    createDialog(
      createChoicesButtons('players-type-choice', ['X', 'O'], (event) => {
        askForDifficultyLevel(event.target.value);
      }),
    );
  }

  function handleNumOfPlayers(event) {
    const numOfPlayers = Number(event.target.value);
    gameEvents.emit(gameEvents.START_EVENT_NAME, numOfPlayers);
    playersNum.textContent = numOfPlayers === 1 ? '1 Player' : '2 Players';
  }

  function resetBoard() {
    boardCells.forEach((cell) => (cell.textContent = ''));
  }

  function resetState() {
    playersNum.textContent = '1 Player';
    xScore.textContent = '0';
    oScore.textContent = '0';
    ties.textContent = '0';
    currentPlayer.textContent = 'X';
  }

  function invertCurrentPlayerType(type) {
    if (type.toLowerCase() === 'x') {
      currentPlayer.textContent = 'O';
    } else {
      currentPlayer.textContent = 'X';
    }
  }

  function onStart(num) {
    if (num === 1) {
      askForPlayerType();
    } else {
      terminateDialog();
      showGameUI();
    }
  }

  function onStarted(type) {
    currentPlayer.textContent = type;
  }

  function onMarked(cellIndex, type) {
    boardCells[cellIndex].textContent = type;
    invertCurrentPlayerType(type);
  }

  function onWin(type) {
    showMessage('' + type + ' Win!');
    if (type === 'X') {
      let currentScore = Number(xScore.textContent);
      xScore.textContent = currentScore ? ++currentScore : 1;
    } else {
      let currentScore = Number(oScore.textContent);
      oScore.textContent = currentScore ? ++currentScore : 1;
    }
  }

  function onTie() {
    showMessage('Tie!');
    let currentTies = Number(ties.textContent);
    ties.textContent = currentTies ? ++currentTies : 1;
  }

  function onResetBoard(type) {
    currentPlayer.textContent = type;
    resetBoard();
  }

  function onHard() {
    const gameLevelSpan = createElement('span', 'game-level', ' (Hard)');
    playersNum.appendChild(gameLevelSpan);
  }

  function onMedium() {
    const gameLevelSpan = createElement('span', 'game-level', ' (Medium)');
    playersNum.appendChild(gameLevelSpan);
  }

  function onEasy() {
    const gameLevelSpan = createElement('span', 'game-level', ' (Easy)');
    playersNum.appendChild(gameLevelSpan);
  }

  function init(globalGameEvents) {
    gameEvents = globalGameEvents;
    if (!gameUI) createGameUI();
    gameEvents.add(gameEvents.START_EVENT_NAME, onStart);
    gameEvents.add(gameEvents.STARTED_EVENT_NAME, onStarted);
    gameEvents.add(gameEvents.WIN_EVENT_NAME, onWin);
    gameEvents.add(gameEvents.TIE_EVENT_NAME, onTie);
    gameEvents.add(gameEvents.MARKED_EVENT_NAME, onMarked);
    gameEvents.add(gameEvents.RESET_BOARD_EVENT_NAME, onResetBoard);
    gameEvents.add(gameEvents.HARD_GAME_EVENT_NAME, onHard);
    gameEvents.add(gameEvents.MEDIUM_GAME_EVENT_NAME, onMedium);
    gameEvents.add(gameEvents.EASY_GAME_EVENT_NAME, onEasy);
    resetState();
    resetBoard();
    createDialog(
      createChoicesButtons(
        'players-num-choice',
        ['1 Player', '2 Players'],
        handleNumOfPlayers,
      ),
    );
    showDialog();
  }

  return { init };
})();
