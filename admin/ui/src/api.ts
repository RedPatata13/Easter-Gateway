const BASE = 'http://localhost:4000'

const headers = () => ({
  'Content-Type': 'application/json',
  'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY || ''
})

const headersNoBody = () => ({
  'x-admin-key': import.meta.env.VITE_ADMIN_API_KEY || ''
})

export const api = {
  keys: {
    list: () => fetch(`${BASE}/admin/keys`, { headers: headers() })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? data : []),
    create: (name: string) => fetch(`${BASE}/admin/keys`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ name })
    }).then(r => r.json()),
    toggle: (key: string, active: boolean) => fetch(`${BASE}/admin/keys/${key}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ active })
    }).then(r => r.json()),
    delete: (key: string) => fetch(`${BASE}/admin/keys/${key}`, {
      method: 'DELETE',
      headers: headersNoBody()
    }).then(r => {
      if (!r.ok) throw new Error('failed to delete key')
      return r
    }),
  },
  routes: {
    list: () => fetch(`${BASE}/admin/routes`, { headers: headers() })
      .then(r => r.json())
      .then(data => Array.isArray(data) ? data : []),
    create: (route: object) => fetch(`${BASE}/admin/routes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(route)
    }).then(r => r.json()),
    delete: (id: string) => fetch(`${BASE}/admin/routes/${id}`, {
      method: 'DELETE',
      headers: headersNoBody()
    }).then(r => {
      if (!r.ok) throw new Error('failed to delete route')
      return r
    }),
  }
}