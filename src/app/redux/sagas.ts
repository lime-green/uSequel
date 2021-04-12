import { PayloadAction } from '@reduxjs/toolkit'
import { call, put, takeLatest } from 'redux-saga/effects'

import {
    Connect,
    ListDatabases,
    ListTables,
    SelectTableAction,
    connectionSlice,
    layoutSlice,
} from 'app/redux'
import { sqlClientFactory } from 'lib/db'

const activeConnections = {}
const hasActiveConnection = (connectionId) => {
    return Boolean(activeConnections[connectionId])
}
const getConnection = (connectionId) => {
    return activeConnections[connectionId]
}
const setConnection = (connectionId, sql) => {
    activeConnections[connectionId] = sql
}
const removeConnection = (connectionId) => {
    delete activeConnections[connectionId]
}

function* attemptConnection(action: PayloadAction<Connect>) {
    const { connectionId } = action.payload
    const database = 'mysql'

    if (hasActiveConnection(connectionId)) {
        try {
            yield call(getConnection(connectionId).close)
        } catch (e) {
            console.error(e)
        }

        removeConnection(connectionId)
    }

    const sql = sqlClientFactory('mysql', {
        host: action.payload.host,
        username: 'root',
        password: 'root',
        database: database,
    })

    try {
        yield call(sql.connect)
        setConnection(connectionId, sql)

        yield call(
            listDatabases,
            connectionSlice.actions.listDatabases(connectionId),
        )
        yield call(
            listTables,
            connectionSlice.actions.listTables(connectionId, database),
        )
        yield put(
            connectionSlice.actions.attemptConnectionSuccess(
                connectionId,
                database,
            ),
        )
    } catch (e) {
        console.error(e)
    }
}

function* listTables(action: PayloadAction<ListTables>) {
    const { connectionId, database } = action.payload

    if (hasActiveConnection(connectionId)) {
        const sql = getConnection(connectionId)
        const tables = yield call(sql.listTables)
        yield put(
            connectionSlice.actions.listTablesSuccess(
                connectionId,
                database,
                tables,
            ),
        )
    } else {
        throw new Error('no connection')
    }
}

function* listDatabases(action: PayloadAction<ListDatabases>) {
    const { connectionId } = action.payload

    if (hasActiveConnection(connectionId)) {
        const sql = getConnection(connectionId)
        const databases = yield call(sql.listDatabases)
        yield put(
            connectionSlice.actions.listDatabasesSuccess(
                connectionId,
                databases,
            ),
        )
    } else {
        throw new Error('no connection')
    }
}

function* fetchInitialTableInfo(action: PayloadAction<SelectTableAction>) {
    const { tabId, table, database } = action.payload

    if (hasActiveConnection(tabId)) {
        const sql = getConnection(tabId)
        const rows = yield call(sql.fetchTableRows, table, 100)
        yield put(
            connectionSlice.actions.fetchTableRowsSuccess(
                tabId,
                table,
                rows,
                database,
            ),
        )
    } else {
        throw new Error('no connection')
    }
}

function* sagaWorker() {
    yield takeLatest(
        connectionSlice.actions.attemptConnection,
        attemptConnection,
    )
    yield takeLatest(connectionSlice.actions.listDatabases, listDatabases)
    yield takeLatest(layoutSlice.actions.selectTable, fetchInitialTableInfo)
}

export default sagaWorker
