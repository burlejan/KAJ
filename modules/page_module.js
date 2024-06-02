/*
* Class for writing into the page
*/

import {Game_logic} from "./word_module.js";

export class Page_generator {
    constructor() {
        this.main = document.querySelector('main');
        this._getCurrentPageFromURL();
        this.currentPlayerName = '';
        this.secretWord = null;
        this.gamelogic = null;
        this.isGame = false;
        this.keyboard = null;
        localStorage.setItem('active_game', this.isGame);
        this.currentBoard = [];
        window.onpopstate = this.handlePopState.bind(this); // Listen to popstate event for history navigation
        this._renderPageByURL();
        this.addKeyUpListener(); // mozna zbytecne
    }

    _renderPageByURL() {
        let page = this._getCurrentPageFromURL();
        if (page == null) {
            this.renderWelcomePage();
            return;
        }

        switch (page) {
            case 'game':
                const activeGame = localStorage.getItem('active_game');
                const playerName = localStorage.getItem('current_player_name');
                const board = JSON.parse(localStorage.getItem('current_board'));
                const secretWord = localStorage.getItem('current_secret_word');
                if (activeGame == null || !activeGame || playerName == null || board == null || secretWord == null) {
                    // No data no game
                    this.currentPlayerName = '';
                    this.currentBoard = [];
                    this.secretWord = null;
                    this.isGame = false;
                    this.gamelogic = null;
                    this.renderWelcomePage();
                } else {
                    this.currentPlayerName = playerName;
                    this.currentBoard = board;
                    this.secretWord = secretWord;
                    this.isGame = true;
                    this.gamelogic = Game_logic.createWithSecretWord(this.secretWord);
                    this.keyboard = Keyboard.createFromBoard(this.currentBoard);
                    this.renderGamePage();
                }
                break;
            case 'score':
                this.renderScorePage()
                break;
            default:
                this.renderWelcomePage();
                break;
        }

    }

    _getCurrentPageFromURL() {
        // Get first "directory" from URL
        const url = new URL(window.location.href);
        const filteredSegments = url.pathname.split('/').filter(segment => segment.length > 0);
        return filteredSegments.length > 0 ? filteredSegments[0] : null;
    }

    renderWelcomePage() {
        // Set history state for the welcome page
        history.pushState({ page: 'welcome' }, 'Wordle - Welcome', '/');

        // TODO add form
        this.main.innerHTML = `
            <section class="single">
                <h2>Wordle</h2>
                <label for="player_name">Player name:</label>
                <input type="text" id="player_name" maxlength="5" placeholder="Enter your name">
                <input type="submit" value="Start game" id="submit_player_name">
            </section>`;

        const submitButton = document.querySelector('#submit_player_name');
        const playerNameInput = document.querySelector('#player_name');

        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            const playerName = playerNameInput.value.trim();
            if (playerName !== '') {
                this.currentPlayerName = playerName;
                this.renderGamePage();
            }
        });
    }

    renderGamePage() {
        // Set history state for the game page
        history.pushState({ page: 'game' }, 'Wordle - Game', '/game');

        this.isGame = true;
        this.currentWord = '';
        localStorage.setItem('active_game', this.isGame);
        // TODO determine if serialization is needed
        localStorage.setItem('current_board', JSON.stringify(this.currentBoard));
        localStorage.setItem('current_player_name', this.currentPlayerName);
        if (this.secretWord == null) {
            this.gamelogic = new Game_logic();
            this.secretWord = this.gamelogic.getSecretWord();
        }
        this.keyboard = this.keyboard == null ? new Keyboard() : this.keyboard;
        localStorage.setItem('current_secret_word', this.secretWord);
        this.main.innerHTML = `
            <section class="single" id="board">
            </section>
            <section class="single" id="keyboard">
            </section>`;

        this._renderBoardAndKeyboard();
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

            gameBoard.innerHTML = `<p>Player: ${this.currentPlayerName}</p>` + result;
        }
    }

    _getBackspaceSvg() {
        return `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
                <path fill="var(--text_clr)"
                      d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
            </svg>`;
    }

    _getLetterBox(type, letter, id = '', extraClasses ='') {
        id = id!=='' ? `id="${id}"` : '';
        return `<div tabindex="-1" class="${type}_letter letter ${extraClasses}" ${id}>${letter}</div>`;
    }

    _getKeyboardRow(letters, last = false) {
        let result = '';
        for (const letter of letters) {
            result += this._getLetterBox("keyboard", letter[0], letter[0], letter[1]);
        }

        if (last) {
            result = this._getLetterBox("keyboard", this._getBackspaceSvg(), 'backspace', 'keyboard_large_letter') + result +
                this._getLetterBox("keyboard", 'Enter', 'enter', 'keyboard_large_letter');
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
        }
    }

    renderScorePage() {
        // Set history state for the score page
        history.pushState({ page: 'score' }, 'Wordle - Score', '/score');

        this.main.innerHTML = `
            <section class="score">
                <h2>Scores</h2>
                <p>Score 1: 100</p>
                <p>Score 2: 80</p>
                <p>Score 3: 50</p>
            </section>`;
    }

    handlePopState(event) {
        // Handle history navigation
        const state = event.state;
        if (state) {
            if (state.page === 'welcome') {
                this.renderWelcomePage();
            } else if (state.page === 'game') {
                this.renderGamePage();
            } else if (state.page === 'score') {
                this.renderScorePage();
            }
        } else {
            this.renderWelcomePage();
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

    addKeyUpListener() {
        document.addEventListener('keyup', e => {
            if (this.isGame) {
                const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                if (e.key === "Backspace") {
                    if (this.currentWord.length > 0) {
                        this.currentWord = this.currentWord.slice(0, -1);
                        this._handleClick(document.querySelector(`#backspace`));
                    }
                    this._renderBoard();
                    return;
                }
                if (letters.includes(e.key)) {
                    if (this.currentWord.length < 5) {
                        this.currentWord += e.key;
                        this._handleClick(document.querySelector(`#${e.key}`));
                        this._renderBoard()
                        return;
                    }
                }
                if (e.key === "Enter" && this.currentWord.length === 5) {
                    this._handleClick(document.querySelector(`#enter`));

                    let [result, letters] = this.gamelogic.checkWord(this.currentWord);
                    let win = result[0]; //temporary
                    if (result[1]) {
                        this.currentBoard[this.currentBoard.length] = letters;
                        localStorage.setItem('current_board', JSON.stringify(this.currentBoard));
                        this.currentWord = '';

                        for (const letter of letters) {
                            this.keyboard.addClassToLetter(...letter);
                            // let key = document.querySelector('#'+letter[0]);
                            // key.classList.add(letter[1]);
                        }

                        if (win) {
                            this.isGame = false;
                            this.currentWord = null;
                            //TODO animation and then stats
                            setTimeout(() => this.renderScorePage(), 4000);
                        }
                    }

                }
                this._renderBoardAndKeyboard()
            }
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