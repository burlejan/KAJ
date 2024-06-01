/*
* Class for game logic
 */

export class game_logic {

    constructor() {
       this.#getWords();
    }

    #getWords(){
        //todo get words from ?file?
        this.words = ["apple", "lemon", "melon", "grape", "peach", "beach"];
        return;
    }

    

    checkWord(quess) {
        if (quess == this.secret) {
            
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
