import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { msalInitialization, msalInstance } from './config/msalInstance.ts'

if (window.opener) {
  void msalInitialization
    .then(() => msalInstance.handleRedirectPromise())
    .catch((error: unknown) => {
      console.error('MSAL popup callback failed:', error)
    })
    .finally(() => {
      window.close()
    })
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
