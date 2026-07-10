import { DesktopSidebar } from '@/components/desktop-sidebar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopSidebar />
      <div className="md:ml-[240px]">
        <div className="md:max-w-3xl">
          {children}
        </div>
      </div>
    </>
  )
}
