'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  MessageSquare, 
  CreditCard,
  Star,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const menuItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Listings', href: '/admin/listings', icon: Building2 },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
  { label: 'Transactions', href: '/admin/transactions', icon: CreditCard },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin-auth')
    router.push('/admin/login')
  }

  return (
    <>
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-foreground">SpaceButton</h1>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary/20 text-primary" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                    {isActive && !collapsed && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-secondary border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
            <div className="w-14 h-14 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">Log Out?</h3>
            <p className="text-muted-foreground text-sm text-center mb-6">
              Are you sure you want to log out of your admin account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 bg-secondary hover:bg-accent text-foreground rounded-xl transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-xl transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
