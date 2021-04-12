import React, { FunctionComponent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { Colors, Theme } from 'app/renderer/colors'
import { connectionSlice, selectTableRows } from 'app/redux'

const Rows = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: flex-start;
    flex-direction: column;

    margin-top: 20px;
`
const Row = styled.div`
    display: flex;
    width: 100%;

    &:nth-child(even) {
        background: ${Theme.ACCENT};
    }
    &:nth-child(odd) {
        background: ${Theme.BG_SIDEBAR};
    }
`
const Column = styled.span`
    border: 0.5px solid ${Colors.LIGHT_GREY};
    padding: 10px;
    width: 100px;
    overflow: hidden;
    white-space: nowrap;
`

const ConnectedScreenWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    justify-content: space-evenly;
`

export const ConnectedScreen: FunctionComponent = () => {
    const tableRows = useSelector(selectTableRows)
    // fix key
    return (
        <ConnectedScreenWrapper>
            <Rows>
                {tableRows &&
                    tableRows.map((row, i) => (
                        <Row key={i}>
                            {Object.values(row).map((col, j) => (
                                <Column key={j}>{col}</Column>
                            ))}
                        </Row>
                    ))}
            </Rows>
        </ConnectedScreenWrapper>
    )
}
