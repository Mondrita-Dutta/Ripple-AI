/// <reference types="vite/client" />

import React from 'react'
import { render } from 'react-dom'
import App from './App'
import './styles.css'

render(
  React.createElement(React.StrictMode, null, React.createElement(App)),
  document.getElementById('root'),
)