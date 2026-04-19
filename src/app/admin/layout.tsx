'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, useSidebar } from './_components/SidebarContext'
import { ThemeProvider } from './_components/ThemeContext'
import AdminSidebar from './_components/AdminSidebar'
import AdminHeader from './_components/AdminHeader'

const AdminContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar()

  return (
    <div className="min-h-full xl:flex">
      <AdminSidebar />

      {/* Backdrop mobile */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isExpanded || isHovered ? 'lg:ml-[260px]' : 'lg:ml-[72px]'}`}>
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 bg-gray-50 dark:bg-gray-950 min-h-0">
          <div className="mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') router.replace('/connexion')
        else setChecked(true)
      })
      .catch(() => router.replace('/connexion'))
  }, [router])

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
