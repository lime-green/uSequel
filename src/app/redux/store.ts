import { Middleware, Store, configureStore } from '@reduxjs/toolkit'

import {
    connectionSlice,
    connectionState,
    layoutSlice,
    layoutState,
} from 'app/redux'

export type RootState = {
    connections: connectionState
    layout: layoutState
}

export const createStore = (customMiddleware: Middleware[]): Store => {
    const reducer = {
        connections: connectionSlice.reducer,
        layout: layoutSlice.reducer,
    }
    const middleware = (getDefaultMiddleware: any) => [
        ...customMiddleware,
        ...getDefaultMiddleware(),
    ]
    const store = configureStore({ middleware, reducer })
    return store
}
