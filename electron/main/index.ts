
process.env.DIST = join(__dirname, '../..')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')


import { app, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { release } from 'os'
import { join } from 'path'
const nodemailer = require('nodemailer');
require('dotenv').config();
import { homedir } from "os";
import { knex } from "knex";
import type { Knex } from "knex";
import pkg from "../../package.json";

export let appDirectory = join(homedir(), pkg.name);


const config: Knex.Config = {
  client: "sqlite3",
  connection: {
    filename: join(appDirectory, "storage.db"),
  },
  useNullAsDefault: true,
};

const dbsqlite3 = knex(config);

// Création de la table 'flow'
dbsqlite3.schema.hasTable("flow").then((exists) => {
  if (!exists) {
  
    dbsqlite3.schema
      .createTable("flow", (table) => {
        table.increments("id").primary();
        table.string("name");
        table.json("data");
        table.integer("year");
      })
      .then(() => {
        
      })
      .catch((err) => {
       
      });
  } else {
   
  }
});

// Création de la table 'files'
dbsqlite3.schema.hasTable("files").then((exists) => {
  if (!exists) {
    
    dbsqlite3.schema
      .createTable("files", (table) => {
        table.increments("id").primary();
        table.string("name").notNullable();
        table.json("data").notNullable();
        table.integer("years");
      })
      .then(() => {
       
      })
      .catch((err) => {
       
      });
  } else {
   
  }
});

// Création de la table 'managers'
dbsqlite3.schema.hasTable("managers").then((exists) => {
  if (!exists) {
    dbsqlite3.schema
      .createTable("managers", (table) => {
        table.increments("id").primary();
        table.string("first_name").notNullable();
        table.string("last_name").notNullable();
        table.string("email").notNullable().unique();
        table.string("category").notNullable();
      })
      .then(() => {
      
      })
      .catch((err) => {
       
      });
  } else {
    
  }
});

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
const preload = join("./db/flows.db", '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([]));
  // Create a new instance of the database
  // let db = new sqlite3.Database('./db/flows.db', sqlite3.OPEN_READWRITE, (err) => {
  //   if (err) {
  //     console.error(err.message);
  //   }
  //   console.log('Connected to the database.');
  // });
  let db=dbsqlite3
// Create a transporter for sending emails
  const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  ipcMain.handle('sendEmail', async (event, emailData) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: emailData.to,
        subject: emailData.subject,
        text: emailData.text,
        attachments: emailData.attachments
      };

      await transporter.sendMail(mailOptions);
      console.log('Email sent!');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  
  ipcMain.handle('getManagers', async (event, arg) => {
    try {
      const managers = await db('managers').select('last_name', 'first_name', 'email', 'category');
      return managers;
    } catch (error) {
      console.error('Erreur lors de la récupération des gestionnaires :', error);
      throw error;
    }
  });
  

  ipcMain.handle('insertManager', async (event, arg) => {
    const [first_name, last_name, email, category] = arg;
    try {
      const insertedManager = await db('managers').insert({
        first_name,
        last_name,
        email,
        category,
      });
      return insertedManager[0]; // Retourne l'ID du nouveau gestionnaire inséré
    } catch (error) {
      console.error('Erreur lors de l\'insertion du gestionnaire :', error);
      throw error;
    }
  });
  
  
  ipcMain.handle('editManagerByEmail', async (event, arg) => {
    const [first_name, last_name, email, category, oldemail] = arg;
    try {
      const updatedRows = await db('managers')
        .where('email', oldemail)
        .update({
          first_name,
          last_name,
          email,
          category,
        });
      return updatedRows; // Retourne le nombre de lignes mises à jour
    } catch (error) {
      console.error('Erreur lors de la mise à jour du gestionnaire par e-mail :', error);
      throw error;
    }
  });
  
  ipcMain.handle('EmptyManagers', async (event) => {
    try {
      await db('managers').del();
      return 'Tous les gestionnaires ont été supprimés avec succès.';
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les gestionnaires :', error);
      throw error;
    }
  });
  
  
  ipcMain.handle('insertMultiManagers', async (event, arg) => {
    const managerss = arg;
    console.log(JSON.stringify(managerss));
  
    try {
      const insertedIds = await db('managers').insert(managerss, ['id']);
      return insertedIds;
    } catch (error) {
      console.error('Erreur lors de l\'insertion de plusieurs gestionnaires :', error);
      throw error;
    }
  });
  
  ipcMain.handle('deleteManagersbyemail', async (event, emailsToDelete) => {
    try {
      const deletedRows = await db('managers')
        .whereIn('email', emailsToDelete)
        .del();
      return deletedRows;
    } catch (error) {
      console.error('Erreur lors de la suppression des gestionnaires par e-mail :', error);
      throw error;
    }
  });
  
  
  ipcMain.handle('getEmailByManager', async (event, first_name, last_name) => {
    try {
      const result = await db('managers')
        .select('email')
        .where('first_name', first_name)
        .orWhere('last_name', last_name)
        .first(); // Utilisez first() pour obtenir le premier résultat
  
      return result ? result.email : null;
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'e-mail du gestionnaire :', error);
      return null;
    }
  });  
  
  ipcMain.handle('getJsonFiles', async (event, arg) => {
    const currentYear = new Date().getFullYear();
  
    try {
      const files = await db('flow')
        .select('name')
        .where('year', currentYear);
  
      const fileNames = files.map((file) => file.name);
      return fileNames;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers JSON :', error);
      return [];
    }
  });
  
  ipcMain.handle('getFlowsByYear', async (event, arg) => {
    try {
      const files = await db('flow')
        .select('name')
        .where('year', arg.year);
  
      const fileNames = files.map((file) => file.name);
      return fileNames;
    } catch (error) {
      console.error('Erreur lors de la récupération des flux par année :', error);
      return [];
    }
  });  

  ipcMain.handle('getFilesByYear', async (event, arg) => {
    try {
      const files = await db('files')
        .select('name')
        .where('years', arg.years);
  
      const fileNames = files.map((file) => file.name);
      return fileNames;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers par année :', error);
      return [];
    }
  });  

  ipcMain.handle('updateJsonFileName', async (event, arg) => {
    try {
      await db('flow')
        .where('name', arg.oldName)
        .update({
          name: arg.newName
        });
      return;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom du fichier JSON :', error);
      throw error;
    }
  });
  

  ipcMain.handle('updateQuillFileName', async (event, arg) => {
    try {
      await db('files')
        .where('name', arg.oldName)
        .update({
          name: arg.newName
        });
      return;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom du fichier Quill :', error);
      throw error;
    }
  });  
  
  ipcMain.handle('updateJsonFile', async (event, arg) => {
    try {
      const formattedData = JSON.stringify(arg.data).replace(/\\/g, '').slice(1, -1);
  
      await db('flow')
        .where('name', arg.name)
        .update({
          data: formattedData
        });
  
      return;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier JSON :', error);
      throw error;
    }
  });
  
  ipcMain.handle('updateContentFile', async (event, arg) => {
    try {
      await db('files')
        .where('name', arg.name)
        .update({
          data: arg.data
        });
  
      return;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contenu du fichier :', error);
      throw error;
    }
  });  

  ipcMain.handle('getJsonFile', async (event, arg) => {
    try {
      const result = await db('flow')
        .select('data')
        .where('name', arg.name)
        .first();
  
      return result ? result.data : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier JSON :', error);
      return null;
    }
  });  
  
  ipcMain.handle('getYearsFlow', async (event, arg) => {
    try {
      const currentYear = new Date().getFullYear();
      const years = await db('flow')
        .distinct('year')
        .where('year', '<', currentYear)
        .pluck('year');
  
      return years;
    } catch (error) {
      console.error('Erreur lors de la récupération des années de flux :', error);
      return [];
    }
  });
  
  

  ipcMain.handle('getYearsFile', async (event, arg) => {
    try {
      const currentYear = new Date().getFullYear();
      const years = await db('files')
        .distinct('years')
        .where('years', '<', currentYear)
        .pluck('years');
  
      return years;
    } catch (error) {
      console.error('Erreur lors de la récupération des années de fichiers :', error);
      return [];
    }
  });
  
ipcMain.handle('insertJsonFile', async (event, arg) => {
  try {
    const formattedData = JSON.stringify(arg.data).replace(/\\/g, '').slice(1, -1);
    const insertResult = await db('flow').insert({
      name: arg.name,
      data: formattedData,
      year: arg.year
    });

    return insertResult;
  } catch (error) {
    console.error('Erreur lors de l\'insertion du fichier JSON :', error);
    throw error;
  }
});
   
  
ipcMain.handle('deleteJsonFile', async (event, arg) => {
  try {
    const result = await db('flow')
      .where('name', arg.name)
      .del();

    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier JSON :', error);
    throw error;
  }
});

ipcMain.handle('deleteQuillFile', async (event, arg) => {
  try {
    const result = await db('files')
      .where('name', arg.name)
      .del();

    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier Quill :', error);
    throw error;
  }
});

ipcMain.handle('insertQuillcontent', async (event, data) => {
  try {
    const insertResult = await db('files').insert({
      name: data.name,
      data: data.data,
      years: data.years
    });

    const result = 'Data inserted successfully';
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'insertion du contenu Quill :', error);
    throw error;
  }
});
  
