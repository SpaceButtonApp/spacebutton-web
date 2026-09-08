import { DesktopSidebar } from '@/components/desktop-sidebar'
import { VisitTracker } from '@/components/visit-tracker'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitTracker />
      <DesktopSidebar />
      <div className="md:ml-[25vw]">
        {children}
      </div>
    </>
  )
}
