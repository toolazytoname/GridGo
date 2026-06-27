import React from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:uno.css'
import '@gridgo/ui/styles/global.css'
import './styles.css'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
