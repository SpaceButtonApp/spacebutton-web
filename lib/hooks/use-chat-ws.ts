'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/lib/store'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
// WebSocket lives at the root host (no /api/v1 prefix on that router)
const WS_BASE = API_BASE
  .replace('/api/v1', '')
  .replace('https://', 'wss://')
  .replace('http://', 'ws://')

export type WsChatEvent =
  | { type: 'message'; sender_id: string; content: string; chat_id: string }
  | { type: 'typing'; user_id: string; is_typing: boolean }
  | { type: 'read_receipt'; user_id: string }

export function useChatWs(chatId: string | null, onEvent: (e: WsChatEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const onEventRef = useRef(onEvent)
  useEffect(() => { onEventRef.current = onEvent })

  useEffect(() => {
    if (!chatId) return
    const { accessToken } = useAppStore.getState()
    if (!accessToken) return

    const ws = new WebSocket(`${WS_BASE}/ws/chat/${chatId}?token=${accessToken}`)
    wsRef.current = ws

    ws.onmessage = (e) => {
      try {
        onEventRef.current(JSON.parse(e.data) as WsChatEvent)
      } catch {}
    }
    ws.onerror = () => ws.close()
    ws.onclose = () => { wsRef.current = null }

    return () => { ws.close() }
  }, [chatId])

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return {
    wsMessage: useCallback((content: string) => send({ type: 'message', content }), [send]),
    wsTyping: useCallback((isTyping: boolean) => send({ type: 'typing', is_typing: isTyping }), [send]),
    wsRead: useCallback(() => send({ type: 'read' }), [send]),
  }
}
