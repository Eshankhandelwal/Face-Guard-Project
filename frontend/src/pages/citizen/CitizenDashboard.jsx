import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  PlusCircle, Package, Phone,
  AlertCircle, CheckCircle, FileText
} from 'lucide-react'

export default function CitizenDashboard() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">How can we help you today?</p>
      </div>

      {/* Main actions — 3 cards */}
      <div className="grid grid-cols-1 gap-4 mb-8">

        <Link to="/citizen/report"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-lg group">
          <div className="bg-blue-500 p-3 rounded-xl w-fit">
            <PlusCircle size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Report Missing Person</p>
            <p className="text-blue-200 text-sm mt-1">
              Submit details and photo to alert police immediately.
              A case reference number will be generated for you.
            </p>
          </div>
        </Link>

        <Link to="/citizen/track"
          className="bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-md group">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit group-hover:bg-blue-100">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-bold text-lg text-gray-900">Track Your Case</p>
            <p className="text-gray-400 text-sm mt-1">
              Enter your case reference number (e.g. FG-2025-0001) to see
              the latest status, alerts, and timeline updates.
            </p>
          </div>
        </Link>

        <Link to="/items"
          className="bg-gray-800 hover:bg-gray-900 text-white rounded-2xl p-6 flex flex-col gap-3 transition-all hover:shadow-lg group">
          <div className="bg-gray-700 p-3 rounded-xl w-fit">
            <Package size={24} />
          </div>
          <div>
            <p className="font-bold text-lg">Report Lost Item</p>
            <p className="text-gray-400 text-sm mt-1">
              Register a lost belonging so officers can track and return it.
            </p>
          </div>
        </Link>

      </div>

      {/* What happens after report */}
      <div className="space-y-3 mb-8">
        <h2 className="font-semibold text-gray-900">What happens after you report?</h2>

        {[
          {
            icon:  CheckCircle,
            color: 'text-green-600 bg-green-50',
            title: 'Report received',
            desc:  'Your report is instantly saved and visible to all police officers'
          },
          {
            icon:  AlertCircle,
            color: 'text-blue-600 bg-blue-50',
            title: 'AI face scan begins',
            desc:  'Our cameras automatically scan for the person in real-time'
          },
          {
            icon:  FileText,
            color: 'text-purple-600 bg-purple-50',
            title: 'Case reference generated',
            desc:  'Use your reference number anytime to track the status of your case'
          },
          {
            icon:  Phone,
            color: 'text-orange-600 bg-orange-50',
            title: 'You get notified',
            desc:  'Police will contact you on the number you provided if found'
          },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
            <div className={`${color} p-2.5 rounded-lg flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{title}</p>
              <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency contact */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="font-semibold text-red-800 mb-1">Emergency?</p>
        <p className="text-red-600 text-sm">
          Call <strong>100</strong> (Police) or <strong>112</strong> (Emergency) immediately
        </p>
      </div>
    </div>
  )
}