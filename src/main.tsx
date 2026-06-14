import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app/App'

console.log('🔍 VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌')
console.log('🔍 VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
