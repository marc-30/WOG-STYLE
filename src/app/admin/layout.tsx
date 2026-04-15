'use client'
/**
 * Admin layout — full-screen overlay (z-9999) couvrant le layout WOG store.
 * Gère sidebar collapsible + header + ThemeProvider + SidebarProvider.
 */

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        {/* Full-screen overlay covering WOG header/footer */}
        <div className="fixed inset-0 z-[9999] overflow-auto bg-gray-50 dark:bg-gray-950 font-sans">
          <AdminContent>{children}</AdminContent>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}
