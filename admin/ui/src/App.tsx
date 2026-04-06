import { useState } from 'react'
import { KeyRound, Route, Shield } from 'lucide-react'
import { KeysPage } from './components/KeysPage'
import { RoutesPage } from './components/RoutesPage'

type Tab = 'routes' | 'keys'

export default function App() {
  const [tab, setTab] = useState<Tab>('routes')
  console.log('admin key:', import.meta.env.VITE_ADMIN_API_KEY)
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Shield size={18} className="text-neutral-400" />
          <span className="text-sm font-medium text-neutral-300">Easter Gateway</span>
          <span className="text-xs text-neutral-600 ml-auto">admin</span>
        </div>

        <div className="flex gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded p-1 w-fit">
          <button
            onClick={() => setTab('routes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              tab === 'routes'
                ? 'bg-white text-black font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Route size={13} /> Routes
          </button>
          <button
            onClick={() => setTab('keys')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
              tab === 'keys'
                ? 'bg-white text-black font-medium'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <KeyRound size={13} /> API Keys
          </button>
        </div>

        {tab === 'routes' && <RoutesPage />}
        {tab === 'keys' && <KeysPage />}
      </div>
    </div>
  )
}