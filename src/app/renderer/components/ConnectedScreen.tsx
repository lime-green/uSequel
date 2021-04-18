import React, { Component, FunctionComponent } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { RootState } from 'app/redux/store'
import { Theme } from 'app/renderer/colors'
import {
    connectionSlice,
    selectCurrentDatabase,
    selectCurrentOffset,
    selectCurrentTabId,
    selectCurrentTable,
    selectLoading,
    selectOrderedByColumn,
    selectOrderedByType,
    selectRowCount,
    selectTableColumnInfo,
    selectTablePK,
    selectTableRows,
} from 'app/redux'
import refresh from 'app/renderer/assets/refresh.svg'

const RowsWrapper = styled.div`
    display: flex;
    min-width: 100%;
    height: 100%;
    align-items: flex-start;
    flex-direction: column;
`

const Table = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: flex-start;
    flex-direction: column;
    overflow: auto;

    position: relative;
`

const Row = styled.div`
    display: flex;
    min-width: 100%;
    height: ${(props: any) => props.height}px;

    &:nth-child(even) {
        background: ${Theme.ACCENT};
        input {
            background: ${Theme.ACCENT};
        }
    }
    &:nth-child(odd) {
        background: ${Theme.BG_SIDEBAR};
        input {
            background: ${Theme.BG_SIDEBAR};
        }
    }
    &&& {
        ${(props: any) =>
            props.selected && `&, input { background: ${Theme.FOCUS}; }`}
    }
` as any

const Column = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: ${(props: any) => props.width}px;
    min-width: 100px;
    padding: 0 5px;

    &:hover {
        background: ${(props: any) =>
            props.hasData ? Theme.FOCUS_SECONDARY : 'inherit'};

        input {
            background: ${(props: any) =>
                props.hasData ? Theme.FOCUS_SECONDARY : 'inherit'};
        }
    }

    span,
    input {
        font-size: 14px;
        line-height: 20px;
    }

    input {
        outline: none;
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
        font-size: 14px;
    }
` as any

const ConnectedScreenWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    justify-content: space-evenly;
    flex-direction: column;
`

const ColumnInfoRow = styled(Row)`
    border-bottom: 1px solid grey;
    position: sticky;
    top: 0;
    left: 0;
    font-weight: bold;
`

const ColumnInfoColumn = styled(Column)`
    border-right: 1px solid grey;

    &:hover {
        cursor: default;
    }

    &&& {
        background: ${({ isOrdered }) =>
            isOrdered ? Theme.FOCUS : 'inherited'};
    }
`

const FooterWrapper = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 30px;
    overflow: hidden;
`

const FooterLeft = styled.div`
    display: flex;
    align-items: center;

    div,
    img {
        margin-right: 5px;
        display: flex;
    }
`

const FooterRight = styled.div`
    display: flex;
`

const Arrow = styled.div`
    color: ${(props: any) => (props.hasMore ? 'inherit' : 'grey')};
    cursor: ${(props: any) => (props.hasMore ? 'pointer' : 'not-allowed')};
    margin-right: 10px;
    margin-bottom: 3px;
    font-size: 25px;

    &:hover {
        color: ${(props: any) => (props.hasMore ? Theme.FOCUS : 'grey')};
    }
` as any

const Plus = styled.div`
    font-size: 30px;
    margin-bottom: 3px;
`

const Minus = styled.div`
    font-size: 30px;
    margin-bottom: 3px;
`

const Refresh = styled.div`
    width: 18px;
    height: 100%;
    line-height: 50px;
`

const OrderByArrow = styled.span`
    margin-left: 5px;
`

type RowsProps = {
    tabId: string
    tableColumnInfo: Record<string, any>[]
    tablePK: number[]
    tableRows: any[]
    currentOffset: number
    table: string
    database: string
    rowCount: number
    isLoading: boolean
    orderedByColumn: string | null
    orderedByType: 'asc' | 'desc' | null
    refreshPage
    nextPage
    previousPage
    orderBy
}

class UnconnectedRows extends React.Component<RowsProps> {
    rowHeight = 20
    tableRef = null
    columnClickTimeout = null

    state = {
        editingColumn: null,
        rowSelected: null,
    }

    constructor(props) {
        super(props)
        this.tableRef = React.createRef()
    }

    shouldComponentUpdate(nextProps: Readonly<RowsProps>, nextState): boolean {
        if (nextState.rowSelected !== this.state.rowSelected) return true
        if (nextState.editingColumn !== this.state.editingColumn) return true
        if (nextProps.orderedByType !== this.props.orderedByType) return true
        if (nextProps.orderedByColumn !== this.props.orderedByColumn)
            return true
        if (nextProps.table !== this.props.table) return true
        if (!nextProps.isLoading && this.props.isLoading) {
            if (nextProps.rowCount !== this.props.rowCount) return true

            return nextProps.tableRows.some((nextRow, i) => {
                const rowValues = Object.values(this.props.tableRows[i])
                const nextRowValues = Object.values(nextRow)
                if (nextRowValues.length !== rowValues.length) return true
                return nextRowValues.some((col, j) => {
                    if (col !== rowValues[j]) return true
                })
            })
        }
        return false
    }

