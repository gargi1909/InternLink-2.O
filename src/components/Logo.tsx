import { Link } from 'react-router-dom'
import { Link2 } from 'lucide-react'

export default function Logo({ size = 'md', to = '/' }: { size?: 'sm' | 'md' | 'lg'; to?: string }) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', iconSize: 15 },
    md: { icon: 'w-9 h-9', text: 'text-xl', iconSize: 18 },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', iconSize: 24 },
  }
  const s = sizes[size]
  return (
    <Link to={to} className="flex items-center gap-2.5 font-bold">
      <div className={`${s.icon} bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0`}>
        <Link2 size={s.iconSize} strokeWidth={2.5} />
      </div>
      <span className={`${s.text} text-gray-900 dark:text-white tracking-tight`}>
        Intern<span className="text-brand-600">Link</span>
      </span>
    </Link>
  )
}
