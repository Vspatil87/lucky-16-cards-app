const {
  ipcRenderer,
  globalShortcut,
  screen,
  BrowserView,
} = require("electron");
const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain } = electron;
let { remote } = require("electron");
const url = require("url");
const fs = require("fs");
const EventEmitter = require("events");
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(Infinity);
const { PosPrinter } = require("electron-pos-printer");

require("v8-compile-cache");
const path = require("path");
const io = require("socket.io-client");
require("events").EventEmitter.defaultMaxListeners = Infinity;

var socket = io.connect("http://localhost:3001");
var moment = require("moment");
const { exec } = require("child_process");
process.env.NODE_ENV = "development";
let mainWindow;
const moment1 = require("moment-timezone");
const { Socket } = require("dgram");
const { log } = require("console");
var loginUsername = "sam";
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  console.log("CurrentWidth ------------- ", width);
  console.log("Currentheight ------------- ", height);
  mainWindow = new BrowserWindow({
    title: "10 Ka Dam Game",
    width: width,
    height: height,
    icon: path.join(__dirname, "../assets/images/a2.ico"),
    frame: false,
    resizable: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
    },
  });
  mainWindow.show();
  let currentDirr = __dirname;
  let desiredDirr = path.dirname(currentDirr);

  mainWindow.loadURL(
    url.format({
      pathname: path.join("../app/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  gamewindowsisrunning = true;
  mainWindow.once("ready-to-show", () => {
    show: true;
    mainWindow.show();
  });
  mainWindow.on("close", (e, Event) => {
    e.preventDefault();
    gamewindowsisrunning = false;
    socket.emit("logout", loginUsername);
    mainWindow.destroy();
    app.quit();
  });
  mainWindow.setMenuBarVisibility(false);
  const handle = mainWindow.getNativeWindowHandle();
  mainWindow.on("closed", function () {
    gamewindowsisrunning = false;
    socket.emit("logout", loginUsername);
    mainWindow.destroy();
    app.quit();
  });
}
app.disableHardwareAcceleration();
app.on("ready", createWindow);
socket.on("connect", function () {
  console.log("connected");
});
socket.on("disconnect", function () {
  console.log("socketDisconnected ");
});
socket.on("confirmbet", function (data) {
  socket.emit("confirmbet", data);
});
var currentUserId = 18;

/* --- Curent Timer send ---- */
/* Get User Data  */
// Quit when all windows are closed.
app.on("window-all-closed", async function () {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") {
    socket.emit("logout", loginUsername);
    mainWindow.destroy();
    gamewindowsisrunning = false;
    const list = await require("find-process")("pid", proc.pid);
    app.quit();
    if (list[0] && list[0].name.toLowerCase() === "10Kadm.exe")
      process.kill(proc.pid);
  }
});

app.on("before-quit", () => {
  socket.emit("logout", loginUsername);
  mainWindow.removeAllListeners("close");
  mainWindow.close();
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
// Timer socket
socket.on("timer", function (countdown) {
  // console.log("countDown", countdown);
  mainWindow.webContents.send("timer", countdown);
});
// Get user data usig username
userId = ipcMain.on("userData", function () {
  socket.emit("userData", currentUserId);
});
socket.on("userDataReply", function (dataReply) {
  mainWindow.webContents.send("userDataReply", dataReply);
});

// ConfirmBet
ipcMain.on("confirmbet", function (e, betData) {
  console.log("betData");
  socket.emit("confirmBet", betData);
});
// generate Ticker
socket.on("generateTicket", function (ticketData) {
  mainWindow.webContents.send("generateTicket", ticketData);
});

// cretate and store barcode
ipcMain.on("barcode_image", function (event, barimage_data) {
  // try {
  console.log("barimage_data"), barimage_data;
  var ticket_id = barimage_data.ticketId;
  var cmt_img = barimage_data.dataURL;
  var ext = cmt_img.split(";")[0].match(/jpeg|jpg|png|gif/)[0];
  var data_img = cmt_img.replace(/^data:image\/\w+;base64,/, "");
  let imageBuffer = new Buffer.from(data_img, "base64");
  let fileName = ticket_id + ".png";
  var savesPath;
  const currentDir = __dirname;
  console.log("------------------");
  if (__dirname.includes(".asar")) {
    console.log("here it is ");
    const desiredDir = path.dirname(currentDir);
    var exePath = app.getPath("exe"), // (2)
      splitPath = exePath.replace(/\\/g, "/").split(/\//); // (3)
    splitPath.pop(); // (4)
    exePath = splitPath.join("/"); // (5)
    savesPath = path.join(exePath + "/resources/" + fileName);
    const dir = exePath + "/resources/"; // (6)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    if (!fs.existsSync(savesPath)) {
      var file1 = savesPath;
      fs.writeFile(file1, imageBuffer, function (err) {
        event.sender.send("imagesend", fileName, err);
      });
    }
  } else {
    const desiredDir = path.dirname(currentDir);

    var exePath = app.getPath("exe"), // (2)
      splitPath = exePath.replace(/\\/g, "/").split(/\//); // (3)
    splitPath.pop(); // (4)
    exePath = splitPath.join("/"); // (5)
    console.log("desiredDir", desiredDir);
    savesPath = path.join(desiredDir + "/resources/" + fileName);
    const dir = desiredDir + "/resources/"; // (6)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    if (!fs.existsSync(savesPath)) {
      var file1 = savesPath;
      fs.writeFile(file1, imageBuffer, function (err) {
        event.sender.send("imagesend", fileName, err);
      });
    }
  }
});
