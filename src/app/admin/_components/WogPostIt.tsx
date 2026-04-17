'use client'
import { useState, useEffect } from 'react'

type PostItColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'

interface PostIt {
  id: string; contenu: string; couleur: PostItColor; createdAt: string
}

const BG: Record<PostItColor, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-500/10',
  blue:   'bg-blue-100 dark:bg-blue-500/10',
  green:  'bg-green-100 dark:bg-green-500/10',
  pink:   'bg-pink-100 dark:bg-pink-500/10',
  purple: 'bg-purple-100 dark:bg-purple-500/10',
}
const BORDER: Record<PostItColor, string> = {
  yellow: 'border-yellow-200 dark:border-yellow-500/20',
  blue:   'border-blue-200 dark:border-blue-500/20',
  green:  'border-green-200 dark:border-green-500/20',
  pink:   'border-pink-200 dark:border-pink-500/20',
  purple: 'border-purple-200 dark:border-purple-500/20',
}
const TEXT: Record<PostItColor, string> = {
  yellow: 'text-yellow-700 dark:text-yellow-400',
  blue:   'text-blue-700 dark:text-blue-400',
  green:  'text-green-700 dark:text-green-400',
  pink:   'text-pink-700 dark:text-pink-400',
  purple: 'text-purple-700 dark:text-purple-400',
}
const COLORS: PostItColor[] = ['yellow', 'blue', 'green', 'pink', 'purple']

export default function WogPostIt() {
  const [postits, setPostits] = useState<PostIt[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [couleur, setCouleur] = useState<PostItColor>('yellow')

  const fetchPostits = () => {
    fetch('/api/admin/postits')
      .then(r => r.ok ? r.json() : { postits: [] })
      .then(d => setPostits(d.postits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPostits() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const res = await fetch('/api/admin/postits', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: text, couleur }),
    })
    if (res.ok) { fetchPostits(); setText('') }
  }

  const handleDelete = async (id: string) => {
    setPostits(prev => prev.filter(p => p.id !== id))
    await fetch(`/api/admin/postits/${id}`, { method: 'DELETE' })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Post-it</h3>
        <p className="text-theme-xs text-gray-500 dark:text-gray-400 mt-0.5">{postits.length} note{postits.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <form onSubmit={handleAdd} className="space-y-2">
          <textarea
            placeholder="Ajouter une note..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 resize-none"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setCouleur(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${couleur === c ? 'scale-125' : ''} ${BORDER[c]} ${BG[c]}`}
                  title={c} />
              ))}
            </div>
            <button type="submit" disabled={!text.trim()}
              className="rounded-lg bg-brand-500 px-3 py-1.5 text-theme-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
              Ajouter
            </button>
          </div>
        </form>
      </div>

      <div className="p-4 max-h-72 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        ) : postits.length === 0 ? (
          <p className="text-center text-theme-sm text-gray-400 dark:text-gray-500 py-6">Aucune note pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {postits.map(p => (
              <div key={p.id} className={`relative p-3 rounded-xl border group ${BG[p.couleur as PostItColor] ?? BG.yellow} ${BORDER[p.couleur as PostItColor] ?? BORDER.yellow}`}>
                <p className={`text-theme-xs leading-relaxed break-words ${TEXT[p.couleur as PostItColor] ?? TEXT.yellow}`}>
                  {p.contenu}
                </p>
                <p className="text-[10px] text-gray-400 mt-2">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</p>
                <button onClick={() => handleDelete(p.id)}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-900/80 text-gray-400 hover:text-error-500 transition-all shadow-sm">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
