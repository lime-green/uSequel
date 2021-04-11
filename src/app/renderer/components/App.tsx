import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

import { ConnectionScreen } from './ConnectionScreen'

const AppWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`

export const App: FunctionComponent = () => {
    return (
        <AppWrapper>
            <ConnectionScreen />
        </AppWrapper>
    )
}
