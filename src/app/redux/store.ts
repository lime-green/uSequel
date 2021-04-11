import { AnyAction, Store, configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'

import saga from 'app/redux/sagas'

const IPCChannelName = 'redux-action'

function todos(state: Array<string> = [], action: AnyAction) {
    switch (action.type) {
        case 'ADD_TODO': {
            console.log('adding todo', action)
            return state.concat([action.text])
        }
        default:
            return state
    }
}

export const createStore = (
    ipcSend: (...args: any[]) => void,
    ipcReceive: (...args: any[]) => void,
): Store => {
    const reducer = {
        todos,
    }
    const sagaMiddleware = createSagaMiddleware()
    const middleware = (getDefaultMiddleware: any) => [
        createElectronIPCMiddleware(ipcSend),
        ...getDefaultMiddleware(),
        sagaMiddleware,
    ]
    const store = configureStore({ middleware, reducer })
    ipcReceive(IPCChannelName, (event: any, action: AnyAction) => {
        console.log('RECEIVED ACTION', action)
        if (action) {
            store.dispatch(action)
        }
    })
    sagaMiddleware.run(saga)
    return store
}

const createElectronIPCMiddleware = (ipcSend: (...args) => void) => {
    return (store) => (next) => (action) => {
        const reduxKey = '__electronIPCProxy'

        if (!action[reduxKey]) {
            ipcSend(IPCChannelName, { ...action, [reduxKey]: true })
        }

        console.log(store.getState())
        next(action)
    }
}
