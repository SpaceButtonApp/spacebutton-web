import { DesktopSidebar } from '@/components/desktop-sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopSidebar />
      <div className="md:ml-[40vw]">
        {children}
      </div>
    </>
  )
}
