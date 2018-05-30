const {app, BrowserWindow, Menu, ipcMain} = require('electron');
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

  

  mainWindow.webContents.on('did-finish-load', function() {
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
const regName = 'Registered name'
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
  console.log(' listget ' )
  var wb;
  if (!fs.existsSync(persFile)) {
    mainWindow.webContents.send('list:obtained', []);
    return
  }
  
  wb = await xlsxpopulate.fromFileAsync(persFile)
  ws = wb.sheet(regSheet)
  if (typeof(ws) == "undefined") {
    mainWindow.webContents.send('list:obtained', []);
  }
  list = await getListFromSheet(persFile, regSheet)
  list = getListWithoutTitle(list, regName)

  // lastr = ws.usedRange().endCell().rowNumber()
  // list = []
  // for (r=0; r < lastr + 1; r++) {
  //   v = ws.row(r).cell(1).value()
  //   if (r == 0 && r == regName) {
  //     continue
  //   }
  //   list.push(v)
  // }
  
  //event.sender.send("list:obtained", "aa");
  mainWindow.webContents.send('list:obtained', list);
  //console.log('sent')
});

ipcMain.on('persons:get', async (event, a) => {
  console.log(' regget ' )
  var wb;
  if (!fs.existsSync(persFile)) {
    if (a.t == "autocomplete") {
      mainWindow.webContents.send('registered:getautocomplete', []);
    } else {
      mainWindow.webContents.send('registered:verified', {ok:false, msg:'Nemohu registrovat uzivatele. Soubor s registracemi nenalezen.'});
    }
    return
  }
  
  list = await getListFromSheet(persFile, perSheet)
  list = getListWithoutTitle(list, persName)
  if (a.t == "autocomplete") {
    mainWindow.webContents.send('registered:getautocomplete', list);
    return
  }

  console.log('check if is in persons')
  isInPers = isInList(a.p, list)
  if (!isInPers) {
    mainWindow.webContents.send('registered:verified', {ok:false, msg:'Nemohu registrovat uzivatele. Neni predregistrovany.'});
    return
  }

  list = await getListFromSheet(persFile, regSheet)
  list = getListWithoutTitle(list, regName)
  isInRegs = isInList(a.p, list)
  if (isInRegs) {
    mainWindow.webContents.send('registered:verified', {ok:false, msg:'Nemohu registrovat uzivatele. Uzivatel je uz zaregistrovany.'});
    return
  }
  
  wb = await xlsxpopulate.fromFileAsync(persFile)
  ws = wb.sheet(regSheet)
  if (typeof(ws) == "undefined") {
    ws = wb.addSheet(regSheet)
    ws.row(1).cell(1).value(regName)
  }
  lastr = ws.usedRange().endCell().rowNumber()
  ws.row(lastr + 1).cell(1).value(a.p)
  await wb.toFileAsync(persFile)
  mainWindow.webContents.send('registered:verified', {ok:true});

});

function isInList(s, l) {
  for (r=0; r < l.length ; r++) {
    //console.log(' list[r]' + list[r] + ' ' + s)
    if (l[r] && s && l[r].toLowerCase() == s.toLowerCase()) {
      return true
    }
  }
  return false
}

async function getListFromSheet(b, s) {
  wb = await xlsxpopulate.fromFileAsync(b)
  ws = wb.sheet(s)
  if (typeof(ws) == "undefined")
  {
    return []
  }
  lastr = ws.usedRange().endCell().rowNumber()
  list = []
  for (r=1; r < lastr + 1; r++) {
    v = ws.row(r).cell(1).value()
    list.push(v)
  }
  return list
}

function getListWithoutTitle(l, t) {
  if (l[0] == t) {
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
  }
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
