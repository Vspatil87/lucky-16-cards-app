let selectedCoinValue = 0;
let userBalance = 1000; // Do not change this value (will come from socket)
let balance = userBalance;
let userBets = Array(16);
userBets.fill(0);
let canvasTimer;
let lastwinners = {
    winners: [0, 1, 5, 4, 1],
    betWin: ['0', '2X', '5X', '1X', '8X'],
};
lastWinImages = [
    '../assets/images/last-win-cards/0.png',
    '../assets/images/last-win-cards/1.png',
    '../assets/images/last-win-cards/2.png',
    '../assets/images/last-win-cards/3.png',
    '../assets/images/last-win-cards/4.png',
    '../assets/images/last-win-cards/5.png',
    '../assets/images/last-win-cards/6.png',
    '../assets/images/last-win-cards/7.png',
    '../assets/images/last-win-cards/8.png',
    '../assets/images/last-win-cards/9.png',
    '../assets/images/last-win-cards/10.png',
    '../assets/images/last-win-cards/11.png',
    '../assets/images/last-win-cards/12.png',
    '../assets/images/last-win-cards/13.png',
    '../assets/images/last-win-cards/14.png',
    '../assets/images/last-win-cards/15.png',
];
winnerImages = [
    '../assets/images/win-cards/0.png',
    '../assets/images/win-cards/1.png',
    '../assets/images/win-cards/2.png',
    '../assets/images/win-cards/3.png',
    '../assets/images/win-cards/4.png',
    '../assets/images/win-cards/5.png',
    '../assets/images/win-cards/6.png',
    '../assets/images/win-cards/7.png',
    '../assets/images/win-cards/8.png',
    '../assets/images/win-cards/9.png',
    '../assets/images/win-cards/10.png',
    '../assets/images/win-cards/11.png',
    '../assets/images/win-cards/12.png',
    '../assets/images/win-cards/13.png',
    '../assets/images/win-cards/14.png',
    '../assets/images/win-cards/15.png',
];
xImages = [
    '../assets/images/1x-to-10x/1.png',
    '../assets/images/1x-to-10x/2.png',
    '../assets/images/1x-to-10x/3.png',
    '../assets/images/1x-to-10x/4.png',
    '../assets/images/1x-to-10x/5.png',
    '../assets/images/1x-to-10x/6.png',
    '../assets/images/1x-to-10x/7.png',
    '../assets/images/1x-to-10x/8.png',
    '../assets/images/1x-to-10x/9.png',
    '../assets/images/1x-to-10x/10.png',
];


window.onload = () => {
    getTime();
    getLastWinners();
    startTimer();
};

function getTime() {
    let hours = new Date().getHours();
    let mins = new Date().getMinutes();
    document.getElementById('time').innerText = hours + ' : ' + mins;
}

function getLastWinners() {
    lastwinners.winners.forEach((winner, index) => {
        let imageTag = document.getElementsByClassName('last-win-images')[index];
        let winTag = document.getElementsByClassName('last-win-box')[index];
        imageTag.src = lastWinImages[winner];
        imageTag.style.visibility = 'visible';
        if (lastwinners.betWin[index] && lastwinners.betWin[index] !== '0') {
            winTag.innerText = lastwinners.betWin[index];
        } else {
            winTag.innerText = 'N';
        }
        winTag.style.visibility = 'visible';
    });
}

function checkBalance(bet) {
    if (!bet || isNaN(bet)) {
        bet = 0;
    }
    if (balance >= bet) {
        return true;
    } else {
        alert('No Balance');
        return false;
    }
}

function resetBalance() {
    const totalBets = userBets.reduce((accumulator, currentValue) => accumulator + currentValue);
    balance = userBalance - totalBets;
    document.getElementById('balance').innerText = balance;
    document.getElementById('play-count').innerText = totalBets;
}

function resetCoins() {
    let removeSelectedCoinCss = `box-shadow: none; transform: scale(1); border-radius: 0;`
    selectedCoinValue = 0;
    document.getElementById('coin-5').style.cssText = removeSelectedCoinCss;
    document.getElementById('coin-10').style.cssText = removeSelectedCoinCss;
    document.getElementById('coin-20').style.cssText = removeSelectedCoinCss;
    document.getElementById('coin-50').style.cssText = removeSelectedCoinCss;
    document.getElementById('coin-100').style.cssText = removeSelectedCoinCss;
    document.getElementById('coin-500').style.cssText = removeSelectedCoinCss;
}

