const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const xlsxpopulate = require('xlsx-populate');
const path = require('path');
const fs = require('fs');


let mainWindow;
let renderedScreen;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    fullscreen: false,
    title: 'Registrace',
    fullscreenable: true
  });

  mainWindow.loadURL('file://' + __dirname + '/mainWindow.html');
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', () => app.quit());



  mainWindow.webContents.on('did-finish-load', function () {
    console.log('did-finish-load')
    if (renderedScreen == undefined) {
      renderScreen('welcome')
    } else {
      renderScreen(renderedScreen)
    }
  })

});

ipcMain.on('screen:set', (event, screen) => {
  console.log('screen set' + screen)
  renderScreen(screen)
});

const persFile = path.join(__dirname, 'data/persons.xlsx')
const perSheet = 'persons'
const regSheet = 'registered'
const setSheet = 'settings'
const settingsName = 'Settings'
const regName = 'Registered name'
const regNum = 'Registration number'
const persName = 'Persons'
ipcMain.on('person:register', async (event, person) => {
  console.log(' registered ' + person)
  var wb;
  if (!fs.existsSync(persFile)) {
    wb = await xlsxpopulate.fromBlankAsync(persFile);
    olds = wb.sheets(0)
    ws = wb.addSheet(perSheet)
    wb.deleteSheet(0)
    ws.row(1).col(1).value(regName)
  } else {
    wb = await xlsxpopulate.fromFileAsync(persFile)
    ws = wb.sheet(perSheet)
  }

  lastr = ws.usedRange().endCell().rowNumber()
  ws.row(lastr + 1).cell(1).value(person)

  await wb.toFileAsync(persFile)
  renderScreen('welcome')
});

ipcMain.on('list:get', async (event, a) => {
  console.log(' listget ')
  var wb;
  if (!fs.existsSync(persFile)) {
    mainWindow.webContents.send('list:obtained', []);
    return
  }

  wb = await xlsxpopulate.fromFileAsync(persFile)
  ws = wb.sheet(regSheet)
  if (typeof (ws) == "undefined") {
    mainWindow.webContents.send('list:obtained', []);
  }

  arr = await getArraysFromSheet(persFile, regSheet, true)
  arr.splice(0,1)
  var list = []
  for(i=0;i < arr.length; i++) {
    if (typeof(arr[i][0]) != "undefined") {
      list.push({ N: arr[i][0], R: arr[i][1]})
    }
  }
  //onsole.log('Registered are '+JSON.stringify(list))
  //list = await getListFromSheet(persFile, regSheet)
  //list = getListWithoutTitle(list, regName)
  list.sort(function (a, b) { 
    var nameA = (a.N+"").toUpperCase(); // ignore upper and lowercase
    var nameB = (b.N+"").toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
    
    });


  //event.sender.send("list:obtained", "aa");
  mainWindow.webContents.send('list:obtained', list);
  //console.log('sent')
});

ipcMain.on('persons:get', async (event, a) => {
  console.log(' regget ')
  var wb;
  if (!fs.existsSync(persFile)) {
    if (a.t == "autocomplete") {
      mainWindow.webContents.send('registered:getautocomplete', []);
    } else {
      mainWindow.webContents.send('registered:verified', { ok: false, msg: 'Nemohu registrovat uzivatele. Soubor s registracemi nenalezen.' });
    }
    return
  }

  //list = await getListFromSheet(persFile, perSheet)
  //list = getListWithoutTitle(list, persName)

  arr = await getArraysFromSheet(persFile, perSheet, true)
  console.log('current arr '+JSON.stringify(arr))
  // removes first row
  arr.splice(0,1)  //getArrayWithoutTitle(arr, settingsName)
  //console.log('cut arr '+JSON.stringify(arr))
  p = await getColFromArr(arr, 0, false)
  //console.log('p  '+JSON.stringify(p))
  r = await getColFromArr(arr, 1, false)
  //console.log('r  '+JSON.stringify(r))
  list = p.concat(r)
  //console.log('list  '+JSON.stringify(list))
  if (a.t == "autocomplete") {
    mainWindow.webContents.send('registered:getautocomplete', list);
    return
  }

  // FInd person among registered
  wb = await xlsxpopulate.fromFileAsync(persFile)
  ws = wb.sheet(regSheet)
  if (typeof (ws) == "undefined") {
    ws = wb.addSheet(regSheet)
  }
  arr = await getArraysFromSheet(persFile, perSheet, true)
  // Find person by name
  irow = await getItemIndexFromArr(arr, 0, a.p)
  n = a.p
  if (irow >=0 ) {
    rn = await getValAtIndexFromArr(arr, irow, 1)
  }
  console.log('irow '+irow)
  if (irow < 0) {
    // Find person by reg num
    irow = await getItemIndexFromArr(arr, 1, a.p)
    n = await getValAtIndexFromArr(arr, irow, 0)
    rn = a.p
  }

  console.log('check if '+n+' with rn '+ rn +' is in persons')
  //console.log('current list '+JSON.stringify(list))
  isInPers = isInList(n, list)
  if (!isInPers) {
    mainWindow.webContents.send('registered:verified', { ok: false, msg: 'Nemohu registrovat uzivatele. Neni predregistrovany.' });
    return
  }

  //list = await getListFromSheet(persFile, regSheet)
  //list = getListWithoutTitle(list, regName)

  arr = await getArraysFromSheet(persFile, regSheet, true)
  // removes first row
  arr.splice(0,1)  //getArrayWithoutTitle(arr, settingsName)
  personsList = await getColFromArr(arr, 0, false)
  regNumsList = await getColFromArr(arr, 1, false)

  isInRegs = isInList(n, personsList)
  if (isInRegs) {
    mainWindow.webContents.send('registered:verified', { ok: false, msg: 'Nemohu registrovat uzivatele. Uzivatel je uz zaregistrovany.' });
    return
  }
  isInRegs = isInList(rn, regNumsList)
  if (isInRegs) {
    mainWindow.webContents.send('registered:verified', { ok: false, msg: 'Nemohu registrovat uzivatele. Uzivatel  s timto cislem je uz zaregistrovany.' });
    return
  }
  

  arr = await getArraysFromSheet(persFile, regSheet, true)
  arr2 = [{N: regName, R: regNum}]
  for(i=1;i < arr.length; i++) {
    if (typeof(arr[i][0]) != "undefined") {
      arr2.push({ N: arr[i][0], R: arr[i][1]})
    }
  }

  arr2.push({ N: n, R: rn})
  

  arr = arr2
  ws = wb.sheet(regSheet)
  if (typeof (ws) != "undefined") {
    ws = wb.deleteSheet(ws)
  }
  ws = wb.addSheet(regSheet)
  for(i=0;i < arr.length; i++) {
    ws.row(i+1).cell(1).value(arr[i].N)
    ws.row(i+1).cell(2).value(arr[i].R)
  }
  wb.moveSheet(regSheet, setSheet)
  
  // lastr = await getEmptyOrNewVal(arr, 0)
  // adr = ws.row(lastr + 1).cell(1).address()
  // ws.cell(adr).value(n)
  // for(i=1;i < 50; i++) {
  //   ws.row(i).cell(i).value(i)
  // }
  //value(n)
  r = await wb.toFileAsync(persFile)
  
  mainWindow.webContents.send('registered:verified', { ok: true });

});


