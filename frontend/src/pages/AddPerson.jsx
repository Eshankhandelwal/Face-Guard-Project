import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Upload, ArrowLeft, CheckCircle } from 'lucide-react'

export default function AddPerson() {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', description: '',
    last_seen_location: '', contact_number: ''
  })
  const [photo, setPhoto]     = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!photo) { alert('Please upload a photo of the missing person'); return }

    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('photo', photo)

    try {
      await api.post('/persons/add', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess(true)
      setTimeout(() => navigate('/persons'), 2000)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error submitting report')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="bg-green-100 p-6 rounded-full">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Report Submitted!</h2>
        <p className="text-gray-400 text-sm">Face encoded and saved. Redirecting...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Missing Person</h1>
          <p className="text-gray-400 text-sm">All information is kept confidential</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Photo <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => document.getElementById('photo-input').click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-xl shadow" />
                  <p className="text-xs text-gray-400">Click to change photo</p>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">Clear face photo required for recognition • JPG, PNG</p>
                </>
              )}
            </div>
            <input id="photo-input" type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          {/* Name + Age */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input required placeholder="Enter full name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Age</label>
              <input type="number" min="1" max="120" placeholder="Age in years"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
          </div>

          {/* Gender + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contact Number</label>
              <input placeholder="+91 XXXXXXXXXX"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.contact_number} onChange={e => set('contact_number', e.target.value)} />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Last Seen Location</label>
            <input placeholder="e.g. Chandpole Gate, Jaipur"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.last_seen_location} onChange={e => set('last_seen_location', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea rows={3} placeholder="Clothing worn, identifying marks, circumstances..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? '⏳ Processing face encoding...' : 'Submit Missing Person Report'}
          </button>
        </form>
      </div>
    </div>
  )
}