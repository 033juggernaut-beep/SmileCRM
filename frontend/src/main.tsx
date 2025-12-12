import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { premiumTheme } from './theme/premiumTheme'
import { LanguageProvider } from './context/LanguageContext'

const envSnapshot = Object.fromEntries(Object.entries(import.meta.env))
console.log('[vite] Runtime env variables', envSnapshot)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode={premiumTheme.config.initialColorMode} />
    <ChakraProvider theme={premiumTheme}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ChakraProvider>
  </StrictMode>,
)