ipcMain.on('settings:get', async (event, a) => {

  var wb;
  if (!fs.existsSync(persFile)) {
    mainWindow.webContents.send('welcome:settings', []);
    return
  }
  s = {}
  arr = await getArraysFromSheet(persFile, setSheet, true)
  arr.splice(0,1)  //getArrayWithoutTitle(arr, settingsName)
  irow = await getItemIndexFromArr(arr, 0, "Nazev")
  if (irow >= 0) {
    s.name = await getValAtIndexFromArr(arr, irow, 1)
  } 
  mainWindow.webContents.send('welcome:settings', s);

});


function isInList(s, l) {
  for (r = 0; r < l.length; r++) {
    //console.log(' list[r]' + list[r] + ' ' + s)
    if (l[r] && s && (l[r]+"").toLowerCase() == (s+"").toLowerCase()) {
      return true
    }
  }
  return false
}

async function getListFromSheet(b, s) {
  wb = await xlsxpopulate.fromFileAsync(b)
  ws = wb.sheet(s)
  if (typeof (ws) == "undefined") {
    return []
  }
  lastr = ws.usedRange().endCell().rowNumber()
  var list = []
  for (r = 1; r <= lastr; r++) {
    v = ws.row(r).cell(1).value()
    if (typeof (v) != "undefined") {
      list.push(v)
    }
  }
  return list
}

async function getValAtIndexFromArr(arr, row, col) {
    v = arr[row][col]
    return v
}

async function getItemIndexFromArr(arr, col, text) {
  for (r = 0; r <= arr.length; r++) {
    if (typeof (arr[r]) == "undefined") {
      continue
    }
    v = arr[r][col]
    if (typeof (v) != "undefined" && (v + "").toLowerCase() == text.toLowerCase()) {
      return r
    }
  }
  return -1
}

async function getEmptyOrNewVal(arr, col) {
  for (r = 0; r <= arr.length; r++) {
    v = arr[r][col]
    if (typeof (v) == "undefined") {
      return r
    }
  }
  return arr.length
}

async function getArraysFromSheet(b, s, includeEmpty) {
  var wb = await xlsxpopulate.fromFileAsync(b)
  var ws = wb.sheet(s)
  if (typeof (ws) == "undefined") {
    return []
  }
  lastr = ws.usedRange().endCell().rowNumber()
  lastc = ws.usedRange().endCell().columnNumber()
  var arrays = []
  for (r = 1; r <= lastr; r++) {
    var list = []
    for (c = 1; c <= lastc; c++) {
      v = ws.row(r).cell(c).value()
      //console.log('value at r'+r+' col '+c+' v:'+v)
      if (typeof (v) == "undefined") {
        if (includeEmpty) {
          list.push(v)
        }
      } else {
        list.push(v)
      }
    }
    arrays.push(list)
  }
  return arrays
}

async function getColFromArr(arr, c, includeEmpty) {
  var list = []
  for (r = 0; r <= arr.length; r++) {
    if (typeof (arr[r]) == "undefined") {
      if (includeEmpty) {
      list.push(arr[r])}
      continue
    }
      v = arr[r][c]
      //console.log('arr at r:'+r+' c: '+c+' v: '+v)
      if (typeof (v) == "undefined") {
        if (includeEmpty) {
          list.push(v)
        }
      } else {
        list.push(v)
      }
  }
  return list
}

function getListWithoutTitle(l, t) {
  if (l[0].trim() == t) {
    l.splice(0, 1)
  }
  return l
}

function getArrayWithoutTitle(l, t) {
  if (l[0][0].trim() == t) {
    l.splice(0, 1)
  }
  return l
}

function renderScreen(screen) {
  mainWindow.webContents.send('screen:set', screen);
  renderedScreen = screen
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      // {
      //   label: 'New Todo',
      //   click() { createAddWindow(); }
      // },
      // {
      //   label: 'Clear Todos',
      //   click() {
      //     mainWindow.webContents.send('todo:clear');
      //   }
      // },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }, {
    label: "Edit",
    submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}
];


if (process.platform === 'darwin') {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'View',
    submenu: [
      { role: 'reload' },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
