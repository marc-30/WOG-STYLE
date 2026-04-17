'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSidebar } from './SidebarContext'
import { useTheme } from './ThemeContext'
import { clearAuthUser } from '@/hooks/useAuth'

interface AdminUser { prenom: string; nom: string; email: string | null; role: string }

const AdminHeader: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => { if (data.user) setUser(data.user) })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuthUser()
    router.push('/connexion')
  }

  const initiales = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'AD'

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) toggleSidebar()
    else toggleMobileSidebar()
  }

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-1 items-center justify-between px-4 py-3 sm:px-6">

        {/* Left: toggle + logo mobile */}
        <div className="flex items-center gap-3">
          <button onClick={handleToggle}
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-lg border border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            {isMobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            ) : (
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><path fillRule="evenodd" d="M0 1a1 1 0 011-1h16a1 1 0 010 2H1a1 1 0 01-1-1zm0 5a1 1 0 011-1h16a1 1 0 010 2H1a1 1 0 01-1-1zm0 5a1 1 0 011-1h9a1 1 0 010 2H1a1 1 0 01-1-1z" fill="currentColor"/></svg>
            )}
          </button>

          <Link href="/admin" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-500 text-white font-black text-sm flex items-center justify-center">W</div>
            <span className="text-base font-black text-gray-800 dark:text-white/90 uppercase tracking-tight">WOG</span>
          </Link>
        </div>

        {/* Right: theme + notif + user */}
        <div className="flex items-center gap-2">

          {/* Retour au site */}
          <Link href="/" target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-theme-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Voir le site
          </Link>

          {/* Dark mode */}
          <button onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 text-gray-500 rounded-full border border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(o => !o); setDropdownOpen(false) }}
              className="relative flex items-center justify-center w-10 h-10 text-gray-500 rounded-full border border-gray-200 hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-800 dark:text-white/90">Notifications</h5>
                  <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <p className="text-theme-sm text-gray-400 dark:text-gray-500 text-center py-4">Aucune nouvelle notification.</p>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false) }}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
              <div className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {initiales}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90 leading-tight">
                  {user ? `${user.prenom} ${user.nom}` : 'Admin'}
                </p>
                <p className="text-theme-xs text-gray-400 dark:text-gray-500 leading-tight">{user?.email || 'Administrateur'}</p>
              </div>
              <svg className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 p-2 z-50">
                <div className="px-3 py-2 mb-1">
                  <p className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">{user ? `${user.prenom} ${user.nom}` : 'Administrateur'}</p>
                  <p className="text-theme-xs text-gray-400 dark:text-gray-500">{user?.email || ''}</p>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-1">
                  <Link href="/admin/utilisateurs" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-theme-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Mon profil
                  </Link>
                  <Link href="/" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-theme-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Retour au site
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-theme-sm text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
