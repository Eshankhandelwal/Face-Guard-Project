import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Users, Bell, Package, Camera, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { path: '/',           icon: LayoutDashboard, label: 'Dashboard'       },
  { path: '/persons',    icon: Users,            label: 'Missing Persons' },
  { path: '/alerts',     icon: Bell,             label: 'Alerts'          },
  { path: '/items',      icon: Package,          label: 'Lost Items'      },
  { path: '/camera',     icon: Camera,           label: 'Live Camera'     },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">FaceGuard</h1>
            <p className="text-xs text-gray-400">Surveillance System</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-800 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-sm w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}