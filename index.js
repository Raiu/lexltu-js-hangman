const selKeypad = '.container-keypad';
const selHangman = '.container-hangman';
const selGame = '.container-game';
const selWord = '.container-word';
const selWordList = '.list-word';
const selKeypadButton = '.btn-keypad';
const selModalWin = '.modal.won';
const selModalLost = '.modal.lost';

const fillChar = '_';

const wordsFileUrl = './words.json';

const alphabetLetters = [...Array(26)].map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i));

const rand = (lowest, highest) => Math.floor(Math.random() * (highest - lowest + 1)) + parseFloat(lowest);

let hangmanParts = [];
let hangmanState = 0;

let gameReady = false;
let guessedLetters = [];
let attempts = 0;
let wrongGuesses = 0;
let maxGuesses = 6;

let theWord, theWordHint, theWordLetters;

let gameState = {
    correctGuesses: [],
    guessedLetters: [],
    wrongGuesses: 0,
    attempts: 0,
    gameReady: false,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

const gameStateHandler = {
    set(obj, prop, value) {
        obj[prop] = value;
        switch (prop) {
            case 'wrongGuesses':
                wrongGuessesHandler(value);
                break;
            case 'correctGuesses':
                correctGuessesHandler(value);
                break;
            case 'guessedLetters':
                guessedLettersHandler(value);
                break;
            default:
                break;
        }
        return true;
    },
};

const state = new Proxy(gameState, gameStateHandler);

//////////////////////////////////////////////////////////////////////////////////////////////////////

const addKeypadButtonEvents = keypad => {
    Array.from(keypad.querySelectorAll('button')).forEach(button => {
        button.addEventListener('click', event => handleGuessEvent(event));
    });
};

const addKeyPressEvent = () => window.addEventListener('keydown', handleGuessEvent);

const removeKeyPressEvent = () => window.removeEventListener('keydown', handleGuessEvent);

const handleGuessEvent = event => {
    const letter = event.type === 'click' ? event.target.dataset.id?.toUpperCase() : event.key?.toUpperCase();
    if (letter && alphabetLetters.includes(letter) && !guessedLetters.includes(letter)) {
        processGuess(letter, event);
    }
};

const wrongGuessesHandler = value => {
    if (value >= maxGuesses - 2) {
        showHint();
    }
    updateHangman();
};

const correctGuessesHandler = value => {
    document.querySelector(selWordList).innerHTML = genWordDisplay(value);
};

const guessedLettersHandler = value => {
    disableKeypadButton(value[value.length - 1]);
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

const processGuess = (letter, event) => {
    if (state.guessedLetters.includes(letter)) {
        console.log(`'${letter}' already guessed`);
        return;
    }

    if (theWordLetters.includes(letter)) {
        updateCorrectGuesses(letter);
    } else {
        state.wrongGuesses++;
    }

    state.attempts++;
    state.guessedLetters = [...state.guessedLetters, letter];

    checkGameCondition();
};

const checkGameCondition = () => {
    if (state.wrongGuesses === maxGuesses) {
        console.log('Lost: Max attempts reached');
        showLostModal();
        return;
    }

    if (state.correctGuesses.join() === theWordLetters.join()) {
        console.log('Won: Word guessed');
        showWinModal();
        return;
    }
};

const updateHangman = () => {
    if (hangmanState !== state.wrongGuesses && hangmanState < maxGuesses) {
        hangmanState++;
        hangmanParts[hangmanState - 1].classList.remove('invisible');
        sendFlashLifeLost('.container');
    }
};

const updateCorrectGuesses = letter => {
    state.correctGuesses = theWordLetters.map((l, i) => {
        if (l === letter) {
            return letter;
        }
        if (state.correctGuesses[i] !== fillChar) {
            return state.correctGuesses[i];
        }
        return fillChar;
    });
};

const sendFlashLifeLost = async selector => {
    const element = document.querySelector(selector);
    element.classList.add('flash-life-lost');
    setTimeout(() => element.classList.remove('flash-life-lost'), 600);
};

const disableKeypadButton = letter => {
    document.querySelector(`${selKeypadButton}[data-id="${letter}"]`).disabled = true;
};

const showHint = () => {
    document.querySelector('.hint').classList.remove('hidden');
    document.querySelector('.hint .tooltip').innerHTML = theWordHint;
};

const showWinModal = () => {
    document.querySelector(selModalWin).classList.remove('hidden');
    document.querySelector('#btn-reset-won').addEventListener('click', () => location.reload());
};

const showLostModal = () => {
    document.querySelector(selModalLost + ' .modal-content').innerHTML = `
    <h1>You lost!</h1>
    <p>${theWord} was the correct word.</p>
    <button class="close btn-modal" id="btn-reset-lost">Play again</button>`;

    const modal = document.querySelector(selModalLost);
    modal.classList.remove('hidden');
    modal.addEventListener('click', () => location.reload());
    document.querySelector('#btn-reset-lost').addEventListener('click', () => location.reload());
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

const setHangmanParts = () => (hangmanParts = [...document.querySelectorAll('svg .hangman')]);

const genWordDisplay = letters => {
    return letters.map(l => (l !== fillChar ? `<li class="active">${l}</li>` : `<li></li>`)).join('\n');
};

const getRandomWord = words => words[rand(0, words.length - 1)];

const genKeyboard = alphabet => alphabet.map(genKeyboardButton).join('\n');

const genKeyboardButton = key => `<button class="btn-keypad" data-id="${key}">${key}</button>`;

//////////////////////////////////////////////////////////////////////////////////////////////////////

const fetchWords = async url => (await fetch(url)).json();

const start = async () => {
    const keypad = document.querySelector(selKeypad);
    const wordList = document.querySelector(selWordList);

    // Fetch words
    try {
        const words = await fetchWords(wordsFileUrl);
        ({ word: theWord, hint: theWordHint } = getRandomWord(words));
        theWordLetters = theWord.toUpperCase().split('');
        state.correctGuesses = Array(theWord.length).fill(fillChar);
    } catch (error) {
        console.error(error);
        return;
    }

    setHangmanParts();

    // Create keypad
    keypad.innerHTML = genKeyboard(alphabetLetters);
    addKeypadButtonEvents(keypad);

    // Add keyboard press listeners
    window.addEventListener('keydown', handleGuessEvent);
    window.addEventListener('focus', addKeyPressEvent);
    window.addEventListener('blur', removeKeyPressEvent);

    console.log('Word:', theWord);
    console.log('Hint:', theWordHint);

    state.gameReady = true;
};

// Start game
window.onload = start();
