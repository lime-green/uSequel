import { PayloadAction } from '@reduxjs/toolkit'
import { call, put, takeEvery } from 'redux-saga/effects'

import {
    Connect,
    ListDatabases,
    ListTables,
    connectionSlice,
} from 'app/redux/slice'
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

function* sagaWorker() {
    yield takeEvery(
        connectionSlice.actions.attemptConnection,
        attemptConnection,
    )
    yield takeEvery(connectionSlice.actions.listDatabases, listDatabases)
}

export default sagaWorker
