import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import './styles/global.css'

const root = createRoot(document.getElementById('root'))

root.render(
  React.createElement(StrictMode, null, React.createElement(App, null)),
)
