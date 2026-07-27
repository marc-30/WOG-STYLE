'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { SidebarProvider, useSidebar } from './_components/SidebarContext'
import { ThemeProvider } from './_components/ThemeContext'
import AdminSidebar from './_components/AdminSidebar'
import AdminHeader from './_components/AdminHeader'
import AdminBottomNav from './_components/AdminBottomNav'

const AdminContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered } = useSidebar()

  return (
    <div className="min-h-full xl:flex">
      {/* Sidebar : desktop uniquement */}
      <AdminSidebar />

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[72px]'}`}>
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-0 pb-20 lg:pb-6">
          <div className="mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom nav : mobile uniquement */}
      <AdminBottomNav />
    </div>
  )
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isSetupPage = pathname === '/admin/setup'
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (isSetupPage) return
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || (data.user.role !== 'ADMIN' && data.user.role !== 'SUPER_ADMIN')) router.replace('/connexion')
        else setChecked(true)
      })
      .catch(() => router.replace('/connexion'))
  }, [router, isSetupPage])

  // /admin/setup doit rester accessible sans compte existant (création du tout premier admin).
  if (isSetupPage) return <>{children}</>

  if (!checked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }
  return <>{children}</>
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <ThemeProvider>
        <SidebarProvider>
          <div className="fixed inset-0 z-[9999] overflow-auto bg-gray-50 dark:bg-gray-950 font-sans">
            <AdminContent>{children}</AdminContent>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </AdminAuthGuard>
  )
}
