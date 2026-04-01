import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup,
         Circle, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import api from '../api/client'
import { useAlerts } from '../hooks/useAlerts'
import {
  MapPin, RefreshCw, Filter, X, Layers,
  AlertCircle, Clock, CheckCircle, Wifi,
  ZoomIn, Navigation, ChevronDown, Search
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// ── Fix Leaflet icon in React ─────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ── Custom pin markers ────────────────────────────────────────
const makePin = (color, pulse = false) => L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:36px;height:36px">
      ${pulse ? `<div style="
        position:absolute;top:0;left:0;
        width:36px;height:36px;
        background:${color};
        border-radius:50%;
        opacity:0.3;
        animation:ping 1.5s ease-out infinite;
      "></div>` : ''}
      <div style="
        position:absolute;top:2px;left:2px;
        width:28px;height:28px;
        background:${color};
        border:3px solid white;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>
    </div>
  `,
  iconSize:    [36, 36],
  iconAnchor:  [18, 36],
  popupAnchor: [0, -38],
})

const ICONS = {
  high:     makePin('#ef4444', true),
  medium:   makePin('#f59e0b'),
  low:      makePin('#3b82f6'),
  reviewed: makePin('#22c55e'),
  dismissed:makePin('#9ca3af'),
}

function getIcon(alert) {
  if (alert.status === 'reviewed')  return ICONS.reviewed
  if (alert.status === 'dismissed') return ICONS.dismissed
  if (alert.confidence >= 85) return ICONS.high
  if (alert.confidence >= 70) return ICONS.medium
  return ICONS.low
}

// ── Location → GPS coordinates ────────────────────────────────
// Update these with your actual camera locations
const LOCATION_COORDS = {
  'Main Gate':        [26.9124, 75.7873],
  'North Gate':       [26.9260, 75.8235],
  'South Gate':       [26.8900, 75.7950],
  'East Gate':        [26.9150, 75.8300],
  'West Gate':        [26.9100, 75.7600],
  'City Center':      [26.9196, 75.7878],
  'Railway Station':  [26.9219, 75.7872],
  'Bus Stand':        [26.9045, 75.7872],
  'Chandpole Gate':   [26.9239, 75.8101],
  'Sanganeri Gate':   [26.9055, 75.8193],
  'CAM-01':           [26.9124, 75.7873],
  'CAM-02':           [26.9260, 75.8100],
  'CAM-03':           [26.9050, 75.8050],
  'CAM-04':           [26.9300, 75.7700],
  'CAM-05':           [26.8980, 75.7800],
}

const JAIPUR_CENTER = [26.9124, 75.7873]

function getCoords(alert) {
  const loc = alert.location || ''
  const cam = alert.camera_id || ''

  // Exact match on location
  if (LOCATION_COORDS[loc]) return LOCATION_COORDS[loc]

  // Exact match on camera ID
  if (LOCATION_COORDS[cam]) return LOCATION_COORDS[cam]

  // Fuzzy match
  const locKey = Object.keys(LOCATION_COORDS).find(k =>
    loc.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(loc.toLowerCase())
  )
  if (locKey) return LOCATION_COORDS[locKey]

  // Random offset from center so pins don't stack
  const seed = (alert.id || 0) * 0.003
  return [
    JAIPUR_CENTER[0] + (Math.sin(seed) * 0.025),
    JAIPUR_CENTER[1] + (Math.cos(seed) * 0.025),
  ]
}

// ── Map controller — lets us fly to locations ─────────────────
function MapController({ flyTo }) {
  const map = useMap()
  useEffect(() => {
    if (flyTo) {
      map.flyTo(flyTo, 16, { duration: 1.2 })
    }
  }, [flyTo, map])
  return null
}

// ── Confidence color helper ───────────────────────────────────
function confColor(c) {
  if (c >= 85) return 'bg-red-100 text-red-800 border-red-200'
  if (c >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

// ── Time ago helper ───────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MapView() {
  const [alerts, setAlerts]       = useState([])
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [mapStyle, setMapStyle]   = useState('street')
  const [showZones, setShowZones] = useState(false)
  const [showPanel, setShowPanel] = useState(true)
  const [selected, setSelected]   = useState(null)
  const [flyTo, setFlyTo]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [liveCount, setLiveCount] = useState(0)
  const [newAlertIds, setNewAlertIds] = useState(new Set())

  const load = () => {
    setLoading(true)
    api.get('/alerts')
      .then(r => setAlerts(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Live WebSocket alerts
  const handleLiveAlert = useCallback((newAlert) => {
    setAlerts(prev => [newAlert, ...prev])
    setLiveCount(c => c + 1)
    setNewAlertIds(prev => new Set([...prev, newAlert.alert_id]))
    // Fly map to new alert location
    const coords = getCoords(newAlert)
    setFlyTo(coords)
    setSelected({ ...newAlert, id: newAlert.alert_id, confidence: newAlert.confidence })
    // Clear "new" highlight after 5 seconds
    setTimeout(() => {
      setNewAlertIds(prev => {
        const next = new Set(prev)
        next.delete(newAlert.alert_id)
        return next
      })
    }, 5000)
  }, [])

  useAlerts(handleLiveAlert)

  // Filtered alerts
  const filtered = alerts.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    const matchSearch = !search ||
      a.person_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase()) ||
      a.camera_id?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = {
    total:    alerts.length,
    new:      alerts.filter(a => a.status === 'new').length,
    high:     alerts.filter(a => a.confidence >= 85 && a.status === 'new').length,
    reviewed: alerts.filter(a => a.status === 'reviewed').length,
  }

  const tileUrl = mapStyle === 'street'
    ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    : mapStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

  const tileAttr = mapStyle === 'street'
    ? '&copy; OpenStreetMap contributors'
    : mapStyle === 'dark'
    ? '&copy; OpenStreetMap &copy; CartoDB'
    : '&copy; Esri'

  const flyToAlert = (alert) => {
    const coords = getCoords(alert)
    setFlyTo([...coords])
    setSelected(alert)
  }

  const updateAlertStatus = async (alertId, status) => {
    try {
      await api.put(`/alerts/${alertId}/status?status=${status}`)
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, status } : a
      ))
      if (selected?.id === alertId) {
        setSelected(prev => ({ ...prev, status }))
      }
    } catch {}
  }

  return (
    <div style={{ height: 'calc(100vh - 96px)' }} className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Alert Map</h1>
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <Wifi size={11} />
              Live
            </div>
            {liveCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200 font-medium">
                +{liveCount} new
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Real-time face match locations</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Map style selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {[
              { key: 'street',    label: 'Street'    },
              { key: 'dark',      label: 'Dark'      },
              { key: 'satellite', label: 'Satellite' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setMapStyle(key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mapStyle === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <button onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              showZones
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            <Layers size={13} />
            Zones
          </button>

          <button onClick={load}
            className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-600 px-3 py-2 rounded-lg text-xs hover:bg-gray-50">
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat pills */}
      <div className="flex gap-3 mb-4 flex-shrink-0">
        {[
          { label: 'Total',    value: stats.total,    color: 'bg-gray-100 text-gray-700'       },
          { label: 'New',      value: stats.new,      color: 'bg-red-100 text-red-700'         },
          { label: 'Critical', value: stats.high,     color: 'bg-orange-100 text-orange-700'   },
          { label: 'Reviewed', value: stats.reviewed, color: 'bg-green-100 text-green-700'     },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${color} rounded-lg px-4 py-2 flex items-center gap-2`}>
            <span className="text-lg font-bold">{value}</span>
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-400 bg-white border border-gray-100 rounded-lg px-4 py-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Critical ≥85%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" /> Medium ≥70%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Reviewed
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* Side panel */}
        <div className={`flex flex-col gap-3 flex-shrink-0 transition-all ${showPanel ? 'w-72' : 'w-0 overflow-hidden'}`}>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-3 text-gray-400" />
            <input
              placeholder="Search person or location..."
              className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'new', 'reviewed', 'dismissed'].map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* Selected alert detail card */}
          {selected && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">{selected.person_name}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              {selected.person_photo && (
                <img src={selected.person_photo} alt=""
                  className="w-full h-28 object-cover rounded-lg mb-3 ring-2 ring-blue-100" />
              )}

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Confidence</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confColor(selected.confidence)}`}>
                    {selected.confidence?.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Location</span>
                  <span className="text-xs font-medium text-gray-700 truncate max-w-32">
                    {selected.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Camera</span>
                  <span className="text-xs font-medium text-gray-700">{selected.camera_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Time</span>
                  <span className="text-xs text-gray-500">{timeAgo(selected.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    selected.status === 'new'       ? 'bg-red-100 text-red-700'    :
                    selected.status === 'reviewed'  ? 'bg-green-100 text-green-700' :
                                                      'bg-gray-100 text-gray-500'
                  }`}>
                    {selected.status}
                  </span>
                </div>
              </div>

              {/* Fly to button */}
              <button
                onClick={() => flyToAlert(selected)}
                className="w-full flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 rounded-lg text-xs font-medium mb-2 transition-colors">
                <Navigation size={12} />
                Fly to location
              </button>

              {/* Action buttons */}
              {selected.status === 'new' && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateAlertStatus(selected.id, 'reviewed')}
                    className="flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-2 rounded-lg text-xs font-medium transition-colors">
                    <CheckCircle size={12} />
                    Review
                  </button>
                  <button
                    onClick={() => updateAlertStatus(selected.id, 'dismissed')}
                    className="flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 py-2 rounded-lg text-xs font-medium transition-colors">
                    <X size={12} />
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Alert list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-gray-300">
                  <AlertCircle size={28} className="mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No alerts match</p>
                </div>
              ) : (
                filtered.map(alert => (
                  <div key={alert.id}
                    onClick={() => flyToAlert(alert)}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${
                      selected?.id === alert.id
                        ? 'bg-blue-50'
                        : newAlertIds.has(alert.id)
                        ? 'bg-red-50'
                        : 'hover:bg-gray-50'
                    }`}>
                    {/* Colored dot */}
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      alert.status === 'reviewed'  ? 'bg-green-500' :
                      alert.status === 'dismissed' ? 'bg-gray-300'  :
                      alert.confidence >= 85       ? 'bg-red-500'   :
                      alert.confidence >= 70       ? 'bg-yellow-400' :
                                                     'bg-blue-500'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {alert.person_name}
                        {newAlertIds.has(alert.id) && (
                          <span className="ml-1 text-xs text-red-500 font-bold">NEW</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{alert.location}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-gray-700">
                        {alert.confidence?.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-300">{timeAgo(alert.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-w-0">
          {/* Toggle panel button */}
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="absolute top-3 left-3 z-20 bg-white border border-gray-200 text-gray-600 p-2 rounded-lg shadow-sm hover:bg-gray-50 text-xs flex items-center gap-1">
            <Filter size={13} />
            {showPanel ? 'Hide' : 'Show'} panel
          </button>

          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-full">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <MapPin size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Loading map...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={JAIPUR_CENTER}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}>

                <MapController flyTo={flyTo} />
                <ZoomControl position="bottomright" />

                <TileLayer attribution={tileAttr} url={tileUrl} />

                {/* Zone circles */}
                {showZones && filtered.map(alert => {
                  const coords = getCoords(alert)
                  const color = alert.confidence >= 85 ? '#ef4444' :
                                alert.confidence >= 70 ? '#f59e0b' : '#3b82f6'
                  return (
                    <Circle key={`z-${alert.id}`}
                      center={coords}
                      radius={alert.confidence >= 85 ? 400 : 250}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.1,
                        weight: 1,
                        dashArray: '4 4'
                      }}
                    />
                  )
                })}

                {/* Markers */}
                {filtered.map(alert => {
                  const coords = getCoords(alert)
                  const isSelected = selected?.id === alert.id
                  const isNew = newAlertIds.has(alert.id)

                  return (
                    <Marker
                      key={alert.id}
                      position={coords}
                      icon={getIcon(alert)}
                      zIndexOffset={isSelected ? 1000 : isNew ? 500 : 0}
                      eventHandlers={{ click: () => setSelected(alert) }}>
                      <Popup maxWidth={220}>
                        <div style={{ fontFamily:'system-ui,sans-serif', padding:'4px' }}>
                          {alert.person_photo && (
                            <img src={alert.person_photo} alt=""
                              style={{ width:'100%',height:'80px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px' }} />
                          )}
                          <p style={{ fontWeight:600, fontSize:14, margin:'0 0 4px', color:'#111' }}>
                            {alert.person_name}
                          </p>
                          <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 6px' }}>
                            📍 {alert.location}
                          </p>
                          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:6 }}>
                            <span style={{
                              fontSize:11, fontWeight:700,
                              padding:'2px 8px', borderRadius:20,
                              background: alert.confidence>=85?'#fef2f2':'#fefce8',
                              color: alert.confidence>=85?'#991f1f':'#854f0b'
                            }}>
                              {alert.confidence?.toFixed(1)}% match
                            </span>
                            <span style={{
                              fontSize:11, fontWeight:500,
                              padding:'2px 8px', borderRadius:20,
                              background: alert.status==='new'?'#fef2f2':
                                          alert.status==='reviewed'?'#f0fdf4':'#f9fafb',
                              color: alert.status==='new'?'#dc2626':
                                     alert.status==='reviewed'?'#16a34a':'#6b7280'
                            }}>
                              {alert.status}
                            </span>
                          </div>
                          <p style={{ fontSize:11, color:'#9ca3af', margin:'0 0 2px' }}>
                            📷 {alert.camera_id}
                          </p>
                          <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>
                            🕐 {timeAgo(alert.created_at)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}