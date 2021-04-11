import { BrowserWindow, ipcMain } from 'electron'

import { createStore } from 'app/redux/store'

export const storeAdapter = (mainWindow: BrowserWindow): void => {
    mainWindow.webContents.on('did-finish-load', () => {
        const send = (channel, ...args) =>
            mainWindow.webContents.send(channel, ...args)
        createStore(send, ipcMain.on.bind(ipcMain))
    })
}
