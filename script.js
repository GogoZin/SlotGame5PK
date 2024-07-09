const cards = [];
const cardElements = document.querySelectorAll('.card');
const dealButton = document.getElementById('dealButton');
const drawButton = document.getElementById('drawButton');
const resultDisplay = document.createElement('div');
const cardSound = new Audio('audio/cardsounds.mp3');
const btnSound = new Audio('audio/btn.mp3');
cardSound.volume = 1;
btnSound.volume = 1;
resultDisplay.id = 'result';
document.body.appendChild(resultDisplay);

let currentDeck = [];
let valueCounts = {}; // 全局變數，存儲牌面值計數
let suitCounts = {};  // 全局變數，存儲花色計數

function initializeDeck() {
    currentDeck = [];
    const suits = ['♠', '♥', '♣', '♦'];
    const colors = { '♠': 'black', '♥': 'red', '♣': 'black', '♦': 'red' };
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    suits.forEach(suit => {
        values.forEach(value => {
            currentDeck.push({ value, suit, color: colors[suit] });
        });
    });
}

function shuffleDeck() {
    for (let i = currentDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
}

function dealCards() {
    btnSound.play();
    initializeDeck();
    shuffleDeck();
    for (let i = 0; i < 5; i++) {
        cards[i] = currentDeck.pop();
        displayCard(cardElements[i], cards[i]);
        cardElements[i].classList.remove('held');
        cardElements[i].style.border = '1px solid black'; // 恢復原來的邊框顏色
        cardElements[i].classList.remove('winning'); // 清空背景顏色
        cardElements[i].addEventListener('click', toggleHold); // 重新啟用事件處理
    }
    drawButton.disabled = false;
    dealButton.disabled = true;
    resultDisplay.textContent = ''; // 清空結果顯示
    
    const coverElements = document.querySelectorAll('.cover');
    const backElements = document.querySelectorAll('.back');

    setTimeout(()=> {
        coverElements.forEach((cv, c_index) => {
            cardSound.play();
            setTimeout(() => {
                cv.classList.add('goback');
                backElements[c_index].classList.add('gofront');
            }, c_index * 200);
        });
    }, 100);
}

function drawCards() {
    btnSound.play();
    for (let i = 0; i < 5; i++) {
        if (!cardElements[i].classList.contains('held')) {
            cards[i] = currentDeck.pop();
            displayCard(cardElements[i], cards[i]);
        }
        
        cardElements[i].removeEventListener('click', toggleHold); // 禁用事件處理
    }
    const coverElements = document.querySelectorAll('.cover');
    const backElements = document.querySelectorAll('.back');
    setTimeout(()=> {
        coverElements.forEach((cv, c_index) => {
            cardSound.play();
            setTimeout(() => {
                cv.classList.add('goback');
                backElements[c_index].classList.add('gofront'); //抽牌動畫
            }, c_index * 200);
        });
    }, 100);
    setTimeout(() => {
        checkForWin(); //延遲判斷中獎
    }, 1500);
    drawButton.disabled = true;
    dealButton.disabled = false;
}

function displayCard(element, card) { //繪製牌面
    element.innerHTML = `<div class="cover"></div>
        <div class="back">
            <span class="value" style="color: ${card.color};">${card.value}</span>
            <span class="suit" style="color: ${card.color};">${card.suit}</span>
        </div>
    `;
}

function toggleHold() {
    this.classList.toggle('held');
    if (this.classList.contains('held')) {
        this.style.border = '2px solid yellow'; // 選擇保留牌時設置邊框為黃色
    } else {
        this.style.border = '1px solid black'; // 取消選擇時恢復原來的邊框顏色
    }
}

function checkForWin() {
    valueCounts = {}; // 清空牌面值計數
    suitCounts = {};  // 清空花色計數

    const values = cards.map(card => card.value);
    const suits = cards.map(card => card.suit);

    values.forEach(value => valueCounts[value] = (valueCounts[value] || 0) + 1);
    suits.forEach(suit => suitCounts[suit] = (suitCounts[suit] || 0) + 1);

    const isFlush = Object.keys(suitCounts).length === 1;
    const isStraight = checkStraight(values);
    const fourOfAKind = Object.values(valueCounts).includes(4);
    const threeOfAKind = Object.values(valueCounts).includes(3);
    const pairs = Object.values(valueCounts).filter(count => count === 2).length;

    if (isFlush && isStraight) {
        highlightWinningCards('flushStraight');
        resultDisplay.textContent = '中獎: 同花順';
    } else if (fourOfAKind) {
        highlightWinningCards('fourOfAKind');
        resultDisplay.textContent = '中獎: 鐵支';
    } else if (threeOfAKind && pairs === 1) {
        highlightWinningCards('fullHouse');
        resultDisplay.textContent = '中獎: 葫蘆';
    } else if (isFlush) {
        highlightWinningCards('flush');
        resultDisplay.textContent = '中獎: 同花';
    } else if (isStraight) {
        highlightWinningCards('straight');
        resultDisplay.textContent = '中獎: 順子';
    } else if (threeOfAKind) {
        highlightWinningCards('threeOfAKind');
        resultDisplay.textContent = '中獎: 三條';
    } else if (pairs === 2) {
        highlightWinningCards('twoPair');
        resultDisplay.textContent = '中獎: 兩對';
    } else if (pairs === 1) {
        highlightWinningCards('onePair');
        resultDisplay.textContent = '中獎: 一對';
    } else {
        resultDisplay.textContent = '未中獎';
    }
}

function highlightWinningCards(winType) {
    switch (winType) {
        case 'flushStraight':
            const isFlushStraight = Object.keys(suitCounts).length === 1 && checkStraight(Object.keys(valueCounts));
            if (isFlushStraight) {
                cards.forEach((card, index) => {
                    if (index < 5) {
                        cardElements[index].classList.add('winning');
                    }
                });
            }
            break;
        case 'fourOfAKind':
            const fourKindValue = Object.keys(valueCounts).find(key => valueCounts[key] === 4);
            cards.forEach((card, index) => {
                if (card.value === fourKindValue) {
                    cardElements[index].classList.add('winning');
                }
            });
            break;
        case 'fullHouse':
            const threeKindValue = Object.keys(valueCounts).find(key => valueCounts[key] === 3);
            const pair3Value = Object.keys(valueCounts).find(key => valueCounts[key] === 2);
            cards.forEach((card, index) => {
                if (card.value === threeKindValue || card.value === pair3Value) {
                    cardElements[index].classList.add('winning');
                }
            });
            break;
        case 'flush':
            if (Object.keys(suitCounts).length === 1) {
                cards.forEach((card, index) => {
                    if (index < 5) {
                        cardElements[index].classList.add('winning');
                    }
                });
            }
            break;
        case 'straight':
            if (checkStraight(Object.keys(valueCounts))) {
                cards.forEach((card, index) => {
                    cardElements[index].classList.add('winning');
                });
            }
            break;
        case 'threeOfAKind':
            const threeValue = Object.keys(valueCounts).find(key => valueCounts[key] === 3);
            cards.forEach((card, index) => {
                if (card.value === threeValue) {
                    cardElements[index].classList.add('winning');
                }
            });
            break;
        case 'twoPair':
            const pairsValues = Object.keys(valueCounts).filter(key => valueCounts[key] === 2);
            cards.forEach((card, index) => {
                if (pairsValues.includes(card.value)) {
                    cardElements[index].classList.add('winning');
                }
            });
            break;
        case 'onePair':
            const pairValue = Object.keys(valueCounts).find(key => valueCounts[key] === 2);
            cards.forEach((card, index) => {
                if (card.value === pairValue) {
                    cardElements[index].classList.add('winning');
                }
            });
            break;
        default:
            break;
    }
}


function checkStraight(values) {
    const order = 'A23456789TJQKA';
    const valueIndices = values.map(value => order.indexOf(value)).sort((a, b) => a - b);
    for (let i = 0; i < valueIndices.length - 1; i++) {
        if (valueIndices[i + 1] !== valueIndices[i] + 1) {
            return false;
        }
    }
    return true;
}

dealButton.addEventListener('click', dealCards);
drawButton.addEventListener('click', drawCards);
