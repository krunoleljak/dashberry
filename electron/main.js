const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const log = require('electron-log');
const { Tray, Menu } = require('electron');

let mainWindow;
let backendProcess;
let tray;

// Fix for Linux sandbox error: The SUID sandbox helper binary was found, but is not configured correctly.
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('no-sandbox');
    app.commandLine.appendSwitch('disable-dev-shm-usage');
}

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

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Create Tray
    tray = new Tray(path.join(__dirname, 'icon.png')); // We will need a placeholder icon
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show', click: () => mainWindow.show() },
        {
            label: 'Quit', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Dashberry');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    let backendReady = Promise.resolve();

    if (process.env.NODE_ENV !== 'development') {
        // In production, launch the backend
        const backendPath = path.join(process.resourcesPath, 'backend', 'backend');
        log.info(`Spawning backend at: ${backendPath}`);

        backendProcess = spawn(backendPath, [], { stdio: 'pipe' });

        backendProcess.stdout.on('data', (data) => log.info(`[Backend] ${data}`));
        backendProcess.stderr.on('data', (data) => log.error(`[Backend ERR] ${data}`));
        backendProcess.on('close', (code) => log.info(`Backend exited with code ${code}`));

        backendReady = waitOn({ resources: ['http-get://localhost:5000/api/health'], timeout: 60000 })
            .catch((err) => {
                log.error('Backend server not starting', err);
            });
    } else {
        // Wait for Angular dev server
        backendReady = waitOn({ resources: ['http://localhost:4200'], timeout: 60000 })
            .catch((err) => {
                log.error('Angular dev server not starting', err);
            });
    }

    backendReady.then(() => {
        createWindow();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // We handle hiding in mainWindow.on('close'), so this might not be reached unless quitting
    }
});

app.on('before-quit', () => {
    app.isQuitting = true;
    if (backendProcess) {
        log.info('Killing backend process');
        backendProcess.kill();
    }
});
