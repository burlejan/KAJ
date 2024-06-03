/*
* This handles color scheme toggle
*/

const toggle = document.querySelector('#theme_toggle');
const toggleSpan = document.querySelector('#theme_toggle_span');
toggle.addEventListener('click', toggleColorScheme);

function changeLabel() {
    // nastaveni popisku na tlacitku pro zmenu barevneho schematu
    if (document.documentElement.classList.contains("dark")) {
        toggleSpan.innerHTML = "&#x2600;";
    } else {
        toggleSpan.innerHTML = "&#x263e;";
    }
}

function loadColorScheme() {
    let theme = localStorage.getItem("theme") || "";
    if (theme === "") {
        //kdyz neni nic ulozeno, tak nastavi barevne schema podle nastaveni prohlizece
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add("dark")
        } else {
            document.documentElement.classList.add("light")
        }
    } else {
        document.documentElement.classList.add(theme);
    }
    changeLabel()
}
loadColorScheme()

function toggleColorScheme() {
    // zmena schematu pri kliknuti na tlacitko
    if (document.documentElement.classList.contains("light")) {
        document.documentElement.classList.remove("light")
        document.documentElement.classList.add("dark")
        localStorage.setItem("theme", "dark");
    } else if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark")
        document.documentElement.classList.add("light")
        localStorage.setItem("theme", "light");
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.add("light")
            localStorage.setItem("theme", "light");
        }
    }
    changeLabel()
}
