import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'
import {
  Bell, Users, Camera, UserPlus,
  AlertCircle, CheckCircle, ArrowRight,
  TrendingUp, Package, ScanSearch
} from 'lucide-react'

export default function OfficerDashboard() {
  const [stats, setStats]   = useState(null)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.get('/alerts/stats').then(r => setStats(r.data)).catch(() => {})
    api.get('/alerts?status=new').then(r => setAlerts(r.data.slice(0, 5))).catch(() => {})
  }, [])

  const cards = [
    {
      label: 'Active Cases',
      value: stats?.total_missing   ?? 0,
      icon:  Users,
      bg:    'bg-red-50',
      text:  'text-red-600',
      link:  '/persons'
    },
    {
      label: 'New Alerts',
      value: stats?.new_alerts      ?? 0,
      icon:  Bell,
      bg:    'bg-yellow-50',
      text:  'text-yellow-600',
      link:  '/alerts'
    },
    {
      label: 'Persons Found',
      value: stats?.total_found     ?? 0,
      icon:  CheckCircle,
      bg:    'bg-green-50',
      text:  'text-green-600',
      link:  '/persons'
    },
    {
      label: 'Lost Items',
      value: stats?.total_lost_items ?? 0,
      icon:  Package,
      bg:    'bg-blue-50',
      text:  'text-blue-600',
      link:  '/items'
    },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">Officer Dashboard</h1>
          <p className="text-sm opacity-90 mt-1">
            Your active cases, alerts and surveillance tools
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/persons/add"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
            <UserPlus size={15} /> Report Person
          </Link>
          <Link to="/officer/camera"
            className="flex items-center gap-2 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-lg text-sm font-medium transition">
            <Camera size={15} /> Live Camera
          </Link>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-2 gap-4">

        <Link to="/persons/add"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors group shadow-sm">
          <div className="bg-blue-500 p-3 rounded-lg flex-shrink-0">
            <UserPlus size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Report Missing Person</p>
            <p className="text-blue-200 text-sm mt-0.5">Add new case to database</p>
          </div>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link to="/officer/camera"
          className="bg-gray-800 hover:bg-gray-900 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors group shadow-sm">
          <div className="bg-gray-700 p-3 rounded-lg flex-shrink-0">
            <Camera size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Start Camera Scan</p>
            <p className="text-gray-400 text-sm mt-0.5">Live face detection</p>
          </div>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link to="/alerts"
          className="bg-red-600 hover:bg-red-700 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors group shadow-sm">
          <div className="bg-red-500 p-3 rounded-lg flex-shrink-0">
            <Bell size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">View Alerts</p>
            <p className="text-red-200 text-sm mt-0.5">
              {stats?.new_alerts ?? 0} unreviewed alert{stats?.new_alerts !== 1 ? 's' : ''}
            </p>
          </div>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link to="/search"
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-5 flex items-center gap-4 transition-colors group shadow-sm">
          <div className="bg-purple-500 p-3 rounded-lg flex-shrink-0">
            <ScanSearch size={22} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Photo Search</p>
            <p className="text-purple-200 text-sm mt-0.5">Search by face photo</p>
          </div>
          <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, bg, text, link }) => (
          <Link key={label} to={link}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`${bg} ${text} p-2.5 rounded-xl`}>
                <Icon size={20} />
              </div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent alerts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Recent Alerts</h2>
          <Link to="/alerts"
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-10 text-gray-300">
            <Bell size={36} className="mx-auto mb-3" />
            <p className="text-sm text-gray-400">No new alerts right now</p>
            <p className="text-xs text-gray-300 mt-1">
              Alerts appear here when a face match is detected
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id}
                className="flex items-center gap-3 bg-red-50 hover:bg-red-100 border border-red-100 p-3 rounded-xl transition-colors cursor-pointer">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {a.person_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    📍 {a.location} &nbsp;•&nbsp;
                    📷 {a.camera_id} &nbsp;•&nbsp;
                    {a.confidence?.toFixed(1)}% match
                  </p>
                </div>
                <span className="text-xs font-bold text-red-600 bg-white border border-red-200 px-2 py-1 rounded-full flex-shrink-0">
                  NEW
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}