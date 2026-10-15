import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Logo from '@/components/Logo'
import { Moon, Sun, LayoutDashboard } from 'lucide-react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme, currentUser, loginAsDemo } = useApp()
  const navigate = useNavigate()

  const handleDemoAccess = () => {
    if (currentUser) {
      navigate(`/${currentUser.role}/dashboard`)
    } else {
      loginAsDemo('student')
      navigate('/student/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">Home</Link>
            <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">About</Link>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">Contact</Link>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-600 dark:text-gray-300">Login</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={handleDemoAccess} className="btn-primary text-sm hidden sm:flex">
              <LayoutDashboard size={16} /> {currentUser ? 'Dashboard' : 'Demo Mode'}
            </button>
            <Link to="/register" className="btn-secondary text-sm hidden sm:flex">Get Started</Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white font-bold">IL</div>
              <span className="text-lg font-bold text-white">InternLink</span>
            </div>
            <p className="text-sm">Connecting Students, Colleges & Companies for seamless internship management.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/register" className="hover:text-white">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Users</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white">Student Login</Link></li>
              <li><Link to="/login" className="hover:text-white">Company Login</Link></li>
              <li><Link to="/login" className="hover:text-white">Faculty Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@internlink.in</li>
              <li>+91 80 1234 5678</li>
              <li>Bengaluru, Karnataka, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">© 2026 InternLink. Built for college internship management.</p>
          <p className="text-xs">A college project demonstration.</p>
        </div>
      </div>
    </footer>
  )
}
