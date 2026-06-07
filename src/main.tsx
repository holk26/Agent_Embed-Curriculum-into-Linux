import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from './components/effects/ThemeProvider'
import { SoundFXProvider } from './components/effects/SoundFX'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <ThemeProvider>
      <SoundFXProvider>
        <App />
      </SoundFXProvider>
    </ThemeProvider>
  </HashRouter>,
)
