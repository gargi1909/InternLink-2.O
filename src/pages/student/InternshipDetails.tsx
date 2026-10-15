import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo } from '@/components/ui'
import Modal from '@/components/Modal'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { calculateSkillMatch, getScoreColorTokens } from '@/utils/skillMatcher'

export default function InternshipDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { internships, applications, currentStudent, applyForInternship, showToast } = useApp()
  const internship = internships.find(i => i.id === id)

  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState(currentStudent?.resumeName ?? '')
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  if (!internship) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Internship not found.</p>
        <Link to="/student/internships" className="btn-primary mt-4 text-sm">Back to Internships</Link>
      </div>
    )
  }

  const hasApplied = applications.some(a => a.internshipId === internship.id && a.status !== 'Withdrawn')
  const isDeadlinePassed = new Date() > new Date(internship.deadline)
  const match = calculateSkillMatch(currentStudent?.skills, internship.requiredSkills)
  const colorTokens = getScoreColorTokens(match.score)

  const openApplyModal = () => {
    setAvailabilityConfirmed(false)
    setAvailabilityError(null)
    setSelectedResumeFile(null)
    setResumeFileName(currentStudent?.resumeName || '')
    setShowApplyModal(true)
  }

  const handleApply = async () => {
    if (!currentStudent) return

    if (!availabilityConfirmed) {
      setAvailabilityError('You must confirm your availability before submitting your application.')
      return
    }

    setSubmitting(true)
    const success = await applyForInternship(internship.id, currentStudent.id, coverLetter, true, selectedResumeFile)
    setSubmitting(false)

    if (success) {
      setShowApplyModal(false)
      navigate('/student/applications')
    }
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600">
        <ArrowLeft size={16} /> Back
      </button>

      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{internship.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{internship.companyName}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={15} /> {internship.location}</span>
              <span className="flex items-center gap-1"><Clock size={15} /> {internship.duration}</span>
              <span className="flex items-center gap-1">
                <Calendar size={15} /> Starts {new Date(internship.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <Badge variant="info">{internship.workMode}</Badge>
            </div>
          </div>
          <div className="text-right sm:self-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{internship.stipend.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500">per month</p>
            {hasApplied ? (
              <span className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium rounded-lg text-sm border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={16} /> Already Applied
              </span>
            ) : isDeadlinePassed ? (
              <button disabled className="btn-secondary opacity-60 cursor-not-allowed mt-3 w-full text-xs">
                Deadline Passed
              </button>
            ) : (
              <button onClick={openApplyModal} className="btn-primary mt-3 w-full">
                Apply Now
              </button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About the Internship</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{internship.description}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {internship.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {internship.requiredSkills.map(s => (
                <Badge key={s} variant="brand">{s}</Badge>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Eligibility</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{internship.eligibility}</p>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Benefits</h3>
            <ul className="space-y-2">
              {internship.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Feature 2: Smart Skill Match Score Card */}
          <Card className="border border-brand-100 dark:border-brand-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-brand-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Skill Match</h3>
              </div>
              {match.hasRequiredSkills && match.hasStudentSkills && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${colorTokens.bg} ${colorTokens.text} ${colorTokens.border}`}>
                  {match.score}% Match
                </span>
              )}
            </div>

            {!match.hasRequiredSkills ? (
              <p className="text-xs text-gray-500 py-2">
                {match.message || 'Not enough data to calculate match'}
              </p>
            ) : !match.hasStudentSkills ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-300 mb-2 font-medium">
                  {match.message || 'Complete your profile skills to view your match score'}
                </p>
                <Link to="/student/profile" className="text-xs font-semibold text-brand-600 hover:underline inline-block">
                  Add Skills in Profile →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{match.matchedCount}</span> of {match.totalRequired} required skills matched
                </p>

                {/* Subtle progress bar */}
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${colorTokens.progressBg}`}
                    style={{ width: `${match.score}%` }}
                  />
                </div>

                {match.matchedSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Matched Skills ({match.matchedSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {match.missingSkills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                      <AlertCircle size={13} className="text-amber-500" /> Missing Required Skills ({match.missingSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingSkills.map(s => (
                        <span key={s} className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 leading-tight">
                  Match score measures skill overlap only and does not guarantee selection or replace company review.
                </p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Official Internship Schedule</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Duration</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{internship.duration}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Official Start Date</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(internship.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Official End Date</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(internship.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Openings</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{internship.openings}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Applicants</dt>
                <dd className="font-medium text-gray-900 dark:text-white">{internship.applicants}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Application Deadline</dt>
                <dd className={`font-medium ${isDeadlinePassed ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  {new Date(internship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {isDeadlinePassed && ' (Expired)'}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About {internship.companyName}</h3>
            <div className="flex items-center gap-3 mb-3">
              <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="sm" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{internship.companyName}</p>
                <p className="text-xs text-gray-500">{internship.location}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A leading company in the {internship.type} space, offering great learning opportunities for interns.
            </p>
          </Card>
        </div>
      </div>

      <Modal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${internship.title}`}
        footer={
          <>
            <button onClick={() => setShowApplyModal(false)} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button onClick={handleApply} className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Resume <span className="text-gray-400 font-normal text-xs">({selectedResumeFile ? 'New file selected' : currentStudent?.resumeName ? 'Using profile resume' : 'Upload optional'})</span>
            </label>
            <input
              type="file"
              ref={resumeInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                const allowedExts = ['.pdf', '.docx']
                const ext = '.' + file.name.split('.').pop()?.toLowerCase()
                if (!allowedExts.includes(ext)) {
                  showToast('error', 'Only PDF and DOCX files are allowed')
                  if (resumeInputRef.current) resumeInputRef.current.value = ''
                  return
                }

                if (file.size > 5 * 1024 * 1024) {
                  showToast('error', 'Resume file size must be less than 5MB')
                  if (resumeInputRef.current) resumeInputRef.current.value = ''
                  return
                }

                setSelectedResumeFile(file)
                setResumeFileName(file.name)
              }}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
            />
            <div className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {resumeFileName || 'No resume selected'}
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX (max 5MB)</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedResumeFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedResumeFile(null)
                      setResumeFileName(currentStudent?.resumeName || '')
                      if (resumeInputRef.current) resumeInputRef.current.value = ''
                    }}
                    className="text-xs text-gray-500 hover:text-red-500 underline"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Upload size={14} /> {selectedResumeFile || currentStudent?.resumeName ? 'Change File' : 'Upload'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cover Letter</label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="Tell the company why you're a great fit for this internship..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {(currentStudent?.skills ?? []).length > 0 ? (
                currentStudent?.skills.map(s => <Badge key={s} variant="brand">{s}</Badge>)
              ) : (
                <span className="text-xs text-gray-400">No skills added in profile yet</span>
              )}
            </div>
          </div>

          {/* Feature 1: Official Schedule & Availability Confirmation */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Availability & Schedule Confirmation <span className="text-red-500">*</span>
            </label>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-3 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Official Internship Period:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(internship.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – {new Date(internship.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Duration & Work Mode:</span>
                <span>{internship.duration} • {internship.workMode}</span>
              </div>
            </div>

            <label className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
              availabilityError
                ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}>
              <input
                type="checkbox"
                checked={availabilityConfirmed}
                onChange={e => {
                  setAvailabilityConfirmed(e.target.checked)
                  if (e.target.checked) setAvailabilityError(null)
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug select-none">
                I confirm that I am available to start on the internship's specified start date and can participate throughout the advertised internship period.
              </span>
            </label>

            {availabilityError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle size={13} /> {availabilityError}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
