const electron = require("electron");
const { ipcRenderer } = electron;
const { remote } = require("electron");
const { PosPrinter } = remote.require("electron-pos-printer");
const dialog = electron.remote.dialog;
const path = require("path");
const moment = require("moment-timezone");
const timeInKolkata = moment.tz("Asia/Kolkata");

let printerNameDefault;
let webContents = remote.getCurrentWebContents();
let printers = webContents.getPrinters(); //list the printers
let selectedCoinValue = 0;
let userBalance = 0; // Do not change this value (will come from socket)
let balance = userBalance;
let canvasTimer;
let userBets = Array(16); userBets.fill(0);
let aId, mId, dId, username, userId;
let countDown = 0;
let timerDuration = 180;
let setTimer = true;
let winner = 8;
let winnerAmount = 0;
const app = remote.app;
const wheelMusic = new Audio('../assets/audio/wheelStart.wav');
const options = {
  preview: false,
  width: "170px", //  width of content body
  margin: "0 0 0 1mm", //  setting 5mm left margin
  copies: 1,

  printerName: printerNameDefault,
  pageSize: { height: 301000, width: 71000 },
  silent: true,
  style: {
    fontSize: "12px",
    fontWeight: "bold",
  },
};
const lastWinImages = [
  "../assets/images/last-win-cards/0.png",
  "../assets/images/last-win-cards/1.png",
  "../assets/images/last-win-cards/2.png",
  "../assets/images/last-win-cards/3.png",
  "../assets/images/last-win-cards/4.png",
  "../assets/images/last-win-cards/5.png",
  "../assets/images/last-win-cards/6.png",
  "../assets/images/last-win-cards/7.png",
  "../assets/images/last-win-cards/8.png",
  "../assets/images/last-win-cards/9.png",
  "../assets/images/last-win-cards/10.png",
  "../assets/images/last-win-cards/11.png",
  "../assets/images/last-win-cards/12.png",
  "../assets/images/last-win-cards/13.png",
  "../assets/images/last-win-cards/14.png",
  "../assets/images/last-win-cards/15.png",
];
const winnerImages = [
  "../assets/images/win-cards/0.png",
  "../assets/images/win-cards/1.png",
  "../assets/images/win-cards/2.png",
  "../assets/images/win-cards/3.png",
  "../assets/images/win-cards/4.png",
  "../assets/images/win-cards/5.png",
  "../assets/images/win-cards/6.png",
  "../assets/images/win-cards/7.png",
  "../assets/images/win-cards/8.png",
  "../assets/images/win-cards/9.png",
  "../assets/images/win-cards/10.png",
  "../assets/images/win-cards/11.png",
  "../assets/images/win-cards/12.png",
  "../assets/images/win-cards/13.png",
  "../assets/images/win-cards/14.png",
  "../assets/images/win-cards/15.png",
];
const xImages = [
  "../assets/images/1x-to-10x/1.png",
  "../assets/images/1x-to-10x/2.png",
  "../assets/images/1x-to-10x/3.png",
  "../assets/images/1x-to-10x/4.png",
  "../assets/images/1x-to-10x/5.png",
  "../assets/images/1x-to-10x/6.png",
  "../assets/images/1x-to-10x/7.png",
  "../assets/images/1x-to-10x/8.png",
  "../assets/images/1x-to-10x/9.png",
  "../assets/images/1x-to-10x/10.png",
];

// onload functions call
window.onload = () => {
  ipcRenderer.send("userData");
  ipcRenderer.send("getLastWinners");
  selectCoin(5);
};

// Barcode functionality
document.getElementById("ticketValue").addEventListener("keypress", function (event) {
  if (event.keyCode === 13 || event.which === 13) {
    // Enter key was pressed
    // msg = 'yes' (winamount, betno, ticketId, xvalue, bettime)
    // msg = 'yes' (winamount, betno, ticketId, xvalue, bettime)
    let ticketId = document.getElementById("ticketValue").value;
    console.log(ticketId);
    if (ticketId.length == 8) {
      ipcRenderer.send("claimTicket", { ticketId, username });
      document.getElementById("ticketValue").value = "";
    }
  }
});

