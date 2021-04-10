import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css'
import { App } from './components/App'

function render() {
    ReactDOM.render(<App />, document.getElementById("react-app"));
}

render();