function selectCoin(value) {
    resetCoins();
    let selectedCoinCss = `box-shadow: 0px 0px 8px 0px; transform: scale(1.1); border-radius: 60px;`;
    selectedCoinValue = parseInt(value, 10);
    switch (value) {
        case 5:
            document.getElementById('coin-5').style.cssText = selectedCoinCss;
            break;
        case 10:
            document.getElementById('coin-10').style.cssText = selectedCoinCss;
            break;
        case 20:
            document.getElementById('coin-20').style.cssText = selectedCoinCss;
            break;
        case 50:
            document.getElementById('coin-50').style.cssText = selectedCoinCss;
            break;
        case 100:
            document.getElementById('coin-100').style.cssText = selectedCoinCss;
            break;
        case 500:
            document.getElementById('coin-500').style.cssText = selectedCoinCss;
            break;
    }
}

function setBet(betNumber) {
    if (!checkBalance(selectedCoinValue)) {
        return;
    }
    let betNumberCss = `font-size: 16px; font-family: Poppins-SemiBold;`;
    userBets = userBets.map((bet, index) => {
        if (betNumber === index) {
            bet += selectedCoinValue;
            if (bet) {
                document.getElementById(index).innerText = bet;
                document.getElementById(index).style.cssText = betNumberCss;
            }
        }
        return bet;
    });
    resetBalance();
}

function setMultiBets(type) {
    let index = [];
    let betNumberCss = `font-size: 16px; font-family: Poppins-SemiBold;`;
    let previousValue = parseInt(document.getElementById(type).innerText, 10);
    if (!selectedCoinValue || !checkBalance(selectedCoinValue * 4)) {
        return;
    }
    switch (type) {
        case 'h':
            index = [0, 4, 8, 12];
            break;
        case 's':
            index = [1, 5, 9, 13];
            break;
        case 'd':
            index = [2, 6, 10, 14];
            break;
        case 'c':
            index = [3, 7, 11, 15];
            break;
        case 'a':
            index = [0, 1, 2, 3];
            break;
        case 'k':
            index = [4, 5, 6, 7];
            break;
        case 'q':
            index = [8, 9, 10, 11];
            break;
        case 'j':
            index = [12, 13, 14, 15];
            break;
    }
    if (isNaN(previousValue)) {
        document.getElementById(type).innerText = selectedCoinValue;
    } else {
        document.getElementById(type).innerText = (previousValue + selectedCoinValue);
    }
    document.getElementById(type).style.cssText = betNumberCss;
    index.forEach(element => {
        setBet(element);
    });
}

function rebet() {
    let betNumberCss = `font-size: 16px; font-family: Poppins-SemiBold;`;
    let betArray = [0, 0, 0, 0, 15, 30, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let total = betArray.reduce((accumulator, currentValue) => accumulator + currentValue);
    if (!checkBalance(total)) {
        return;
    }
    betArray.forEach((bet, index) => {
        userBets[index] = bet;
        if (bet) {
            document.getElementById(index).innerText = bet;
            document.getElementById(index).style.cssText = betNumberCss;
        }
    });
}

function double() {
    let total = userBets.reduce((accumulator, currentValue) => accumulator + currentValue);
    if (!checkBalance(total * 2)) {
        return;
    }
    userBets = userBets.map((bet, index) => {
        bet *= 2;
        if (bet) {
            document.getElementById(index).innerText = bet;
        }
        return bet;
    });
}

function reprint() {

}

function reset() {
    resetBets();
    resetCoins();
    resetBalance();
}

function resetBets() {
    let betNumberCss = `font-size: 14px; font-family: Poppins-Medium;`;
    let allTypes = ['h', 's', 'd', 'c', 'a', 'k', 'q', 'j'];
    userBets = userBets.map((bet, index) => {
        let id = '' + index;
        document.getElementById(id).innerText = 'Play';
        document.getElementById(id).style.cssText = betNumberCss;
        return 0;
    });
    allTypes.map(type => {
        document.getElementById(type).innerText = 'Play';
        document.getElementById(type).style.cssText = betNumberCss;
        return 0;
    });
}

function print() {

}

// Timer 
function startTimer() {
    canvasTimer = new CanvasCircularCountdown(document.getElementById('timer'), {
        "duration": 20000,
        "elapsedTime": 0,
        "throttle": 100,
        "clockwise": true,
        "radius": 45,
        "progressBarWidth": 12,
        "progressBarOffset": 0,
        "circleBackgroundColor": "#111111",
        "emptyProgressBarBackgroundColor": "#C2BCDA",
        "filledProgressBarBackgroundColor": pickColorByPercentage,
        "showCaption": true,
        "captionColor": "#ffffff",
        "captionFont": "20px Poppins",
        captionText: (percentage, time) => {
            return (((time.remaining % 60000) / 1000).toFixed(0));
        }
    }, function onTimerRunning(percentage, time, instance) {
        let timeRemaining = ((time.remaining % 60000) / 1000).toFixed(0);
        if (timeRemaining < 10) {
            disableGame();
        }
        if (timeRemaining < 1) {
            instance.stop();
            spin();
        }
    }).start();
}

const pickColorByPercentage = (percentage, time) => {
    switch (true) {
        case percentage >= 60:
            return '#06DE19'; // green
        case percentage >= 25 && percentage < 60:
            return '#ffc107'; // orange
        default:
            return '#ff0000'; // red
    }
}

function disableGame() {
    let elements = document.getElementsByClassName('btn');
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.pointerEvents = 'none';
    }
    hideText(true);
}

