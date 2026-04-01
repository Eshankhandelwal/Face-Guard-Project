import { useRef, useState, useCallback, useEffect } from 'react'
import api from '../api/client'
import { Camera, Play, Square, Upload, AlertCircle, CheckCircle, Scan } from 'lucide-react'

export default function CameraPage() {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const intervalRef = useRef(null)

  const [streaming, setStreaming] = useState(false)
  const [scanning,  setScanning]  = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [cameraId,  setCameraId]  = useState('CAM-01')
  const [location,  setLocation]  = useState('Main Gate')
  const [scanCount, setScanCount] = useState(0)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setStreaming(true)
      setError('')
    } catch {
      setError('❌ Camera access denied. Please click Allow when browser asks for camera permission.')
    }
  }

  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStreaming(false)
    setScanning(false)
  }

  const captureAndMatch = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video  = videoRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const fd = new FormData()
      fd.append('photo',     blob, 'capture.jpg')
      fd.append('camera_id', cameraId)
      fd.append('location',  location)

      try {
        const res = await api.post('/persons/match-face', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setResult(res.data)
        setScanCount(c => c + 1)
      } catch (err) {
        console.error('Match error:', err)
      }
    }, 'image/jpeg', 0.85)
  }, [cameraId, location])

  const startScanning = () => {
    setScanning(true)
    captureAndMatch()
    intervalRef.current = setInterval(captureAndMatch, 5000)
  }

  const stopScanning = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setScanning(false)
  }

  const uploadAndMatch = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fd = new FormData()
    fd.append('photo',     file)
    fd.append('camera_id', cameraId)
    fd.append('location',  location)

    setResult(null)
    try {
      const res = await api.post('/persons/match-face', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch {
      alert('Error processing image')
    }
  }

  useEffect(() => () => stopCamera(), [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Camera Surveillance</h1>
        <p className="text-gray-400 text-sm">Real-time face matching against missing persons database</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Camera Feed — takes 2/3 width */}
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video relative">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />

            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-3">
                <div className="bg-white/10 p-6 rounded-full">
                  <Camera size={40} className="opacity-60" />
                </div>
                <p className="text-sm text-white/60">Click "Start Camera" to begin</p>
              </div>
            )}

            {scanning && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                SCANNING • {scanCount} scans
              </div>
            )}

            {streaming && !scanning && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                <span className="w-2 h-2 bg-white rounded-full" />
                LIVE
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap">
            {!streaming ? (
              <button onClick={startCamera}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Play size={15} /> Start Camera
              </button>
            ) : (
              <>
                {!scanning ? (
                  <button onClick={startScanning}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                    <Scan size={15} /> Start Scanning
                  </button>
                ) : (
                  <button onClick={stopScanning}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                    <Square size={15} /> Stop Scanning
                  </button>
                )}
                <button onClick={stopCamera}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium">
                  <Square size={15} /> Stop Camera
                </button>
              </>
            )}

            <label className="flex items-center gap-2 border border-gray-300 text-gray-600 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload size={15} /> Upload Image
              <input type="file" accept="image/*" className="hidden" onChange={uploadAndMatch} />
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Panel — 1/3 width */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Camera Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Camera ID</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={cameraId} onChange={e => setCameraId(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Location</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
                📷 Auto-scans every 5 seconds when active. Each match creates an alert automatically.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Match Results</h3>

            {!result ? (
              <div className="text-center py-8 text-gray-300">
                <Scan size={32} className="mx-auto mb-2" />
                <p className="text-sm text-gray-400">No scan results yet</p>
              </div>
            ) : result.matches_found === 0 ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 p-3 rounded-lg">
                <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">No match found</p>
                  <p className="text-xs text-green-600">Person not in database</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <AlertCircle size={18} className="text-red-600" />
                  <p className="text-sm font-bold text-red-700">
                    {result.matches_found} match(es) found!
                  </p>
                </div>
                {result.alerts.map((a, i) => (
                  <div key={i} className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <p className="font-bold text-red-900 text-sm">{a.person_name}</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      Confidence: {a.confidence?.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Alert ID: #{a.alert_id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}