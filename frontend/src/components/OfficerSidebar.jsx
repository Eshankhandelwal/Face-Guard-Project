import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Bell, UserPlus,
         Package, Camera, LogOut, BadgeCheck, UserCog, Map, ScanSearch } from 'lucide-react'

const navItems = [
  { path: '/officer',        icon: LayoutDashboard, label: 'Dashboard'        },
  { path: '/persons',        icon: Users,           label: 'Missing Persons'  },
  { path: '/persons/add',    icon: UserPlus,        label: 'Report Person'    },
  { path: '/alerts',         icon: Bell,            label: 'Alerts'           },
  { path: '/map',            icon: Map,             label: 'Alert Map'        },
  { path: '/items',          icon: Package,         label: 'Lost Items'       },
  { path: '/officer/camera', icon: Camera,          label: 'Live Camera'      },
  { path: '/profile',        icon: UserCog,         label: 'My Profile'       },
  { path: '/search', icon: ScanSearch, label: 'Photo Search' },
]

export default function OfficerSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BadgeCheck size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">FaceGuard</h1>
            <p className="text-xs text-gray-400">Officer Portal</p>
          </div>
        </div>
        <div className="mt-4 bg-blue-900/40 border border-blue-700/50 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide">Police Officer</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-sm w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  )
}