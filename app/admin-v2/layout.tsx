import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SpaceButton Admin',
  description: 'SpaceButton Administration Dashboard',
}

export default function AdminV2Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {children}
    </div>
  )
}
