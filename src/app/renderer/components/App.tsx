import React, { FunctionComponent } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import { selectShouldShowConnectScreen } from 'app/redux'
import { Theme } from 'app/renderer/colors'

import { ConnectionScreen } from './ConnectionScreen'
import { ConnectedScreen } from './ConnectedScreen'
import { SideBar } from './SideBar'
import { TopBar } from './TopBar'

const AppWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

const Content = styled.div`
    display: flex;
    align-items: flex-start;
    min-height: 0;
    flex: 1;
    width: 100%;
`

const SideBarContainer = styled.div`
    width: 30%;
    height: 100%;
    overflow: hidden;
    min-width: 100px;
    max-width: 350px;
`

const MainScreenContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`

const TopBarContainer = styled.div`
    display: flex;
    height: 50px;
    border: 1px solid ${Theme.ACCENT};
`

export const App: FunctionComponent = () => {
    const showConnectScreen = useSelector(selectShouldShowConnectScreen)
    return (
        <AppWrapper>
            <TopBarContainer>
                <TopBar />
            </TopBarContainer>
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
