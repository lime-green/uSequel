import { BrowserWindow, ipcMain } from 'electron'

import { connectIPCRedux } from 'app/redux'

export const storeAdapter = (mainWindow: BrowserWindow): void => {
    mainWindow.webContents.on('did-finish-load', () => {
        const send = (channel, ...args) => {
            mainWindow.webContents.send(channel, ...args)
        }
        const receive = (channel, cb) => {
            ipcMain.removeAllListeners(channel)
            ipcMain.on(channel, cb)
        }
        connectIPCRedux(send, receive)
    })
}
