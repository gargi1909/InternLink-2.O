import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, ProgressBar, Badge } from '@/components/ui'
import { Building2, Mail, Phone, Globe, MapPin, FileText, Briefcase, Users, Edit3, Save } from 'lucide-react'

export default function CompanyProfile() {
  const { currentCompany, updateCompany, showToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(currentCompany ? { ...currentCompany } : null)

  if (!currentCompany || !form) return null

  const completion = Math.round(([
    form.name, form.email, form.phone, form.industry, form.website,
    form.description, form.location,
  ].filter(Boolean).length / 7) * 100)

  const handleSave = async () => {
    await updateCompany(form)
    setEditing(false)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your company information</p>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)} className="btn-primary text-sm">
          {editing ? <><Save size={16} /> Save Changes</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-20 h-20 ${form.logoColor} rounded-2xl flex items-center justify-center text-white text-2xl font-bold`}>
            {(form.name || 'Company').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('') || 'C'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form.name}</h2>
            <p className="text-sm text-gray-500">{form.industry}</p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-500">Profile Completion</span>
                <span className="font-semibold text-brand-600">{completion}%</span>
              </div>
              <ProgressBar value={completion} />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Building2 size={18} /> Company Information</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Company Name</label>
            <input type="text" disabled={!editing} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> Email</label>
              <input type="email" disabled={!editing} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} /> Phone</label>
              <input type="tel" disabled={!editing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1"><Briefcase size={12} /> Industry</label>
              <input type="text" disabled={!editing} value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 flex items-center gap-1"><Globe size={12} /> Website</label>
              <input type="text" disabled={!editing} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={12} /> Location</label>
            <input type="text" disabled={!editing} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Description</label>
            <textarea disabled={!editing} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="input-field text-sm resize-none" />
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white"><Users size={24} /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Company Stats</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="brand">Active Employer</Badge>
              <Badge variant="success">Verified Company</Badge>
              <Badge variant="info">Hiring Since 2024</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
