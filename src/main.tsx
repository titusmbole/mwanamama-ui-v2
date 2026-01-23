import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App as AntdApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css' // Import Ant Design styles
// import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AntdApp>
      <App />
    </AntdApp>
  </StrictMode>,
)
