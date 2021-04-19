import { PayloadAction } from '@reduxjs/toolkit'
import { call, put, select, takeLatest } from 'redux-saga/effects'

import { SQLClient } from 'lib/db/abstract'
import {
    ColumnInfo,
    Connect,
    ListDatabases,
    ListTables,
    OrderBy,
    SelectTableAction,
    UpdateSingleValue,
    connectionSlice,
    getTableColumnInfo,
    layoutSlice,
    selectCurrentOffset,
    selectOrderedByColumn,
    selectOrderedByType,
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
const ensureConnection = (connectionId): SQLClient => {
    if (!hasActiveConnection(connectionId)) throw new Error('no connection')
    return getConnection(connectionId)
}

const defaultLimit = 100

function* attemptConnection(action: PayloadAction<Connect>) {
    const {
        connectionId,
        database,
        username,
        password,
        host,
        port,
    } = action.payload

    if (hasActiveConnection(connectionId)) {
        try {
            yield call(getConnection(connectionId).close)
        } catch (e) {
            console.error(e)
        }

        removeConnection(connectionId)
    }

    const sql = sqlClientFactory('mysql', {
        host: host,
        username: username,
        password: password,
        database: database,
        port: port,
    })

    try {
        yield call(sql.connect)
        setConnection(connectionId, sql)

        yield call(
            listDatabases,
            connectionSlice.actions.listDatabases(connectionId),
        )
        if (database) {
            yield call(
                listTables,
                connectionSlice.actions.listTables(connectionId, database),
            )
        }
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

    const sql = ensureConnection(connectionId)
    const tables = yield call(sql.listTables)
    yield put(
        connectionSlice.actions.listTablesSuccess(
            connectionId,
            database,
            tables,
        ),
    )
}

function* listDatabases(action: PayloadAction<ListDatabases>) {
    const { connectionId } = action.payload

    const sql = ensureConnection(connectionId)
    const databases = yield call(sql.listDatabases)
    yield put(
        connectionSlice.actions.listDatabasesSuccess(connectionId, databases),
    )
}

function* fetchPageHelper(action: PayloadAction<any>, offset: number) {
    const {
        connectionId,
        database,
        table,
        orderByColumn,
        orderByType,
    } = action.payload

    const sql = ensureConnection(connectionId)
    const columnInfo = yield call(sql.getColumnInfo, table)
    const rows = yield call(
        sql.fetchTableRows,
        table,
        defaultLimit,
        orderByColumn,
        orderByType,
        offset,
    )
    const count = yield call(sql.fetchCount, table)
    yield put(
        connectionSlice.actions.fetchTableRowsSuccess(
            connectionId,
            table,
            rows,
            database,
            columnInfo,
            offset,
            count,
            orderByColumn,
            orderByType,
        ),
    )
}

function* fetchInitialTableInfo(action: PayloadAction<SelectTableAction>) {
    const { tabId } = action.payload
    yield call(
        fetchPageHelper,
        { payload: { ...action.payload, connectionId: tabId } } as any,
        0,
    )
}

function* fetchNextPage(action: PayloadAction<any>) {
    const { currentOffset } = action.payload
    yield call(fetchPageHelper, action, currentOffset + defaultLimit)
}

function* fetchPreviousPage(action: PayloadAction<any>) {
    const { currentOffset } = action.payload
    yield call(
        fetchPageHelper,
        action,
        Math.max(currentOffset - defaultLimit, 0),
    )
}

function* refreshPage(action: PayloadAction<any>) {
    const { currentOffset } = action.payload
    yield call(fetchPageHelper, action, currentOffset)
}

function* orderBy(action: PayloadAction<OrderBy>) {
    const { currentOffset } = action.payload
    yield call(fetchPageHelper, action, currentOffset)
}

function* updateSingleValue(action: PayloadAction<UpdateSingleValue>) {
    const {
        connectionId,
        database,
        table,
        columnName,
        columnValue,
        row,
    } = action.payload

    const sql = ensureConnection(connectionId)
    const tableColumnInfo: ColumnInfo = yield select(
        getTableColumnInfo,
        connectionId,
        database,
        table,
    )
    const tablePKs = tableColumnInfo
        .map((col, i) => (col.isPrimary ? i : -1))
        .filter((i) => i >= 0)
    const set = { [columnName]: columnValue }
    const where = tablePKs.reduce(
        (agg, pk) =>
            Object.assign(agg, { [tableColumnInfo[pk].name]: row[pk] }),
        {},
    )

    yield call(sql.update, table, set, where)
    const currentOffset = yield select(selectCurrentOffset)
    const orderedByColumn = yield select(selectOrderedByColumn)
    const orderedByType = yield select(selectOrderedByType)
    const rows = yield call(
        sql.fetchTableRows,
        table,
        defaultLimit,
        orderedByColumn,
        orderedByType,
        currentOffset,
    )
    const count = yield call(sql.fetchCount, table)
    yield put(
        connectionSlice.actions.fetchTableRowsSuccess(
            connectionId,
            table,
            rows,
            database,
            tableColumnInfo,
            currentOffset,
            count,
            orderedByColumn,
            orderedByType,
        ),
    )
}

function* selectDatabase(action: PayloadAction<any>) {
    const { connectionId, database } = action.payload

    const sql = ensureConnection(connectionId)
    yield sql.selectDatabase(database)
    yield put(
        connectionSlice.actions.selectDatabaseSuccess(connectionId, database),
    )
    yield call(
        listTables,
        connectionSlice.actions.listTables(connectionId, database),
    )
}

const takeLatestWithErrorHandler = (action, handler) => {
    /*
     Instead of cancelling the saga watcher on error, we log to console

     TODO:
     Should also publish a failure action so we can show internal errors
     */
    return takeLatest(action, function* (action_) {
        try {
            yield call(handler, action_)
        } catch (e) {
            console.error(e)
        }
    })
}

function* sagaWorker() {
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.attemptConnection,
        attemptConnection,
    )
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.listDatabases,
        listDatabases,
    )
    yield takeLatestWithErrorHandler(
        layoutSlice.actions.selectTable,
        fetchInitialTableInfo,
    )
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.nextPage,
        fetchNextPage,
    )
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.previousPage,
        fetchPreviousPage,
    )
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.refreshPage,
        refreshPage,
    )
    yield takeLatestWithErrorHandler(connectionSlice.actions.orderBy, orderBy)
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.updateSingleValue,
        updateSingleValue,
    )
    yield takeLatestWithErrorHandler(
        connectionSlice.actions.selectDatabase,
        selectDatabase,
    )
}

export default sagaWorker
