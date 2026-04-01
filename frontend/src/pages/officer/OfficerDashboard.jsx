import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import { Bell, Users, Camera, UserPlus,
         AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'

export default function OfficerDashboard() {
  const [stats, setStats]   = useState(null)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.get('/alerts/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/alerts?status=new').then(r => setAlerts(r.data.slice(0, 5))).catch(() => {})
  }, [])

  const cards = [
    { label: 'Active Cases',  value: stats?.total_missing ?? 0, icon: Users,  bg: 'bg-red-50',    text: 'text-red-600',    link: '/persons'        },
    { label: 'New Alerts',    value: stats?.new_alerts    ?? 0, icon: Bell,   bg: 'bg-yellow-50', text: 'text-yellow-600', link: '/alerts'         },
    { label: 'Persons Found', value: stats?.total_found   ?? 0, icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-600', link: '/persons'     },
    { label: 'Lost Items',    value: stats?.total_lost_items ?? 0, icon: AlertCircle, bg: 'bg-blue-50', text: 'text-blue-600', link: '/items'     },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-400 text-sm">Your active cases and alerts</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link to="/persons/add"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors group">
          <div className="bg-blue-500 p-3 rounded-lg">
            <UserPlus size={22} />
          </div>
          <div>
            <p className="font-semibold">Report Missing Person</p>
            <p className="text-blue-200 text-sm">Add new case</p>
          </div>
          <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link to="/officer/camera"
          className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl p-5 flex items-center gap-4 transition-colors group">
          <div className="bg-gray-700 p-3 rounded-lg">
            <Camera size={22} />
          </div>
          <div>
            <p className="font-semibold">Start Camera Scan</p>
            <p className="text-gray-400 text-sm">Live face detection</p>
          </div>
          <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link to="/alerts"
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors group">
          <div className="bg-red-500 p-3 rounded-lg">
            <Bell size={22} />
          </div>
          <div>
            <p className="font-semibold">View Alerts</p>
            <p className="text-red-200 text-sm">{stats?.new_alerts ?? 0} unreviewed</p>
          </div>
          <ArrowRight size={18} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, bg, text, link }) => (
          <Link key={label} to={link}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className={`${bg} ${text} p-2.5 rounded-lg w-fit mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent alerts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
          <Link to="/alerts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <Bell size={32} className="mx-auto mb-2" />
            <p className="text-sm text-gray-400">No new alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center gap-3 bg-red-50 border border-red-100 p-3 rounded-lg">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{a.person_name}</p>
                  <p className="text-xs text-gray-400">{a.location} • {a.confidence?.toFixed(1)}% match</p>
                </div>
                <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">NEW</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}