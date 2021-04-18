import { AnyAction, Store } from '@reduxjs/toolkit'
import createSagaMiddleware, { stdChannel } from 'redux-saga'

import { createStore } from 'app/redux/store'
import saga from 'app/redux/sagas'

export const REDUX_IPC_CHANNEL = 'redux-action'

const actionWhitelistChannel = (actionsWhitelist: string[] = null) => {
    const chan = stdChannel()
    const originalPut = chan.put

    chan.put = (input: Record<string, unknown>) => {
        const sagaInternal = Object.keys(input).some((key) =>
            key.startsWith('@@redux-saga/'),
        )
        if (sagaInternal) {
            return originalPut(input)
        }

        if (
            Object.prototype.hasOwnProperty.call(input, 'type') &&
            actionsWhitelist &&
            !actionsWhitelist.includes(input.type as string)
        ) {
            console.debug('Ignoring saga action', input)
            return
        }

        return originalPut(input)
    }
    return chan
}

export const connectIPCRedux = (
    ipcSend: (...args: any[]) => void,
    ipcReceive: (...args: any[]) => void,
    sagaActionsWhitelist: string[] = null,
): Store => {
    const ipcMiddleware = createElectronIPCMiddleware(ipcSend)
    const options = {
        channel: actionWhitelistChannel(sagaActionsWhitelist),
    } as any
    const sagaMiddleware = createSagaMiddleware(options)
    const store = createStore([ipcMiddleware, sagaMiddleware])

    ipcReceive(REDUX_IPC_CHANNEL, (event: any, action: AnyAction) => {
        console.debug('RECEIVED ACTION', action.type)
        store.dispatch(action)
    })
    sagaMiddleware.run(saga)
    return store
}

const createElectronIPCMiddleware = (ipcSend: (...args) => void) => {
    return (store) => (next) => (action) => {
        const actionSentinelKey = '__electronIPCProxied'

        if (!action[actionSentinelKey]) {
            console.debug('FORWARDING ACTION', action.type)
            ipcSend(REDUX_IPC_CHANNEL, { ...action, [actionSentinelKey]: true })
        }

        next(action)
    }
}