function enableGame() {
    reset();
    let elements = document.getElementsByClassName('btn');
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.pointerEvents = 'visible';
    }
    hideText(false);
}

function hideText(hide) {
    let elements = document.getElementsByClassName('play');
    if (hide) {
        document.getElementById('bet-info').style.visibility = 'hidden';
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].innerText === 'Play') {
                elements[i].style.visibility = 'hidden';
            }
        }
    } else {
        document.getElementById('bet-info').style.visibility = 'visible';
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.visibility = 'visible';
        }
    }
}

// Wheel
// Q = 20, k = 40, A = 65, J = 85
// club = -50, heart = -73, spade = -97, diamond = -2
function spin() {
    let wheelTwo = document.getElementById('wheel-two');
    let wheelThree = document.getElementById('wheel-three');
    wheelTwo.classList.add("spin");
    wheelTwo.classList.remove("aWin");
    wheelTwo.classList.remove("kWin");
    wheelTwo.classList.remove("qWin");
    wheelTwo.classList.remove("jWin");
    wheelThree.classList.add("spinWheel");
    wheelThree.classList.remove("hWin");
    wheelThree.classList.remove("sWin");
    wheelThree.classList.remove("dWin");
    wheelThree.classList.remove("cWin");
    let winners = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let winnersAmount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const winner = Math.floor(Math.random() * winners.length);
    const winnerAmount = Math.floor(Math.random() * winnersAmount.length);
    setTimeout(() => {
        stopWheelTwo(winner);
    }, 8000);

    setTimeout(() => {
        stopWheelThree(winner, winnerAmount);
    }, 10000);
}

function stopWheelTwo(winner) {
    let wheelTwo = document.getElementById('wheel-two');
    wheelTwo.style.animationFillMode = 'forwards';
    wheelTwo.style.animationTimingFunction = 'ease';
    console.log('a == ', winner);
    if (winner < 4) {
        wheelTwo.classList.add("aWin");
    } else if (winner >= 4 && winner < 8) {
        wheelTwo.classList.add("kWin");
    } else if (winner >= 8 && winner < 12) {
        wheelTwo.classList.add("qWin");
    } else if (winner >= 12 && winner < 16) {
        wheelTwo.classList.add("jWin");
    }
}

function stopWheelThree(winner, winnerAmount) {
    let wheelThree = document.getElementById('wheel-three');
    wheelThree.classList.remove("spinWheel");
    wheelThree.style.animationFillMode = 'forwards';
    wheelThree.style.animationTimingFunction = 'ease';
    if (winner === 0 || winner === 4 || winner === 8 || winner === 12) {
        wheelThree.classList.add("hWin");
        setTimeout(() => {
            setWinner(winner, winnerAmount);
        }, 3500);
    }
    if (winner === 1 || winner === 5 || winner === 9 || winner === 13) {
        wheelThree.classList.add("sWin");
        setTimeout(() => {
            setWinner(winner, winnerAmount);
        }, 4500);
    }
    if (winner === 2 || winner === 6 || winner === 10 || winner === 14) {
        wheelThree.classList.add("dWin");
        setTimeout(() => {
            setWinner(winner, winnerAmount);
        }, 1500);
    }
    if (winner === 3 || winner === 7 || winner === 11 || winner === 15) {
        wheelThree.classList.add("cWin");
        setTimeout(() => {
            setWinner(winner, winnerAmount);
        }, 2500);
    }
}

function setWinner(winner, winnerAmount) {
    let wheelTwo = document.getElementById('wheel-two');
    let wheelThree = document.getElementById('wheel-three');
    let wheelWinner = document.getElementById('wheel-winner');
    let wheelWinnerAmount = document.getElementById('wheel-winner-amount');
    wheelWinner.style.visibility = 'visible';
    wheelWinner.src = winnerImages[winner];
    wheelWinnerAmount.style.visibility = 'visible';
    wheelWinnerAmount.src = xImages[winnerAmount];
    setTimeout(() => {
        wheelTwo.style.removeProperty('animation-fill-mode');
        wheelTwo.style.removeProperty('animation-timing-function');
        wheelTwo.classList.remove("spin");
        wheelThree.style.removeProperty('animation-fill-mode');
        wheelThree.style.removeProperty('animation-timing-function');
        wheelThree.classList.remove("spinWheel");
        wheelWinner.style.visibility = 'hidden';
        wheelWinnerAmount.style.visibility = 'hidden';
        canvasTimer.reset();
        canvasTimer.start();
        enableGame();
    }, 2000);
}