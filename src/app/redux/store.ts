import { Middleware, Store, configureStore } from '@reduxjs/toolkit'

import { connectionSlice, connectionState } from 'app/redux/slice'

export type RootState = {
    connections: connectionState
}

export const createStore = (customMiddleware: Middleware[]): Store => {
    const reducer = {
        connections: connectionSlice.reducer,
    }
    const middleware = (getDefaultMiddleware: any) => [
        ...customMiddleware,
        ...getDefaultMiddleware(),
    ]
    const store = configureStore({ middleware, reducer })
    return store
}
