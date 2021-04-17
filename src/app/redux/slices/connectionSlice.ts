import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type TableRowData = [
    {
        [key: string]: any
    },
]

export type ColumnInfo = [
    {
        name: string
        field: string
        type: string
        isNull: boolean
        isPrimary: boolean
        isUnique: boolean
        default: string
    },
]

export type connectionState = {
    [connectionId: string]: {
        currentDatabase: string
        databases?: string[]
        isConnected: boolean
        isConnecting: boolean
        databaseData: {
            [databaseId: string]: {
                tables: string[]
                tableData: {
                    [table: string]: {
                        currentOffset: number
                        count: number
                        rows: TableRowData
                        columnInfo: ColumnInfo
                    }
                }
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

export type FetchTableRowsSuccess = {
    connectionId: string
    table: string
    rows: TableRowData
    database: string
    columnInfo: ColumnInfo
    offset: number
}

export type FetchTableCountSuccess = {
    connectionId: string
    table: string
    count: number
    database: string
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
        fetchTableRowsSuccess: {
            reducer: (state, action: PayloadAction<FetchTableRowsSuccess>) => {
                const {
                    connectionId,
                    table,
                    rows,
                    database,
                    columnInfo,
                    offset,
                } = action.payload
                state[connectionId].databaseData[database].tableData[table] = {
                    count: null,
                    currentOffset: offset,
                    rows: rows,
                    columnInfo: columnInfo,
                }
            },
            prepare: (
                connectionId: string,
                table: string,
                rows: TableRowData,
                database: string,
                columnInfo: ColumnInfo,
                offset: number,
            ) => {
                return {
                    payload: {
                        connectionId,
                        table,
                        rows,
                        database,
                        columnInfo,
                        offset,
                    },
                }
            },
        },
        fetchTableCountSuccess: {
            reducer: (state, action: PayloadAction<FetchTableCountSuccess>) => {
                const { connectionId, table, count, database } = action.payload
                state[connectionId].databaseData[database].tableData[
                    table
                ].count = count
            },
            prepare: (
                connectionId: string,
                table: string,
                count: number,
                database: string,
            ) => {
                return {
                    payload: {
                        connectionId,
                        table,
                        count,
                        database,
                    },
                }
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
        nextPage: {
            reducer: (state) => {
                return state
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
            ) => {
                return {
                    payload: { connectionId, database, table, currentOffset },
                }
            },
        },
        previousPage: {
            reducer: (state) => {
                return state
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
            ) => {
                return {
                    payload: { connectionId, database, table, currentOffset },
                }
            },
        },
        refreshPage: {
            reducer: (state) => {
                return state
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
            ) => {
                return {
                    payload: { connectionId, database, table, currentOffset },
                }
            },
        },
        listDatabasesSuccess: {
            reducer: (state, action: PayloadAction<ListDatabasesSuccess>) => {
                state[action.payload.connectionId].databases =
                    action.payload.databases
                action.payload.databases.forEach((db) => {
                    state[action.payload.connectionId].databaseData[db] = {
                        tables: null,
                        tableData: {},
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
                tables.forEach((table) => {
                    state[connectionId].databaseData[database].tableData[
                        table
                    ] = {
                        count: null,
                        rows: null,
                        columnInfo: null,
                        currentOffset: 0,
                    }
                })
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
