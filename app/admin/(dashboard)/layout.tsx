'use client'
// This layout is kept as a simple pass-through.
// Auth checking and sidebar rendering are handled by AdminApp in app/admin/page.tsx.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
