import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type connectionState = {
    [connectionId: string]: {
        currentDatabase: string
        databases?: string[]
        isConnected: boolean
        isConnecting: boolean
        databaseData: {
            [databaseId: string]: {
                tables: string[]
            }
        }
    }
}

export type Connect = {
    connectionId: string
    host?: string
    database?: string
}

export type ListDatabases = {
    connectionId: string
}

export type ListDatabasesSuccess = {
    connectionId: string
    databases: string[]
}

export type ListTables = {
    connectionId: string
    database: string
}

export type ListTablesSuccess = {
    connectionId: string
    database: string
    tables: string[]
}

const initialState = {
    '0': {
        currentDatabase: null,
        databases: null,
        isConnected: false,
        isConnecting: false,
        databaseData: {},
    },
} as connectionState

export const connectionSlice = createSlice({
    name: 'connections',
    initialState,
    reducers: {
        attemptConnection: {
            reducer: (state, action: PayloadAction<Connect>) => {
                state[action.payload.connectionId].isConnecting = true
            },
            prepare: (
                connectionId: string,
                host = 'localhost',
                database = 'mysql',
            ) => {
                return { payload: { connectionId, database, host } }
            },
        },
        attemptConnectionSuccess: {
            reducer: (state, action: PayloadAction<Connect>) => {
                const { connectionId, database } = action.payload
                state[connectionId].isConnecting = false
                state[connectionId].isConnected = true
                state[connectionId].currentDatabase = database
            },
            prepare: (connectionId: string, database: string) => {
                return { payload: { connectionId, database } }
            },
        },
        listDatabases: {
            reducer: (state) => {
                return state
            },
            prepare: (connectionId: string) => {
                return { payload: { connectionId } }
            },
        },
        listDatabasesSuccess: {
            reducer: (state, action: PayloadAction<ListDatabasesSuccess>) => {
                state[action.payload.connectionId].databases =
                    action.payload.databases
                action.payload.databases.forEach((db) => {
                    state[action.payload.connectionId].databaseData[db] = {
                        tables: null,
                    }
                })
            },
            prepare: (connectionId: string, databases: string[]) => {
                return { payload: { connectionId, databases } }
            },
        },
        listTables: {
            reducer: (state, action: PayloadAction<ListTables>) => {
                return state
            },
            prepare: (connectionId: string, database: string) => {
                return { payload: { connectionId, database } }
            },
        },
        listTablesSuccess: {
            reducer: (state, action: PayloadAction<ListTablesSuccess>) => {
                const { connectionId, database, tables } = action.payload
                state[connectionId].databaseData[database].tables = tables
            },
            prepare: (
                connectionId: string,
                database: string,
                tables: string[],
            ) => {
                return { payload: { connectionId, database, tables } }
            },
        },
    },
})
