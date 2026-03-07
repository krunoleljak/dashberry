const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const log = require('electron-log');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Depending on env, load localhost or built files
    const startUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:4200'
        : `file://${path.join(__dirname, '../frontend/dist/frontend/browser/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    if (process.env.NODE_ENV !== 'development') {
        // In production, we'd launch the backend here
        // For now, in dev, we use concurrently
    }

    // Wait for Angular dev server
    if (process.env.NODE_ENV === 'development') {
        waitOn({ resources: ['http://localhost:4200'], timeout: 60000 })
            .then(() => {
                createWindow();
            })
            .catch((err) => {
                log.error('Angular dev server not starting', err);
            });
    } else {
        // prod
        createWindow();
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
