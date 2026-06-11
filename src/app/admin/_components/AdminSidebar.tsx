'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from './SidebarContext'
import WogGuide from './WogGuide'

type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string }[]
}

const GridIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
const ListIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
const BoxIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
const CollectionIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 7h18M3 12h18M3 17h18"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
const PieIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21.21 15.89A10 10 0 118 2.83"/><path d="M22 12A10 10 0 0012 2v10z"/></svg>
const TableIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
const TaskIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
const NoteIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
const DotsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>
const ChevronDown = ({ className = '' }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Vue d'ensemble", subItems: [{ name: 'Dashboard', path: '/admin' }] },
  { icon: <ListIcon />, name: 'Commandes', path: '/admin/commandes' },
  { icon: <BoxIcon />, name: 'Produits', path: '/admin/produits' },
  { icon: <CollectionIcon />, name: 'Collections', path: '/admin/collections' },
  { icon: <UserIcon />, name: 'Utilisateurs', path: '/admin/utilisateurs' },
]

const othersItems: NavItem[] = [
  { icon: <PieIcon />, name: 'Analyse', subItems: [
    { name: 'Rapports', path: '/admin/crm' },
    { name: 'Statistiques', path: '/admin/crm' },
  ]},
  { icon: <TableIcon />, name: 'CRM', subItems: [
    { name: 'Contacts & E-mails', path: '/admin/crm' },
    { name: 'Campagnes', path: '/admin/crm' },
  ]},
  { icon: <TaskIcon />, name: 'Tâches', path: '/admin/taches' },
  { icon: <NoteIcon />, name: 'Post-it', path: '/admin/taches' },
  { icon: <SettingsIcon />, name: 'Paramètres', subItems: [
    { name: 'Mon compte', path: '/admin/utilisateurs' },
    { name: 'Gestion utilisateurs', path: '/admin/utilisateurs' },
  ]},
]

const AdminSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar()
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<{ type: 'main' | 'others'; index: number } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isActive = useCallback((path: string) => pathname === path, [pathname])

  useEffect(() => {
    let matched = false
    ;(['main', 'others'] as const).forEach(type => {
      const items = type === 'main' ? navItems : othersItems
      items.forEach((nav, index) => {
        nav.subItems?.forEach(sub => {
          if (isActive(sub.path)) { setOpenSubmenu({ type, index }); matched = true }
        })
      })
    })
    if (!matched) setOpenSubmenu(null)
  }, [pathname, isActive])

  useEffect(() => {
    if (openSubmenu) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) setSubMenuHeight(prev => ({ ...prev, [key]: subMenuRefs.current[key]?.scrollHeight || 0 }))
    }
  }, [openSubmenu])

  const toggle = (index: number, type: 'main' | 'others') => {
    setOpenSubmenu(prev => prev?.type === type && prev.index === index ? null : { type, index })
  }

  const show = isExpanded || isHovered || isMobileOpen

  const renderItems = (items: NavItem[], type: 'main' | 'others') => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => {
        const key = `${type}-${index}`
        const isOpen = openSubmenu?.type === type && openSubmenu.index === index
        const activeClass = 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
        const inactiveClass = 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button onClick={() => toggle(index, type)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isOpen ? activeClass : inactiveClass} ${!show ? 'justify-center' : 'justify-start'}`}>
                <span className="flex-shrink-0">{nav.icon}</span>
                {show && <><span className="flex-1 text-left">{nav.name}</span><ChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} /></>}
              </button>
            ) : nav.path ? (
              <Link href={nav.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(nav.path) ? activeClass : inactiveClass} ${!show ? 'justify-center' : ''}`}>
                <span className="flex-shrink-0">{nav.icon}</span>
                {show && <span>{nav.name}</span>}
              </Link>
            ) : null}

            {nav.subItems && show && (
              <div ref={el => { subMenuRefs.current[key] = el }}
                className="overflow-hidden transition-all duration-300"
                style={{ height: isOpen ? `${subMenuHeight[key] || 0}px` : '0px' }}>
                <ul className="mt-1 ml-9 space-y-0.5">
                  {nav.subItems.map(sub => (
                    <li key={sub.name}>
                      <Link href={sub.path}
                        className={`block px-3 py-1.5 rounded-lg text-theme-sm transition-colors ${isActive(sub.path) ? 'text-brand-600 font-medium dark:text-brand-400' : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90'}`}>
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <aside
      className={`hidden lg:fixed lg:flex flex-col top-0 left-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full transition-all duration-300 ease-in-out z-50
        ${isExpanded || isHovered ? 'lg:w-[260px]' : 'lg:w-[72px]'}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>

      {/* Logo */}
      <div className={`flex items-center py-6 px-4 border-b border-gray-100 dark:border-gray-800 ${!show ? 'justify-center' : 'gap-2.5'}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500 text-white font-black text-sm flex items-center justify-center">W</div>
        {show && (
          <div>
            <span className="text-base font-black text-gray-800 dark:text-white/90 uppercase tracking-tight">WOG</span>
            <p className="text-theme-xs text-gray-400 dark:text-gray-500 -mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
        <div>
          {show && <p className="mb-2 px-3 text-theme-xs font-semibold uppercase text-gray-400 dark:text-gray-600 tracking-wider">Principal</p>}
          {!show && <div className="flex justify-center mb-2"><DotsIcon /></div>}
          {renderItems(navItems, 'main')}
        </div>
        <div>
          {show && <p className="mb-2 px-3 text-theme-xs font-semibold uppercase text-gray-400 dark:text-gray-600 tracking-wider">Outils & Accès</p>}
          {!show && <div className="flex justify-center mb-2"><DotsIcon /></div>}
          {renderItems(othersItems, 'others')}
        </div>
      </div>

      {/* Guide CRM en bas */}
      {show && (
        <div className="py-4 px-3 border-t border-gray-100 dark:border-gray-800">
          <WogGuide />
        </div>
      )}
    </aside>
  )
}

export default AdminSidebar
