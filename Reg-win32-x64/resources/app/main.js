const {app, BrowserWindow, Menu, ipcMain} = require('electron');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      fullscreen: false
  });

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

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
