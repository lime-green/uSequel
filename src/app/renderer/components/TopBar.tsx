import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import {
    connectionSlice,
    selectCurrentDatabase,
    selectCurrentTabId,
    selectDatabases,
} from 'app/redux'
import { Theme } from 'app/renderer/colors'

const TopBarWrapper = styled.div`
    display: flex;
    height: 100%;
`

const SelectDatabaseWrapper = styled.div`
    display: flex;
    height: 100%;
    align-items: center;
    margin-left: 10px;
`

const SelectDatabase = styled.select`
    width: 200px;
    border: 1px solid ${Theme.ACCENT};
    border-radius: 5px;
    padding: 3px;
`

const OptionSpacer = styled.option``

export const TopBar: React.FunctionComponent = () => {
    const dispatch = useDispatch()
    const databases = useSelector(selectDatabases)
    const currentDatabase = useSelector(selectCurrentDatabase)
    const tabId = useSelector(selectCurrentTabId)

    return (
        <TopBarWrapper>
            <SelectDatabaseWrapper>
                {databases.length ? (
                    <SelectDatabase
                        onChange={(e) => {
                            if (e.currentTarget.value)
                                dispatch(
                                    connectionSlice.actions.selectDatabase(
                                        tabId,
                                        e.currentTarget.value,
                                    ),
                                )
                        }}
                        value={currentDatabase || ''}
                    >
                        <option value={''}>Choose database...</option>
                        <OptionSpacer disabled />
                        {databases.map((database) => (
                            <option key={database} value={database}>
                                {database}
                            </option>
                        ))}
                    </SelectDatabase>
                ) : (
                    <SelectDatabase disabled={true}>
                        <option>Choose database...</option>
                    </SelectDatabase>
                )}
            </SelectDatabaseWrapper>
        </TopBarWrapper>
    )
}
