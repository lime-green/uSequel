import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { createStore } from 'app/redux/store'

import './index.css'
import { App } from './components/App'

const rootElement = document.getElementById('react-app')
function render() {
    const { ipc } = window as any

    ReactDOM.render(
        <Provider store={createStore(ipc.send, ipc.receive)}>
            <App />
        </Provider>,
        rootElement,
    )
}

render()
