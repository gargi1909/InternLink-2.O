import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, ProgressBar } from '@/components/ui'
import { User, Mail, Phone, GraduationCap, Briefcase, Linkedin, Github, FileText, Plus, X, Upload, Download, Award } from 'lucide-react'
import { api } from '@/services/api'

export default function StudentProfile() {
  const { currentStudent, updateStudent, uploadProfileResume, showToast } = useApp()
  const [editing, setEditing] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState(currentStudent ? { ...currentStudent } : null)
  const [uploadingResume, setUploadingResume] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentStudent) {
      setForm(prev => prev ? { ...prev, resumeName: currentStudent.resumeName || prev.resumeName } : { ...currentStudent })
    }
  }, [currentStudent])

  if (!currentStudent || !form) return null

  const completion = form.profileCompletion

  const handleSave = async () => {
    await updateStudent(form)
    setEditing(false)
  }

  const addSkill = () => {
    const currentSkills = Array.isArray(form.skills) ? form.skills : []
    if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...currentSkills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    const currentSkills = Array.isArray(form.skills) ? form.skills : []
    setForm({ ...form, skills: currentSkills.filter(s => s !== skill) })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal and professional information</p>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)} className="btn-primary text-sm">
          {editing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {(form.name || currentStudent?.name || 'Student').split(' ').filter(Boolean).map(w => w[0]).join('') || 'S'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form.name || currentStudent?.name || 'Student'}</h2>
            <p className="text-sm text-gray-500">{form.email || currentStudent?.email || ''}</p>
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

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><User size={18} /> Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Full Name</label>
              <input type="text" disabled={!editing} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input type="email" disabled={!editing} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input type="tel" disabled={!editing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><GraduationCap size={18} /> Academic Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">College</label>
              <input type="text" disabled={!editing} value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} className="input-field text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">College ID</label>
                <input type="text" disabled={!editing} value={form.collegeId} onChange={e => setForm({ ...form, collegeId: e.target.value })} className="input-field text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Year</label>
                <input type="text" disabled={!editing} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input-field text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500">Course</label>
              <input type="text" disabled={!editing} value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Department</label>
              <input type="text" disabled={!editing} value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Briefcase size={18} /> Professional Information</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bio</label>
            <textarea disabled={!editing} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field text-sm resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(Array.isArray(form.skills) ? form.skills : []).map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full text-sm">
                  {skill}
                  {editing && <button onClick={() => removeSkill(skill)} className="hover:text-red-500"><X size={14} /></button>}
                </span>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="input-field text-sm flex-1" placeholder="Add a skill..." />
                <button onClick={addSkill} className="btn-secondary text-sm"><Plus size={16} /> Add</button>
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Linkedin size={12} /> LinkedIn</label>
              <input type="text" disabled={!editing} value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1"><Github size={12} /> GitHub</label>
              <input type="text" disabled={!editing} value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={18} /> Resume</h3>
        <input
          type="file"
          ref={fileInputRef}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const allowedExts = ['.pdf', '.docx']
            const ext = '.' + file.name.split('.').pop()?.toLowerCase()
            if (!allowedExts.includes(ext)) {
              showToast('error', 'Only PDF and DOCX files are allowed')
              if (fileInputRef.current) fileInputRef.current.value = ''
              return
            }

            if (file.size > 5 * 1024 * 1024) {
              showToast('error', 'Resume file size must be less than 5MB')
              if (fileInputRef.current) fileInputRef.current.value = ''
              return
            }

            try {
              setUploadingResume(true)
              const success = await uploadProfileResume(file)
              if (success) {
                setForm(prev => prev ? { ...prev, resumeName: file.name } : null)
              }
            } finally {
              setUploadingResume(false)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }
          }}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{form.resumeName || 'No resume uploaded yet'}</p>
            <p className="text-xs text-gray-500">PDF, DOCX (max 5MB)</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {form.resumeName && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await api.downloadStudentProfileResume(form.resumeName || 'Resume.pdf')
                  } catch (err: any) {
                    showToast('error', err.message || 'Failed to download resume')
                  }
                }}
                className="btn-secondary text-sm flex items-center gap-1.5"
                title="Download current resume"
              >
                <Download size={16} /> Download
              </button>
            )}
            <button
              type="button"
              disabled={uploadingResume}
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              <Upload size={16} /> {uploadingResume ? 'Uploading...' : 'Upload New'}
            </button>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white"><Award size={24} /></div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Achievements</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="brand">2,500+ Applications Sent</Badge>
              <Badge variant="success">92% Attendance</Badge>
              <Badge variant="info">Active Intern</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
