import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { Theme } from 'app/renderer/colors'
import {
    connectionSlice,
    selectCurrentDatabase,
    selectCurrentOffset,
    selectCurrentTabId,
    selectCurrentTable,
    selectRowCount,
    selectTableColumnInfo,
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
    }
    &:nth-child(odd) {
        background: ${Theme.BG_SIDEBAR};
    }
` as any

const Column = styled.div`
    padding: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: ${(props: any) => props.width}px;
    min-width 100px;
    padding: 0 5px;
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
`

const ColumnInfoColumn = styled(Column)`
    border-right: 1px solid grey;
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

const Rows: FunctionComponent = () => {
    const tableColumnInfo = useSelector(selectTableColumnInfo) as Array<any>
    const tableRows = useSelector(selectTableRows)
    const [height, setHeight] = React.useState(0)
    React.useLayoutEffect(() => {
        const totalHeight = document.getElementById('table').clientHeight
        setHeight(totalHeight)
    })

    const rowHeight = 20
    const numRows = Math.max(
        Math.floor(height / rowHeight) - 1,
        tableRows.length,
    )
    const numCols = tableColumnInfo.length

    const calculateColumnWidths = (numRows, numCols) => {
        const widths = {}
        if (!tableColumnInfo.length) return widths

        const numCharsToWidth = (numChars) => {
            if (!numChars) return 10
            const width = numChars * 10
            return Math.min(width, 450)
        }

        for (let j = 0; j < numCols; j++) {
            const col = tableColumnInfo[j].name
            const width = numCharsToWidth(col.length)
            if (!widths[j] || width > widths[j]) {
                widths[j] = width
            }
        }

        for (let i = 0; i < numRows; i++) {
            const row = Object.values(tableRows[i] || {})

            for (let j = 0; j < numCols; j++) {
                const col = String(row[j] || '') as string
                const width = numCharsToWidth(col.length)
                if (width > widths[j]) {
                    widths[j] = width
                }
            }
        }
        return widths
    }
    const columnWidths = calculateColumnWidths(numRows, numCols)

    const renderColumnHeader = () => {
        return (
            <ColumnInfoRow key={'column-header'} height={rowHeight}>
                {tableColumnInfo.map((columnInfo, j) => (
                    <ColumnInfoColumn
                        key={columnInfo.name}
                        width={columnWidths[j]}
                    >
                        {columnInfo.name}
                    </ColumnInfoColumn>
                ))}
            </ColumnInfoRow>
        )
    }

    const renderRows = () => {
        return Array.from(Array(numRows)).map((_, i) => (
            <Row key={i} height={rowHeight}>
                {Array.from(Array(numCols)).map((_, j) => {
                    return (
                        <Column key={j} width={columnWidths[j]}>
                            {Object.values(tableRows[i] || {})[j]}
                        </Column>
                    )
                })}
            </Row>
        ))
    }

    return (
        <Table id="table">
            {renderColumnHeader()}
            <RowsWrapper id="rows-wrapper">{renderRows()}</RowsWrapper>
        </Table>
    )
}

const Footer = () => {
    const tabId = useSelector(selectCurrentTabId)
    const currentOffset = useSelector(selectCurrentOffset)
    const table = useSelector(selectCurrentTable)
    const database = useSelector(selectCurrentDatabase)
    const rowCount = useSelector(selectRowCount)
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

export const ConnectedScreen: FunctionComponent = () => {
    return (
        <ConnectedScreenWrapper>
            <Rows />
            <Footer />
        </ConnectedScreenWrapper>
    )
}
