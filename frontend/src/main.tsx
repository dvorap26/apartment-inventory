import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// MSAL returns popup-based login responses to this URL. Keep that window blank
// so it cannot render a second sign-in button before MSAL finishes the request.
if (!window.opener) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
