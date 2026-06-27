import React from 'react'
import ReactDOM from 'react-dom/client'
import 'virtual:uno.css'
import '@gridgo/ui/styles/global.css'
import './styles.css'
import { App } from './App'
import { useUIStore } from './store/ui'

// 支持 ?tab=xxx 直接定位（用于截图脚本和分享链接）
const urlTab = new URLSearchParams(location.search).get('tab') as any
if (urlTab && ['matrix', 'list', 'calendar', 'gantt', 'profile'].includes(urlTab)) {
  useUIStore.setState({ activeTab: urlTab })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
