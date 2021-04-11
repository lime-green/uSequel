import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'app/redux/store'

const selectSelf = (state: RootState) => state
const selectConnections = createSelector(
    selectSelf,
    (state) => state.connections,
)
const selectConnectionId = createSelector(selectSelf, (state) => '0')
const selectConnection = createSelector(
    selectConnections,
    selectConnectionId,
    (connections, connectionId) => connections[connectionId],
)
const selectDatabaseData = createSelector(
    selectConnection,
    (connection) => connection.databaseData,
)
const selectCurrentDatabase = createSelector(
    selectConnection,
    (connection) => connection.currentDatabase,
)
export const selectTables = createSelector(
    selectCurrentDatabase,
    selectDatabaseData,
    (currentDatabase, databaseData) =>
        databaseData[currentDatabase]?.tables || [],
)
