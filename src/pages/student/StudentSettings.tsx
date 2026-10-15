import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card } from '@/components/ui'
import { User, Bell, Palette, Lock, Shield, Moon, Sun, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function StudentSettings() {
  const { theme, toggleTheme, showToast, logout } = useApp()
  const navigate = useNavigate()
  const [notifPrefs, setNotifPrefs] = useState({ application: true, interview: true, attendance: true, workLog: true, faculty: true, company: true })

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    showToast('success', 'Notification preferences updated')
  }

  const sections = [
    { icon: User, title: 'Account', desc: 'Manage your account information' },
    { icon: Bell, title: 'Notifications', desc: 'Configure notification preferences' },
    { icon: Palette, title: 'Appearance', desc: 'Customize how InternLink looks' },
    { icon: Lock, title: 'Password', desc: 'Change your password' },
    { icon: Shield, title: 'Privacy', desc: 'Control your privacy settings' },
  ]

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Palette size={18} /> Appearance</h3>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            {theme === 'light' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-brand-400" />}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-xs text-gray-500">{theme === 'light' ? 'Light mode' : 'Dark mode'}</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="relative w-12 h-6 bg-gray-200 dark:bg-brand-600 rounded-full transition">
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Bell size={18} /> Notification Preferences</h3>
        <div className="space-y-2">
          {[
            { key: 'application' as const, label: 'Application Updates', desc: 'Status changes on your applications' },
            { key: 'interview' as const, label: 'Interview Reminders', desc: 'Upcoming interview notifications' },
            { key: 'attendance' as const, label: 'Attendance Alerts', desc: 'Daily attendance reminders' },
            { key: 'workLog' as const, label: 'Work Log Reminders', desc: 'Daily work log submission reminders' },
            { key: 'faculty' as const, label: 'Faculty Messages', desc: 'Messages from your faculty' },
            { key: 'company' as const, label: 'Company Messages', desc: 'Messages from companies' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <button onClick={() => toggleNotif(item.key)} className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition">
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${notifPrefs[item.key] ? 'left-6 bg-brand-600' : 'left-0.5 bg-white'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={18} /> Change Password</h3>
        <div className="space-y-3">
          <div><label className="text-xs text-gray-500">Current Password</label><input type="password" className="input-field text-sm" placeholder="••••••••" /></div>
          <div><label className="text-xs text-gray-500">New Password</label><input type="password" className="input-field text-sm" placeholder="••••••••" /></div>
          <div><label className="text-xs text-gray-500">Confirm New Password</label><input type="password" className="input-field text-sm" placeholder="••••••••" /></div>
          <button onClick={() => showToast('success', 'Password updated successfully')} className="btn-primary text-sm">Update Password</button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Shield size={18} /> Privacy</h3>
        <div className="space-y-2">
          {['Show profile to companies', 'Show profile to other students', 'Allow faculty to view my work logs', 'Show attendance to faculty'].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">{p}</p>
              <button className="relative w-12 h-6 bg-brand-600 rounded-full"><div className="absolute top-0.5 left-6 w-5 h-5 bg-white rounded-full" /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-red-200 dark:border-red-900/30">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
          <LogOut size={18} /> <span className="font-medium text-sm">Logout from InternLink</span>
        </button>
      </Card>
    </div>
  )
}
