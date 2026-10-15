import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Card } from '@/components/ui'
import { Plus, Save, Send, Calendar, AlertCircle, Sparkles } from 'lucide-react'
import type { WorkMode } from '@/types'

export default function PostInternship() {
  const { currentCompany, publishInternship, saveInternshipDraft, showToast } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    eligibility: '',
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid' as WorkMode,
    duration: '6 months',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    stipend: 18000,
    openings: 2,
    deadline: '2026-12-15',
    benefits: '',
    type: 'Software Development',
  })

  const [dateError, setDateError] = useState('')

  if (!currentCompany) return null

  // Date shortcuts that calculate and populate real dates
  const applyDatePreset = (preset: 'summer' | 'post_exam' | 'next_month') => {
    const today = new Date()
    let start = new Date(today)
    let end = new Date(today)
    let deadline = new Date(today)

    if (preset === 'next_month') {
      start.setMonth(today.getMonth() + 1)
      start.setDate(1)
      end = new Date(start)
      end.setMonth(start.getMonth() + 3)
      deadline = new Date(start)
      deadline.setDate(start.getDate() - 10)
    } else if (preset === 'post_exam') {
      // Semester start (e.g. Jan 15 or Jul 15)
      start = new Date('2026-01-15')
      end = new Date('2026-07-15')
      deadline = new Date('2025-12-20')
    } else if (preset === 'summer') {
      // Summer 3 months
      start = new Date('2026-05-01')
      end = new Date('2026-08-01')
      deadline = new Date('2026-04-15')
    }

    setForm(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      deadline: deadline.toISOString().split('T')[0],
      duration: preset === 'post_exam' ? '6 months' : '3 months',
    }))
    setDateError('')
    showToast('info', 'Schedule dates populated with explicit calendar dates.')
  }

  const validateDates = (): boolean => {
    if (!form.startDate || !form.endDate || !form.deadline) {
      setDateError('Start date, end date, and application deadline are all required.')
      return false
    }

    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const deadline = new Date(form.deadline)

    if (end <= start) {
      setDateError('End date must be strictly after the internship start date.')
      return false
    }

    if (deadline > start) {
      setDateError('Application deadline must be on or before the internship start date.')
      return false
    }

    setDateError('')
    return true
  }

  const buildInternship = async (status: 'Active' | 'Draft') => {
    if (!validateDates()) {
      showToast('error', 'Please resolve schedule date errors before submitting.')
      return
    }

    const data = {
      companyId: currentCompany.id,
      title: form.title,
      description: form.description,
      responsibilities: form.responsibilities.split('\n').filter(Boolean),
      requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      eligibility: form.eligibility,
      location: form.location,
      workMode: form.workMode,
      duration: form.duration,
      startDate: form.startDate,
      endDate: form.endDate,
      stipend: form.stipend,
      openings: form.openings,
      deadline: form.deadline,
      benefits: form.benefits.split('\n').filter(Boolean),
      type: form.type,
    }

    if (status === 'Active') {
      await publishInternship(data)
      navigate('/company/internships')
    } else {
      await saveInternshipDraft(data)
      navigate('/company/internships')
    }
  }

  const isValid = form.title && form.description && form.location && form.deadline && !dateError

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a New Internship</h1>
        <p className="text-sm text-gray-500 mt-1">Define role details and exact calendar schedule for student applications</p>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Internship Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Cloud Solutions Intern" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="input-field resize-none" placeholder="Describe the internship role, responsibilities, and expected project work..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Responsibilities (one per line)</label>
            <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} rows={3} className="input-field resize-none" placeholder="Develop scalable API endpoints&#10;Write unit tests&#10;Participate in sprint demos" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Required Skills (comma-separated)</label>
              <input type="text" value={form.requiredSkills} onChange={e => setForm({ ...form, requiredSkills: e.target.value })} className="input-field" placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Internship Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field">
                <option>Software Development</option><option>Data Analytics</option><option>AI/ML</option>
                <option>Design</option><option>Cloud & DevOps</option><option>Cybersecurity</option>
                <option>Business</option><option>Mobile Development</option><option>Testing</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Eligibility Criteria</label>
            <input type="text" value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="input-field" placeholder="e.g. B.Tech 3rd or 4th year, CS/IT, 7+ CGPA" />
          </div>
        </div>
      </Card>

      {/* Exact Date & Joining Schedule */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" />
              Exact Dates & Joining Schedule
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Strict calendar dates stored in database. End date must be after start date.</p>
          </div>

          {/* Quick Schedule Shortcuts */}
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => applyDatePreset('post_exam')} className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2.5 py-1 rounded-md font-medium flex items-center gap-1">
              <Sparkles size={12} /> After Exams (6M)
            </button>
            <button type="button" onClick={() => applyDatePreset('summer')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md font-medium">
              Summer (3M)
            </button>
            <button type="button" onClick={() => applyDatePreset('next_month')} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md font-medium">
              Next Month
            </button>
          </div>
        </div>

        {dateError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            {dateError}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Internship Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => { setForm({ ...form, startDate: e.target.value }); setDateError('') }}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Preview: {formatDateDisplay(form.startDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Internship End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={e => { setForm({ ...form, endDate: e.target.value }); setDateError('') }}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Preview: {formatDateDisplay(form.endDate)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => { setForm({ ...form, deadline: e.target.value }); setDateError('') }}
              className="input-field"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Preview: {formatDateDisplay(form.deadline)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration</label>
            <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field">
              <option>1 month</option><option>2 months</option><option>3 months</option>
              <option>4 months</option><option>6 months</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Logistics & Compensation</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g. Bengaluru, Karnataka" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Work Mode</label>
            <select value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value as WorkMode })} className="input-field">
              <option>Remote</option><option>Hybrid</option><option>On-site</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stipend (₹/month)</label>
            <input type="number" value={form.stipend} onChange={e => setForm({ ...form, stipend: parseInt(e.target.value) || 0 })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Openings</label>
            <input type="number" value={form.openings} onChange={e => setForm({ ...form, openings: parseInt(e.target.value) || 1 })} className="input-field" min="1" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Benefits (one per line)</h3>
        <textarea value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} rows={3} className="input-field resize-none" placeholder="Direct mentorship&#10;Certificate of completion&#10;Pre-placement offer opportunity" />
      </Card>

      <div className="flex justify-end gap-3">
        <button onClick={() => buildInternship('Draft')} className="btn-secondary"><Save size={16} /> Save Draft</button>
        <button onClick={() => buildInternship('Active')} disabled={!isValid} className="btn-primary"><Send size={16} /> Publish Internship</button>
      </div>
    </div>
  )
}
