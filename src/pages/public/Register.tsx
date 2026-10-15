import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import Logo from '@/components/Logo'
import { GraduationCap, Building2, Users, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { UserRole } from '@/types'
import { api } from '@/services/api'

export default function Register() {
  const { showToast } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', college: '', company: '', industry: '', department: '', course: '', year: '', designation: '' })

  const roles = [
    { key: 'student' as UserRole, label: 'Student', desc: 'Find and apply for internships', icon: GraduationCap, color: 'brand' },
    { key: 'company' as UserRole, label: 'Company', desc: 'Post internships and hire interns', icon: Building2, color: 'blue' },
    { key: 'faculty' as UserRole, label: 'Faculty', desc: 'Monitor and manage student internships', icon: Users, color: 'emerald' },
  ]

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role.toUpperCase(),
        phone: form.phone,
        college: form.college,
        course: form.course,
        department: form.department,
        year: form.year,
        industry: form.industry,
        location: 'Bengaluru, Karnataka',
        website: form.company,
        designation: form.designation,
      }
      await api.register(payload)
      showToast('success', 'Account created successfully! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      showToast('error', err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 sm:px-6">
        <Logo size="sm" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create your account</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Join InternLink and start your internship journey.</p>
          </div>

          {/* Role selection */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {roles.map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`card p-5 text-left transition-all ${role === r.key ? 'ring-2 ring-brand-500 border-brand-300' : 'hover:shadow-md'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  r.color === 'brand' ? 'bg-brand-50 text-brand-600' :
                  r.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  'bg-emerald-50 text-emerald-600'
                }`}>
                  <r.icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{r.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                {role === r.key && <CheckCircle2 size={16} className="text-brand-500 mt-2" />}
              </button>
            ))}
          </div>

          {/* Form */}
          {role && (
            <form onSubmit={handleRegister} className="card p-6 space-y-4 animate-fade-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {role === 'company' ? 'Company Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-field pl-10"
                      placeholder={role === 'company' ? 'Acme Corp' : 'John Doe'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" required className="input-field pl-10" placeholder="you@example.com"
                      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" required className="input-field pl-10" placeholder="••••••••"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="tel" className="input-field pl-10" placeholder="+91 98765 43210"
                      value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              {role === 'student' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">College</label>
                    <input type="text" className="input-field" placeholder="VIT Chennai"
                      value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course</label>
                    <input type="text" className="input-field" placeholder="B.Tech Computer Science"
                      value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                    <input type="text" className="input-field" placeholder="Computer Science"
                      value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Year</label>
                    <select className="input-field" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                      <option value="">Select year</option>
                      <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                  </div>
                </div>
              )}

              {role === 'company' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry</label>
                    <input type="text" className="input-field" placeholder="Software Development"
                      value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
                    <input type="text" className="input-field" placeholder="www.company.com"
                      value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                  </div>
                </div>
              )}

              {role === 'faculty' && (
                <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">College</label>
                    <input type="text" className="input-field" placeholder="VIT Chennai"
                      value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                    <input type="text" className="input-field" placeholder="Computer Science"
                      value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Designation</label>
                    <input type="text" className="input-field" placeholder="Professor & Internship Coordinator"
                      value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" required className="mt-1 rounded border-gray-300" />
                I agree to InternLink's Terms of Service and Privacy Policy
              </label>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3 disabled:opacity-50">
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
