import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Bell, UserPlus,
         Package, Shield, LogOut, Settings, UserCog, Map, ScanSearch  } from 'lucide-react'

const navItems = [
  { path: '/dashboard',              icon: LayoutDashboard, label: 'Dashboard'        },
  { path: '/admin/users',   icon: Users,            label: 'Manage Users'    },
  { path: '/persons',       icon: UserPlus,         label: 'Missing Persons' },
  { path: '/alerts',        icon: Bell,             label: 'Alerts'          },
  { path: '/items',         icon: Package,          label: 'Lost Items'      },
  { path: '/officer/camera',icon: Settings,         label: 'Live Camera'     },
  { path: '/profile',        icon: UserCog,          label: 'My Profile'      },
  { path: '/map', icon: Map, label: 'Alert Map' },
  { path: '/search', icon: ScanSearch, label: 'Photo Search' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">FaceGuard</h1>
            <p className="text-xs text-gray-400">Admin Control Panel</p>
          </div>
        </div>
        <div className="mt-4 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-red-300 font-semibold uppercase tracking-wide">Administrator</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-red-400 font-medium">Full system access</p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-sm w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  )
}