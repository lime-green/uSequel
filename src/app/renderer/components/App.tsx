import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { selectShouldShowConnectScreen } from 'app/redux'
import { SideBar } from 'app/renderer/components/SideBar'

import { ConnectionScreen } from './ConnectionScreen'
import { ConnectedScreen } from './ConnectedScreen'

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
    overflow: hidden;
`

const MainScreenContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`

export const App: FunctionComponent = () => {
    const showConnectScreen = useSelector(selectShouldShowConnectScreen)
    return (
        <AppWrapper>
            <Content>
                <SideBarContainer>
                    <SideBar />
                </SideBarContainer>

                <MainScreenContainer>
                    {showConnectScreen ? (
                        <ConnectionScreen />
                    ) : (
                        <ConnectedScreen />
                    )}
                </MainScreenContainer>
            </Content>
        </AppWrapper>
    )
}
