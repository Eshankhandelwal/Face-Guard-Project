import { useEffect, useState } from 'react'
import api from '../../api/client'
import {
  Users, Shield, BadgeCheck, User, Search,
  Trash2, UserPlus, X, Eye, EyeOff, CheckCircle
} from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers]             = useState([])
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [showForm, setShowForm]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [loading, setLoading]         = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'officer'
  })

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = () => {
    api.get('/auth/users')
      .then(r => setUsers(r.data))
      .catch(() => setError('Failed to load users'))
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = filter === 'all' || u.role === filter
    return matchSearch && matchRole
  })

  // ── Create user ───────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/auth/users/create', form)
      setSuccess(`${form.role === 'officer' ? 'Officer' : 'Citizen'} account created!`)
      setForm({ name: '', email: '', password: '', role: 'officer' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating user')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete user ───────────────────────────────────────────
  const handleDelete = async (user) => {
    try {
      await api.delete(`/auth/users/${user.id}`)
      setSuccess(`"${user.name}" removed successfully`)
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Error deleting user')
      setDeleteConfirm(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-400 text-sm">{users.length} total accounts</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError(''); setSuccess('') }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={15} />
          Add New User
        </button>
      </div>

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
          <CheckCircle size={16} />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
          <button onClick={() => setError('')} className="ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Admin protected badge */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-4">
        <div className="bg-red-100 p-2.5 rounded-lg">
          <Shield size={20} className="text-red-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-800 text-sm">Admin Account (Protected)</p>
          <p className="text-red-500 text-xs">
            {users.find(u => u.role === 'admin')?.name ?? 'No admin found'} —{' '}
            {users.find(u => u.role === 'admin')?.email ?? ''}
          </p>
        </div>
        <span className="text-xs bg-red-200 text-red-800 px-3 py-1 rounded-full font-semibold">
          Cannot be deleted
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-blue-200 p-5 flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
            <BadgeCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'officer').length}
            </p>
            <p className="text-sm text-gray-400">Police Officers</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-5 flex items-center gap-4">
          <div className="bg-green-50 text-green-600 p-3 rounded-xl">
            <User size={22} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'citizen').length}
            </p>
            <p className="text-sm text-gray-400">Citizens</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-gray-400" />
          <input
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'officer', 'citizen'].map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === r
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['User', 'Email', 'Role', 'Joined', 'Access', 'Action'].map(h => (
                <th key={h}
                  className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.filter(u => u.role !== 'admin').map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">

                {/* Name + Avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                      user.role === 'officer' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>

                {/* Role badge */}
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                    user.role === 'officer'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {user.role}
                  </span>
                </td>

                {/* Joined date */}
                <td className="px-5 py-4 text-sm text-gray-400">
                  {new Date(user.created_at).toLocaleDateString('en-IN')}
                </td>

                {/* Access level */}
                <td className="px-5 py-4 text-sm text-gray-500">
                  {user.role === 'officer'
                    ? '🔵 Surveillance + cases'
                    : '🟢 Report only'}
                </td>

                {/* Delete button */}
                <td className="px-5 py-4">
                  <button
                    onClick={() => setDeleteConfirm(user)}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors font-medium">
                    <Trash2 size={13} />
                    Remove
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filtered.filter(u => u.role !== 'admin').length === 0 && (
          <div className="text-center py-14 text-gray-300">
            <Users size={40} className="mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No users found</p>
            <button
              onClick={() => { setShowForm(true) }}
              className="text-red-500 text-sm mt-2 hover:underline">
              Add a user →
            </button>
          </div>
        )}
      </div>

      {/* ── ADD USER MODAL ─────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg text-gray-900">Add New User</h2>
                <p className="text-xs text-gray-400 mt-0.5">Create officer or citizen account</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
              <Shield size={14} className="text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                You can only create <strong>Officer</strong> or <strong>Citizen</strong> accounts.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                <input required placeholder="Enter full name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.name}
                  onChange={e => setF('name', e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <input required type="email" placeholder="user@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={form.email}
                  onChange={e => setF('email', e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <input required
                    type={showPass ? 'text' : 'password'}
                    placeholder="Set a strong password"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={form.password}
                    onChange={e => setF('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'officer', label: 'Police Officer', icon: BadgeCheck, color: 'border-blue-500 bg-blue-50 text-blue-700'  },
                    { value: 'citizen', label: 'Citizen',        icon: User,       color: 'border-green-500 bg-green-50 text-green-700' },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button key={value} type="button"
                      onClick={() => setF('role', value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        form.role === value ? color : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {form.role === 'officer'
                    ? '🔵 Can access surveillance, alerts, camera, missing persons'
                    : '🟢 Can only report missing persons and lost items'}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setError('') }}
                  className="px-5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Remove User</h2>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            {/* User card in modal */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                deleteConfirm.role === 'officer' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {deleteConfirm.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{deleteConfirm.name}</p>
                <p className="text-sm text-gray-400">{deleteConfirm.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                  deleteConfirm.role === 'officer'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {deleteConfirm.role}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to remove <strong>{deleteConfirm.name}</strong>?
              They will immediately lose all access to the system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                Yes, Remove User
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}