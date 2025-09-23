import { app, BrowserWindow, Tray, Menu, screen, ipcMain, nativeImage, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, '..'); // parent of dist
const distHtml = path.join(__dirname, 'src', 'pages', 'index.html'); // Option A (copied)
const srcHtml = path.join(projectRoot, 'src', 'pages', 'index.html'); // Option B (source)
const preloadJs = path.join(__dirname, 'preload.js'); // compiled preload
const trayPng = path.join(projectRoot, 'public', 'trayTemplate.png'); // icon in project/public

// Initialize store
const store = new Store({
  name: 'korio-dashboard',
  // encryptionKey: 'your-encryption-key-here' // Optional encryption
});

let win = null;
let tray = null;
let isQuitting = false;

function pickHtmlPath() {
  if (fs.existsSync(distHtml)) return distHtml; // prefer packaged/copied
  if (fs.existsSync(srcHtml)) return srcHtml; // fallback to source (dev)
  console.error('[MAIN] Could not find an HTML entry at:', distHtml, 'or', srcHtml);
  return null;
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: Math.min(1000, Math.floor(width * 0.7)),
    height: Math.min(800, Math.floor(height * 0.8)),
    show: true,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Make sure this path is correct
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.center();

  const htmlPath = pickHtmlPath();
  if (!htmlPath) {
    win.loadURL('about:blank');
    win.webContents.executeJavaScript(
      `document.body.innerHTML = '<pre style="padding:16px">No index.html found.\\nExpected one of:\\n${distHtml}\\n${srcHtml}</pre>'`,
    );
    return;
  }

  win.webContents.on('did-finish-load', () => console.log('[MAIN] did-finish-load:', htmlPath));
  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[MAIN] did-fail-load:', code, desc, 'url:', url);
  });

  win.loadFile(htmlPath);
  win.webContents.openDevTools({ mode: 'detach' }); // debug; remove later

  // Hide window when clicking outside or losing focus
  win.on('blur', () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide();
    }
  });

  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  if (!fs.existsSync(trayPng)) {
    console.warn('[MAIN] Tray icon not found at', trayPng, '— skipping tray for now.');
    return;
  }
  const icon = nativeImage.createFromPath(trayPng);
  if (icon.isEmpty()) {
    console.warn('[MAIN] Tray icon is empty — skipping tray.');
    return;
  }
  tray = new Tray(icon);
  const menu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (win) {
          win.show();
          win.focus();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
  tray.setToolTip('Dev Dashboard');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    if (win) {
      win.isVisible() ? win.hide() : win.show();
    }
  });
}

// IPC handlers for token management
ipcMain.handle('store-token', async (event, key, token) => {
  store.set(`tokens.${key}`, token);
  return true;
});

ipcMain.handle('get-token', async (event, key) => {
  return store.get(`tokens.${key}`);
});

ipcMain.handle('delete-token', async (event, key) => {
  store.delete(`tokens.${key}`);
  return true;
});

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  globalShortcut.register('Control+Alt+D', () => {
    if (!win) return;
    win.isVisible() ? win.hide() : win.show();
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
