export default (function () {
  let gameEvents,
    roundCount,
    players,
    currentPlayer,
    numOfPlayers,
    userType,
    computerType,
    computerTurn,
    gameStarted,
    boardRestarted,
    win,
    tie,
    markCount;

  function createPlayer(type) {
    let score = 0;

    function getType() {
      return type;
    }

    function getScore() {
      return score;
    }

    function incrementScore() {
      return ++score;
    }

    return { getType, getScore, incrementScore };
  }

  function invertCurrentPlayer() {
    markCount++;
    currentPlayer = players[markCount % 2];
  }

  function resetState() {
    win = false;
    tie = false;
    markCount = roundCount;
    currentPlayer = players[markCount % 2];
    boardRestarted = true;
    computerTurn =
      numOfPlayers === 1 && computerType === currentPlayer.getType();
  }

  function setPlayersTypes(type) {
    if (type.toUpperCase() === players[0].getType()) {
      [userType, computerType] = [players[0].getType(), players[1].getType()];
    } else {
      [computerType, userType] = [players[0].getType(), players[1].getType()];
    }
  }

  function announceGameDifficulty(difficultyLevel) {
    difficultyLevel = difficultyLevel.toLowerCase();
    if (difficultyLevel === 'h') {
      gameEvents.emit(gameEvents.HARD_GAME_EVENT_NAME);
    } else if (difficultyLevel === 'm') {
      gameEvents.emit(gameEvents.MEDIUM_GAME_EVENT_NAME);
    } else {
      gameEvents.emit(gameEvents.EASY_GAME_EVENT_NAME);
    }
  }

  function setComputerTurn() {
    computerTurn = computerType === currentPlayer.getType();
    if (computerTurn) {
      gameEvents.emit(
        gameEvents.COMPUTER_TURN_EVENT_NAME,
        computerType,
        userType,
      );
    }
  }

  function onStart(value) {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      numOfPlayers = num;
      gameStarted = num === 2;
      if (gameStarted) {
        gameEvents.emit(gameEvents.STARTED_EVENT_NAME, currentPlayer.getType());
      }
    }
  }

  function onOneGamePlayer(type, difficultyLevel) {
    setPlayersTypes(type);
    announceGameDifficulty(difficultyLevel);
    setComputerTurn();
    gameEvents.emit(gameEvents.STARTED_EVENT_NAME, currentPlayer.getType());
    gameStarted = true;
  }

  function onMark(cellIndex) {
    if (gameStarted && !computerTurn && !win && !tie) {
      gameEvents.emit(
        gameEvents.MARKING_EVENT_NAME,
        cellIndex,
        currentPlayer.getType(),
      );
    }
  }

  function onMarked() {
    invertCurrentPlayer();
    if (numOfPlayers === 1 && !computerTurn && !win && !tie) {
      gameEvents.emit(
        gameEvents.COMPUTER_TURN_EVENT_NAME,
        computerType,
        userType,
      );
      computerTurn = true;
    }
    boardRestarted = false;
  }

  function onUserTurn() {
    computerTurn = false;
    invertCurrentPlayer();
  }

  function onWin() {
    roundCount++;
    win = true;
    tie = false;
  }

  function onTie() {
    roundCount++;
    tie = true;
    win = false;
  }

  function onReset() {
    if (!boardRestarted) {
      resetState();
      gameEvents.emit(
        gameEvents.RESET_BOARD_EVENT_NAME,
        currentPlayer.getType(),
      );
      if (computerTurn) {
        gameEvents.emit(
          gameEvents.COMPUTER_TURN_EVENT_NAME,
          computerType,
          userType,
        );
      }
    } else {
      gameEvents.emit(gameEvents.RESTART_EVENT_NAME, currentPlayer.getType());
    }
  }

  function init(globalGameEvents) {
    gameEvents = globalGameEvents;
    roundCount = 0;
    players = [createPlayer('X'), createPlayer('O')];
    currentPlayer = players[0];
    numOfPlayers = 0;
    userType = null;
    computerType = null;
    gameStarted = false;
    resetState();
    gameEvents.add(gameEvents.START_EVENT_NAME, onStart);
    gameEvents.add(gameEvents.ONE_PLAYER_GAME_EVENT_NAME, onOneGamePlayer);
    gameEvents.add(gameEvents.MARK_EVENT_NAME, onMark);
    gameEvents.add(gameEvents.MARKED_EVENT_NAME, onMarked);
    gameEvents.add(gameEvents.WIN_EVENT_NAME, onWin);
    gameEvents.add(gameEvents.TIE_EVENT_NAME, onTie);
    gameEvents.add(gameEvents.RESET_EVENT_NAME, onReset);
    gameEvents.add(gameEvents.USER_TURN_EVENT_NAME, onUserTurn);
  }

  return { init };
})();
