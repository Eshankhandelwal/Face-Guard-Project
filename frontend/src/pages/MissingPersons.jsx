import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import {
  UserPlus, Search, MapPin, Phone,
  Calendar, Users, Filter, X, Download
} from 'lucide-react'

export default function MissingPersons() {
  const [persons, setPersons]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [downloading, setDownloading] = useState(null) // stores person id being downloaded

  const [filters, setFilters] = useState({
    search:  '',
    status:  'missing',
    gender:  '',
    age_min: '',
    age_max: '',
  })

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.status)  params.append('status',  filters.status)
    if (filters.search)  params.append('search',  filters.search)
    if (filters.gender)  params.append('gender',  filters.gender)
    if (filters.age_min) params.append('age_min', filters.age_min)
    if (filters.age_max) params.append('age_max', filters.age_max)

    api.get(`/persons?${params.toString()}`)
      .then(r => setPersons(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(load, 400)
    return () => clearTimeout(timer)
  }, [filters])

  const clearFilters = () => setFilters({
    search: '', status: 'missing', gender: '', age_min: '', age_max: ''
  })

  const activeFilterCount = [
    filters.gender, filters.age_min, filters.age_max
  ].filter(Boolean).length

  const markFound = async (id) => {
    if (!confirm('Mark this person as found?')) return
    await api.put(`/persons/${id}/status?status=found`)
    setPersons(prev => prev.filter(p => p.id !== id))
  }

  // ── PDF Download ──────────────────────────────────────────
  const downloadReport = async (personId, personName) => {
    setDownloading(personId)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(`/api/reports/person/${personId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to generate report')

      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      a.download     = `FaceGuard_Report_${personName.replace(/ /g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate PDF. Make sure the backend is running.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div>
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missing Persons</h1>
          <p className="text-gray-400 text-sm">{persons.length} record(s) found</p>
        </div>
        <Link to="/persons/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={15} />
          Report Missing Person
        </Link>
      </div>

      {/* ── Search + Filter Bar ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-3 text-gray-400" />
            <input
              placeholder="Search by name..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={e => setF('search', e.target.value)}
            />
            {filters.search && (
              <button onClick={() => setF('search', '')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status toggle */}
          <div className="flex gap-2">
            {['missing', 'found'].map(s => (
              <button key={s} onClick={() => setF('status', s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filters.status === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <Filter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear filters */}
          {activeFilterCount > 0 && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Gender</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.gender}
                onChange={e => setF('gender', e.target.value)}>
                <option value="">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min age</label>
              <input
                type="number" min="0" max="120" placeholder="e.g. 10"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.age_min}
                onChange={e => setF('age_min', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max age</label>
              <input
                type="number" min="0" max="120" placeholder="e.g. 60"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.age_max}
                onChange={e => setF('age_max', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* ── Results ───────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Searching...</div>
      ) : persons.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Users size={48} className="mx-auto mb-3" />
          <p className="text-gray-400">No results found</p>
          <button onClick={clearFilters}
            className="text-blue-600 text-sm mt-2 block mx-auto hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {persons.map(person => (
            <div key={person.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

              {/* Photo */}
              <div className="relative">
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-5xl font-bold text-gray-300">
                      {person.name[0]}
                    </span>
                  </div>
                )}
                <span className={`absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-semibold ${
                  person.status === 'missing'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {person.status.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-base">
                  {person.name}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {person.age ? `${person.age} yrs` : 'Age N/A'} •{' '}
                  {person.gender || 'Unknown'}
                </p>

                <div className="mt-3 space-y-1">
                  {person.last_seen_location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={11} className="flex-shrink-0" />
                      <span className="truncate">{person.last_seen_location}</span>
                    </div>
                  )}
                  {person.contact_number && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={11} />
                      {person.contact_number}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar size={11} />
                    {new Date(person.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-3 space-y-2">
                  {/* Mark as found */}
                  {person.status === 'missing' && (
                    <button
                      onClick={() => markFound(person.id)}
                      className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-medium py-2 rounded-lg transition-colors">
                      ✓ Mark as Found
                    </button>
                  )}

                  {/* Download PDF report */}
                  <button
                    onClick={() => downloadReport(person.id, person.name)}
                    disabled={downloading === person.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-wait text-blue-700 border border-blue-200 text-xs font-medium py-2 rounded-lg transition-colors">
                    <Download size={12} />
                    {downloading === person.id
                      ? 'Generating PDF...'
                      : 'Download PDF Report'}
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}