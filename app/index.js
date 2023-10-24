const electron = require("electron");
const { ipcRenderer } = electron;
let { remote } = require("electron");
const { PosPrinter } = remote.require("electron-pos-printer");
const dialog = electron.remote.dialog;
const path = require("path");
let printerNameDefault;
var webContents = remote.getCurrentWebContents();
var printers = webContents.getPrinters(); //list the printers
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
let selectedCoinValue = 0;
let userBalance = 1000; // Do not change this value (will come from socket)
let balance = userBalance;
let userBets = Array(16);

userBets.fill(0);
let lastwinners = {
  winners: [0, 1, 5, 4, 1],
  betWin: ["0", "2X", "5X", "1X", "8X"],
};
lastWinImages = [
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
const moment = require("moment-timezone");
const timeInKolkata = moment.tz("Asia/Kolkata");
// Set the timezone to Asia/Kolkata

window.onload = () => {
  ipcRenderer.send("userData");

  // getTime();
  getLastWinners();
};
// draw time
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
  console.log("formattedTime"), formattedTime;
  return formattedTime;
}

ipcRenderer.on("timer", function (event, data) {
  // console.log("userData", data);
});
var aId, mId, dId, username, userId;
ipcRenderer.on("userDataReply", function (event, data) {
  const nextDrawTime = getTime();
  const currentDraww = currentDraw();
  console.log("currentDtae ", currentDraww);
  document.getElementById("time").innerText = nextDrawTime;
  console.log(nextDrawTime);
  console.log("userData", data);
  document.getElementById("gameId").innerText = " " + data.username;
  document.getElementById("balance").innerText = " " + data.balance;
  aId = data.aId;
  mId = data.mId;
  dId = data.dId;
  userId = data.userId;
  username = data.username;
});

function getLastWinners() {
  lastwinners.winners.forEach((winner, index) => {
    let imageTag = document.getElementsByClassName("last-win-images")[index];
    let winTag = document.getElementsByClassName("last-win-box")[index];
    imageTag.src = lastWinImages[winner];
    imageTag.style.visibility = "visible";
    if (lastwinners.betWin[index] && lastwinners.betWin[index] !== "0") {
      winTag.innerText = lastwinners.betWin[index];
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
  index.forEach((element) => {
    setBet(element);
  });
}

function rebet() {
  let betNumberCss = `font-size: 16px; font-family: Poppins-SemiBold;`;
  let betArray = [0, 0, 0, 0, 15, 30, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

function reprint() {}

function reset() {
  resetBets();
  resetCoins();
  resetBalance();
}

function resetBets() {
  let betNumberCss = `font-size: 14px; font-family: Poppins-Medium;`;
  let allTypes = ["h", "s", "d", "c", "a", "k", "q", "j"];
  userBets = userBets.map((bet, index) => {
    let id = "" + index;
    document.getElementById(id).innerText = "Play";
    document.getElementById(id).style.cssText = betNumberCss;
    return 0;
  });
  allTypes.map((type) => {
    document.getElementById(type).innerText = "Play";
    document.getElementById(type).style.cssText = betNumberCss;
    return 0;
  });
}

async function print(params) {
  const totalBets = userBets.reduce(
    (accumulator, currentValue) => accumulator + currentValue
  );
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

  console.log("this is final data ", betData);
  ipcRenderer.send("confirmbet", betData);
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
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">No</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">qty</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">No</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">qty</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">No</th>
                            <th style=" padding: 0;height: 1px; width:2px; border: none; font-size = 3px ;font-family:Helvetica, sans-serif;">qty</th>
                        </tr>
                    </thead>
                    <tbody>`;

      let trSize = 0;
      tablehtml += `<tr>`;
      if (betsData[m].bet1 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >01</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet1 +
          `</td>`;
      }

      if (betsData[m].bet2 > 0) {
        trSize = trSize + 1;
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >02</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >03</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >04</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >05</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >06</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >07</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >08</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >09</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >10</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >11</td>`;
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
        tablehtml += `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >12</td>`;
        tablehtml +=
          `<td style=" padding: 1px;height: 1px; border: none; font-size = 4px ;font-family:Helvetica, sans-serif;" >` +
          betsData[m].bet12 +
          `</td>`;
      }
      tablehtml += `</tr>`;

      tablehtml += `</tbody></table>`;
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
          itemStyle1: `margin-left: -3px;font-size:12px;`, // Value Style
          lineStyle1: `margin-left: -8px;font-size:12px;`,
        },
        {
          type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
          value: "12 Ka Power",
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
          style: `margin-bottom: 3px%;`,
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
  ipcRenderer.on("imagesend", function (event, imagesend, err) {});
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
