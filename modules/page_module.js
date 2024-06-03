/*
* Class for writing into the page
*/
const pointsForWin = 100;
const pointsForCorrectLetter = 10;
const pointsForPresentLetter = 5;

import {Game_logic} from "./word_module.js";

export class Page_generator {
    constructor() {
        this.main = document.querySelector('main');
        this.currentPlayerName = '';
        this.secretWord = null;
        this.gamelogic = null;
        this.isGame = false;
        this.keyboard = null;
        this.score = 0;
        localStorage.setItem('active_game', this.isGame);
        this.currentBoard = [];
        window.onpopstate = this.handlePopState.bind(this); // Listen to popstate event for history navigation
        this.addKeyUpListener();
        this._renderPageByURL().then();
    }

    async _renderPageByURL() {
        let page = this._getCurrentPageFromURL();
        if (page == null) {
            await this.renderWelcomePage();
            return;
        }

        switch (page) {
            case 'game':
                const activeGame = localStorage.getItem('active_game');
                const playerName = localStorage.getItem('current_player_name');
                const board = JSON.parse(localStorage.getItem('current_board'));
                const secretWord = localStorage.getItem('current_secret_word');
                const score = localStorage.getItem('current_score');
                let correctGuess = this._checkBoardForCorrectGuess(board);

                if (activeGame==null || !activeGame || playerName==null || board==null || secretWord==null || correctGuess || score==null) {
                    // No data no game
                    this.currentPlayerName = '';
                    this.currentBoard = [];
                    this.secretWord = null;
                    this.isGame = false;
                    this.gamelogic = null;
                    this.score = 0;
                    await this.renderWelcomePage();
                } else {
                    this.currentPlayerName = playerName;
                    this.currentBoard = board;
                    this.secretWord = secretWord;
                    this.isGame = true;
                    this.score = Number.parseInt(score);
                    this.gamelogic = Game_logic.createWithSecretWord(this.secretWord);
                    this.keyboard = Keyboard.createFromBoard(this.currentBoard);
                    await this.renderGamePage();
                }
                break;
            case 'score':
                await this.renderScorePage()
                break;
            default:
                await this.renderWelcomePage();
                break;
        }
    }

