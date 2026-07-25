'use client'

import { useState, useCallback } from 'react'
import { tickets as initialTickets } from '@/lib/data/supportMockData'

type Message = { id: number; from: string; text: string; time: string }
type Ticket = typeof initialTickets[0]

function nowTime() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
}

const USER_REPLIES = [
  'Okay, I understand. Please get back to me soon.',
  'Thank you for your help!',
  'Alright, I will wait for your update.',
  'Got it. Please sort this out quickly.',
  'I appreciate your quick response.',
]

const ADMIN_REPLIES = [
  'I have noted this. Will investigate and respond shortly.',
  'Escalation received. Looking into it now.',
  'I can see the issue. I am working on a fix.',
  'Thanks for the escalation. Will resolve within 10 minutes.',
]

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)

  const sendMessage = useCallback((ticketId: string, text: string) => {
    const newMsg: Message = { id: Date.now(), from: 'agent', text, time: nowTime() }
    setTickets(prev => prev.map(t => t.id === ticketId
      ? { ...t, messages: [...t.messages, newMsg] }
      : t
    ))
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, from: 'user', text: USER_REPLIES[Math.floor(Math.random() * USER_REPLIES.length)], time: nowTime() }
      setTickets(prev => prev.map(t => t.id === ticketId
        ? { ...t, messages: [...t.messages, reply] }
        : t
      ))
    }, 1800 + Math.random() * 1200)
  }, [])

  const sendAdminMessage = useCallback((ticketId: string, text: string) => {
    const newMsg: Message = { id: Date.now(), from: 'agent', text, time: nowTime() }
    setTickets(prev => prev.map(t => t.id === ticketId
      ? { ...t, adminMessages: [...t.adminMessages, newMsg] }
      : t
    ))
    setTimeout(() => {
      const reply: Message = { id: Date.now() + 1, from: 'admin', text: ADMIN_REPLIES[Math.floor(Math.random() * ADMIN_REPLIES.length)], time: nowTime() }
      setTickets(prev => prev.map(t => t.id === ticketId
        ? { ...t, adminMessages: [...t.adminMessages, reply] }
        : t
      ))
    }, 2200 + Math.random() * 1500)
  }, [])

  const escalateTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, escalated: true } : t))
  }, [])

  const resolveTicket = useCallback((ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t))
  }, [])

  const resetTickets = useCallback(() => {
    setTickets(initialTickets)
  }, [])

  return { tickets, sendMessage, sendAdminMessage, escalateTicket, resolveTicket, resetTickets }
}
