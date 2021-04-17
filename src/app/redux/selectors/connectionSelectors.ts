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
