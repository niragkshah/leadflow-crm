'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import Navbar from '@/components/Navbar'
import LeadForm from '@/components/LeadForm'
import { supabase } from '@/lib/supabase'
import { STATUSES, STATUS_COLORS, SCORE_COLOR, CSV_HEADERS, formatDate } from '@/lib/utils'

const EMPTY_FILTERS = { status: '', search: '', minScore: 0 }

export default function LeadsPage() {
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editLead, setEditLead] = useState(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [toast, setToast] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      await fetchLeads()
      setLoading(false)
    }
    init()
  }, [router])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setLeads(data || [])
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const handleSave = async (form) => {
    const { id, created_at, updated_at, ...fields } = form

    if (editLead) {
      // Update
      const { error } = await supabase
        .from('leads')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', editLead.id)

      if (error) { showToast('Error saving lead.'); return }
      showToast('Lead updated.')
    } else {
      // Insert
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('leads')
        .insert({ ...fields, created_by: user.id })

      if (error) { showToast('Error adding lead.'); return }
      showToast('Lead added!')
    }

    setFormOpen(false)
    setEditLead(null)
    await fetchLeads()
  }

  const handleDelete = async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (!error) {
      setDeleteId(null)
      showToast('Lead deleted.')
      await fetchLeads()
    }
  }

  const openEdit = (lead) => {
    setEditLead(lead)
    setFormOpen(true)
  }

  const openAdd = () => {
    setEditLead(null)
    setFormOpen(true)
  }

  // ─── CSV Export ─────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const rows = filtered.map((l) =>
      CSV_HEADERS.reduce((acc, h) => ({ ...acc, [h]: l[h] ?? '' }), {})
    )
    const csv = Papa.unparse(rows, { header: true })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported.')
  }

  // ─── CSV Import ─────────────────────────────────────────────────────────────

  const importCSV = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const { data: { user } } = await supabase.auth.getUser()
        const rows = result.data.map((row) => ({
          name: row.name || 'Unknown',
          email: row.email || '',
          phone: row.phone || '',
          company: row.company || '',
          status: STATUSES.includes(row.status) ? row.status : 'New',
          score: Number(row.score) || 50,
          notes: row.notes || '',
          follow_up_date: row.follow_up_date || null,
          source: row.source || '',
          created_by: user.id,
        }))

        const { error } = await supabase.from('leads').insert(rows)
        if (error) {
          showToast('Import failed. Check your CSV format.')
        } else {
          showToast(`Imported ${rows.length} leads!`)
          await fetchLeads()
        }
      },
    })

    // Reset file input
    e.target.value = ''
  }

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const filtered = leads.filter((l) => {
    const q = filters.search.toLowerCase()
    const matchQ =
      !q ||
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q)
    const matchStatus = !filters.status || l.status === filters.status
    const matchScore = l.score >= filters.minScore
    return matchQ && matchStatus && matchScore
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Leads</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {filtered.length} of {leads.length} leads
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Import CSV */}
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={importCSV}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg transition"
            >
              ↑ Import CSV
            </button>
            <button
              onClick={exportCSV}
              disabled={filtered.length === 0}
              className="px-4 py-2 text-sm border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 rounded-lg transition disabled:opacity-50"
            >
              ↓ Export CSV
            </button>
            <button
              onClick={openAdd}
              className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-lg transition"
            >
              + Add Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 w-56"
            placeholder="Search name, email, company…"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
          />
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            value={filters.minScore}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minScore: Number(e.target.value) }))
            }
          >
            <option value={0}>All Scores</option>
            <option value={70}>Hot (≥ 70)</option>
            <option value={40}>Warm (≥ 40)</option>
          </select>
          {(filters.search || filters.status || filters.minScore > 0) && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-xs text-gray-500 hover:text-white transition"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-600 text-sm">
                {leads.length === 0
                  ? 'No leads yet. Add your first lead!'
                  : 'No leads match your filters.'}
              </p>
              {leads.length === 0 && (
                <button
                  onClick={openAdd}
                  className="mt-4 px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-gray-950 rounded-lg transition"
                >
                  + Add First Lead
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-950/50">
                    {[
                      'Name',
                      'Company',
                      'Email',
                      'Status',
                      'Score',
                      'Follow-up',
                      'Source',
                      '',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs uppercase tracking-wider text-gray-500 font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition group"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{lead.name}</p>
                        {lead.phone && (
                          <p className="text-xs text-gray-500">{lead.phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {lead.company || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {lead.email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${
                            STATUS_COLORS[lead.status]
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${SCORE_COLOR(lead.score)}`}
                        >
                          {lead.score}
                        </span>
                        <span className="text-gray-600 text-xs"> /100</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(lead.follow_up_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {lead.source || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => openEdit(lead)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(lead.id)}
                            className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded bg-red-950/30 hover:bg-red-950/50 transition"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* CSV format hint */}
        <p className="text-xs text-gray-700 mt-3">
          CSV import expects columns:{' '}
          <code className="text-gray-600">{CSV_HEADERS.join(', ')}</code>
        </p>
      </main>

      {/* Lead Form Modal */}
      {formOpen && (
        <LeadForm
          lead={editLead}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false)
            setEditLead(null)
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-white mb-2">Delete Lead?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 text-sm text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 text-sm font-semibold text-white bg-red-700 hover:bg-red-600 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-fade-in z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
