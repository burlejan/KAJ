/*
* Class for game logic
 */

export class Game_logic {

    constructor() {
        this._getWords();
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

    _getWords(){
        //todo get words from ?file?
        this.words = ["apple", "lemon", "melon", "grape", "peach", "beach"];
        this.secretWord = this.words[Math.floor(Math.random() * this.words.length)];
    }

    checkWord(guess) {
        if (guess === this.secretWord) {
            return [true, true];
        } else {
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

                return [[false, true], result];
            }
            // TODO check characters
            return [false, false];
        }
    }

}





// // List of possible words
// const words = ["apple", "orange", "lemon", "melon", "banana", "grape", "peach", "cherry", "plum", "kiwi"];
//
// // Pick a random word from the list
// let secretWord = words[Math.floor(Math.random() * words.length)];
// let attemptsLeft = 6;
// let guessedWord = "_____"; // Display placeholder
//
// // Function to check the guess and update game state
// function checkGuess(guess) {
//     guess = guess.toLowerCase().trim();
//
//     if (guess.length !== 5 || !/^[a-z]+$/.test(guess)) {
//         return { message: "Please enter a valid 5-letter word.", isGameOver: false };
//     }
//
//     if (attemptsLeft > 0) {
//         attemptsLeft--;
//
//         if (guess === secretWord) {
//             guessedWord = secretWord;
//             return { message: "Congratulations! You guessed the word.", isGameOver: true };
//         } else {
//             let newGuessedWord = "";
//             for (let i = 0; i < 5; i++) {
//                 if (secretWord[i] === guess[i]) {
//                     newGuessedWord += guess[i];
//                 } else if (secretWord.includes(guess[i])) {
//                     newGuessedWord += "?";
//                 } else {
//                     newGuessedWord += "_";
//                 }
//             }
//             guessedWord = newGuessedWord;
//
//             if (attemptsLeft === 0) {
//                 return { message: "Out of attempts! The word was: " + secretWord, isGameOver: true };
//             } else {
//                 return { message: "Incorrect guess. Attempts left: " + attemptsLeft, isGameOver: false };
//             }
//         }
//     }
//
//     return { message: "", isGameOver: true }; // Game over state
// }
//
// // Function to get the current state of the game
// function getGameState() {
//     return {
//         guessedWord: guessedWord,
//         attemptsLeft: attemptsLeft,
//         secretWordLength: 5 // Assuming fixed word length of 5 letters
//     };
// }
//
// // Export the functions to be used as a module
// export { checkGuess, getGameState };
