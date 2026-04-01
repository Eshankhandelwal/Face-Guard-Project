import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import {
  Upload, ArrowLeft, CheckCircle,
  Copy, FileText, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CitizenReport() {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', description: '',
    last_seen_location: '', contact_number: ''
  })
  const [photo, setPhoto]       = useState(null)
  const [preview, setPreview]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [caseResult, setCaseResult] = useState(null) // stores case ref after success
  const [copied, setCopied]     = useState(false)
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
    if (!photo) { alert('Please upload a photo'); return }

    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('photo', photo)

    try {
      const res = await api.post('/persons/add', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Build case reference from returned ID
      const year    = new Date().getFullYear()
      const caseRef = `FG-${year}-${String(res.data.id).padStart(4, '0')}`

      setCaseResult({
        caseRef,
        name: form.name,
        personId: res.data.id
      })
    } catch (err) {
      alert(err.response?.data?.detail || 'Error submitting report')
    } finally {
      setLoading(false)
    }
  }

  const copyRef = () => {
    navigator.clipboard.writeText(caseResult.caseRef)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Success screen ────────────────────────────────────────
  if (caseResult) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          {/* Success icon */}
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Report Submitted!</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your report for <strong>{caseResult.name}</strong> has been filed successfully.
            Police have been notified and surveillance is now active.
          </p>

          {/* Case reference box */}
          <div className="bg-blue-50 border-2 border-blue-200 border-dashed rounded-2xl p-6 mb-6">
            <p className="text-xs text-blue-500 font-medium uppercase tracking-wider mb-2">
              Your Case Reference Number
            </p>
            <p className="text-3xl font-bold font-mono text-blue-700 mb-3 tracking-wider">
              {caseResult.caseRef}
            </p>
            <button
              onClick={copyRef}
              className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              {copied
                ? <><CheckCircle size={14} /> Copied!</>
                : <><Copy size={14} /> Copy Reference</>}
            </button>
          </div>

          {/* Important note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-yellow-800 mb-1">
              Important — Save this number!
            </p>
            <p className="text-xs text-yellow-700 leading-relaxed">
              Use this reference number to track the status of your case anytime.
              Screenshot this page or write it down. You cannot recover it if lost.
            </p>
          </div>

          {/* What happens next */}
          <div className="text-left mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">What happens next?</p>
            <div className="space-y-2.5">
              {[
                { step: '1', text: 'Police officers have been notified of your report' },
                { step: '2', text: 'AI cameras will actively scan for this person'     },
                { step: '3', text: 'You will be contacted if a match is found'         },
                { step: '4', text: 'Use your case ref to track progress anytime'       },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </div>
                  <p className="text-xs text-gray-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            <Link
              to="/citizen/track"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              <FileText size={15} />
              Track This Case
              <ChevronRight size={14} />
            </Link>
            <button
              onClick={() => {
                setCaseResult(null)
                setForm({ name:'', age:'', gender:'', description:'', last_seen_location:'', contact_number:'' })
                setPhoto(null)
                setPreview(null)
              }}
              className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Report form ───────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Missing Person</h1>
          <p className="text-gray-400 text-sm">Fill all details carefully — a case reference will be generated</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Photo upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Photo <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => document.getElementById('photo-input').click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="preview"
                    className="w-32 h-32 object-cover rounded-xl shadow" />
                  <p className="text-xs text-gray-400">Click to change photo</p>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Clear face photo required for AI recognition • JPG, PNG
                  </p>
                </>
              )}
            </div>
            <input id="photo-input" type="file" accept="image/*"
              className="hidden" onChange={handlePhoto} />
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
                value={form.contact_number}
                onChange={e => set('contact_number', e.target.value)} />
            </div>
          </div>

          {/* Last seen */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Last Seen Location</label>
            <input placeholder="e.g. Chandpole Gate, Jaipur"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.last_seen_location}
              onChange={e => set('last_seen_location', e.target.value)} />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea rows={3} placeholder="Clothing worn, identifying marks, circumstances..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs text-blue-600 font-medium mb-1">
              A unique case reference number will be generated after submission
            </p>
            <p className="text-xs text-blue-500">
              Save this number to track your case status anytime from the Track Case page.
            </p>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? 'Submitting report...' : 'Submit Missing Person Report'}
          </button>
        </form>
      </div>
    </div>
  )
}