import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { Shield, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [showPass, setShowPass]     = useState(false)
  const [form, setForm]             = useState({ name: '', email: '', password: '', role: 'citizen' })
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)

  const { login, getHomePath } = useAuth()
  const navigate = useNavigate()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isRegister) {
        // ── REGISTER ── just create account, redirect to login
        const payload = {
          name:     form.name,
          email:    form.email,
          password: form.password,
          role:     form.role
        }
        const res = await api.post('/auth/register', payload)
        setSuccess(`Account created successfully! Please login with your credentials.`)
        setForm({ name: '', email: '', password: '', role: 'citizen' })
        // Switch to login form after 1.5 seconds
        setTimeout(() => {
          setIsRegister(false)
          setSuccess('')
        }, 1500)

      } else {
        // ── LOGIN ── get token and redirect to role dashboard
        const res = await api.post('/auth/login', {
          email:    form.email,
          password: form.password
        })
        login(res.data)
        navigate(getHomePath(res.data.role))
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back to home */}
        <Link to="/"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors w-fit">
          <ArrowLeft size={15} />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">FaceGuard</h1>
              <p className="text-xs text-gray-500">Surveillance & Communication System</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {isRegister
              ? 'Register your account — you will be redirected to login'
              : 'Sign in to access your dashboard'}
          </p>

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
              <CheckCircle size={16} className="flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — register only */}
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text" required
                  placeholder="Your full name"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <input
                type="email" required
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Role — register only */}
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Register as</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'officer', label: 'Police Officer', desc: 'Surveillance access' },
                    { value: 'citizen', label: 'Citizen',        desc: 'Report missing persons' },
                  ].map(({ value, label, desc }) => (
                    <button key={value} type="button"
                      onClick={() => set('role', value)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.role === value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <p className={`text-sm font-semibold ${
                        form.role === value ? 'text-blue-700' : 'text-gray-700'
                      }`}>{label}</p>
                      <p className={`text-xs mt-0.5 ${
                        form.role === value ? 'text-blue-500' : 'text-gray-400'
                      }`}>{desc}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 bg-gray-50 px-3 py-2 rounded-lg">
                  ℹ️ Admin accounts are created by the system administrator only.
                </p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors mt-2">
              {loading
                ? 'Please wait...'
                : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
              className="text-blue-600 font-medium hover:underline">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}