ipcRenderer.on("claimReply", function (event, data) {
  console.log('data === ', data);
  document.getElementById('winningPopup').style.display = 'block';
  if (data) {
    let msg = data.msg;
    if (msg === 'yes') {
      document.getElementById('win-message').innerHTML = 'Congratulations! You Won' +
        `<div id="win-amount" class="win-amount">${data.winAmt}</div>` +
        `<div id="win-bet-time" class="win-bet-time">${data.betTime}</div>`;
    } else {
      document.getElementById('win-message').innerHTML = data.msg;
    }
  }
});

function closePopup() {
  document.getElementById('winningPopup').style.display = 'none';
}

// Get time
function getTime() {
  const currentTime = new Date(); // Get the current time
  const minutes = currentTime.getMinutes();

  // Calculate the number of draws that have occurred since midnight
  const drawNumber = Math.floor(minutes / 3);

  // Calculate the next draw number
  const nextDrawNumber = drawNumber + 1;

  // Calculate the next draw time
  const nextDrawTime = new Date(currentTime);
  nextDrawTime.setMinutes(nextDrawNumber * 3);
  nextDrawTime.setSeconds(0);

  // Format the next draw time as HH:MM PM/AM
  const formattedTime = nextDrawTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return formattedTime;
}

// Get Current Draw
function currentDraw() {
  const currentTime = new Date(); // Get the current time
  const minutes = currentTime.getMinutes();

  // Calculate the number of draws that have occurred since midnight
  const drawNumber = Math.floor(minutes / 3);

  // Calculate the next draw time
  const nextDrawTime = new Date(currentTime);
  nextDrawTime.setMinutes(drawNumber * 3);
  nextDrawTime.setSeconds(0);

  // Format the next draw time as HH:MM PM/AM
  const formattedTime = nextDrawTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  console.log("formattedTime", formattedTime);
  return formattedTime;
}

ipcRenderer.on("lastWinnerReply", function (event, data) {
  setLastWinners(data);
});

ipcRenderer.on("currentWinner", function (event, data) {
  console.log('winner == ', data);
  winner = data.winner - 1;
  winnerAmount = data.xvalue - 1;
});

ipcRenderer.on("timer", function (event, data) {
  countDown = data;
  timerDuration = countDown * 1000;
  if (setTimer) {
    if (canvasTimer) {
      canvasTimer.reset();
      canvasTimer.setDuration(timerDuration);
      canvasTimer.start();
    } else {
      startTimer();
    }
    setTimer = false;
  }
  console.log("userData", timerDuration);
});

ipcRenderer.on("userDataReply", function (event, data) {
  const nextDrawTime = getTime();
  const currentDraww = currentDraw();
  console.log("currentDtae ", currentDraww);
  document.getElementById("time").innerText = nextDrawTime;
  console.log(nextDrawTime);
  console.log("userData", data);
  document.getElementById("gameId").innerText = " " + data.username;
  document.getElementById("balance").innerText = " " + data.balance;
  userBalance = data.balance;
  balance = userBalance;
  aId = data.aId;
  mId = data.mId;
  dId = data.dId;
  userId = data.userId;
  username = data.username;
});

function setLastWinners(data) {
  data.forEach((winner, index) => {
    let imageTag = document.getElementsByClassName("last-win-images")[index];
    let winTag = document.getElementsByClassName("last-win-box")[index];
    imageTag.src = lastWinImages[winner.winner - 1];
    imageTag.style.visibility = "visible";
    if (winner.xvalue && winner.xvalue !== "0" && winner.xvalue !== 1 && winner.xvalue !== '1') {
      winTag.innerText = winner.xvalue + 'X';
    } else {
      winTag.innerText = "N";
    }
    winTag.style.visibility = "visible";
  });
}

function checkBalance(bet) {
  if (!bet || isNaN(bet)) {
    bet = 0;
  }
  if (balance >= bet) {
    return true;
  } else {
    alert("No Balance");
    return false;
  }
}

function resetBalance() {
  const totalBets = userBets.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
  balance = userBalance - totalBets;
  document.getElementById("balance").innerText = balance;
  document.getElementById("play-count").innerText = totalBets;
}

