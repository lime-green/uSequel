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
                        orderedByColumn: string | null
                        orderedByType: 'asc' | 'desc' | null
                        loading: boolean
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
    count: number
    orderedByColumn: string | null
    orderedByType: 'asc' | 'desc' | null
}

export type OrderBy = {
    connectionId: string
    database: string
    table: string
    currentOffset: number
    orderByColumn: string | null
    orderByType: 'asc' | 'desc' | null
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
                    count,
                    orderedByColumn,
                    orderedByType,
                } = action.payload

                state[connectionId].databaseData[database].tableData[table] = {
                    count,
                    loading: false,
                    currentOffset: offset,
                    rows: rows,
                    columnInfo: columnInfo,
                    orderedByColumn,
                    orderedByType,
                }
            },
            prepare: (
                connectionId: string,
                table: string,
                rows: TableRowData,
                database: string,
                columnInfo: ColumnInfo,
                offset: number,
                count: number,
                orderedByColumn: string | null,
                orderedByType: 'asc' | 'desc' | null,
            ) => {
                return {
                    payload: {
                        connectionId,
                        table,
                        rows,
                        database,
                        columnInfo,
                        offset,
                        count,
                        orderedByColumn,
                        orderedByType,
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
            reducer: (state, action: PayloadAction<any>) => {
                const { connectionId, table, database } = action.payload

                state[connectionId].databaseData[database].tableData[
                    table
                ].loading = true
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
                orderByColumn: string | null,
                orderByType: 'asc' | 'desc' | null,
            ) => {
                return {
                    payload: {
                        connectionId,
                        database,
                        table,
                        currentOffset,
                        orderByColumn,
                        orderByType,
                    },
                }
            },
        },
        previousPage: {
            reducer: (state, action: PayloadAction<any>) => {
                const { connectionId, table, database } = action.payload

                state[connectionId].databaseData[database].tableData[
                    table
                ].loading = true
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
                orderByColumn: string | null,
                orderByType: 'asc' | 'desc' | null,
            ) => {
                return {
                    payload: {
                        connectionId,
                        database,
                        table,
                        currentOffset,
                        orderByColumn,
                        orderByType,
                    },
                }
            },
        },
        refreshPage: {
            reducer: (state, action: PayloadAction<any>) => {
                const { connectionId, table, database } = action.payload

                state[connectionId].databaseData[database].tableData[
                    table
                ].loading = true
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
                orderByColumn: string | null,
                orderByType: 'asc' | 'desc' | null,
            ) => {
                return {
                    payload: {
                        connectionId,
                        database,
                        table,
                        currentOffset,
                        orderByColumn,
                        orderByType,
                    },
                }
            },
        },
        orderBy: {
            reducer: (state, action: PayloadAction<OrderBy>) => {
                const { connectionId, table, database } = action.payload

                state[connectionId].databaseData[database].tableData[
                    table
                ].loading = true
            },
            prepare: (
                connectionId: string,
                database: string,
                table: string,
                currentOffset: number,
                orderByColumn: string | null,
                orderByType: 'asc' | 'desc' | null,
            ) => {
                return {
                    payload: {
                        connectionId,
                        database,
                        table,
                        currentOffset,
                        orderByColumn,
                        orderByType,
                    },
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
            reducer: (state) => {
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
                        loading: false,
                        count: null,
                        rows: null,
                        columnInfo: null,
                        currentOffset: 0,
                        orderedByColumn: null,
                        orderedByType: null,
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
    extraReducers: (builder) => {
        builder.addCase('layout/selectTable', (state, action: any) => {
            const { database, tabId, table } = action.payload
            state[tabId].databaseData[database].tableData[table].loading = true
        })
    },
})
