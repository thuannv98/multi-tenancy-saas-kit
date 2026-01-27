import React, { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

type Practice = { id: number; name: string }
type Client = { id: number; practice_id: string; name: string }

type Extension = { name: string; slot: string; requiredScopes: string[]; requiredRoles: string[] }

type AuditEntry = { id: number; actor?: string; practiceId?: string; action: string; inputs: any; result: any; createdAt: string }

export default function App() {
  const [users] = useState(['practice1_admin', 'staff', ''])
  const [user, setUser] = useState('')
  const [practices, setPractices] = useState<Practice[]>([])
  const [practice, setPractice] = useState<string>('practice1')
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [extensions, setExtensions] = useState<Extension[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])

  useEffect(() => { fetchPractices() }, [])
  useEffect(() => { fetchClients() }, [practice])
  useEffect(() => { fetchAudit() }, [practice])

  async function fetchPractices() {
    try {
      // Practices are seeded in DB; we can hardcode for simplicity
      setPractices([{ id: 1, name: 'practice1' }, { id: 2, name: 'practice2' }])
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchClients() {
    try {
      const res = await axios.get(`${API_BASE}/practices/${practice}/clients`)
      setClients(res.data || [])
    } catch (err) {
      console.error(err)
      setClients([])
    }
  }

  async function fetchExtensionsForClient(c: Client) {
    try {
      const headers = user ? { 'x-user': user } : {}
      const res = await axios.get(`${API_BASE}/practices/${practice}/clients/${c.id}/extensions?slot=client.sidepanel`, { headers })
      setExtensions(res.data || [])
    } catch (err:any) {
      console.error(err)
      setExtensions([])
      alert(err?.response?.data || 'Failed to load extensions')
    }
  }

  async function fetchAudit() {
    try {
      const res = await axios.get(`${API_BASE}/practices/${practice}/audit`)
      setAudit(res.data || [])
    } catch (err) {
      setAudit([])
    }
  }

  async function createClient() {
    if (!user) return alert('Select a user to perform this action')
    try {
      const headers = { 'x-user': user }
      const body = { name: `client-${Date.now()}`, secret: 's' }
      await axios.post(`${API_BASE}/practices/${practice}/clients`, body, { headers })
      fetchClients()
    } catch (err:any) {
      alert(err?.response?.data || 'Create failed')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Account Kit — Minimal UI</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ minWidth: 300 }}>
          <h3>Context</h3>
          <div>
            <label>User: </label>
            <select value={user} onChange={(e) => setUser(e.target.value)}>
              <option value="">(none)</option>
              {users.map(u => <option key={u} value={u}>{u || '(none)'}</option>)}
            </select>
          </div>
          <div>
            <label>Practice: </label>
            <select value={practice} onChange={(e) => setPractice(e.target.value)}>
              {practices.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>

          <h3>Clients</h3>
          <button onClick={createClient}>Create Client</button>
          <ul>
            {clients.map(c => (
              <li key={c.id}>
                <a href="#" onClick={(e) => { e.preventDefault(); setSelectedClient(c); fetchExtensionsForClient(c); }}>{c.name} (id:{c.id})</a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          {!selectedClient ? (
            <div>Select a client to view details</div>
          ) : (
            <ClientDetail client={selectedClient} user={user} practice={practice} extensions={extensions} audit={audit} refreshAudit={fetchAudit} />
          )}
        </div>
      </div>
    </div>
  )
}

function ClientDetail({ client, user, practice, extensions, audit, refreshAudit }:{ client: any, user: string, practice: string, extensions: Extension[], audit: AuditEntry[], refreshAudit:()=>void }) {
  const [to,setTo]=useState('')
  const [subject,setSubject]=useState('')
  const [body,setBody]=useState('')

  async function sendEmail() {
    try {
      const headers: any = {}
      if (user) headers['x-user'] = user
      const payload = { action: 'email.send', inputs: { client_id: client.id, to, subject, body } }
      await axios.post(`${API_BASE}/practices/${practice}/actions`, payload, { headers })
      alert('Sent (queued)')
      refreshAudit()
    } catch (err:any) {
      alert(err?.response?.data || 'Send failed')
    }
  }

  return (
    <div>
      <h3>Client: {client.name} (id: {client.id})</h3>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 300 }}>
          <h4>Extensions (client.sidepanel)</h4>
          <ul>
            {extensions.map(e => <li key={e.name}>{e.name} — roles: {e.requiredRoles.join(', ')}</li>)}
            {extensions.length===0 && <li>(no extensions)</li>}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Send Email</h4>
          <div>
            <div>
              <label>To: </label>
              <input value={to} onChange={e=>setTo(e.target.value)} />
            </div>
            <div>
              <label>Subject: </label>
              <input value={subject} onChange={e=>setSubject(e.target.value)} />
            </div>
            <div>
              <label>Body: </label>
              <textarea value={body} onChange={e=>setBody(e.target.value)} />
            </div>
            <button onClick={sendEmail}>Send</button>
          </div>

          <h4>Audit Log (practice)</h4>
          <table border={1} cellPadding={4} style={{ width: '100%', fontSize: 12 }}>
            <thead>
              <tr><th>id</th><th>actor</th><th>action</th><th>inputs</th><th>result</th><th>createdAt</th></tr>
            </thead>
            <tbody>
              {audit.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.actor}</td>
                  <td>{a.action}</td>
                  <td><pre style={{margin:0}}>{JSON.stringify(a.inputs)}</pre></td>
                  <td><pre style={{margin:0}}>{JSON.stringify(a.result)}</pre></td>
                  <td>{a.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
