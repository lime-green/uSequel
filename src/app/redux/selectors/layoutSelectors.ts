import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'app/redux/store'

const selectSelf = (state: RootState) => state
const selectLayout = createSelector(selectSelf, (state) => state.layout)

export const selectCurrentTabId = createSelector(
    selectLayout,
    (layout) => layout.currentTab,
)

const selectTabData = createSelector(
    selectLayout,
    selectCurrentTabId,
    (layout, currentTabId) => layout.tabs[currentTabId],
)

export const selectShouldShowConnectScreen = createSelector(
    selectTabData,
    (tabData) => tabData.contentScreenState === 'connect',
)

export const selectCurrentTable = createSelector(
    selectTabData,
    (tabData) => tabData.selectedTable,
)
