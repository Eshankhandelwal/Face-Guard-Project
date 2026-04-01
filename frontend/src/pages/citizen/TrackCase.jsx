import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/client'
import {
  Search, FileText, MapPin, Camera, CheckCircle,
  AlertCircle, Clock, User, Phone, Calendar,
  Shield, ChevronRight, RefreshCw, X
} from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return 'Unknown time'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Timeline event icons ──────────────────────────────────────
function TimelineIcon({ type }) {
  const base = "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
  if (type === 'reported')
    return <div className={`${base} bg-blue-100 text-blue-600`}><FileText size={16} /></div>
  if (type === 'alert')
    return <div className={`${base} bg-yellow-100 text-yellow-600`}><Camera size={16} /></div>
  if (type === 'reviewed')
    return <div className={`${base} bg-purple-100 text-purple-600`}><Shield size={16} /></div>
  if (type === 'found')
    return <div className={`${base} bg-green-100 text-green-600`}><CheckCircle size={16} /></div>
  return <div className={`${base} bg-gray-100 text-gray-400`}><Clock size={16} /></div>
}

export default function TrackCase() {
  const { user } = useAuth()
  const [query, setQuery]     = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [searched, setSearched] = useState(false)

  const handleTrack = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResult(null)
    setSearched(true)

    try {
      const res = await api.get(`/persons/track/${query.trim().toUpperCase()}`)
      setResult(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Case not found. Please check the reference number and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setQuery('')
    setResult(null)
    setError('')
    setSearched(false)
  }

  const statusConfig = {
    missing: {
      label: 'ACTIVELY SEARCHING',
      bg:    'bg-red-50',
      border:'border-red-200',
      text:  'text-red-700',
      badge: 'bg-red-100 text-red-800',
      icon:  <AlertCircle size={18} className="text-red-600" />
    },
    found: {
      label: 'CASE RESOLVED',
      bg:    'bg-green-50',
      border:'border-green-200',
      text:  'text-green-700',
      badge: 'bg-green-100 text-green-800',
      icon:  <CheckCircle size={18} className="text-green-600" />
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Track Your Case</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Enter your case reference number to see the latest updates
        </p>
      </div>

      {/* Search box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            <Search size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Case Reference Lookup</h3>
            <p className="text-xs text-gray-400">Format: FG-YEAR-NUMBER (e.g. FG-2025-0001)</p>
          </div>
        </div>

        <form onSubmit={handleTrack}>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. FG-2025-0001"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase tracking-wider"
                value={query}
                onChange={e => setQuery(e.target.value.toUpperCase())}
                maxLength={15}
              />
              {query && (
                <button type="button" onClick={reset}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              {loading
                ? <><RefreshCw size={14} className="animate-spin" /> Searching...</>
                : <><Search size={14} /> Track Case</>}
            </button>
          </div>
        </form>

        {/* Example reference hint */}
        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-600 font-medium mb-1">Where to find your reference number?</p>
          <p className="text-xs text-blue-500">
            Your case reference is shown after submitting a missing person report.
            It looks like <span className="font-mono font-bold">FG-2025-0001</span>.
            Contact your nearest police station if you've lost it.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Case Not Found</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button onClick={reset}
              className="text-red-500 text-xs mt-2 hover:underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Status banner */}
          {(() => {
            const cfg = statusConfig[result.status] || statusConfig.missing
            return (
              <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-5`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cfg.icon}
                    <div>
                      <p className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Case ref: <span className="font-mono font-bold">{result.case_ref}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${cfg.badge}`}>
                    {result.status}
                  </span>
                </div>
              </div>
            )
          })()}

          {/* Person details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex gap-4 p-5">
              {/* Photo */}
              {result.photo_url ? (
                <img
                  src={result.photo_url}
                  alt={result.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-bold text-gray-300">
                    {result.name?.[0] ?? '?'}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">{result.name}</h2>
                <p className="text-sm text-gray-400">
                  {result.age ? `${result.age} years old` : 'Age unknown'} •{' '}
                  {result.gender || 'Gender unknown'}
                </p>
                <div className="mt-2 space-y-1">
                  {result.last_seen && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={11} className="flex-shrink-0 text-gray-400" />
                      Last seen: {result.last_seen}
                    </div>
                  )}
                  {result.reported_on && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={11} className="flex-shrink-0 text-gray-400" />
                      Reported: {formatDate(result.reported_on)}
                    </div>
                  )}
                  {result.contact && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={11} className="flex-shrink-0 text-gray-400" />
                      Contact: {result.contact}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Alert count bar */}
            <div className="border-t border-gray-50 px-5 py-3 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{result.total_alerts}</span>{' '}
                face match alert{result.total_alerts !== 1 ? 's' : ''} recorded
              </p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                result.total_alerts > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {result.total_alerts > 0 ? 'Active surveillance' : 'Awaiting detection'}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              Case Timeline
            </h3>

            {result.timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-300">
                <Clock size={32} className="mx-auto mb-2" />
                <p className="text-sm text-gray-400">No updates yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-gray-100" />

                <div className="space-y-5">
                  {[...result.timeline].reverse().map((event, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <TimelineIcon type={event.type} />

                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-gray-900 text-sm">
                            {event.event}
                          </p>
                          {event.timestamp && (
                            <span className="text-xs text-gray-300 flex-shrink-0 mt-0.5">
                              {timeAgo(event.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {event.description}
                        </p>

                        {/* Alert details card */}
                        {event.type === 'alert' && (
                          <div className="mt-2 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 flex items-center gap-3 flex-wrap">
                            {event.confidence && (
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                event.confidence >= 85
                                  ? 'bg-red-100 text-red-700'
                                  : event.confidence >= 70
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {event.confidence.toFixed(1)}% match
                              </span>
                            )}
                            {event.location && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin size={10} /> {event.location}
                              </span>
                            )}
                            {event.camera_id && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Camera size={10} /> {event.camera_id}
                              </span>
                            )}
                          </div>
                        )}

                        {event.timestamp && (
                          <p className="text-xs text-gray-300 mt-1">
                            {formatDate(event.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help section */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Need Help?</h3>
            <div className="space-y-2">
              {[
                { icon: Phone, text: 'Police Control Room: 100'                              },
                { icon: Phone, text: 'Emergency: 112'                                        },
                { icon: MapPin, text: 'Visit your nearest police station with this case ref' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                  <Icon size={12} className="text-gray-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Search again */}
          <button onClick={reset}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <Search size={14} />
            Search Another Case
          </button>
        </div>
      )}
    </div>
  )
}