/*
* Class for game logic
 */

export class Game_logic {

    constructor() {
        this._getWords().then(console.log);
    }

    static createWithSecretWord(secretWord) {
        const game = new Game_logic();
        game._setSecretWord(secretWord);
        return game;
    }


    _setSecretWord(secretWord) {
        this.secretWord = secretWord;
    }

    getSecretWord() {
        return this.secretWord;
    }

    async _getWords(){
        let words = localStorage.getItem("wordle_words");
        if (words == null) {
            try {
                const res = await fetch("/KAJ/words.txt");
                if (!res.ok) {
                    alert(`Error word file returned status: ${res.statusText}`);
                    throw new Error('Failed to fetch words from the server.');
                }
                const text = await res.text();
                let arr = text.split('\n');
                words = JSON.stringify(arr)
                localStorage.setItem("wordle_words", words);
            } catch (error) {
                console.error('Error fetching words:', error);
                // Fallback to a default list of words if fetching fails
                words = JSON.stringify(["apple", "lemon", "melon", "grape", "peach", "beach"]);
            }

        }
        this.words = JSON.parse(words);
        // this.words = ["apple", "lemon", "melon", "grape", "peach", "beach"];
        this.secretWord = this.words[Math.floor(Math.random() * this.words.length)];
    }

    checkWord(guess) {
        if (this.words.includes(guess)) {
            let result = [];
            for (let i = 0; i < this.secretWord.length; i++) {
                result.push([guess[i], 'absent'])
            }

            const secretCount = {};
            const guessCount = {};

            for (let i = 0; i < guess.length; i++) {
                if (guess[i] === this.secretWord[i]) {
                    result[i] = [guess[i], 'correct'];
                } else {
                    secretCount[this.secretWord[i]] = (secretCount[this.secretWord[i]] || 0) + 1;
                    guessCount[guess[i]] = (guessCount[guess[i]] || 0) + 1;
                }
            }

            for (let i = 0; i < guess.length; i++) {
                if (result[i][1] === 'correct') continue;
                if (secretCount[guess[i]]) {
                    result[i] = [guess[i], 'present'];
                    secretCount[guess[i]]--;
                }
            }

            return [[guess===this.secretWord, true], result];
        }
        return [[false, false]];
    }

}