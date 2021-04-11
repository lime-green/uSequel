import { BrowserWindow, app, ipcMain } from 'electron'
import installExtension, {
    REACT_DEVELOPER_TOOLS,
    REDUX_DEVTOOLS,
} from 'electron-devtools-installer'

import { storeAdapter } from 'app/main/storeAdapter'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit()
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    })
    mainWindow.maximize()
    mainWindow.show()

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

    if (!app.isPackaged) {
        mainWindow.webContents.openDevTools()
        installExtension(extensions, {
            loadExtensionOptions: { allowFileAccess: true },
            forceDownload: false,
        }).catch(console.log)
    }

    storeAdapter(mainWindow)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        event.preventDefault()
        // const parsedUrl = new URL(navigationUrl)

        // if (parsedUrl.origin !== 'https://example.com') {
        //     event.preventDefault()
        // }
    })
})
