function openaccountModal() {
    const drawDate = moment().format("YYYY-MM-DD");
    ipcRenderer.send("getAccountData", {
        from: drawDate,
        to: drawDate,
        username,
    });
}
function customDate() {
    let from = document.getElementById("selectfrom").value;
    let to = document.getElementById("selectto").value;
    ipcRenderer.send("getAccountData", { from, to, username });
}
ipcRenderer.on("showAcccountData", function (event, data) {
    console.log(data);
});