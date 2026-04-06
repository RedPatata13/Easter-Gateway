import { useEffect, useState } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from 'lucide-react'
import { api } from '../api'

interface ApiKey {
  id: string
  name: string
  key: string
  active: boolean
  createdAt: string
}

export const KeysPage = () => {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [name, setName] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const load = async () => setKeys(await api.keys.list())

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!name.trim()) return
    await api.keys.create(name)
    setName('')
    load()
  }

  const toggle = async (key: ApiKey) => {
    await api.keys.toggle(key.key, !key.active)
    load()
  }

  const remove = async (key: string) => {
    await api.keys.delete(key)
    load()
  }

  const copy = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-sm outline-none focus:border-neutral-600"
          placeholder="key name e.g. my-app"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && create()}
        />
        <button
          onClick={create}
          className="flex items-center gap-1 bg-white text-black px-3 py-2 rounded text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          <Plus size={14} /> New key
        </button>
      </div>

      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded px-4 py-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{k.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${k.active ? 'bg-green-950 text-green-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  {k.active ? 'active' : 'disabled'}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-neutral-500 font-mono truncate">{k.key}</span>
                <button onClick={() => copy(k.key)} className="text-neutral-600 hover:text-neutral-400 transition-colors flex-shrink-0">
                  {copied === k.key ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <button onClick={() => toggle(k)} className="text-neutral-500 hover:text-white transition-colors">
              {k.active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
            </button>
            <button onClick={() => remove(k.key)} className="text-neutral-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {keys.length === 0 && (
          <p className="text-sm text-neutral-600 text-center py-8">no api keys yet</p>
        )}
      </div>
    </div>
  )
}