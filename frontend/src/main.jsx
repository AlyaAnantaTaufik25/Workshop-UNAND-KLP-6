import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './components/ui-polish.css'
import './components/motion.css'
import './components/dashboard.css'
import './components/design-language.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DialogHost } from './components/Dialog.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      {/* Dialog konfirmasi & toast global yang seragam */}
      <DialogHost />
    </AuthProvider>
  </StrictMode>,
)