function resetCoins() {
  let removeSelectedCoinCss = `box-shadow: none; transform: scale(1); border-radius: 0;`;
  selectedCoinValue = 0;
  document.getElementById("coin-5").style.cssText = removeSelectedCoinCss;
  document.getElementById("coin-10").style.cssText = removeSelectedCoinCss;
  document.getElementById("coin-20").style.cssText = removeSelectedCoinCss;
  document.getElementById("coin-50").style.cssText = removeSelectedCoinCss;
  document.getElementById("coin-100").style.cssText = removeSelectedCoinCss;
  document.getElementById("coin-500").style.cssText = removeSelectedCoinCss;
}

function selectCoin(value) {
  resetCoins();
  let selectedCoinCss = `box-shadow: 0px 0px 8px 0px; transform: scale(1.1); border-radius: 60px;`;
  selectedCoinValue = parseInt(value, 10);
  switch (value) {
    case 5:
      document.getElementById("coin-5").style.cssText = selectedCoinCss;
      break;
    case 10:
      document.getElementById("coin-10").style.cssText = selectedCoinCss;
      break;
    case 20:
      document.getElementById("coin-20").style.cssText = selectedCoinCss;
      break;
    case 50:
      document.getElementById("coin-50").style.cssText = selectedCoinCss;
      break;
    case 100:
      document.getElementById("coin-100").style.cssText = selectedCoinCss;
      break;
    case 500:
      document.getElementById("coin-500").style.cssText = selectedCoinCss;
      break;
  }
}

function setBet(betNumber) {
  if (!checkBalance(selectedCoinValue)) {
    return;
  }
  let betNumberCss = `font-size: 18px; font-family: Poppins-SemiBold;`;
  userBets = userBets.map((bet, index) => {
    if (betNumber === index) {
      bet += selectedCoinValue;
      if (bet) {
        document.getElementById(index).innerText = bet;
        document.getElementById(index).style.cssText = betNumberCss;
        // document.getElementById(index).classList.add('bet-circle');
      }
    }
    return bet;
  });
  resetBalance();
}

function setMultiBets(type) {
  let index = [];
  let betNumberCss = `font-size: 18px; font-family: Poppins-SemiBold;`;
  let previousValue = parseInt(document.getElementById(type).innerText, 10);
  if (!selectedCoinValue || !checkBalance(selectedCoinValue * 4)) {
    return;
  }
  switch (type) {
    case "h":
      index = [0, 4, 8, 12];
      break;
    case "s":
      index = [1, 5, 9, 13];
      break;
    case "d":
      index = [2, 6, 10, 14];
      break;
    case "c":
      index = [3, 7, 11, 15];
      break;
    case "a":
      index = [0, 1, 2, 3];
      break;
    case "k":
      index = [4, 5, 6, 7];
      break;
    case "q":
      index = [8, 9, 10, 11];
      break;
    case "j":
      index = [12, 13, 14, 15];
      break;
  }
  if (isNaN(previousValue)) {
    document.getElementById(type).innerText = selectedCoinValue;
  } else {
    document.getElementById(type).innerText = previousValue + selectedCoinValue;
  }
  document.getElementById(type).style.cssText = betNumberCss;
  // document.getElementById(type).classList.add('bet-circle-for-all');
  index.forEach((element) => {
    setBet(element);
  });
}

function rebet() {
  let betNumberCss = `font-size: 18px; font-family: Poppins-SemiBold;`;
  let betArray = JSON.parse(localStorage.getItem('betData'));
  let total = betArray.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
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
  resetBalance();
}

