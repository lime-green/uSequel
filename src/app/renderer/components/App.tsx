import React, { FunctionComponent } from 'react'
import styled from 'styled-components'

import { SideBar } from 'app/renderer/components/SideBar'

import { ConnectionScreen } from './ConnectionScreen'

const AppWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
`

const Content = styled.div`
    display: flex;
    align-items: flex-start;
    width: 100%;
    height: 100%;
`

const SideBarContainer = styled.div`
    display: flex;
    width: 20%;
    height: 100%;
`

const ConnectionScreenContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`

export const App: FunctionComponent = () => {
    return (
        <AppWrapper>
            <Content>
                <SideBarContainer>
                    <SideBar />
                </SideBarContainer>

                <ConnectionScreenContainer>
                    <ConnectionScreen />
                </ConnectionScreenContainer>
            </Content>
        </AppWrapper>
    )
}
