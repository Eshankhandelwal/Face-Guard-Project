import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Users, Bell, Package, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const weeklyData = [
  { day: 'Mon', alerts: 4 }, { day: 'Tue', alerts: 7 },
  { day: 'Wed', alerts: 3 }, { day: 'Thu', alerts: 9 },
  { day: 'Fri', alerts: 5 }, { day: 'Sat', alerts: 12 },
  { day: 'Sun', alerts: 6 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentAlerts, setRecentAlerts] = useState([])

  useEffect(() => {
    api.get('/alerts/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/alerts?status=new').then(r => setRecentAlerts(r.data.slice(0, 5))).catch(() => {})
  }, [])

  const cards = [
    { label: 'Missing Persons', value: stats?.total_missing ?? 0, icon: Users,         color: 'bg-red-500',    text: 'text-red-500',    bg: 'bg-red-50'    },
    { label: 'Persons Found',   value: stats?.total_found   ?? 0, icon: CheckCircle,   color: 'bg-green-500',  text: 'text-green-500',  bg: 'bg-green-50'  },
    { label: 'New Alerts',      value: stats?.new_alerts    ?? 0, icon: Bell,           color: 'bg-yellow-500', text: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Lost Items',      value: stats?.total_lost_items ?? 0, icon: Package,    color: 'bg-blue-500',   text: 'text-blue-500',   bg: 'bg-blue-50'   },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm">Real-time surveillance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color, text, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={`${bg} ${text} p-2.5 rounded-lg`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Chart */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Weekly Alert Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="alerts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Alerts */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
            <Link to="/alerts" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <Bell size={32} className="mx-auto mb-2" />
              <p className="text-sm">No new alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{alert.person_name}</p>
                    <p className="text-xs text-gray-400">{alert.location} • {alert.confidence?.toFixed(1)}% match</p>
                  </div>
                  <span className="text-xs font-bold text-red-500">NEW</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}