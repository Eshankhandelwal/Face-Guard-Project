import { useState, useRef, useCallback } from 'react'
import {
  Upload, Search, X, Camera, User,
  MapPin, Phone, CheckCircle, AlertCircle,
  ZoomIn, ChevronDown, ChevronUp, FileImage
} from 'lucide-react'

export default function PhotoSearch() {
  const [photo, setPhoto]         = useState(null)
  const [preview, setPreview]     = useState(null)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')
  const [showAll, setShowAll]     = useState(false)
  const [enlarged, setEnlarged]   = useState(null)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [])

  const handleSearch = async () => {
    if (!photo) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const token = localStorage.getItem('token')
      const fd    = new FormData()
      fd.append('photo', photo)

      const res = await fetch('/api/persons/search-by-photo', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    fd
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Search failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to search. Check backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPhoto(null)
    setPreview(null)
    setResult(null)
    setError('')
    setShowAll(false)
  }

  const confidenceColor = (c) => {
    if (c >= 85) return { bar: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-800 border-red-200'       }
    if (c >= 70) return { bar: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    if (c >= 50) return { bar: 'bg-blue-400',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-800 border-blue-200'     }
    return              { bar: 'bg-gray-300',   text: 'text-gray-500',   badge: 'bg-gray-100 text-gray-600 border-gray-200'     }
  }

  const displayResults = showAll
    ? result?.all_results
    : result?.matches?.length > 0
    ? result.matches
    : result?.all_results?.slice(0, 3)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Search</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Upload any photo to instantly search the missing persons database
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">

        {/* Left panel — upload */}
        <div className="col-span-2 space-y-4">

          {/* Upload zone */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileImage size={16} className="text-blue-500" />
              Upload Photo
            </h3>

            {/* Drop zone */}
            <div
              onClick={() => !preview && fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${
                dragOver
                  ? 'border-blue-400 bg-blue-50'
                  : preview
                  ? 'border-gray-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              style={{ minHeight: '220px' }}>

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Search photo"
                    className="w-full object-cover rounded-xl"
                    style={{ maxHeight: '260px' }}
                  />
                  {/* Overlay buttons */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setEnlarged(preview) }}
                      className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg transition-colors">
                      <ZoomIn size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); reset() }}
                      className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-lg transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-xl">
                    <p className="text-white text-xs font-medium truncate">{photo?.name}</p>
                    <button
                      onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
                      className="text-blue-300 text-xs hover:text-blue-200 mt-0.5">
                      Change photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center h-full absolute inset-0">
                  <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <Upload size={28} className="text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop photo here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG supported • Any photo with a face
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={!photo || loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing face...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search Database
                </>
              )}
            </button>

            {/* Reset */}
            {(photo || result) && (
              <button
                onClick={reset}
                className="mt-2 w-full border border-gray-200 text-gray-500 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Clear & Start Over
              </button>
            )}
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">How it works</h3>
            <div className="space-y-3">
              {[
                { step:'1', title:'Upload any photo',   desc:'CCTV screenshot, mobile photo, or any image with a face'   },
                { step:'2', title:'AI extracts face',   desc:'DeepFace detects and encodes the face into a unique vector'  },
                { step:'3', title:'Database compared',  desc:'Compared against all missing persons with face data'         },
                { step:'4', title:'Results ranked',     desc:'Matches sorted by confidence percentage — highest first'     },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence guide */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Confidence Guide</h3>
            <div className="space-y-2.5">
              {[
                { color:'bg-red-500',    label:'85% and above',  desc:'Strong match — high probability'    },
                { color:'bg-yellow-400', label:'70% – 84%',      desc:'Possible match — needs review'      },
                { color:'bg-blue-400',   label:'50% – 69%',      desc:'Weak similarity — unlikely match'   },
                { color:'bg-gray-300',   label:'Below 50%',      desc:'No significant match'               },
              ].map(({ color, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                  <div>
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — results */}
        <div className="col-span-3">

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 text-sm">Search Failed</p>
                <p className="text-red-600 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!result && !loading && !error && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center"
              style={{ minHeight: '420px' }}>
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <Camera size={40} className="text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-2">No search yet</h3>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Upload a photo on the left and click
                "Search Database" to find matching
                missing persons
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center"
              style={{ minHeight: '420px' }}>
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Search size={18} className="text-blue-600" />
                </div>
              </div>
              <p className="font-semibold text-gray-800">Analyzing photo...</p>
              <p className="text-gray-400 text-sm mt-1">DeepFace is extracting facial features</p>
              <div className="mt-4 space-y-1.5 text-xs text-gray-400">
                <p>Detecting face in image</p>
                <p>Generating 128-dimension encoding</p>
                <p>Comparing against database...</p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <div className="space-y-4">

              {/* Summary bar */}
              <div className={`rounded-2xl border p-4 flex items-center gap-4 ${
                result.matches_found > 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
                {result.matches_found > 0
                  ? <AlertCircle size={22} className="text-red-600 flex-shrink-0" />
                  : <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
                }
                <div className="flex-1">
                  <p className={`font-bold text-sm ${
                    result.matches_found > 0 ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {result.matches_found > 0
                      ? `${result.matches_found} match${result.matches_found > 1 ? 'es' : ''} found!`
                      : 'No strong matches found'}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    result.matches_found > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    Searched {result.total_searched} missing person{result.total_searched !== 1 ? 's' : ''} in database
                  </p>
                </div>
                {result.matches_found > 0 && (
                  <div className="bg-red-600 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    {result.matches_found}
                  </div>
                )}
              </div>

              {/* No results tip */}
              {result.matches_found === 0 && result.total_searched > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Tips for better results</p>
                  <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Use a clear, well-lit photo with a visible face</li>
                    <li>Avoid photos with sunglasses, masks, or heavy filters</li>
                    <li>Front-facing photos work best</li>
                    <li>The person may not be in the database yet</li>
                  </ul>
                </div>
              )}

              {/* No persons in DB */}
              {result.total_searched === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                  <User size={32} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">No persons in database</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Add missing persons with photos first for face search to work
                  </p>
                </div>
              )}

              {/* Result cards */}
              {displayResults && displayResults.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                      {result.matches_found > 0
                        ? `Matches (${result.matches_found})`
                        : 'Closest results (no strong match)'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sorted by confidence
                    </p>
                  </div>

                  {displayResults.map((person, i) => {
                    const cc = confidenceColor(person.confidence)
                    return (
                      <div key={person.person_id}
                        className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                          person.is_match
                            ? 'border-red-200 ring-1 ring-red-100'
                            : 'border-gray-100'
                        }`}>
                        <div className="flex gap-4 p-4">

                          {/* Rank badge */}
                          <div className="flex-shrink-0 flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              i === 0 && person.is_match
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                              #{i + 1}
                            </div>
                          </div>

                          {/* Person photo */}
                          {person.photo_url ? (
                            <div className="relative flex-shrink-0">
                              <img
                                src={person.photo_url}
                                alt={person.name}
                                className={`w-16 h-16 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                                  person.is_match ? 'ring-2 ring-red-400' : 'ring-1 ring-gray-200'
                                }`}
                                onClick={() => setEnlarged(person.photo_url)}
                              />
                              <div className="absolute -top-1 -right-1">
                                <ZoomIn size={12} className="text-gray-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-2xl font-bold text-gray-300">
                                {person.name?.[0] ?? '?'}
                              </span>
                            </div>
                          )}

                          {/* Person details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{person.name}</h3>
                                <p className="text-xs text-gray-400">
                                  {person.age ? `${person.age} yrs` : 'Age N/A'} •{' '}
                                  {person.gender || 'Unknown'}
                                </p>
                              </div>

                              {/* Confidence badge */}
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cc.badge}`}>
                                  {person.confidence.toFixed(1)}% match
                                </span>
                                {person.is_match && (
                                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                                    MATCH
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Confidence bar */}
                            <div className="mt-2 mb-2">
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                  className={`${cc.bar} h-1.5 rounded-full transition-all`}
                                  style={{ width: `${Math.min(person.confidence, 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Info row */}
                            <div className="flex items-center gap-3 flex-wrap">
                              {person.last_seen_location && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin size={10} className="text-gray-400" />
                                  {person.last_seen_location}
                                </span>
                              )}
                              {person.contact_number && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone size={10} className="text-gray-400" />
                                  {person.contact_number}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                person.status === 'missing'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {person.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* Show all / less toggle */}
                  {result.all_results?.length > 3 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                      {showAll
                        ? <><ChevronUp size={14} /> Show less</>
                        : <><ChevronDown size={14} /> Show all {result.all_results.length} results</>
                      }
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enlarged photo modal */}
      {enlarged && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setEnlarged(null)}>
          <div className="relative max-w-lg w-full">
            <img
              src={enlarged}
              alt="Enlarged"
              className="w-full rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setEnlarged(null)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}