import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('ipc', {
    send: (channel: string, ...data: any) => {
        const allowedChannels = ['redux-action']
        if (allowedChannels.includes(channel)) {
            console.debug('sending to channel', channel, data)
            ipcRenderer.send(channel, ...data)
        }
    },
    receive: (channel: string, cb: (...args: any[]) => any[]) => {
        console.log('LISTENING!!!')
        const allowedChannels = ['redux-action']
        if (allowedChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => cb(null, ...args))
        }
    },
})
