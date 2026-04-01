import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import {
  User, Mail, Lock, Shield, BadgeCheck,
  CheckCircle, X, Eye, EyeOff, Save, KeyRound
} from 'lucide-react'

export default function Profile() {
  const { user, login } = useAuth()

  // Profile form state
  const [name, setName]   = useState(user?.name  || '')
  const [email, setEmail] = useState(user?.email || '')

  // Password form state
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // UI state
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError]     = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError]     = useState('')

  const roleColor =
    user?.role === 'admin'   ? 'bg-red-100 text-red-700'   :
    user?.role === 'officer' ? 'bg-blue-100 text-blue-700' :
                               'bg-green-100 text-green-700'

  const roleIcon =
    user?.role === 'admin'   ? <Shield size={14} />     :
    user?.role === 'officer' ? <BadgeCheck size={14} /> :
                               <User size={14} />

  // ── Save profile ──────────────────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const params = new URLSearchParams()
      if (name)  params.append('name',  name)
      if (email) params.append('email', email)

      const res = await api.put(`/auth/profile?${params.toString()}`)

      // Update name in localStorage and auth context
      localStorage.setItem('name', res.data.name)
      login({
        access_token: localStorage.getItem('token'),
        role: user.role,
        name: res.data.name
      })

      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  // ── Change password ───────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPass !== confirmPass) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPass.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('current_password', currentPass)
      params.append('new_password', newPass)

      await api.put(`/auth/change-password?${params.toString()}`)

      setPasswordSuccess('Password changed successfully!')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage your account details and password</p>
      </div>

      {/* Profile card at top */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ${
            user?.role === 'admin'   ? 'bg-red-500'   :
            user?.role === 'officer' ? 'bg-blue-500'  :
                                       'bg-green-500'
          }`}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-400">{email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${roleColor}`}>
                {roleIcon}
                {user?.role}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">ID #{user?.id ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit profile form ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            <User size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
            <p className="text-xs text-gray-400">Update your name and email address</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <CheckCircle size={15} />
            {profileSuccess}
            <button onClick={() => setProfileSuccess('')} className="ml-auto">
              <X size={13} />
            </button>
          </div>
        )}

        {profileError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {profileError}
            <button onClick={() => setProfileError('')} className="ml-auto">
              <X size={13} />
            </button>
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text" required
                placeholder="Your full name"
                className="w-full pl-9 pr-4 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email" required
                placeholder="your@email.com"
                className="w-full pl-9 pr-4 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${roleColor}`}>
                {roleIcon}
                {user?.role}
              </span>
              <span className="text-xs text-gray-400 ml-1">— Role cannot be changed</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <Save size={15} />
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Change password form ──────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
            <KeyRound size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Change Password</h3>
            <p className="text-xs text-gray-400">Use a strong password of at least 6 characters</p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <CheckCircle size={15} />
            {passwordSuccess}
            <button onClick={() => setPasswordSuccess('')} className="ml-auto">
              <X size={13} />
            </button>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
            {passwordError}
            <button onClick={() => setPasswordError('')} className="ml-auto">
              <X size={13} />
            </button>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Current Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                type={showNew ? 'text' : 'password'}
                placeholder="Enter new password"
                className="w-full pl-9 pr-10 border border-gray-200 rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Password strength bar */}
            {newPass && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      newPass.length >= i * 3
                        ? newPass.length < 6  ? 'bg-red-400'
                        : newPass.length < 9  ? 'bg-yellow-400'
                        :                       'bg-green-400'
                        : 'bg-gray-200'
                    }`} />
                  ))}
                </div>
                <p className={`text-xs ${
                  newPass.length < 6  ? 'text-red-500'    :
                  newPass.length < 9  ? 'text-yellow-600' :
                                        'text-green-600'
                }`}>
                  {newPass.length < 6  ? 'Too short'  :
                   newPass.length < 9  ? 'Fair'        :
                   newPass.length < 12 ? 'Good'        : 'Strong'}
                </p>
              </div>
            )}
          </div>

          {/* Confirm new password */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                className={`w-full pl-9 pr-10 border rounded-lg py-2.5 text-sm focus:outline-none focus:ring-2 ${
                  confirmPass && confirmPass !== newPass
                    ? 'border-red-300 focus:ring-red-500'
                    : confirmPass && confirmPass === newPass
                    ? 'border-green-300 focus:ring-green-500'
                    : 'border-gray-200 focus:ring-orange-500'
                }`}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {confirmPass && (
                <div className="absolute right-9 top-3">
                  {confirmPass === newPass
                    ? <CheckCircle size={15} className="text-green-500" />
                    : <X size={15} className="text-red-400" />
                  }
                </div>
              )}
            </div>
            {confirmPass && confirmPass !== newPass && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={passwordLoading || (confirmPass && confirmPass !== newPass)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            <KeyRound size={15} />
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}