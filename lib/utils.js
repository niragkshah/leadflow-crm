export const STATUSES = ['New', 'Contacted', 'Interested', 'Closed', 'Not Interested']

export const STATUS_COLORS = {
  New: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Contacted: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Interested: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Closed: 'bg-green-500/10 text-green-400 border-green-500/30',
  'Not Interested': 'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

export const SCORE_COLOR = (score) => {
  if (score >= 70) return 'text-green-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

export const CSV_HEADERS = [
  'name', 'email', 'phone', 'company', 'status', 'score', 'notes', 'follow_up_date', 'source',
]

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
