import { useEffect, useState } from 'react'
import api from '../api/client'
import { Package, Plus, MapPin, Phone, Tag, X } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Documents', 'Wallet/Purse', 'Jewelry', 'Clothing', 'Keys', 'Other']

export default function LostItems() {
  const [items, setItems]       = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [photo, setPhoto]       = useState(null)
  const [form, setForm] = useState({
    name: '', description: '', category: '', last_seen_location: '', contact_number: ''
  })

  const load = () => api.get('/items').then(r => setItems(r.data))
  useEffect(() => { load() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
    if (photo) fd.append('photo', photo)

    try {
      await api.post('/items/add', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      await load()
      setShowForm(false)
      setForm({ name: '', description: '', category: '', last_seen_location: '', contact_number: '' })
      setPhoto(null)
    } catch {
      alert('Error reporting item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost Items</h1>
          <p className="text-gray-400 text-sm">{items.length} item(s) reported</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={15} />
          Report Lost Item
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg text-gray-900">Report Lost Item</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Item Name *</label>
                  <input required placeholder="e.g. Black wallet"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Last Seen Location</label>
                  <input placeholder="Where was it last seen?"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.last_seen_location} onChange={e => set('last_seen_location', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Contact Number</label>
                  <input placeholder="+91 XXXXXXXXXX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.contact_number} onChange={e => set('contact_number', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea rows={2} placeholder="Any identifying details..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Photo (optional)</label>
                <input type="file" accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700"
                  onChange={e => setPhoto(e.target.files[0])} />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <Package size={48} className="mx-auto mb-3" />
          <p className="text-gray-400">No items reported yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Package size={28} className="text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    item.status === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-2 space-y-1">
                  {item.category && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Tag size={10} />{item.category}
                    </div>
                  )}
                  {item.last_seen_location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin size={10} />{item.last_seen_location}
                    </div>
                  )}
                  {item.contact_number && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone size={10} />{item.contact_number}
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}