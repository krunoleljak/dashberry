const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitOn = require('wait-on');
const log = require('electron-log');
const { Tray, Menu } = require('electron');

let mainWindow;
let backendProcess;
let tray;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Enable electron-log to output to the VS Code debug console/terminal in dev mode
if (isDev) {
    log.transports.console.level = 'debug';
    log.transports.file.level = 'debug';
} else {
    log.transports.console.level = false;
}

function createWindow() {
    log.info('Creating window');

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Show splash screen immediately
    const splashUrl = `file://${path.join(__dirname, 'splash.html')}`;
    mainWindow.loadURL(splashUrl);
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create Tray
    try {
        tray = new Tray(path.join(__dirname, 'icon.png'));
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
    } catch (err) {
        log.error('Failed to create tray icon:', err);
    }
}

function loadApp() {
    log.info('Loading app');
    const startUrl = isDev
        ? 'http://localhost:4200'
        : `file://${path.join(__dirname, '../frontend/dist/frontend/browser/index.html')}`;

    mainWindow.loadURL(startUrl).catch(err => {
        log.error('Failed to load app URL:', err);
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    // Create window immediately with splash screen
    createWindow();

    let backendReady;

    if (!isDev) {
        // In production, launch the backend
        const backendPath = path.join(process.resourcesPath, 'backend', 'backend');
        log.info(`Spawning backend at: ${backendPath}`);

        backendProcess = spawn(backendPath, [], { stdio: 'pipe' });

        backendProcess.stdout.on('data', (data) => log.info(`[Backend] ${data}`));
        backendProcess.stderr.on('data', (data) => log.error(`[Backend ERR] ${data}`));
        backendProcess.on('close', (code) => log.info(`Backend exited with code ${code}`));

        const backendErrorPromise = new Promise((_, reject) => {
            backendProcess.on('error', (err) => {
                log.error(`[Backend ERR] Failed to start backend:`, err);
                reject(new Error(`Backend failed to start: ${err.message}`));
            });
            backendProcess.on('exit', (code) => {
                if (code !== 0 && code !== null) {
                    reject(new Error(`Backend exited prematurely with code ${code}`));
                }
            });
        });

        backendReady = Promise.race([
            waitOn({ resources: ['http-get://localhost:5000/api/health'], timeout: 60000 }),
            backendErrorPromise
        ]).catch((err) => {
            log.error('Backend server not starting', err);
            throw err;
        });
    } else {
        // In dev mode, just wait for the health endpoint (backend started externally)
        backendReady = waitOn({
            resources: ['http-get://localhost:5000/api/health'],
            timeout: 60000
        }).catch((err) => {
            log.error('Backend health check failed in dev mode', err);
            throw err;
        });
    }

    // Once backend is ready, switch from splash to actual app
    backendReady.then(() => {
        log.info('Backend ready, loading app');
        loadApp();
    }).catch(() => {
        log.error('Backend server not starting');
        mainWindow.loadURL(`data:text/html,<html><body style="background:\%231a1a2e;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Failed to start services. Check logs.</h2></body></html>`);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    console.log('Window all closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    console.log('Before quit');
    if (tray) tray.destroy();
    app.isQuitting = true;
    if (backendProcess) {
        log.info('Killing backend process');
        backendProcess.kill();
    }
});