ipcMain.handle('getQuillContentData', async (event, arg) => {
  try {
    const result = await db('files')
      .select('data')
      .where('name', arg.name)
      .first();

    if (result) {
      return result.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données du contenu Quill :', error);
    return null;
  }
});
  
ipcMain.handle('checkFileNameExists', async (event, arg) => {
  try {
    const result = await db('files')
      .select('name')
      .where('name', arg.name)
      .first();

    return !!result; // Renvoie true si le nom de fichier existe, sinon false
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence du nom de fichier :', error);
    return false;
  }
});
  
ipcMain.handle('checkFlowNameExists', async (event, arg) => {
  try {
    const result = await db('flow')
      .select('name')
      .where('name', arg.name)
      .first();

    return !!result; // Renvoie true si le nom de flux existe, sinon false
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence du nom de flux :', error);
    return false;
  }
});

ipcMain.handle('getQuillContentName', async (event, arg) => {
  const currentYear = new Date().getFullYear();

  try {
    const files = await db('files')
      .select('name')
      .where('years', currentYear);

    const fileNames = files.map((file) => file.name);
    return fileNames;
  } catch (error) {
    console.error('Erreur lors de la récupération des noms de fichiers Quill :', error);
    return [];
  }
});

}  
  
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
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
  }
})