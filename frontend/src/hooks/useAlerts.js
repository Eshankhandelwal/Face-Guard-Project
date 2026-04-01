import { useEffect, useRef, useCallback } from 'react'

export function useAlerts(onAlert) {
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const manualClose = useRef(false)

  const connect = useCallback(() => {
    const token = localStorage.getItem('token')
    if (!token) return  // ← Don't connect if not logged in

    const ws = new WebSocket('ws://localhost:8000/ws/alerts')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected to alert stream')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'NEW_ALERT') {
          onAlert(data)
        }
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = () => {
      if (manualClose.current) return  // ← Don't reconnect if we closed it
      console.log('[WS] Disconnected — reconnecting in 3s...')
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [onAlert])

  useEffect(() => {
    manualClose.current = false
    connect()

    return () => {
      manualClose.current = true  // ← Mark as intentional close
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])
}