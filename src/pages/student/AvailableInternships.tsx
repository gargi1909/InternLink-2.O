import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo, EmptyState } from '@/components/ui'
import { Search, MapPin, Clock, Users, Calendar, SlidersHorizontal, Briefcase, X, Sparkles } from 'lucide-react'
import type { Internship, WorkMode } from '@/types'
import { calculateSkillMatch, getScoreColorTokens } from '@/utils/skillMatcher'

export default function AvailableInternships() {
  const { internships, applications, currentStudent, applyForInternship } = useApp()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [type, setType] = useState('')
  const [stipendMin, setStipendMin] = useState('')
  const [duration, setDuration] = useState('')
  const [skill, setSkill] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const myApps = currentStudent ? applications.filter(a => a.studentId === currentStudent.id) : []

  const locations = useMemo(() => [...new Set(internships.map(i => i.location))], [internships])
  const types = useMemo(() => [...new Set(internships.map(i => i.type))], [internships])
  const skills = useMemo(() => [...new Set(internships.flatMap(i => i.requiredSkills))], [internships])
  const durations = useMemo(() => [...new Set(internships.map(i => i.duration))], [internships])

  const filtered = useMemo(() => {
    let result = internships.filter(i => i.status === 'Active')
    if (search) result = result.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.companyName.toLowerCase().includes(search.toLowerCase()))
    if (location) result = result.filter(i => i.location === location)
    if (workMode) result = result.filter(i => i.workMode === workMode)
    if (type) result = result.filter(i => i.type === type)
    if (stipendMin) result = result.filter(i => i.stipend >= parseInt(stipendMin))
    if (duration) result = result.filter(i => i.duration === duration)
    if (skill) result = result.filter(i => i.requiredSkills.includes(skill))

    switch (sortBy) {
      case 'highest-stipend': result = [...result].sort((a, b) => b.stipend - a.stipend); break
      case 'deadline': result = [...result].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()); break
      case 'most-relevant': result = [...result].sort((a, b) => b.applicants - a.applicants); break
      default: result = [...result].sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    }
    return result
  }, [internships, search, location, workMode, type, stipendMin, duration, skill, sortBy])

  const hasApplied = (internshipId: string) => myApps.some(a => a.internshipId === internshipId && a.status !== 'Withdrawn')

  const clearFilters = () => {
    setSearch(''); setLocation(''); setWorkMode(''); setType(''); setStipendMin(''); setDuration(''); setSkill('')
  }

  const activeFilters = [location, workMode, type, stipendMin, duration, skill].filter(Boolean).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Available Internships</h1>
        <p className="text-sm text-gray-500 mt-1">{filtered.length} internships match your criteria</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
            placeholder="Search by title or company..."
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary sm:w-auto">
          <SlidersHorizontal size={16} /> Filters {activeFilters > 0 && <span className="bg-brand-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeFilters}</span>}
        </button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field sm:w-48">
          <option value="newest">Newest First</option>
          <option value="highest-stipend">Highest Stipend</option>
          <option value="deadline">Deadline Soon</option>
          <option value="most-relevant">Most Relevant</option>
        </select>
      </div>

      {showFilters && (
        <Card className="animate-fade-in">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Location</label>
              <select value={location} onChange={e => setLocation(e.target.value)} className="input-field text-sm">
                <option value="">All locations</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Work Mode</label>
              <select value={workMode} onChange={e => setWorkMode(e.target.value)} className="input-field text-sm">
                <option value="">All modes</option>
                <option>Remote</option><option>Hybrid</option><option>On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Internship Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input-field text-sm">
                <option value="">All types</option>
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Stipend (₹/mo)</label>
              <input type="number" value={stipendMin} onChange={e => setStipendMin(e.target.value)} className="input-field text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className="input-field text-sm">
                <option value="">Any duration</option>
                {durations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Skill</label>
              <select value={skill} onChange={e => setSkill(e.target.value)} className="input-field text-sm">
                <option value="">All skills</option>
                {skills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="btn-ghost text-xs mt-3 text-red-500">
              <X size={14} /> Clear all filters
            </button>
          )}
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon={Briefcase} title="No internships match your filters" description="Try adjusting your search criteria or clearing filters." action={<button onClick={clearFilters} className="btn-primary text-sm">Clear Filters</button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(internship => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              applied={hasApplied(internship.id)}
              studentSkills={currentStudent?.skills}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function InternshipCard({
  internship,
  applied,
  studentSkills,
}: {
  internship: Internship
  applied: boolean
  studentSkills?: string[]
}) {
  const match = calculateSkillMatch(studentSkills, internship.requiredSkills)
  const colorTokens = getScoreColorTokens(match.score)

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{internship.title}</h3>
          <p className="text-sm text-gray-500 truncate">{internship.companyName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1"><MapPin size={12} /> {internship.location}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {internship.duration}</span>
        <Badge variant="info">{internship.workMode}</Badge>
      </div>

      {/* Official Start & End Schedule */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 dark:bg-gray-800/40 px-2 py-1 rounded">
        <Calendar size={12} className="text-brand-600 shrink-0" />
        <span className="truncate">
          Schedule: {new Date(internship.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(internship.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Feature 2: Smart Internship Match Score */}
      <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 mb-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Sparkles size={13} className="text-brand-600" /> Skill Match
          </span>
          {match.hasRequiredSkills && match.hasStudentSkills ? (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${colorTokens.bg} ${colorTokens.text} ${colorTokens.border}`}>
              {match.score}%
            </span>
          ) : null}
        </div>

        {!match.hasRequiredSkills ? (
          <p className="text-[11px] text-gray-400">Not enough data to calculate match</p>
        ) : !match.hasStudentSkills ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">Complete profile skills to see match</p>
        ) : (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${colorTokens.progressBg}`}
                style={{ width: `${match.score}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <span>{match.matchedCount} of {match.totalRequired} skills matched</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {match.matchedSkills.slice(0, 2).map(s => (
                <span key={s} className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                  ✓ {s}
                </span>
              ))}
              {match.missingSkills.slice(0, 2).map(s => (
                <span key={s} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded">
                  {s}
                </span>
              ))}
              {match.missingSkills.length > 2 && (
                <span className="text-[10px] text-gray-400 self-center">
                  +{match.missingSkills.length - 2} more
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Calendar size={12} /> Deadline: {new Date(internship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="flex items-center gap-1"><Users size={12} /> {internship.applicants}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
        <span className="font-semibold text-gray-900 dark:text-white">
          ₹{internship.stipend.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500">/mo</span>
        </span>
        {applied ? (
          <Badge variant="success">Applied</Badge>
        ) : (
          <Link to={`/student/internships/${internship.id}`} className="btn-primary text-xs px-3 py-2">
            View & Apply
          </Link>
        )}
      </div>
    </Card>
  )
}
