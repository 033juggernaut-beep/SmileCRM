import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import Inter font from fontsource
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'

import './index.css'
import App from './App.tsx'
import { premiumTheme } from './theme'
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
