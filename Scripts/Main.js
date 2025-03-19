const UpgradeStats = [
    "Adds 1 to your per click income", 
    "Multiplies your per click income by 1.25x", 
    "Adds 1 to your passive income", 
    "Multiplies your passive income by 1.2x"
];
const UpgradeCostInit = [10, 100, 30, 300];
const UpgradeCostMulti = [3, 3, 10, 30];
const MaxUpgrades = [50, 10, 50, 10]

// turn numbers into human readable
function abbreviateNum(num)
{
    if (typeof num !== 'number') {
      return num;
    }

    if (num < 1000) {
      return parseFloat(num.toFixed(1).toString());
    }
  
    const suffixes = ['', 'K', 'M', 'B', 'T', 'Q', 'Qui'];
    let magnitude = 0;
  
    while (num >= 1000 && magnitude < suffixes.length - 1) {
      num /= 1000;
      magnitude++;
    }
  
    return parseFloat(num.toFixed(1)) + suffixes[magnitude];
}

// to hourse:minutes:seconds
function toHHMMSS(str)
{
    var sec_num = parseInt(str, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function SaveData()
{
    var DataArray = [Balance, Upgrades, TotalBalance, TimeInGame];
    DataArray = JSON.stringify(DataArray);
    localStorage.setItem("GameData", DataArray);
}

function ReadData(index)
{
    var GameData = localStorage.getItem("GameData")
    GameData = JSON.parse(GameData)
    console.warn(GameData);
    if (GameData != null)
    {
        return GameData[index]
    }
    else
    {
        return null
    }
}

var CBalance = ReadData(0)
var CUpgrades = ReadData(1)
var CTotalBalance = ReadData(2)
var CTimeInGame = ReadData(3)

// Update balance visually
function UpdateBalance(){ document.getElementById("balance").innerHTML = "Balance: "+abbreviateNum(Balance); }

// Notification for the user
function Disappear(){ document.getElementById("usernotifBox").style.opacity = 0; }
var PendingTimeout = null;
function Notif(text, t)
{
    if (t == null)
    {t = 7000}
    clearTimeout(PendingTimeout)
    document.getElementById("usernotifBox").style.opacity = 1;
    document.getElementById("usernotif").innerHTML = text;
    PendingTimeout = setTimeout(Disappear, t)
}

if (CBalance != null){ Notif("Welcome back!", 12000) }


// main statistics, cookie load

var Balance = 0;
var TotalBalance = 0;
var TimeInGame = 0;
function CParse(C)
{
    return C != "" && parseInt(C)
}

if (CParse(CBalance))
{
    Balance = parseInt(CBalance);
}
if (CParse(CTotalBalance))
{
    TotalBalance = parseInt(CTotalBalance)
}
if (CParse(CTimeInGame))
{
    TimeInGame = parseInt(CTimeInGame)
}

var Increment = 1;
var IncrementButton = 1;
var IncrementButtonMultiplier = 1;
var IncrementTime = 1000;
var IncrementMultiplier = 1;
var LastCheckTime = performance.now();
var LastCheckBalance = Balance;

var Upgrades = [0, 0, 0, 0];
if (CUpgrades != null)
{
    Upgrades = CUpgrades;
    IncrementButton = Upgrades[0] + 1;
    IncrementButtonMultiplier = 0.25 * Upgrades[1] + 1;
    Increment = Upgrades[2] + 1;
    IncrementMultiplier = 0.2 * Upgrades[3] + 1;
}

window.addEventListener("beforeunload", SaveData);
setInterval(SaveData, 1000)

const ShopButtons = [
    document.getElementById("shop0"), 
    document.getElementById("shop1"), 
    document.getElementById("shop2"), 
    document.getElementById("shop3")
];
const ShopButtonDescs = [
    document.getElementById("descshop0"),
    document.getElementById("descshop1"),
    document.getElementById("descshop2"),
    document.getElementById("descshop3")
]; // if someone knows a better way to do this lmk

function UpdateShopDescs()
{
    for (let i = 0; i < ShopButtonDescs.length; i++)
    {
        ShopButtonDescs[i].innerHTML = Upgrades[i]+"/"+MaxUpgrades[i]
    }
}

function BuyUpgrade(i)
{
    var UpgradeCount = Upgrades[i]
    if (UpgradeCount == null)
    {
        UpgradeCount = 0;
    }
    var Cost = UpgradeCostInit[i] * Math.pow(UpgradeCostMulti[i], UpgradeCount)
    if (Balance < Cost)
    {
        Notif("Purchase failed: Not enough balance!")
        return;
    }
    if (UpgradeCount >= MaxUpgrades[i])
    {
        Notif("Purchase failed: This upgrade is already maxed out!")
        return;
    }
    Balance -= Cost
    Upgrades[i] += 1
    switch(i){
        case 0:
            IncrementButton += 1
            break;
        case 1:
            IncrementButtonMultiplier += 0.25
            IncrementButtonMultiplier = Math.floor(IncrementButtonMultiplier*100)/100
            break;
        case 2:
            Increment += 1
            break;
        case 3:
            IncrementMultiplier += 0.2
            break;
    }
    Notif("Upgrade was successfully bought!")
    UpdateUpgrades()
}
for (let i = 0; i < ShopButtons.length; i++)
{
    ShopButtons[i].setAttribute("onclick", "BuyUpgrade("+i+")")
}
function UpdateUpgrades()
{
    for (let i = 0; i < ShopButtons.length; i++)
    {
        ShopButtons[i].innerHTML = UpgradeStats[i]+"<br/>"+"Cost: "+abbreviateNum(UpgradeCostInit[i] * Math.pow(UpgradeCostMulti[i], Upgrades[i]));
    }
    if (IncrementButtonMultiplier > 1)
    {
    document.getElementById("incomepc").innerHTML = "Income (per click): "+abbreviateNum(IncrementButton * IncrementButtonMultiplier)+" ("+IncrementButtonMultiplier+"x multiplier)"
    }
    else
    {
        document.getElementById("incomepc").innerHTML = "Income (per click): "+abbreviateNum(IncrementButton * IncrementButtonMultiplier)
    }
    UpdateShopDescs()
    UpdateStatistics()
}
var LastIncrementUpdate = performance.now()
function IncrementGameTime()
{
    var LiterallyNow = performance.now()
    var Delta = LiterallyNow - LastIncrementUpdate
    LastIncrementUpdate = LiterallyNow
    TimeInGame += Delta/1000
}
IncrementGameTime()
function UpdateStatistics()
{
    function NewLine(t)
    {
        StatInfo.innerHTML = StatInfo.innerHTML+"<br>"+t
    }
    var StatInfo = document.getElementById("StatisticsInfo")
    StatInfo.innerHTML = ""
    NewLine("Current balance: "+Math.floor(Balance))
    NewLine("Lifetime balance: "+Math.floor(TotalBalance))
    NewLine("Raw passive income: "+Math.floor(Increment))
    NewLine("Passive income multiplier: "+IncrementMultiplier)
    NewLine("Total passive income: "+Math.floor(Increment * IncrementMultiplier))
    NewLine("Passive income time: "+Math.floor(IncrementTime)+"ms")
    NewLine("Raw per click income: "+Math.floor(IncrementButton))
    NewLine("Per click income multiplier: "+IncrementButtonMultiplier)
    NewLine("Total per click income: "+Math.floor(IncrementButton * IncrementButtonMultiplier))
    NewLine("")
    NewLine("Time spent in game: "+toHHMMSS(TimeInGame))
}
UpdateUpgrades()

function psIncomeCalc()
{
    let TimeDifference = (performance.now() - LastCheckTime); // ms
    let ExpectedIncome = Increment * IncrementMultiplier * 1000 / IncrementTime;
    let ActualIncome = Balance - LastCheckBalance;
    let ClickIncome = (ActualIncome-ExpectedIncome) * 1000 / TimeDifference;
    if (IncrementMultiplier > 1)
    {
        document.getElementById("incomeps").innerHTML = "Income (per second): "+abbreviateNum(ExpectedIncome * IncrementMultiplier + ClickIncome)+" ("+IncrementMultiplier+"x passive multiplier)"
    }
    else
    {
        document.getElementById("incomeps").innerHTML = "Income (per second): "+abbreviateNum(ExpectedIncome * IncrementMultiplier + ClickIncome);
    }
    LastCheckTime = performance.now();
    LastCheckBalance = Balance;
}

function TimeIncrement()
{
    var toget = Increment * IncrementMultiplier
    Balance += toget;
    TotalBalance += toget;
    setTimeout(TimeIncrement, IncrementTime);
    UpdateBalance();
}

function ButtonIncrement()
{
    var toget = IncrementButton * IncrementButtonMultiplier
    Balance += toget;
    TotalBalance += toget;
    UpdateBalance();
}

function WipeData()
{
    Balance = 0;
    TotalBalance = 0;
    Increment = 1;
    IncrementButton = 1;
    IncrementButtonMultiplier = 1;
    IncrementTime = 1000;
    IncrementMultiplier = 1;
    LastCheckTime = performance.now();
    LastCheckBalance = Balance;
    LastCheckIncome = 0
    Upgrades = [0, 0, 0, 0];
    SaveData();
    location.reload(true);
}

var StatsElems = document.querySelectorAll(".Stats")
var GameElems = document.querySelectorAll(".Game")
var SettingsElems = document.querySelectorAll(".Settings")
function on(thing)
{
    thing.style.visibility = "visible";
}
function off(thing)
{
    thing.style.visibility = "hidden";
}
var CurrentWindow = null;
function SwitchTo(To)
{
    switch (To)
    {
        case CurrentWindow:
            CurrentWindow = "Game"
            StatsElems.forEach(off)
            SettingsElems.forEach(off)
            GameElems.forEach(on)
            break;
        case "Stats":
            CurrentWindow = "Stats"
            StatsElems.forEach(on)
            SettingsElems.forEach(off)
            GameElems.forEach(off)
            break;
        case "Settings":
            CurrentWindow = "Settings"
            StatsElems.forEach(off)
            SettingsElems.forEach(on)
            GameElems.forEach(off)
            break;
        default:
            CurrentWindow = "Game"
            StatsElems.forEach(off)
            SettingsElems.forEach(off)
            GameElems.forEach(on)
    }
}
var texts = document.querySelectorAll("button")
var divs = document.querySelectorAll("div")
var body = document.querySelectorAll("body")
function DarkMode(tag)
{
    var taglist = [
        "dark-mode",
        "dark-mode-green",
        "dark-mode-purple"
    ];
    if (tag == 'light')
    {
        function sw(thing)
        {
            for (let i = 0; i < taglist.length; i++)
            {
                thing.classList.toggle(taglist[i], false) 
            }
        }
        body.forEach(sw)
    }
    else
    {
        function sw(thing)
        {
            for (let i = 0; i < taglist.length; i++)
            {
                thing.classList.toggle(taglist[i], false) 
            }
            thing.classList.toggle(tag)
        }
        body.forEach(sw)
    }
    Notif("Dark mode switched successfully!", 3000)
}
StatsElems.forEach(off)
SettingsElems.forEach(off)


UpdateStatistics()
setTimeout(TimeIncrement, IncrementTime);
setInterval(psIncomeCalc, 1000);
setInterval(UpdateStatistics, 1000);
setInterval(IncrementGameTime, 1000);