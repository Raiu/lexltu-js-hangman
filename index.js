const selKeyboard = '.container-keyboard';
const selHangman = '.container-hangman';
const selGame = '.container-game';
const selWord = '.container-word';
const selWordList = '.list-word';

const wordsUrl = './words1.json';

const alphabetArray = [...Array(26)].map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

let gameReady = false;

window.onload = async () => {
    const keyboard = document.querySelector(selKeyboard);
    const wordList = document.querySelector(selWordList);

    // Set keyboard
    keyboard.innerHTML = genKeyboard(alphabetArray);

    // Get and set word
    /* loadWords(wordsUrl)
    .then(words => {
        ({ word, hint } = selectRandomWord(words));
        chars = word.toUpperCase().split('');
        wordList.innerHTML = genEmptyWordDisplay(word);
        })
        .catch(error => {
            console.error(error);
            }); */

    let word, hint, chars;
    try {
        const words = await loadWords(wordsUrl);
        ({ word, hint } = selectRandomWord(words));
        chars = word.toUpperCase().split('');
        wordList.innerHTML = genEmptyWordDisplay(word);
    } catch (error) {
        console.error("Error loading words");
        console.error(error);
        return
    }

    console.log('test');
};

const loadWords = async url => (await fetch(url)).json();

const selectRandomWord = words => words[Math.floor(Math.random() * words.length)];

const genEmptyWordDisplay = word => [...Array(word.length)].map(() => `<li></li>`).join('\n');

const genKeyboard = alphabet => alphabet.map(genKeyboardButton).join('\n');

const genKeyboardButton = key => `<button class="btn-keyboard">${key}</button>`;

const resetHangman = () => {
    console.log('reset');
}
