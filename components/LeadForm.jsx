'use client'

import { useState, useEffect } from 'react'
import { STATUSES, STATUS_COLORS } from '@/lib/utils'

const BLANK = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'New',
  score: 50,
  notes: '',
  follow_up_date: '',
  source: '',
}

export default function LeadForm({ lead, onSave, onClose }) {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [emailDraft, setEmailDraft] = useState('')
  const [showEmail, setShowEmail] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (lead) {
      setForm({
        ...BLANK,
        ...lead,
        follow_up_date: lead.follow_up_date?.slice(0, 10) || '',
      })
    } else {
      setForm(BLANK)
    }
    setEmailDraft('')
    setShowEmail(false)
  }, [lead])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  const generateEmail = async () => {
    setAiLoading(true)
    setShowEmail(true)
    setEmailDraft('')

    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          status: form.status,
          notes: form.notes,
          score: form.score,
        }),
      })
      const data = await res.json()
      setEmailDraft(data.email || 'Could not generate email.')
    } catch {
      setEmailDraft('Error generating email. Please try again.')
    }
    setAiLoading(false)
  }

  const copyEmail = () => {
    navigator.clipboard.writeText(emailDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <h2 className="font-bold text-white text-lg">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-xl leading-none transition"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name + Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                className="input"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="jane@acme.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+1 312 555 0100"
              />
            </div>
          </div>

          {/* Status + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <input
                className="input"
                value={form.source}
                onChange={(e) => set('source', e.target.value)}
                placeholder="LinkedIn, Referral…"
              />
            </div>
          </div>

          {/* Score + Follow-up date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                Lead Score:{' '}
                <span
                  className={`font-bold ${
                    form.score >= 70
                      ? 'text-green-400'
                      : form.score >= 40
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {form.score}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={form.score}
                onChange={(e) => set('score', Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-2"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Cold (1)</span>
                <span>Hot (100)</span>
              </div>
            </div>
            <div>
              <label className="label">Follow-up Date</label>
              <input
                className="input"
                type="date"
                value={form.follow_up_date}
                onChange={(e) => set('follow_up_date', e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Key details, call summary, next steps…"
            />
          </div>

          {/* AI Email Section */}
          <div className="border border-dashed border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  ✨ AI Outreach Email
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Generates a personalised email draft
                </p>
              </div>
              <button
                type="button"
                onClick={generateEmail}
                disabled={aiLoading || !form.name}
                className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {aiLoading ? 'Generating…' : 'Generate Email'}
              </button>
            </div>

            {showEmail && (
              <div className="mt-3">
                {aiLoading ? (
                  <div className="text-xs text-gray-500 animate-pulse">
                    Writing your email…
                  </div>
                ) : (
                  <div>
                    <textarea
                      className="input resize-none text-xs font-mono"
                      rows={6}
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={copyEmail}
                      className="mt-2 text-xs text-gray-400 hover:text-white transition"
                    >
                      {copied ? '✓ Copied!' : 'Copy to clipboard'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 transition disabled:opacity-60"
            >
              {saving ? 'Saving…' : lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>

      {/* Tailwind class injection for inputs */}
      <style jsx global>{`
        .label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9ca3af;
          margin-bottom: 0.375rem;
        }
        .input {
          width: 100%;
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          color: #f9fafb;
          font-size: 0.875rem;
          transition: border-color 0.15s;
        }
        .input::placeholder {
          color: #4b5563;
        }
        select.input option {
          background: #1f2937;
        }
      `}</style>
    </div>
  )
}
