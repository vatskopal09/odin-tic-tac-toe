export default (function () {
  // Game events' names
  const START_EVENT_NAME = 'start';
  const STARTED_EVENT_NAME = 'started';
  const HARD_GAME_EVENT_NAME = 'hard';
  const MEDIUM_GAME_EVENT_NAME = 'medium';
  const EASY_GAME_EVENT_NAME = 'easy';
  const ONE_PLAYER_GAME_EVENT_NAME = 'oneplayergame';
  const WIN_EVENT_NAME = 'win';
  const TIE_EVENT_NAME = 'tie';
  const MARK_EVENT_NAME = 'mark';
  const MARKING_EVENT_NAME = 'marking';
  const MARKED_EVENT_NAME = 'marked';
  const RESET_EVENT_NAME = 'reset';
  const RESET_BOARD_EVENT_NAME = 'resetboard';
  const RESTART_EVENT_NAME = 'restart';
  const COMPUTER_TURN_EVENT_NAME = 'computerturn';
  const USER_TURN_EVENT_NAME = 'userturn';
  // Game events' state
  let events;

  function init() {
    events = {};
  }

  function add(eventName, callbackfn) {
    if (typeof eventName === 'string' && typeof callbackfn === 'function') {
      events[eventName] = events[eventName] ?? [];
      events[eventName].push(callbackfn);
    }
  }

  function remove(eventName, callbackfn) {
    if (typeof eventName === 'string') {
      const callbacks = events[eventName];
      if (Array.isArray(callbacks)) {
        const i = callbacks.indexOf(callbackfn);
        if (i > -1) {
          callbacks.splice(i, 1);
          if (callbacks.length < 1) delete events[eventName];
        }
      }
    }
  }

  function emit(eventName, ...args) {
    if (typeof eventName === 'string') {
      const callbacks = events[eventName];
      if (Array.isArray(callbacks)) {
        callbacks.forEach((callbackfn) => callbackfn(...args));
      }
    }
  }

  return {
    init,
    add,
    remove,
    emit,
    START_EVENT_NAME,
    STARTED_EVENT_NAME,
    HARD_GAME_EVENT_NAME,
    MEDIUM_GAME_EVENT_NAME,
    EASY_GAME_EVENT_NAME,
    ONE_PLAYER_GAME_EVENT_NAME,
    WIN_EVENT_NAME,
    MARK_EVENT_NAME,
    MARKING_EVENT_NAME,
    MARKED_EVENT_NAME,
    TIE_EVENT_NAME,
    RESET_EVENT_NAME,
    RESET_BOARD_EVENT_NAME,
    RESTART_EVENT_NAME,
    COMPUTER_TURN_EVENT_NAME,
    USER_TURN_EVENT_NAME,
  };
})();
