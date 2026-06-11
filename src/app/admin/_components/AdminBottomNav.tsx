'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const GridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)
const BoxIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
  </svg>
)
const ListIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin',             icon: GridIcon },
  { name: 'Produits',  path: '/admin/produits',    icon: BoxIcon  },
  { name: 'Commandes', path: '/admin/commandes',   icon: ListIcon },
  { name: 'Équipe',    path: '/admin/utilisateurs', icon: UserIcon },
]

export default function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-stretch h-[62px]">
        {NAV_ITEMS.map(({ name, path, icon: Icon }) => {
          const active = pathname === path || (path !== '/admin' && pathname.startsWith(path))
          return (
            <Link
              key={name}
              href={path}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-b-full" />
              )}
              <Icon />
              <span className="text-[10px] font-semibold tracking-wide">{name}</span>
            </Link>
          )
        })}
      </div>
      {/* Safe area iOS */}
      <div className="h-safe-bottom bg-white dark:bg-gray-900" />
    </nav>
  )
}
