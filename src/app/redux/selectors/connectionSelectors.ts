import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'app/redux/store'

import { selectCurrentTabId, selectCurrentTable } from './layoutSelectors'

const selectSelf = (state: RootState) => state
const selectConnections = createSelector(
    selectSelf,
    (state) => state.connections,
)
const selectConnectionId = createSelector(selectCurrentTabId, (tabId) =>
    String(tabId),
)
const selectConnection = createSelector(
    selectConnections,
    selectConnectionId,
    (connections, connectionId) => connections[connectionId],
)
const selectDatabaseData = createSelector(
    selectConnection,
    (connection) => connection.databaseData,
)

export const selectDatabases = createSelector(
    selectConnection,
    (connection) => connection.databases || [],
)

export const selectCurrentDatabase = createSelector(
    selectConnection,
    (connection) => connection.currentDatabase,
)

export const selectTables = createSelector(
    selectCurrentDatabase,
    selectDatabaseData,
    (currentDatabase, databaseData) =>
        databaseData[currentDatabase]?.tables || [],
)

export const selectTableData = createSelector(
    selectCurrentDatabase,
    selectDatabaseData,
    (currentDatabase, databaseData) =>
        databaseData[currentDatabase]?.tableData || {},
)

export const selectTableRows = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.rows || [],
)

export const getTableColumnInfo = (
    state: RootState,
    connectionId: string,
    database: string,
    table: string,
) =>
    state.connections[connectionId].databaseData[database].tableData[table]
        .columnInfo

export const selectTableColumnInfo = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.columnInfo || [],
)

export const selectRowCount = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.count,
)

export const selectCurrentOffset = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.currentOffset,
)

export const selectTablePK = createSelector(
    selectTableColumnInfo,
    (tableColumnInfo) =>
        tableColumnInfo
            .map((col, i) => (col.isPrimary ? i : -1))
            .filter((col) => col >= 0),
)

export const selectLoading = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.loading,
)

export const selectOrderedByColumn = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.orderedByColumn,
)

export const selectOrderedByType = createSelector(
    selectCurrentTable,
    selectTableData,
    (currentTable, tableData) => tableData[currentTable]?.orderedByType,
)