    componentDidUpdate(prevProps: Readonly<RowsProps>) {
        if (prevProps.isLoading && !this.props.isLoading) {
            this.setState({ rowSelected: null, editingColumn: null })
        }
    }

    get numRows() {
        const tableHeight = this.tableRef.current?.clientHeight || 0
        return Math.max(
            Math.floor(tableHeight / this.rowHeight) - 1,
            this.props.tableRows.length,
        )
    }

    get numCols() {
        return this.props.tableColumnInfo.length
    }

    calculateColumnWidths = (numRows, numCols) => {
        const { tableColumnInfo, tableRows } = this.props
        const widths = {}
        if (!tableColumnInfo.length) return widths

        const numCharsToWidth = (numChars) => {
            if (!numChars) return 9
            const width = numChars * 9
            return Math.min(width, 450)
        }

        for (let j = 0; j < numCols; j++) {
            const col = tableColumnInfo[j].name
            const width = numCharsToWidth(col.length + 2)
            if (!widths[j] || width > widths[j]) {
                widths[j] = width
            }
        }

        for (let i = 0; i < numRows; i++) {
            if (!tableRows[i]) continue
            const row = Object.values(tableRows[i])

            for (let j = 0; j < numCols; j++) {
                if (!row[j]) continue

                const col = String(row[j])
                const width = numCharsToWidth(col.length)
                if (width > widths[j]) {
                    widths[j] = width
                }
            }
        }
        return widths
    }

    getRowKey = (row, i) => {
        const { tablePK } = this.props

        if (!row.length || !tablePK.length) return i
        let key = ''
        tablePK.forEach((pk) => {
            if (key) {
                key += `-${row[pk]}`
            } else {
                key = row[pk]
            }
        })
        return key
    }

    getColumnKey = (i) => {
        const { tableColumnInfo } = this.props
        return tableColumnInfo[i].name || i
    }

    renderColumnHeader = (columnWidths) => {
        const { orderedByColumn, orderedByType, tableColumnInfo } = this.props
        const getOrderByType = (columnInfo) => {
            if (orderedByColumn !== columnInfo.name) return 'asc'
            if (orderedByType === 'asc') return 'desc'
            return null
        }

        return (
            <ColumnInfoRow height={this.rowHeight}>
                {tableColumnInfo.map((columnInfo, j) => (
                    <ColumnInfoColumn
                        onClick={() =>
                            this.props.orderBy(
                                this.props.tabId,
                                this.props.database,
                                this.props.table,
                                this.props.currentOffset,
                                getOrderByType(columnInfo) && columnInfo.name,
                                getOrderByType(columnInfo),
                            )
                        }
                        isOrdered={orderedByColumn === columnInfo.name}
                        key={columnInfo.name}
                        width={columnWidths[j]}
                    >
                        {columnInfo.name}
                        {orderedByColumn === columnInfo.name &&
                            (orderedByType === 'asc' ? (
                                <OrderByArrow>&uarr;</OrderByArrow>
                            ) : (
                                <OrderByArrow>&darr;</OrderByArrow>
                            ))}
                    </ColumnInfoColumn>
                ))}
            </ColumnInfoRow>
        )
    }

    handleRowClicked = (row, rowId) => {
        if (!row.length) {
            this.setState({ rowSelected: null, editingColumn: null })
        } else {
            this.setState({ rowSelected: rowId, editingColumn: null })
        }
    }

    renderColumnBody = (col, columnId, hasData) => {
        if (hasData) {
            return (
                <Input
                    onSubmit={(val) => this.setState({ rowSelected: null })}
                    value={col}
                />
            )
        } else {
            return <span />
        }
    }

    renderRows = (columnWidths) => {
        const { tableRows } = this.props

        return Array.from(Array(this.numRows)).map((_, i) => {
            const row = Object.values(tableRows[i] || {})
            const rowKey = this.getRowKey(row, i)

            return (
                <Row
                    onClick={() => this.handleRowClicked(row, rowKey)}
                    key={rowKey}
                    height={this.rowHeight}
                    selected={rowKey === this.state.rowSelected}
                >
                    {Array.from(Array(this.numCols)).map((_, j) => {
                        const col = row[j]
                        const columnKey = this.getColumnKey(j)
                        const hasData = typeof col !== 'undefined'
                        const columnId = `${rowKey}-${columnKey}`

                        return (
                            <Column
                                hasData={hasData}
                                key={columnKey}
                                width={columnWidths[j]}
                            >
                                {this.renderColumnBody(col, columnId, hasData)}
                            </Column>
                        )
                    })}
                </Row>
            )
        })
    }

