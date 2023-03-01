
process.env.DIST = join(__dirname, '../..')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { app, BrowserWindow, shell, ipcMain } from 'electron'
const sqlite3 = require('sqlite3').verbose();
import { release } from 'os'
import { join } from 'path'

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  // Create a new instance of the database
  let db = new sqlite3.Database('./db/flows.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the database.');
  });
  
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (app.isPackaged) {
    win.loadFile(indexHtml)
  } else {
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  ipcMain.handle('getJsonFiles', async (event, arg) => {
    return await new Promise((resolve, reject) => {
      db.all(`SELECT name FROM flow`, [], (err, rows) => {
        if (err) reject(err)
        resolve(rows.map(row => row.name))
      })
    })
  })
  
  // Handle the 'home' message from the renderer process
  ipcMain.handle('home', async (event, arg) => {
    return await new Promise((resolve,reject)=>{
      // Perform a SELECT query to retrieve all playlists
      db.all(`SELECT PlaylistId as id, Name as name FROM playlists`, [], (err, rows) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  });

  // Handle the 'insert' message from the renderer process
  ipcMain.handle('insert', async (event, arg) => {
    return await new Promise((resolve,reject)=>{
      // Perform an INSERT query to add a new playlist
      win.reload()
      db.run(`INSERT INTO playlists (Name) VALUES (?)`, [arg.name], (err) => {
        if (err) reject(err)
        //resolve()
      })
    })
  });

  // Handle the 'update' message from the renderer process
  ipcMain.handle('update', async (event, arg) => {
    return await new Promise((resolve,reject)=>{
      // Perform an UPDATE query to update an existing playlist
      win.reload()
      db.run(`UPDATE playlists SET Name = ? WHERE PlaylistId = ?`, [arg.name, arg.id], (err) => {
        if (err) reject(err)
       // resolve()
      })
    })
  });
  
  // Handle the 'delete' message from the renderer process
  ipcMain.handle('delete', async (event, arg) => {
    return await new Promise((resolve,reject)=>{
      win.reload()
      // Perform a DELETE query to delete an existing playlist
      db.run(`DELETE FROM playlists WHERE PlaylistId = ?`, [arg.id], (err) => {
        if (err) reject(err)
       // resolve()
      })
    })
  });
  ipcMain.handle('getJsonFile', async (event, arg) => {
    try {
      const row: { data: any } = await new Promise((resolve, reject) => {
        db.get(`SELECT data FROM flow WHERE name = ?`, [arg.name], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });
      
      return row.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  });
  
  // Handle the 'insertJsonFile' message from the renderer process
  ipcMain.handle('insertJsonFile', async (event, arg) => {
    return await new Promise((resolve, reject) => {
      // Perform an INSERT query to add a new JSON file
      win.reload();
      const formattedData = JSON.stringify(arg.data).replace(/\\/g, '').slice(1, -1);
      // const formattedData = JSON.stringify(arg.data).replace(/(?!\\)\\(?!n)/g, '')
      // .replace(/\\n/g, '\n').replace(/\\/g, '').replace(/"(\w+)":/g, '$1:')
      // .slice(1, -1);
      //.replace(/[\s\\]/g, '')
      db.run(`INSERT INTO flow (name, data) VALUES (?, ?)`, [arg.name, formattedData], (err) => {
        if (err) reject(err);
        console.log(err);
      });
    });
  });
  
  
  
  
  }

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// new window example arg: new windows url
ipcMain.handle('open-win', (event, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
    },
  })

  if (app.isPackaged) {
    childWindow.loadFile(indexHtml, { hash: arg })
  } else {
    childWindow.loadURL(`${url}/#${arg}`)
    // childWindow.webContents.openDevTools({ mode: "undocked", activate: true })
  }
})
