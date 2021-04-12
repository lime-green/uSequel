import { contextBridge, ipcRenderer } from 'electron'

import { REDUX_IPC_CHANNEL } from 'app/redux/ipcRedux'

contextBridge.exposeInMainWorld('ipc', {
    send: (channel: string, ...data: any) => {
        const allowedChannels = [REDUX_IPC_CHANNEL]
        if (allowedChannels.includes(channel)) {
            console.debug('sending to channel', channel, data)
            ipcRenderer.send(channel, ...data)
        }
    },
    receive: (channel: string, cb: (...args: any[]) => any[]) => {
        const allowedChannels = [REDUX_IPC_CHANNEL]
        if (allowedChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel)
            ipcRenderer.on(channel, (event, ...args) => cb(null, ...args))
        }
    },
})
