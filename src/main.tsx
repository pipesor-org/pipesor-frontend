// Must stay the first import: configures Zod before any schema is constructed (strict CSP).
import './app/zodConfig'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Initializes i18next before the first render (bundled resources, sync init).
import './shared/i18n'
import { App } from './app/App'
import { ThemeProvider, applyTheme, getPreferredTheme } from './shared/lib'
import './app/styles/fonts.css'
import './app/styles/global.css'

applyTheme(getPreferredTheme())

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element "#root" was not found in the document.')
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
