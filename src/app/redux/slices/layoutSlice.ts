import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { connectionSlice } from './connectionSlice'

export type layoutState = {
    currentTab: string
    tabs: {
        [tabId: string]: {
            contentScreenState: 'connect' | 'connected'
            selectedTable: string
        }
    }
    nextTabIdForCreate: string
}

export type SelectTableAction = {
    table: string
    tabId: string
    database: string
}

const initialState = {
    currentTab: '0',
    tabs: {
        '0': {
            contentScreenState: 'connect',
            selectedTable: null,
        },
    },
    nextTabIdForCreate: '1',
} as layoutState

export const layoutSlice = createSlice({
    name: 'layout',
    initialState,
    reducers: {
        selectTable: {
            reducer: (state, action: PayloadAction<SelectTableAction>) => {
                const { tabId, table } = action.payload
                state.tabs[tabId].selectedTable = table
            },
            prepare: (tabId, table, database) => {
                return { payload: { tabId, table, database } }
            },
        },
    },
    extraReducers: (builder) => {
        builder.addCase(
            connectionSlice.actions.attemptConnectionSuccess,
            (state, action) => {
                const tabId = action.payload.connectionId
                state.tabs[tabId].contentScreenState = 'connected'
            },
        )
    },
})
