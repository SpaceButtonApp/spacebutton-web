import type { Metadata } from 'next'
import './support.css'
import './chat.css'
import '../admin/admin.css'

export const metadata: Metadata = {
  title: 'SpaceButton Support',
  description: 'SpaceButton support agent portal',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
