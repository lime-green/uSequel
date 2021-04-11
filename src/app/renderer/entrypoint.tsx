import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { connectIPCRedux, connectionSlice } from 'app/redux'

import './index.css'
import { App } from './components/App'

function render() {
    const rootElement = document.getElementById('react-app')
    const { ipc } = window as any
    const rendererSagaActionsWhitelist = []

    ReactDOM.render(
        <Provider
            store={connectIPCRedux(
                ipc.send,
                ipc.receive,
                rendererSagaActionsWhitelist,
            )}
        >
            <App />
        </Provider>,
        rootElement,
    )
}

render()
