/*
* Class for writing into the page
*/

export class page_generator {


    constructor() {
        this.main = document.querySelector('main');
        
    }

    renderWelcomePage() {
        this.main.innerHTML =
            `<section class="single">
                <h2>Wordle</h2>
                <label for="player_name">Your name:</label>
                <input type="text" id="player_name" maxlength="5" placeholder="Enter your guess">
                <input type="submit" value="Start game" id="submit_player_name">
            </section>`;

    }

    renderGamePage() {
        return;
    }

    render

    renderScorePage() {
        return;
    }
}

