    async renderWelcomePage() {
        await this._applyPageTransition(() => {
            // Set history state for the welcome page
            history.pushState({ page: 'welcome' }, 'Wordle - Welcome', './');
            this.isGame = false

            this.main.innerHTML = `
                <section class="single">
                    <form id="name_form">
                        <h2>Wordle</h2>
                        <label for="player_name">Player name:</label>
                        <input type="text" id="player_name" maxlength="5" placeholder="Enter your name">
                        <div class="buttons">
                            <input type="submit" value="View scores" id="submit_score_page">
                            <input type="submit" value="Start game" id="submit_player_name">
                        </div>
                    </form>
                </section>`;

            const submitButton = document.querySelector('#submit_player_name');
            const scoreButton = document.querySelector('#submit_score_page');
            const playerNameInput = document.querySelector('#player_name');

            scoreButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.renderScorePage();
            });

            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                const playerName = playerNameInput.value.trim();
                if (playerName !== '') {
                    this.currentPlayerName = playerName;
                    this.renderGamePage();
                }
            });
        });
    }

    async renderGamePage() {
        await this._applyPageTransition(() => {
            // Set history state for the game page
            history.pushState({ page: 'game' }, 'Wordle - Game', './game');

            // New Game, when the game is loaded from storage game is already true
            if (!this.isGame) {
                this.currentBoard = [];
                this.keyboard = new Keyboard();
                this.score = 0;
                this.gamelogic = new Game_logic();
                this.secretWord = this.gamelogic.getSecretWord();
            }

            this.isGame = true;
            this.currentWord = '';
            localStorage.setItem('active_game', this.isGame);
            localStorage.setItem('current_board', JSON.stringify(this.currentBoard));
            localStorage.setItem('current_player_name', this.currentPlayerName);
            localStorage.setItem('current_secret_word', this.secretWord);
            localStorage.setItem('current_score', this.score);
            this.main.innerHTML = `
                <section class="single" id="board">
                </section>
                <section class="single" id="keyboard">
                </section>`;

            this._renderBoardAndKeyboard();
        });
    }

    _applyPageTransition(renderPageCallback) {
        const transitionTime = 400;
        return new Promise((resolve) => {
            const main = this.main;
            main.classList.add('page_transition_exit_active');
            setTimeout(() => {
                main.classList.remove('page_transition_exit_active');
                main.classList.add('page_transition_enter');
                renderPageCallback();
                requestAnimationFrame(() => {
                    main.classList.add('page_transition_enter_active');
                    main.classList.remove('page_transition_enter');
                    setTimeout(() => {
                        main.classList.remove('page_transition_enter_active');
                        resolve();
                    }, transitionTime); // Match the duration of the CSS transition
                });
            }, transitionTime); // Match the duration of the CSS transition
        });
    }

    _getStatTableRows() {
        let result = '';
        let scoreTable = JSON.parse(localStorage.getItem('score_table'));
        if (scoreTable == null) {
            return null;
        }
        scoreTable.sort((a, b) => b[1] - a[1]);
        for (const data of scoreTable) {
            result += `<tr>
                <td>${data[0]}</td>
                <td>${data[1]}</td>
                <td>${data[2]}</td>
            </tr>`;
        }
        return result;
    }

    async renderScorePage() {
        await this._applyPageTransition(() => {
            // Set history state for the score page
            history.pushState({ page: 'score' }, 'Wordle - Score', './score');
            this.isGame = false;

            let tableBody = this._getStatTableRows();
            let table = '';
            if (tableBody == null) {
                table = `<tr><td colspan="3">No scores were found, you should try to play!</td></tr>`;
            } else {
                table = `<table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Score</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableBody}                  
                    </tbody>
                </table>`;
            }

            this.main.innerHTML = `
                <section class="single" id="score">
                    <h2>Scores</h2>
                    ${table}     
                    <input type="submit" value="Play again" id="submit_play_again">
                </section>`;

            const playAgainButton = document.querySelector('#submit_play_again');
            playAgainButton.addEventListener('click', (e) => {
                this.renderWelcomePage()
            });
        });
    }

    _handleKeyUp(key) {
        if (this.isGame) {
            const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            if (key === "Backspace") {
                if (this.currentWord.length > 0) {
                    this.currentWord = this.currentWord.slice(0, -1);
                    this._handleClick(document.querySelector(`#backspace`));
                }
                this._renderBoard();
                return;
            }
            if (letters.includes(key)) {
                if (this.currentWord.length < 5) {
                    this.currentWord += key;
                    this._handleClick(document.querySelector(`#${key}`));
                    this._renderBoard()
                    return;
                }
            }
            if (key === "Enter" && this.currentWord.length === 5) {
                this._handleClick(document.querySelector(`#enter`));

                let [result, letters] = this.gamelogic.checkWord(this.currentWord);
                let win = result[0];
                if (result[1]) {
                    this.currentBoard[this.currentBoard.length] = letters;
                    localStorage.setItem('current_board', JSON.stringify(this.currentBoard));
                    this.currentWord = '';

                    for (const letter of letters) {
                        this.keyboard.addClassToLetter(...letter);
                        this._addScoreForLetter(letter[1]);
                    }
                    localStorage.setItem('current_score', this.score);

                    if (win || this.currentBoard.length===6) { // Game ended in a win or a defeat
                        this.score += pointsForWin * (6 - this.currentBoard.length + 1);
                        let scoreTable = JSON.parse(localStorage.getItem('score_table'));
                        if (scoreTable==null) {
                            scoreTable = new Array(0);
                        }
                        scoreTable.push([this.currentPlayerName, this.score, new Date().toLocaleString()]);
                        scoreTable.sort((a, b) => b[1] - a[1]);
                        if (scoreTable.length > 10) {
                            scoreTable.pop();
                        }
                        localStorage.setItem('score_table', JSON.stringify(scoreTable));

                        this._renderBoardAndKeyboard()
                        // Invalidate variables
                        this.isGame = false;
                        this.currentWord = null;
                        this.score = 0;
                        this.currentWord = [];
                        this.currentPlayerName = '';
                        localStorage.setItem('current_score', this.score);
                        localStorage.setItem('active_game', this.isGame);

                        this._showModalWindow("You " + (win ? 'won': 'lost') + '!', 300);
                        requestAnimationFrame(() => {
                            setTimeout(async () => {
                                await this.renderScorePage();
                            }, 2000);
                        });
                        return;
                    }

                    this._renderBoardAndKeyboard()
                } else {
                    this._showModalWindow("Wrong word!", 0, 1000);
                }
            }

        }
    }

    addKeyUpListener() {
        document.addEventListener('keyup', e => {
            this._handleKeyUp(e.key);
        });
    }

    _getBoardRow(i, row = []) {
        let result = '';
        if (row.length>0) {
            for (const letter of row) {
                if (letter.length > 1) {
                    result += this._getLetterBox("board", letter[0], '', letter[1]);
                } else {
                    result += this._getLetterBox("board", letter);
                }
            }

        } else {
            for (let j = 0; j < 5; j++) {
                result += this._getLetterBox("board", '');
            }
        }

        return "<div class=\"board_row\">" + result + "</div>";
    }

    _renderBoard() {
        // Rerender game board with the new word
        if (this.isGame) {
            const gameBoard = document.querySelector('#board');

            let result = '';
            let guessRendered = false;
            for (let i = 0; i < 6; i++) {
                let row = this.currentBoard.hasOwnProperty(i) ? this.currentBoard[i] : [];
                if (row.length===0 && !guessRendered) {
                    row = this._getFiveCharStr(this.currentWord);
                    guessRendered = true;
                }
                result += this._getBoardRow(i, row);
            }

            gameBoard.innerHTML = `<h3>Player: ${this.currentPlayerName}</h3><h4>Score: ${this.score}</h4>` + result;
        }
    }

    _getLetterBox(type, letter, id = '', extraClasses ='') {
        id = id!=='' ? `id="${id}"` : '';
        let data = letter===' ' || letter==='' ? '' : `data-content="letter"`;
        return `<div tabindex="-1" class="${type}_letter letter ${extraClasses}" ${data} ${id}>${letter}</div>`;
    }

    _getKeyboardRow(letters, last = false) {
        let result = '';
        for (const letter of letters) {
            result += this._getLetterBox("keyboard", letter[0], letter[0], letter[1]);
        }

        if (last) {
            result = this._getLetterBox("keyboard", this._getBackspaceSvg(), 'Backspace', 'keyboard_large_letter') + result +
                this._getLetterBox("keyboard", 'Enter', 'Enter', 'keyboard_large_letter');
        }
        return "<div class=\"keyboard_row\">" + result + "</div>";
    }

    _renderKeyboard() {
        if (this.isGame) {
            const keyboardDiv = document.querySelector('#keyboard');
            let result = '';

            for (const [key, letters] of Object.entries(this.keyboard.getKeyboard())) {
                result += this._getKeyboardRow(letters, key === 'last');
            }

            keyboardDiv.innerHTML = result;
            keyboardDiv.addEventListener('mouseup', e => {
                if (e.target.classList.contains('letter')) {
                    this._handleKeyUp(e.target.id);
                }
            })
        }
    }

    _renderBoardAndKeyboard() {
        this._renderBoard();
        this._renderKeyboard();
    }

    _getFiveCharStr(str) {

        while (str.length < 5) {
            str += ' ';
        }

        return str;
    }

    async handlePopState(event) {
        // Handle history navigation
        const state = event.state;
        if (state) {
            if (state.page === 'welcome') {
                await this.renderWelcomePage();
            } else if (state.page === 'game') {
                await this.renderGamePage();
            } else if (state.page === 'score') {
                await this.renderScorePage();
            }
        } else {
            await this.renderWelcomePage();
        }
    }

    _handleClick(keyboardLetter) {
        if (keyboardLetter != null) {
            keyboardLetter.classList.add('active');
            setTimeout(() => {
                keyboardLetter.classList.remove('active');
            }, 200);
        }
    }

    _getBackspaceSvg() {
        return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
                <path fill="var(--text_clr)"
                      d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
            </svg>`;
    }

    _getCurrentPageFromURL() {
        // Get first "directory" from URL
        const url = new URL(window.location.href);
        const filteredSegments = url.pathname.split('/').filter(segment => segment.length > 0);
        return filteredSegments.length > 1 ? filteredSegments[1] : null;
    }

    _checkBoardForCorrectGuess(board) {
        for (const [row, letters] of Object.entries(board)) {
            let correctGuess = true;
            for (const [letter, value] of letters) {
                correctGuess &= value==='correct';
            }
            if (correctGuess) {
                return true;
            }
        }
        return false;
    }

    _addScoreForLetter(letterResult) {
        switch (letterResult) {
            case 'correct':
                this.score += pointsForCorrectLetter;
                break;
            case 'present':
                this.score += pointsForPresentLetter;
                break;
        }
    }

    _showModalWindow(string, delay, ttl = 0) {
        let modal = document.createElement('div');
        modal.innerHTML = `<div class="modal-content"><h2>${string}</h2></div>`;
        modal.classList.add('modal');
        this.main.append(modal);

        requestAnimationFrame(() => {
            setTimeout( () => {
                modal.classList.toggle('active');
                if (ttl!==0) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                                modal.classList.toggle('active');
                            }, ttl)
                    });
                }
            }, delay);
        });
    }
}


class Keyboard {
    constructor() {
        this.letters = {
            'a':['a',''], 'b':['b',''], 'c':['c',''], 'd':['d',''], 'e':['e',''], 'f':['f',''], 'g':['g',''],
            'h':['h',''], 'i':['i',''], 'j':['j',''], 'k':['k',''], 'l':['l',''], 'm':['m',''], 'n':['n',''],
            'o':['o',''], 'p':['p',''], 'q':['q',''], 'r':['r',''], 's':['s',''], 't':['t',''], 'u':['u',''],
            'v':['v',''], 'w':['w',''], 'x':['x',''], 'y':['y',''], 'z':['z','']};
    }

    addClassToLetter(letter, newClass) {
        if (this.letters.hasOwnProperty(letter)) {
            const oldClass = this.letters[letter][1];
            switch (oldClass) {
                case 'correct': // do nothing
                    break;
                case 'present': // only change to correct
                    if (newClass === 'correct') {
                        this.letters[letter][1] = newClass;
                    }
                    break;
                default: // add class, things can only be better
                    this.letters[letter][1] = newClass;
                    break;
            }

        }
    }

    getKeyboard() {
        return {"first":[this.letters['q'], this.letters['w'], this.letters['e'], this.letters['r'], this.letters['t'], this.letters['y'], this.letters['u'], this.letters['i'], this.letters['o'], this.letters['p']],
            "second":[this.letters['a'], this.letters['s'], this.letters['d'], this.letters['f'], this.letters['g'], this.letters['h'], this.letters['j'], this.letters['k'], this.letters['l']],
        "last":[this.letters['z'], this.letters['x'], this.letters['c'], this.letters['v'], this.letters['b'], this.letters['n'], this.letters['m']]};

    }

    static createFromBoard(board) {
        const keyboard = new Keyboard();
        for (const [row, letters] of Object.entries(board)) {
            for (const [letter, value] of letters) {
                keyboard.addClassToLetter(letter, value);
            }
        }
        return keyboard;
    }

}