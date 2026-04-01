import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, PlusCircle, Package, LogOut, User, UserCog, FileText } from 'lucide-react'

const navItems = [
  { path: '/citizen',        icon: Home,       label: 'Home'              },
  { path: '/citizen/report', icon: PlusCircle, label: 'Report Missing'    },
  { path: '/citizen/track',  icon: FileText,   label: 'Track Case'        },
  { path: '/items',          icon: Package,    label: 'Lost Items'        },
  { path: '/profile',        icon: UserCog,    label: 'My Profile'        },
]

export default function CitizenSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <User size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">FaceGuard</h1>
            <p className="text-xs text-gray-400">Citizen Portal</p>
          </div>
        </div>
        <div className="mt-4 bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-2">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-green-300 font-semibold uppercase tracking-wide">Citizen</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-green-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}>
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-green-400">Report missing persons & lost items only</p>
        </div>
        <button onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 text-sm w-full px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </div>
  )
}