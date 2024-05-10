import './styles/main.css';

import gameEvents from './app/game-events.js';
import gameBoard from './app/game-board.js';
import display from './app/display.js';
import game from './app/game.js';

// Play a game
(function startNewGame() {
  gameEvents.init();
  gameEvents.add(gameEvents.RESTART_EVENT_NAME, startNewGame);
  gameBoard.init(gameEvents), game.init(gameEvents), display.init(gameEvents);
})();
