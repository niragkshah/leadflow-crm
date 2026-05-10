'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { STATUS_COLORS, formatDate } from '@/lib/utils'

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
    <div
      className={`absolute top-0 left-0 right-0 h-0.5 ${color}`}
    />
    <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">{label}</p>
    <p className="text-4xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
  </div>
)

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      setLeads(data || [])
      setLoading(false)
    }
    init()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    )
  }

  const total = leads.length
  const hot = leads.filter((l) => l.score >= 70).length
  const closed = leads.filter((l) => l.status === 'Closed').length
  const interested = leads.filter((l) => l.status === 'Interested').length
  const thisWeek = leads.filter((l) => {
    const d = new Date(l.created_at)
    const now = new Date()
    return now - d < 7 * 24 * 60 * 60 * 1000
  }).length

  const statusCounts = ['New', 'Contacted', 'Interested', 'Closed', 'Not Interested'].map(
    (s) => ({ status: s, count: leads.filter((l) => l.status === s).length })
  )

  const upcoming = leads
    .filter((l) => l.follow_up_date)
    .sort((a, b) => new Date(a.follow_up_date) - new Date(b.follow_up_date))
    .slice(0, 5)

  const recent = leads.slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {user?.email?.split('@')[0]}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Leads"
            value={total}
            sub={`${thisWeek} added this week`}
            color="bg-blue-500"
          />
          <StatCard
            label="Hot Leads"
            value={hot}
            sub="Score ≥ 70"
            color="bg-amber-500"
          />
          <StatCard
            label="Closed"
            value={closed}
            sub={`${total ? Math.round((closed / total) * 100) : 0}% close rate`}
            color="bg-green-500"
          />
          <StatCard
            label="Interested"
            value={interested}
            sub="Ready to nurture"
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status breakdown */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">By Status</h2>
            <div className="space-y-3">
              {statusCounts.map(({ status, count }) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{status}</span>
                    <span className="text-gray-400">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming follow-ups */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Upcoming Follow-ups</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-600">No follow-ups scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.company || lead.email}</p>
                    </div>
                    <span className="text-xs text-amber-400 shrink-0">
                      {formatDate(lead.follow_up_date)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent leads */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-5">Recent Leads</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-gray-600">No leads yet. Add your first lead!</p>
            ) : (
              <div className="space-y-3">
                {recent.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.company || lead.email}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}
                    >
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
