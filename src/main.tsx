import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DbProvider } from '@/context/db-context'
import { PinProvider } from '@/context/pin-context'
import App from './App.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <DbProvider>
        <PinProvider>
          <App />
        </PinProvider>
      </DbProvider>
    </BrowserRouter>
  </StrictMode>,
)
