import { useEffect, useState } from 'react'
import { Plus, Trash2, ArrowRight } from 'lucide-react'
import { api } from '../api'

interface Route {
  id: string
  path: string
  method: string
  upstream: string
  stripPath: boolean
}

const METHODS = ['ANY', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE']

const methodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'text-blue-400',
    POST: 'text-green-400',
    PUT: 'text-yellow-400',
    PATCH: 'text-orange-400',
    DELETE: 'text-red-400',
    ANY: 'text-purple-400'
  }
  return colors[method] || 'text-neutral-400'
}

export const RoutesPage = () => {
  const [routes, setRoutes] = useState<Route[]>([])
  const [form, setForm] = useState({ path: '', method: 'ANY', upstream: '', stripPath: false })

  const load = async () => setRoutes(await api.routes.list())

  useEffect(() => { load() }, [])

  const create = async () => {
    if (!form.path.trim() || !form.upstream.trim()) return
    await api.routes.create(form)
    setForm({ path: '', method: 'ANY', upstream: '', stripPath: false })
    load()
  }

  const remove = async (id: string) => {
    if (!window.confirm('delete this route?')) return
    await api.routes.delete(id)
    load()
  }

  return (
    <div>
      <div className="bg-neutral-900 border border-neutral-800 rounded p-4 mb-6 space-y-3">
        <div className="flex gap-2">
          <select
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-2 text-sm outline-none"
            value={form.method}
            onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
          >
            {METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
          <input
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm outline-none focus:border-neutral-500"
            placeholder="/api/users"
            value={form.path}
            onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
          />
        </div>
        <input
          className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm outline-none focus:border-neutral-500"
          placeholder="https://upstream-service.com"
          value={form.upstream}
          onChange={e => setForm(f => ({ ...f, upstream: e.target.value }))}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
            <input
              type="checkbox"
              className="accent-white"
              checked={form.stripPath}
              onChange={e => setForm(f => ({ ...f, stripPath: e.target.checked }))}
            />
            strip path prefix
          </label>
          <button
            onClick={create}
            className="flex items-center gap-1 bg-white text-black px-3 py-2 rounded text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            <Plus size={14} /> Add route
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {routes.map(r => (
          <div key={r.id} className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded px-4 py-3">
            <span className={`text-xs font-mono font-bold w-14 flex-shrink-0 ${methodColor(r.method)}`}>
              {r.method}
            </span>
            <span className="text-sm font-mono text-neutral-300 flex-shrink-0">{r.path}</span>
            <ArrowRight size={12} className="text-neutral-600 flex-shrink-0" />
            <span className="text-sm text-neutral-500 truncate flex-1">{r.upstream}</span>
            {r.stripPath && (
              <span className="text-xs text-neutral-600 flex-shrink-0">strip</span>
            )}
            <button onClick={() => remove(r.id)} className="text-neutral-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {routes.length === 0 && (
          <p className="text-sm text-neutral-600 text-center py-8">no routes yet</p>
        )}
      </div>
    </div>
  )
}