function double() {
  let total = userBets.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
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

function reset() {
  ipcRenderer.send("userData");
  ipcRenderer.send("getLastWinners");
  resetBets();
  resetCoins();
  resetBalance();
}

function resetWinner() {
  let wheelWinner = document.getElementById("wheel-winner");
  let wheelWinnerAmount = document.getElementById("wheel-winner-amount");
  wheelWinner.style.visibility = "hidden";
  wheelWinnerAmount.style.visibility = "hidden";
}

function resetBets() {
  let betNumberCss = `font-size: 14px; font-family: Poppins-Medium;`;
  let allTypes = ["h", "s", "d", "c", "a", "k", "q", "j"];
  userBets = userBets.map((bet, index) => {
    let id = "" + index;
    document.getElementById(id).innerText = "Play";
    document.getElementById(id).style.cssText = betNumberCss;
    // document.getElementById(id).classList.remove('bet-circle');
    return 0;
  });
  allTypes.map((type) => {
    document.getElementById(type).innerText = "Play";
    document.getElementById(type).style.cssText = betNumberCss;
    // document.getElementById(type).classList.remove('bet-circle');
    return 0;
  });
}

async function print(params) {
  const totalBets = userBets.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
  if (!totalBets) {
    return;
  }
  let betData = {
    gameName: params,
    username,
    aId,
    mId,
    dId,
    userId,
    bet1: userBets[0],
    bet2: userBets[1],
    bet3: userBets[2],
    bet4: userBets[3],
    bet5: userBets[4],
    bet6: userBets[5],
    bet7: userBets[6],
    bet8: userBets[7],
    bet9: userBets[8],
    bet10: userBets[9],
    bet11: userBets[10],
    bet12: userBets[11],
    bet13: userBets[12],
    bet14: userBets[13],
    bet15: userBets[14],
    bet16: userBets[15],
    betTotal: totalBets,
    drawTime: await getTime(),
    drawDate: timeInKolkata.format("YYYY-MM-DD"),
  };
  localStorage.setItem('betData', JSON.stringify(userBets));
  console.log("this is final data ", betData);
  ipcRenderer.send("confirmbet", betData);
  resetBets();
}

// print and generate ticket
ipcRenderer.on("generateTicket", async (event, betsData) => {
  try {
    var allTicket = [];
    for (let m = 0; m < betsData.length; m++) {
      printer_data = [];

      var ticketId = betsData[m].ticketId;
      JsBarcode("#barcode", ticketId, {
        height: 40,
      });
      const rootFolder = path.resolve(__dirname, "..");

      var drwConfirmTime = "Confirm Time: " + betsData[m].confirmTime;
      var canvas = document.getElementById("barcode");
      var dataURL = canvas.getAttribute("src");
      await barcodeimage(dataURL, ticketId);
      var savesPath = "";
      if (__dirname.includes(".asar")) {
        // (1)
        var exePath = app.getPath("exe"), // (2)
          splitPath = exePath.replace(/\\/g, "/").split(/\//); // (3)
        splitPath.pop(); // (4)
        exePath = splitPath.join("/");
        savesPath = exePath + "/resources/";
      } else {
        savesPath = path.join(rootFolder, "/resources/");
      }
      let tablehtml = `
            <table style="border: none; margin:0;padding:0 ;font-family:Helvetica, sans-serif;">
                    <thead>
                        <tr style=" padding: 1px;height: 1px; border: none; ">
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">C</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">P</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">C</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">P</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">C</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">P</th>
                        </tr>
                    </thead>
                    <tbody>`;

      let trSize = 0;
      tablehtml += `<tr>`;
      if (betsData[m].bet1 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >AH</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet1 +
          `</td>`;
      }

      if (betsData[m].bet2 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >AS</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet2 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet3 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >AD</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet3 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet4 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >AC</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet4 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet5 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >KH</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet5 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet6 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >KS</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet6 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet7 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >KD</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet7 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet8 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >KC</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet8 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet9 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >QH</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet9 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet10 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >QS</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet10 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet11 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >QD</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet11 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet12 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >QC</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet12 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr ><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet13 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >JH</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet13 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet14 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >JS</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet14 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet15 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >JD</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet15 +
          `</td>`;
      }
      if (trSize == 3) {
        tablehtml += `</tr><tr>`;
        trSize = 0;
      }
      if (betsData[m].bet16 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >JC</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet16 +
          `</td>`;
      }

      tablehtml += `</tr>`;

      tablehtml += `</tbody ></table > `;
      const data = [
        {
          type: "image",
          path: path.join(rootFolder, "/assets/images/balaji.png"), // file path
          position: "left", // position of image: 'left' | 'center' | 'right'
          width: "30px", // width of image in px; default: auto
          height: "30px",
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "FOR AMUSEMENT ONLY",
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: { "font-weight": "700", "font-size": "10px" },
          itemStyle1: `margin - left: -3px; font - size: 12px; `, // Value Style
          lineStyle1: `margin - left: -8px; font - size: 12px; `,
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "Vijay Casino",
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "10px",
            margin: "0",
            padding: "0",
          },
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value:
            "Draw Date : " + betsData[m].drawDate + " " + betsData[m].drawTime,
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "10px",
            margin: "0",
            padding: "0",
          },
        },

        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: tablehtml,
          style: "margin:0; font-family:Helvetica, sans-serif;",
          // css: { "font-weight": "bold", "font-size": "10px", "margin": "0", "padding": "0" }
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "Points : " + betsData[m].betTotal,
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "10px",
            margin: "0",
            padding: "0",
          },
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "GST : Under Process..",
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "10px",
            margin: "0",
            padding: "0",
          },
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "Agent : " + betsData[m].username,
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "10px",
            margin: "0",
            padding: "0",
          },
        },

        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "Ticket Id : " + betsData[m].ticketId,
          style: "margin:0; font-family:Helvetica, sans-serif;",
          css: {
            "font-weight": "bold",
            "font-size": "13px",
            margin: "0",
            padding: "0",
          },
        },

        {
          type: "image",
          path: path.join(savesPath + ticketId + ".png"), // file path
          //path: path.join(__dirname, 'logo-64.png'),
          position: "left", // position of image: 'left' | 'center' | 'right'
          width: "160px", // width of image in px; default: auto
          height: "60px",
          position: "center",
          style: `margin - bottom: 3px %; `,
        },
      ];

      allTicket.push(data);
    }
    print_the_data(allTicket, (f = 0));
  } catch (error) {
    console.log(error);
  }
});

