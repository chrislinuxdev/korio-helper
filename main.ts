import { app, BrowserWindow, Tray, Menu, screen, ipcMain, nativeImage, globalShortcut, shell } from 'electron';
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
  console.debug('Creating window...');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true, // Enable resizing
    minWidth: 400, // Set minimum width
    minHeight: 300, // Set minimum height
    titleBarStyle: 'default', // Shows standard macOS window controls
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Assign mainWindow to the global win variable
  win = mainWindow;

  // Enable window snapping on macOS
  if (process.platform === 'darwin') {
    mainWindow.setVibrancy('under-window');
  }

  // Optional: Add maximize/minimize functionality
  mainWindow.setMenu(null); // Remove default menu if you want

  // Position it on the right edge
  const x = width - mainWindow.getBounds().width - 20;
  const y = 50;
  mainWindow.setPosition(x, y);

  // Don't show automatically - only via shortcut
  mainWindow.once('ready-to-show', () => {
    // Don't call mainWindow.show() here
    console.log('Window ready, use shortcut to show');
  });

  const htmlPath = pickHtmlPath();
  if (!htmlPath) {
    mainWindow.loadURL('about:blank');
    mainWindow.webContents.executeJavaScript(
      `document.body.innerHTML = '<pre style="padding:16px">No index.html found.\\nExpected one of:\\n${distHtml}\\n${srcHtml}</pre>'`,
    );
    return;
  }

  mainWindow.webContents.on('did-finish-load', () => console.log('[MAIN] did-finish-load:', htmlPath));
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('[MAIN] did-fail-load:', code, desc, 'url:', url);
  });

  mainWindow.loadFile(htmlPath);
  mainWindow.webContents.openDevTools({ mode: 'detach' }); // debug; remove later

  // Hide window when clicking outside or losing focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      // Add a small delay to prevent immediate hiding
      setTimeout(() => {
        if (!mainWindow.isFocused()) {
          mainWindow.hide();
        }
      }, 100);
    }
  });

  // Show/hide with slide animation
  mainWindow.on('show', () => {
    console.debug('Show/hide with slide animation');
    // Optional: Add slide-in animation
    const bounds = mainWindow.getBounds();
    mainWindow.setBounds({ ...bounds, x: width }, false);
    mainWindow.setBounds({ ...bounds, x: width - bounds.width - 20 }, true);
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // Show on all desktops
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

// Add IPC handler for opening external links
ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Failed to open external URL:', error);
    return { success: false, error: error.message };
  }
});

// Enable live reload for development
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
  });
}

app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();
  createTray();

  // Register global shortcuts
  // Use environment variable for shortcut
  const shortcut = 'CommandOrControl+Shift+K'; //Add process.env.TOGGLE_SHORTCUT later
  const toggleShortcut = globalShortcut.register(shortcut, () => {
    if (!win) return;

    if (win.isVisible()) {
      win.hide();
      console.log('Window hidden');
    } else {
      win.show();
      win.focus(); // Ensure it gets focus when shown
      console.log('Window shown');
    }
  });

  // Alternative shortcuts you can use:
  // 'CommandOrControl+Alt+D' - Ctrl/Cmd + Alt + D
  // 'CommandOrControl+Shift+Space' - Ctrl/Cmd + Shift + Space
  // 'F12' - Just F12 key
  // 'Alt+Space' - Alt + Space

  if (!toggleShortcut) {
    console.error('Failed to register global shortcut');
  } else {
    console.log('Global shortcut registered:', shortcut);
  }

  // Optional: Register additional shortcuts
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (win && win.isVisible()) {
      win.hide();
      console.log('Window force hidden');
    }
  });
});

// Clean up shortcuts when app is closing
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
