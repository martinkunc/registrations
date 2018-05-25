const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const xlsx = require('xlsx');
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

  renderScreen('welcome')

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

const persFile = 'data/persons.xlsx'
const perSheet = 'persons'
ipcMain.on('person:register', (event, person) => {
  console.log(' registrovany ' + person)
  var wb;
  if (!fs.existsSync(persFile)) {
    wb = xlsx.utils.book_new()
  } else {
    wb = xlsx.readFile(persFile)
  }
  
  console.log(wb.SheetNames)
  console.log(typeof(wb.Sheets[perSheet]))
  console.log(typeof(wb.Sheets[perSheet]) == 'undefined') 

  if (typeof(wb.Sheets[perSheet]) == 'undefined') {
    var ws_data = [ [ '' ] ];
    var ws = xlsx.utils.aoa_to_sheet(ws_data);
    console.log('wsin '+ws)
    xlsx.utils.book_append_sheet(wb, ws,perSheet)
  }
  ws = wb.Sheets[perSheet]
  console.log('ws'+ws)
  //rows = ws['!rows'] 
  //lr = ws['!rows'] ? rows.length : 0
  lr = 0
  nr = lr
  for (var r=0; r<lr; r++) {
    cell_address = {c:0, r:r}
    cell_ref = XLSX.utils.encode_cell(cell_address);
    var desired_value = (desired_cell ? desired_cell.v : undefined);
    if (desired_value == undefined) {
      nr = r;
      break;
    } 
  }

  cell_address = {c:1, r:nr+1}
  console.log(cell_address)
  
  cell_ref = xlsx.utils.encode_cell(cell_address);
  ws['A1'] = { v:'a1 data' }
  ws['B2'] = { v:'b2 value' }
  xlsx.w

  // var ws2 = xlsx.utils.aoa_to_sheet([
  //   "SheetJS".split(""),
  //   [1,2,3,4,5,6,7],
  //   [2,3,4,5,6,7,8]
  // ]);
  // ws2['D1'] = { v:'d1' }
  // xlsx.utils.book_append_sheet(wb, ws2,'ws2')
  xlsx.writeFile(wb,  persFile);


});

function renderScreen(screen) {
  mainWindow.webContents.send('screen:set', screen);
  renderedScreen = screen
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Todo',
        click() { createAddWindow(); }
      },
      {
        label: 'Clear Todos',
        click() {
          mainWindow.webContents.send('todo:clear');
        }
      },
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