function barcodeimage(dataURL, ticketId) {
  var barcodedimage = {
    dataURL: dataURL,
    ticketId: ticketId,
  };
  ipcRenderer.send("barcode_image", barcodedimage);
  ipcRenderer.on("imagesend", function (event, imagesend, err) { });
}

async function print_the_data(printer_data, f = 0) {
  if (printer_data[f]) {
    PosPrinter.print(printer_data[f], options)
      .then((result_print) => {
        print_the_data(printer_data, f + 1);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }
}

// Timer
function startTimer() {
  canvasTimer = new CanvasCircularCountdown(
    document.getElementById("timer"),
    {
      duration: timerDuration,
      elapsedTime: 0,
      throttle: 100,
      clockwise: true,
      radius: 45,
      progressBarWidth: 12,
      progressBarOffset: 0,
      circleBackgroundColor: "#111111",
      emptyProgressBarBackgroundColor: "#C2BCDA",
      filledProgressBarBackgroundColor: pickColorByPercentage,
      showCaption: true,
      captionColor: "#ffffff",
      captionFont: "20px Poppins",
      captionText: (percentage, time) => {
        return (time.remaining / 1000).toFixed(0);
      },
    },
    function onTimerRunning(percentage, time, instance) {
      let timeRemaining = (time.remaining / 1000).toFixed(0);
      if (timeRemaining < 10) {
        disableGame();
      }
      if (timeRemaining < 1) {
        // instance.stop();
        spin();
      }
    }
  ).start();
}

const pickColorByPercentage = (percentage, time) => {
  switch (true) {
    case percentage >= 60:
      return "#06DE19"; // green
    case percentage >= 25 && percentage < 60:
      return "#ffc107"; // orange
    default:
      return "#ff0000"; // red
  }
};

function disableGame() {
  resetWinner();
  let elements = document.getElementsByClassName("btn");
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.pointerEvents = "none";
  }
  hideText(true);
}

function enableGame() {
  reset();
  let elements = document.getElementsByClassName("btn");
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.pointerEvents = "visible";
  }
  hideText(false);
}

function hideText(hide) {
  let elements = document.getElementsByClassName("play");
  if (hide) {
    document.getElementById("bet-info").style.visibility = "hidden";
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].innerText === "Play") {
        elements[i].style.visibility = "hidden";
      }
    }
  } else {
    document.getElementById("bet-info").style.visibility = "visible";
    for (let i = 0; i < elements.length; i++) {
      elements[i].style.visibility = "visible";
    }
  }
}

