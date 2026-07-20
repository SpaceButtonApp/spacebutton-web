import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: 'SpaceButton Admin',
  description: 'SpaceButton Administration Dashboard',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
