import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { selectTables } from 'app/redux'
import { Theme } from 'app/renderer/colors'

const SideBarWrapper = styled.div`
    background: ${Theme.BG_SIDEBAR};
    width: 100%;
`

const TableHeader = styled.div`
    color: ${Theme.ACCENT};
`

const TableList = styled.div`
    border: 1px solid ${Theme.ACCENT};
    overflow: hidden;
`

const TableNameList = styled.div`
    margin-left: 1px;
    margin-right: 10px;
`

const TableName = styled.div`
    text-overflow: ellipsis;
    width: 100%;
    overflow: hidden;
`

const TableSearchWrapper = styled.div`
    padding: 10px;

    input {
        border: 1px solid ${Theme.ACCENT};
        border-radius: 5px;
        padding: 3px;
    }
`

export const SideBar: FunctionComponent = () => {
    const tables = useSelector(selectTables)
    return (
        <SideBarWrapper>
            <TableSearchWrapper>
                <input type={'text'} name={'table'} placeholder={'Filter'} />
            </TableSearchWrapper>
            <TableList>
                <TableHeader>TABLES</TableHeader>
                <TableNameList>
                    {tables.map((tableName) => (
                        <TableName key={tableName}>{tableName}</TableName>
                    ))}
                </TableNameList>
            </TableList>
        </SideBarWrapper>
    )
}