// Wheel
// Q = 20, k = 40, A = 65, J = 85
// club = -50, heart = -73, spade = -97, diamond = -2
function spin() {
  ipcRenderer.send("currentWinner");
  let wheelTwo = document.getElementById("wheel-two");
  let wheelThree = document.getElementById("wheel-three");
  wheelMusic.currentTime = 0;
  wheelMusic.play();

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
  setTimeout(() => {
    stopWheelTwo();
  }, 4000);

  setTimeout(() => {
    stopWheelThree();
  }, 5500);
}

function stopWheelTwo() {
  let wheelTwo = document.getElementById("wheel-two");
  // wheelTwo.style.animationFillMode = "forwards";
  // wheelTwo.style.animationTimingFunction = "ease";
  console.log("a == ", winner);
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

function stopWheelThree() {
  let wheelThree = document.getElementById("wheel-three");
  wheelThree.classList.remove("spinWheel");
  // wheelThree.style.animationFillMode = "forwards";
  // wheelThree.style.animationTimingFunction = "ease";
  setTimeout(() => {
    wheelMusic.currentTime = 4;
    wheelMusic.play();
  }, 2000);
  if (winner === 0 || winner === 4 || winner === 8 || winner === 12) {
    wheelThree.classList.add("hWin");
    setTimeout(() => {
      setWinner(winner, winnerAmount);
    }, 4000);
  }
  if (winner === 1 || winner === 5 || winner === 9 || winner === 13) {
    wheelThree.classList.add("sWin");
    setTimeout(() => {
      setWinner(winner, winnerAmount);
    }, 5000);
  }
  if (winner === 2 || winner === 6 || winner === 10 || winner === 14) {
    wheelThree.classList.add("dWin");
    setTimeout(() => {
      setWinner(winner, winnerAmount);
    }, 2000);
  }
  if (winner === 3 || winner === 7 || winner === 11 || winner === 15) {
    wheelThree.classList.add("cWin");
    setTimeout(() => {
      setWinner(winner, winnerAmount);
    }, 3000);
  }
}

function setWinner(winner, winnerAmount) {
  wheelMusic.pause();
  let wheelTwo = document.getElementById("wheel-two");
  let wheelThree = document.getElementById("wheel-three");
  let wheelWinner = document.getElementById("wheel-winner");
  let wheelWinnerAmount = document.getElementById("wheel-winner-amount");
  wheelWinner.style.visibility = "visible";
  wheelWinner.src = winnerImages[winner];
  wheelWinnerAmount.style.visibility = "visible";
  wheelWinnerAmount.src = xImages[winnerAmount];
  setTimeout(() => {
    wheelTwo.style.removeProperty("animation-fill-mode");
    wheelTwo.style.removeProperty("animation-timing-function");
    wheelTwo.classList.remove("spin");
    wheelThree.style.removeProperty("animation-fill-mode");
    wheelThree.style.removeProperty("animation-timing-function");
    wheelThree.classList.remove("spinWheel");
    // wheelWinner.style.visibility = "hidden";
    // wheelWinnerAmount.style.visibility = "hidden";
    setTimer = true;
    enableGame();
  }, 2000);
}

// Account Modal Popup
// Get the modal
let modal = document.getElementById("accountModal");

// Get the button that opens the modal
let btn = document.getElementById("account");

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
  const currentDate = moment().format("YYYY-MM-DD");
  getAccountData(currentDate, currentDate);
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function getAccountData(fromDate, toDate) {
  ipcRenderer.send("getAccountData", {
    from: fromDate,
    to: toDate,
    username,
  });
}

function resetAccountDates() {
  const fromDate = document.getElementById("select-from");
  const toDate = document.getElementById("select-to");
  if (fromDate.value || toDate.value) {
    fromDate.value = null
    toDate.value = null
    const currentDate = moment().format("YYYY-MM-DD");
    getAccountData(currentDate, currentDate);
  }
}

// 1 => Counter Sale
// 2 => Net to Pay
let accountTabSelected = 1;
function toggleAccountTab(tabId) {
  if (tabId === 1) {
    accountTabSelected = 1;
    document.getElementById('net-to-pay-button').style.background = '#DDDDDD';
    document.getElementById('net-to-pay-button').style.color = '#000';
    document.getElementById('counter-sale-button').style.background = '#411a5dc4';
    document.getElementById('counter-sale-button').style.color = '#fff';
  } else {
    accountTabSelected = 2;
    document.getElementById('counter-sale-button').style.background = '#DDDDDD';
    document.getElementById('counter-sale-button').style.color = '#000';
    document.getElementById('net-to-pay-button').style.background = '#411a5dc4';
    document.getElementById('net-to-pay-button').style.color = '#fff';
  }
  resetAccountDates();
  const currentDate = moment().format("YYYY-MM-DD");
  getAccountData(currentDate, currentDate);
}

function getAccountDataForCustomDates() {
  const fromDate = document.getElementById("select-from").value;
  const toDate = document.getElementById("select-to").value;
  if (fromDate && toDate) {
    getAccountData(fromDate, toDate);
  }
}

ipcRenderer.on("showAcccountData", function (event, data) {
  const accountResults = data.results;
  const accountSummary = data.rightData;
  let accountTableBody = document.getElementById('account-table-body');
  const rows = accountResults.map((data, index) => {
    return `<tr>
        <td>${index + 1}</td>
        <td>${data.drawDate}</td>
        <td>${data.totalPlay}</td>
        <td>${data.totalWin}</td>
      </tr>`
  });
  accountTableBody.innerHTML = rows.join('\n');

  if (accountSummary) {
    document.getElementById('game-id-value').innerText = accountSummary.username;
    document.getElementById('reatiler-code-value').innerText = accountSummary.username;
    document.getElementById('details-from-date').innerText = accountSummary.from;
    document.getElementById('details-to-date').innerText = accountSummary.to;
    document.getElementById('summary-play-value').innerText = accountSummary.totalBet;
    document.getElementById('summary-win-value').innerText = accountSummary.totalWin;
    if (accountTabSelected === 1) {
      document.getElementById('commission').style.display = 'none';
      document.getElementById('net-to-pay').style.display = 'none';
      document.getElementById('outstanding').style.display = 'flex';
      document.getElementById('outstanding-value').innerText = accountSummary.outstanding;
      document.getElementById('account-type-text').innerText = 'Counter Sale';
    } else {
      document.getElementById('outstanding').style.display = 'none';
      document.getElementById('commission').style.display = 'flex';
      document.getElementById('net-to-pay').style.display = 'flex';
      document.getElementById('commission-win-value').innerText = accountSummary.com;
      document.getElementById('net-to-pay-value').innerText = accountSummary.netToPay;
      document.getElementById('account-type-text').innerText = 'Net To Pay';
    }
    document.getElementById('server-time-value').innerText = accountSummary.serverDate;
  }
});

// Reprint Modal Popup
// Get the reprintModal
let reprintModal = document.getElementById("reprintModal");

// Get the button that opens the reprintModal
let reprintBtn = document.getElementById("reprint");

// Get the <closeBtn> element that closes the reprintModal
let closeBtn = document.getElementsByClassName("close")[1];

// When the user clicks on the button, open the reprintModal
reprintBtn.onclick = function () {
  reprintModal.style.display = "block";
  getReprintData();
}

// When the user clicks on <closeBtn> (x), close the reprintModal
closeBtn.onclick = function () {
  reprintModal.style.display = "none";
}

// When the user clicks anywhere outside of the reprintModal, close it
window.onclick = function (event) {
  if (event.target == reprintModal) {
    reprintModal.style.display = "none";
  }
}

function getReprintData() {
  const drawDate = moment().format("YYYY-MM-DD");
  const currentDraww = currentDraw();
  ipcRenderer.send("getLastTickets", { currentDraww, drawDate, username });
}

ipcRenderer.on("reprintData", function (e, reprintData) {
  let reprintTableBody = document.getElementById('reprint-table-body');
  const rows = reprintData.map((data, index) => {
    return `<tr>
        <td>${index + 1}</td>
        <td>${data.ticketId}</td>
        <td>${data.drawDate}</td>
        <td>${data.drawTime}</td>
        <td>${data.betTotal}</td>
        <td>${data.winAmount}</td>
        <td>${(data.claimStatus === true || data.claimStatus === 'true') ? 'Yes' : 'No'}</td>
        <td class="print-action"><button onclick="reprintTicket(${data.ticketId})" class="modal-reprint">P</button></td>
      </tr>`
  });
  reprintTableBody.innerHTML = rows.join('\n');
});

function reprintTicket(ticketId) {
  ipcRenderer.send("reprintThis", ticketId);
}

function logout() {
  ipcRenderer.send("logout", username)
}


function printAccount() {

  let gameId = document.getElementById('game-id-value').innerText;
  let username = document.getElementById('reatiler-code-value').innerText;
  let from = document.getElementById('details-from-date').innerText;
  let To = document.getElementById('details-to-date').innerText;
  let totalPlay = document.getElementById('summary-play-value').innerText;
  let totalWin = document.getElementById('summary-win-value').innerText;
  let outstanding = document.getElementById('outstanding-value').innerText;
  let netToPay = document.getElementById('net-to-pay-value').innerText;

  let serverTime = document.getElementById('server-time-value').innerHTML;

  let com = document.getElementById('commission-win-value').innerHTML;
  let tktData = ``;
  if (accountTabSelected === 1) {
    tktData += `  <div div style = "margin-left:5px" >
      <span style="display: block; font-size: 11px;">Game Id:  &nbsp;` + (gameId) + `</span>
      <br>
      <span style="display: block; font-size: 11px;">Counter Sale</span>
      <br>
      <span style="display: block; font-size: 11px;">Retailer Code: &nbsp;`+ (username) + `</span>
      <br>
      <span style="display: block; font-size: 11px;">`+ (from) + ` &nbsp; &nbsp;&nbsp; TO &nbsp;
          &nbsp;&nbsp; ` + (To) + `</span>
      <hr style="height: 2px; background-color: #000000;">
      <span style="display: block; font-size: 13px;"> Play &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: `+ (totalPlay)
      + ` </span>
      <br>
      <span style="display: block; font-size: 13px;">Win &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: `+ (totalWin) +
      ` </span>
      <hr style="height: 2px; background-color: #000000;">
      <span style="display: block; font-size: 13px;">Outstanding &nbsp;
          &nbsp;&nbsp;: `+ (outstanding) + ` </span>
      <br>
      <span style="display: block; font-size: 9px;">Server Time ; `+ (serverTime) + ` </span>
  </div>`
  } else {

    tktData += `  <div style="margin-left:5px">
      <span style="display: block; font-size: 11px;">Game Id: &nbsp;` + (gameId) + `</span>
      <br>
      <span style="display: block; font-size: 11px;">Net To Pay</span>
      <br>
      <span style="display: block; font-size: 11px;">Retailer Code: &nbsp;`+ (username) + `</span>
      <br>
      <span style="display: block; font-size: 11px;">`+ (from) + ` &nbsp; &nbsp;&nbsp; TO &nbsp;
          &nbsp;&nbsp; ` + (To) + `</span>
      <hr style="height: 2px; background-color: #000000;">
      <span style="display: block; font-size: 13px;"> Play &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `+ (totalPlay)
      + ` </span>
  
      <span style="display: block; font-size: 13px;">Win &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; `+ (totalWin) +
      ` </span>
        
      <span style="display: block; font-size: 13px;">Commission &nbsp;&nbsp; &nbsp;&nbsp;&nbsp; `+ (com) +
      `
      <hr style="height: 2px; background-color: #000000;">
      <span style="display: block; font-size: 13px;">Net To Pay &nbsp;&nbsp;&nbsp;&nbsp;
          &nbsp;&nbsp; `+ (netToPay) + ` </span>
      <br>
      <span style="display: block; font-size: 9px;">Server Time `+ (serverTime) + ` </span>
  </div>`
  }



  const data = [
    {
      type: 'image',
      path: path.join(__dirname, '/logo.png'),     // file path
      position: 'left',                                  // position of image: 'left' | 'center' | 'right'
      width: '50px',                                           // width of image in px; default: auto
      height: '50px',
      // width of image in px; default: 50 or '50px'
    },
    {
      type: 'text',
      value: tktData,
      style: 'margin:0;',
      css: { "font-weight": "900", "font-size": "10px" }
    },
  ]
  if (data) {
    PosPrinter.print(data, options)
      .then((result_print) => {
        reset()
      })
      .catch((error) => {
        console.log("error -", error);
      })
  }
}