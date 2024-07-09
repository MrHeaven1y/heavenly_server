const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

let pyProc = null;
let pyPort = null;

const createPyProc = () => {
  let port = '5000'
  let script = path.join(__dirname, 'server.py')
  pyProc = spawn('python', [script])
  if (pyProc != null) {
    console.log('child process success')
  }
}

const exitPyProc = () => {
  pyProc.kill()
  pyProc = null
  pyPort = null
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL('http://localhost:5000'); 
}

function waitForServer(callback) {
  const client = new net.Socket();
  const tryConnection = () => {
    client.connect({port: 5000}, () => {
      client.end();
      callback();
    });
  };
  client.on('error', (error) => {
    setTimeout(tryConnection, 1000);
  });
  tryConnection();
}

app.on('ready', function() {
  createPyProc();
  waitForServer(createWindow);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('quit', exitPyProc)