    render() {
        console.debug('render')
        const columnWidths = this.calculateColumnWidths(
            this.numRows,
            this.numCols,
        )

        return (
            <Table id="table" ref={this.tableRef}>
                {this.renderColumnHeader(columnWidths)}
                <RowsWrapper id="rows-wrapper">
                    {this.renderRows(columnWidths)}
                </RowsWrapper>
            </Table>
        )
    }
}

const Footer = () => {
    const tabId = useSelector(selectCurrentTabId)
    const currentOffset = useSelector(selectCurrentOffset)
    const table = useSelector(selectCurrentTable)
    const database = useSelector(selectCurrentDatabase)
    const rowCount = useSelector(selectRowCount)
    const orderedByColumn = useSelector(selectOrderedByColumn)
    const orderedByType = useSelector(selectOrderedByType)
    const dispatch = useDispatch()

    const perPage = 100
    const hastMoreLeft = currentOffset - perPage >= 0
    const hasMoreRight = currentOffset + perPage < rowCount

    const renderTableCount = () => {
        const lastOffset = Math.min(currentOffset + perPage, rowCount)
        return (
            <div>
                {rowCount
                    ? `Rows ${currentOffset + 1} - ${lastOffset} of ${Math.max(
                          lastOffset,
                          rowCount,
                      )} in table`
                    : '0 rows in table'}
            </div>
        )
    }

    return (
        <FooterWrapper>
            <FooterLeft>
                <Plus>+</Plus>
                <Minus>-</Minus>
                <Refresh
                    onClick={() => {
                        if (!table) return
                        dispatch(
                            connectionSlice.actions.refreshPage(
                                tabId,
                                database,
                                table,
                                currentOffset,
                                orderedByColumn,
                                orderedByType,
                            ),
                        )
                    }}
                >
                    <img src={refresh} />
                </Refresh>
                {renderTableCount()}
            </FooterLeft>
            <FooterRight>
                <Arrow
                    hasMore={hastMoreLeft}
                    onClick={() => {
                        if (!table) return
                        if (!hastMoreLeft) return

                        dispatch(
                            connectionSlice.actions.previousPage(
                                tabId,
                                database,
                                table,
                                currentOffset,
                                orderedByColumn,
                                orderedByType,
                            ),
                        )
                    }}
                >
                    &larr;
                </Arrow>
                <Arrow
                    hasMore={hasMoreRight}
                    onClick={() => {
                        if (!table) return
                        if (!hasMoreRight) return

                        dispatch(
                            connectionSlice.actions.nextPage(
                                tabId,
                                database,
                                table,
                                currentOffset,
                                orderedByColumn,
                                orderedByType,
                            ),
                        )
                    }}
                >
                    &rarr;
                </Arrow>
            </FooterRight>
        </FooterWrapper>
    )
}

type InputProps = {
    onSubmit
    value: string
}

const InputWrapper = styled.input`
    text-overflow: ellipsis;
`

class Input extends Component<InputProps> {
    ref = null
    state = {
        disabled: true,
        value: this.props.value,
    }

    constructor(props) {
        super(props)
        this.ref = React.createRef() as React.RefObject<any>
    }

    componentDidUpdate(
        prevProps: Readonly<InputProps>,
        prevState: Readonly<any>,
    ) {
        if (prevState.disabled && !this.state.disabled) {
            this.ref.current.focus()
        }
    }

    render() {
        const { disabled } = this.state

        return (
            <span
                onDoubleClick={() => {
                    this.setState({ disabled: false })
                }}
            >
                <InputWrapper
                    disabled={disabled}
                    onBlur={() => this.setState({ disabled: true })}
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            document.getSelection().empty()
                            this.setState({ disabled: true })
                            this.props.onSubmit(this.state.value)
                        }
                    }}
                    type={'text'}
                    onChange={(e) =>
                        this.setState({ value: e.currentTarget.value })
                    }
                    onFocus={(e) => {
                        if (disabled) {
                            e.currentTarget.blur()
                        } else {
                            e.currentTarget.select()
                        }
                    }}
                    value={this.state.value === null ? '' : this.state.value}
                    ref={this.ref}
                />
            </span>
        )
    }
}

const Rows = connect(
    (state: RootState) => ({
        tabId: selectCurrentTabId(state),
        tableColumnInfo: selectTableColumnInfo(state),
        tablePK: selectTablePK(state),
        tableRows: selectTableRows(state),
        currentOffset: selectCurrentOffset(state),
        table: selectCurrentTable(state),
        database: selectCurrentDatabase(state),
        rowCount: selectRowCount(state),
        isLoading: selectLoading(state),
        orderedByColumn: selectOrderedByColumn(state),
        orderedByType: selectOrderedByType(state),
    }),
    {
        refreshPage: connectionSlice.actions.refreshPage,
        nextPage: connectionSlice.actions.nextPage,
        previousPage: connectionSlice.actions.previousPage,
        orderBy: connectionSlice.actions.orderBy,
    },
)(UnconnectedRows)

export const ConnectedScreen: FunctionComponent = () => {
    return (
        <ConnectedScreenWrapper>
            <Rows />
            <Footer />
        </ConnectedScreenWrapper>
    )
}
