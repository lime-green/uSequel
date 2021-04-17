import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash.debounce'

import {
    connectionSlice,
    layoutSlice,
    selectCurrentDatabase,
    selectCurrentTabId,
    selectCurrentTable,
    selectTables,
} from 'app/redux'
import { Theme } from 'app/renderer/colors'

const SideBarWrapper = styled.div`
    background: ${Theme.BG_SIDEBAR};
    width: 100%;
    display: flex;
    flex-direction: column;

    &,
    div {
        box-sizing: border-box;
    }
`

const TableHeader = styled.div`
    color: ${Theme.ACCENT};
    margin: 10px;
`

const TableList = styled.div`
    border: 1px solid ${Theme.ACCENT};
    flex-grow: 1;
`

const TableNameList = styled.div`
    margin: 10px;
    margin-left: 20px;
    height: 100%;
    overflow-y: auto;
`

const TableName = styled.div`
    padding: 2px 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    border-radius: 7px;

    &:hover,
    &:focus {
        cursor: pointer;
        background-color: ${Theme.FOCUS};
        outline: none;
    }

    background-color: ${(props: any) =>
        props.isCurrentTable ? Theme.ACCENT : 'inherit'};
` as any

const TableSearchWrapper = styled.div`
    display: flex;
    padding: 5px;
`

const TableSearchInput = styled.input`
    border: 1px solid ${Theme.ACCENT};
    border-radius: 5px;
    padding: 5px;
    width: 100%;
    margin: 5px;
`

export const SideBar: FunctionComponent = () => {
    const dispatch = useDispatch()
    const [tableFilter, setTableFilter] = React.useState('')
    const currentDatabase = useSelector(selectCurrentDatabase)
    const currentTabId = useSelector(selectCurrentTabId)
    const currentTable = useSelector(selectCurrentTable)
    const tables = useSelector(selectTables)
    const debouncedTableFilter = React.useCallback(
        debounce((filter) => setTableFilter(filter), 150),
        [],
    )
    const selectTable = (tableName) => {
        dispatch(
            layoutSlice.actions.selectTable(
                currentTabId,
                tableName,
                currentDatabase,
            ),
        )
    }

    return (
        <SideBarWrapper>
            <TableSearchWrapper>
                <TableSearchInput
                    type={'text'}
                    name={'table'}
                    placeholder={'Filter'}
                    onChange={(e) => {
                        const filter = e.currentTarget.value.trim()
                        debouncedTableFilter(filter)
                    }}
                />
            </TableSearchWrapper>
            <TableList>
                <TableHeader>TABLES</TableHeader>
                <TableNameList>
                    {tables
                        .filter((tableName) => tableName.includes(tableFilter))
                        .map((tableName) => (
                            <TableName
                                onClick={() => selectTable(tableName)}
                                onKeyUp={(e) => {
                                    if (e.key === 'Enter') {
                                        selectTable(tableName)
                                    }
                                }}
                                tabIndex={0}
                                title={tableName}
                                key={tableName}
                                isCurrentTable={tableName === currentTable}
                            >
                                {tableName}
                            </TableName>
                        ))}
                </TableNameList>
            </TableList>
        </SideBarWrapper>
    )
}
