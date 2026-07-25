'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supportApi, type Ticket, type TicketMessage, type TicketDetail } from '@/lib/api/support'

export interface TicketState {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  detail: TicketDetail | null
  detailLoading: boolean
  sending: boolean
}

const POLL_INTERVAL_LIST = 10_000   // refresh ticket list every 10s
const POLL_INTERVAL_DETAIL = 6_000  // refresh open ticket messages every 6s

export function useTickets() {
  const [state, setState] = useState<TicketState>({
    tickets: [],
    loading: true,
    error: null,
    detail: null,
    detailLoading: false,
    sending: false,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedIdRef = useRef<string | null>(null)
  selectedIdRef.current = selectedId

  // ── Load ticket list ─────────────────────────────────────────────────────

  const loadTickets = useCallback(async () => {
    try {
      const data = await supportApi.getTickets()
      setState(prev => ({ ...prev, tickets: data.tickets, loading: false, error: null }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load tickets',
      }))
    }
  }, [])

  useEffect(() => {
    loadTickets()
    const t = setInterval(loadTickets, POLL_INTERVAL_LIST)
    return () => clearInterval(t)
  }, [loadTickets])

  // ── Load ticket detail ───────────────────────────────────────────────────

  const loadDetail = useCallback(async (ticketId: string) => {
    setState(prev => ({ ...prev, detailLoading: true }))
    try {
      const detail = await supportApi.getTicketDetail(ticketId)
      // Only update if this ticket is still selected
      if (selectedIdRef.current === ticketId) {
        setState(prev => ({ ...prev, detail, detailLoading: false }))
      }
    } catch {
      setState(prev => ({ ...prev, detailLoading: false }))
    }
  }, [])

  useEffect(() => {
    if (!selectedId) { setState(prev => ({ ...prev, detail: null })); return }
    loadDetail(selectedId)
    const t = setInterval(() => {
      if (selectedIdRef.current) loadDetail(selectedIdRef.current)
    }, POLL_INTERVAL_DETAIL)
    return () => clearInterval(t)
  }, [selectedId, loadDetail])

  // ── Actions ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (ticketId: string, text: string) => {
    setState(prev => ({ ...prev, sending: true }))
    try {
      const msg = await supportApi.sendReply(ticketId, text)
      setState(prev => {
        if (!prev.detail || prev.detail.ticket.id !== ticketId) return { ...prev, sending: false }
        return {
          ...prev,
          sending: false,
          detail: { ...prev.detail, messages: [...prev.detail.messages, msg] },
        }
      })
      // Also refresh ticket list so last_message updates
      loadTickets()
    } catch (err) {
      setState(prev => ({ ...prev, sending: false }))
      throw err
    }
  }, [loadTickets])

  const sendAdminMessage = useCallback(async (ticketId: string, text: string) => {
    setState(prev => ({ ...prev, sending: true }))
    try {
      const msg = await supportApi.sendAdminReply(ticketId, text)
      setState(prev => {
        if (!prev.detail || prev.detail.ticket.id !== ticketId) return { ...prev, sending: false }
        return {
          ...prev,
          sending: false,
          detail: { ...prev.detail, admin_messages: [...prev.detail.admin_messages, msg] },
        }
      })
    } catch (err) {
      setState(prev => ({ ...prev, sending: false }))
      throw err
    }
  }, [])

  const escalateTicket = useCallback(async (ticketId: string) => {
    try {
      const updated = await supportApi.escalate(ticketId)
      setState(prev => {
        const tickets = prev.tickets.map(t => t.id === ticketId ? updated : t)
        const detail = prev.detail?.ticket.id === ticketId
          ? { ...prev.detail, ticket: updated }
          : prev.detail
        return { ...prev, tickets, detail }
      })
    } catch (err) {
      throw err
    }
  }, [])

  const resolveTicket = useCallback(async (ticketId: string) => {
    try {
      const updated = await supportApi.updateStatus(ticketId, 'resolved')
      setState(prev => {
        const tickets = prev.tickets.map(t => t.id === ticketId ? updated : t)
        const detail = prev.detail?.ticket.id === ticketId
          ? { ...prev.detail, ticket: updated }
          : prev.detail
        return { ...prev, tickets, detail }
      })
    } catch (err) {
      throw err
    }
  }, [])

  const selectTicket = useCallback((id: string | null) => {
    setSelectedId(id)
  }, [])

  const claimTicket = useCallback(async (ticketId: string) => {
    const updated = await supportApi.claimTicket(ticketId)
    setState(prev => {
      const tickets = prev.tickets.map(t => t.id === ticketId ? updated : t)
      const detail = prev.detail?.ticket.id === ticketId
        ? { ...prev.detail, ticket: updated }
        : prev.detail
      return { ...prev, tickets, detail }
    })
    return updated
  }, [])

  const unclaimTicket = useCallback(async (ticketId: string) => {
    const updated = await supportApi.unclaimTicket(ticketId)
    setState(prev => {
      const tickets = prev.tickets.map(t => t.id === ticketId ? updated : t)
      const detail = prev.detail?.ticket.id === ticketId
        ? { ...prev.detail, ticket: updated }
        : prev.detail
      return { ...prev, tickets, detail }
    })
    return updated
  }, [])

  return {
    ...state,
    selectedId,
    selectTicket,
    sendMessage,
    sendAdminMessage,
    escalateTicket,
    resolveTicket,
    claimTicket,
    unclaimTicket,
    refresh: loadTickets,
  }
}
