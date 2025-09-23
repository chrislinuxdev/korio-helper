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
    width: Math.min(400, Math.floor(width * 0.25)), // Smaller, sidebar-like width
    height: Math.min(600, Math.floor(height * 0.7)),
    show: false, // Start hidden
    frame: false, // Remove window frame for clean look
    alwaysOnTop: true, // Keep on top of all windows
    skipTaskbar: true, // Don't show in taskbar
    resizable: false, // Prevent resizing
    movable: true, // Allow dragging
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    transparent: true, // For rounded corners/shadows
    vibrancy: 'sidebar', // macOS blur effect
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Position it on the right edge (like iOS sidebar)
  const x = width - win.getBounds().width - 20; // 20px from right edge
  const y = 50; // 50px from top
  win.setPosition(x, y);

  // Show with animation
  win.once('ready-to-show', () => {
    win.show();
  });

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
      // Add a small delay to prevent immediate hiding
      setTimeout(() => {
        if (!win.isFocused()) {
          win.hide();
        }
      }, 100);
    }
  });

  // Show/hide with slide animation
  win.on('show', () => {
    // Optional: Add slide-in animation
    const bounds = win.getBounds();
    win.setBounds({ ...bounds, x: width }, false);
    win.setBounds({ ...bounds, x: width - bounds.width - 20 }, true);
  });

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // Show on all desktops
  // win.setLevel('floating'); // Ensure it floats above other windows
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

  // Global shortcut to toggle
  globalShortcut.register('Control+Alt+D', () => {
    if (!win) return;
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus(); // Ensure it gets focus when shown
    }
  });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
