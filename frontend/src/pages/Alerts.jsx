import { useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import { useAlerts } from '../hooks/useAlerts'
import { Bell, CheckCircle, XCircle, RefreshCw, AlertTriangle, Wifi } from 'lucide-react'

export default function Alerts() {
  const [alerts, setAlerts]     = useState([])
  const [filter, setFilter]     = useState('new')
  const [loading, setLoading]   = useState(true)
  const [liveCount, setLiveCount] = useState(0)  // tracks new WS alerts

  const load = () => {
    setLoading(true)
    api.get(`/alerts?status=${filter}`)
      .then(r => setAlerts(r.data))
      .finally(() => setLoading(false))
  }

  // WebSocket — fires when new alert arrives from camera
  const handleLiveAlert = useCallback((newAlert) => {
    if (filter === 'new') {
      setAlerts(prev => [newAlert, ...prev])
    }
    setLiveCount(c => c + 1)

    // Browser notification (if user allowed it)
    if (Notification.permission === 'granted') {
      new Notification('FaceGuard Alert', {
        body: `${newAlert.person_name} detected at ${newAlert.location} — ${newAlert.confidence?.toFixed(1)}% match`,
        icon: '/favicon.ico'
      })
    }
  }, [filter])

  useAlerts(handleLiveAlert)

  useEffect(() => {
    load()
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [filter])

  const updateStatus = async (id, status) => {
    await api.put(`/alerts/${id}/status?status=${status}`)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const confidenceColor = (c) => {
    if (c >= 85) return 'text-red-700 bg-red-100 border-red-200'
    if (c >= 70) return 'text-yellow-700 bg-yellow-100 border-yellow-200'
    return 'text-blue-700 bg-blue-100 border-blue-200'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
              <Wifi size={11} />
              Live stream active
            </div>
            {liveCount > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200 font-medium">
                {liveCount} new since page load
              </span>
            )}
          </div>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {['new', 'reviewed', 'dismissed'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Bell size={48} className="mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No {filter} alerts</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              {alert.person_photo ? (
                <img src={alert.person_photo} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 ring-2 ring-gray-100" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-gray-400" />
                </div>
              )}

              {alert.screenshot_url && (
                <div className="relative flex-shrink-0">
                  <img src={alert.screenshot_url} alt="detection" className="w-14 h-14 rounded-lg object-cover ring-2 ring-yellow-400" />
                  <span className="absolute -top-1 -right-1 text-xs bg-yellow-400 text-yellow-900 px-1 rounded font-bold">LIVE</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{alert.person_name}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${confidenceColor(alert.confidence)}`}>
                    {alert.confidence?.toFixed(1)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  📍 {alert.location} &nbsp;•&nbsp; 📷 {alert.camera_id}
                </p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {new Date(alert.created_at).toLocaleString('en-IN')}
                </p>
              </div>

              {filter === 'new' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => updateStatus(alert.id, 'reviewed')}
                    className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100">
                    <CheckCircle size={13} /> Review
                  </button>
                  <button onClick={() => updateStatus(alert.id, 'dismissed')}
                    className="flex items-center gap-1 text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100">
                    <XCircle size={13} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}