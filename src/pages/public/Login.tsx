import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Logo from '@/components/Logo'
import { GraduationCap, Building2, Users, Mail, Lock, ArrowRight, Eye, EyeOff, Zap, Shield } from 'lucide-react'
import type { UserRole } from '@/types'
import { api } from '@/services/api'

export default function Login() {
  const { login, loginAsDemo, showToast } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        const me = await api.getMe().catch(() => null)
        const userRole = me?.user?.role
        if (userRole) {
          navigate(`/${userRole}/dashboard`)
        } else {
          navigate('/student/dashboard')
        }
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true)
    setError('')
    try {
      await loginAsDemo(role)
      showToast('success', `Logged in as ${role} demo`)
      navigate(`/${role}/dashboard`)
    } catch (err: any) {
      setError(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { role: 'student' as UserRole, email: 'student@internlink.demo', password: 'student123', label: 'Student', icon: GraduationCap, color: 'border-brand-500 bg-brand-50 text-brand-700' },
    { role: 'company' as UserRole, email: 'company@internlink.demo', password: 'company123', label: 'Company', icon: Building2, color: 'border-blue-500 bg-blue-50 text-blue-700' },
    { role: 'faculty' as UserRole, email: 'faculty@internlink.demo', password: 'faculty123', label: 'Faculty', icon: Users, color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
    { role: 'admin' as UserRole, email: 'admin@internlink.demo', password: 'admin123', label: 'TPO/Admin', icon: Shield, color: 'border-purple-500 bg-purple-50 text-purple-700' },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-20 border-white" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full border-16 border-white" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 font-bold text-xl">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
              <Zap size={18} className="text-white" />
            </div>
            <span>InternLink</span>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">Welcome back to InternLink</h2>
          <p className="mt-3 text-brand-100 text-lg">Sign in to manage your internships, applications, attendance, and work logs — backed by PostgreSQL.</p>
          <div className="mt-8 space-y-3">
            {['Mentor-wise student data isolation', 'Exact date & joining schedule validation', 'Automated attendance percentage formula'].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</div>
                <p className="text-brand-50">{t}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-brand-200">© 2026 InternLink. Full-Stack College Internship Management System.</p>
      </div>

      {/* Right panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><Logo size="md" /></div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to your account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your credentials to access your dashboard.</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="rounded border-gray-300" /> Remember me
              </label>
              <button type="button" className="text-brand-600 hover:text-brand-700 font-medium">Forgot password?</button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 disabled:opacity-50">
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs text-gray-400 font-medium">Or use demo account</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoLogin(acc.role)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all hover:scale-105 ${acc.color}`}
                >
                  <acc.icon size={18} />
                  <span className="text-xs font-semibold">{acc.label}</span>
                </button>
              ))}
            </div>
            {email === '' && (
              <div className="mt-3 text-xs text-gray-500 text-center">
                Select any demo account to test role isolation live
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account? <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold">Register</Link>
          </p>
          <p className="mt-4 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-brand-600">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
