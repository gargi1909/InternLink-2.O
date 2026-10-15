import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { internships, testimonials, successStories, faqs } from '@/data/mockData'
import { CompanyLogo } from '@/components/ui'
import {
  Search, Building2, GraduationCap, Users, FileText, Bell, CheckCircle2,
  ArrowRight, Star, MapPin, Briefcase, TrendingUp, Award, ChevronDown,
  Rocket, Target, Calendar, Clock
} from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const { loginAsDemo } = useApp()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const stats = [
    { label: 'Students', value: '2,500+', icon: GraduationCap, color: 'text-brand-600' },
    { label: 'Companies', value: '180+', icon: Building2, color: 'text-blue-600' },
    { label: 'Internships', value: '620+', icon: Briefcase, color: 'text-emerald-600' },
    { label: 'Completion Rate', value: '92%', icon: Award, color: 'text-amber-600' },
  ]

  const featuredInternships = internships.slice(0, 6)

  const howItWorks = [
    { icon: Search, title: 'Discover Internships', desc: 'Browse hundreds of internships from top companies. Filter by role, location, stipend, and skills.' },
    { icon: FileText, title: 'Apply with Ease', desc: 'Submit applications with your profile, resume, and cover letter. Track everything in one place.' },
    { icon: Calendar, title: 'Track Progress', desc: 'Monitor your application status, schedule interviews, and manage attendance and work logs.' },
    { icon: Award, title: 'Complete & Succeed', desc: 'Finish your internship with verified attendance, work logs, and a completion certificate.' },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs font-semibold mb-5">
                <Rocket size={14} /> Trusted by 25+ colleges across India
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Find the right internship. <span className="text-brand-600">Build your future.</span>
              </h1>
              <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0">
                InternLink connects students, companies, and college faculty in one platform to manage internships, applications, attendance, daily work logs, and completion — all in real time.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/login" className="btn-primary text-base px-6 py-3">
                  Explore Internships <ArrowRight size={18} />
                </Link>
                <Link to="/register" className="btn-secondary text-base px-6 py-3">Get Started</Link>
              </div>
              <div className="mt-6 flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-500">
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> Free for students</div>
                <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> No credit card</div>
              </div>
            </div>
            <div className="relative">
              <div className="card p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center text-white">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Dashboard Preview</p>
                    <p className="text-xs text-gray-500">Student activity overview</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-brand-600">4</p>
                    <p className="text-xs text-gray-500">Active Applications</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">2</p>
                    <p className="text-xs text-gray-500">Shortlisted</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">1</p>
                    <p className="text-xs text-gray-500">Interview</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <p className="text-2xl font-bold text-amber-600">92%</p>
                    <p className="text-xs text-gray-500">Attendance</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Interview scheduled — TechNova Solutions</p>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-brand-500 rounded-full" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Shortlisted — InnovateX AI/ML Intern</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 card p-3 shadow-lg hidden sm:block">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Application sent!</p>
                    <p className="text-xs text-gray-500">2 seconds ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 ${s.color} mb-3`}>
                  <s.icon size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">How InternLink Works</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">A simple, streamlined process from discovering internships to completing them successfully.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="card p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl flex items-center justify-center mb-4">
                  <step.icon size={24} />
                </div>
                <div className="text-xs font-bold text-brand-600 mb-1">STEP {i + 1}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Students / Companies / Faculty */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Built for Everyone</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">One platform serving students, companies, and faculty alike.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-8 border-t-4 border-brand-500">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-5">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Students</h3>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {['Browse and apply to 620+ internships', 'Track application status in real time', 'Mark daily attendance and work logs', 'Get faculty feedback and guidance', 'Receive completion certificates'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => loginAsDemo('student')} className="btn-primary mt-6 w-full">Try Student Demo</button>
            </div>
            <div className="card p-8 border-t-4 border-blue-500">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Companies</h3>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {['Post internships and reach 2,500+ students', 'Review and shortlist candidates', 'Schedule interviews with one click', 'Monitor intern attendance and work logs', 'Submit feedback and complete internships'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => loginAsDemo('company')} className="btn-primary mt-6 w-full">Try Company Demo</button>
            </div>
            <div className="card p-8 border-t-4 border-emerald-500">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">For Faculty</h3>
              <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-400">
                {['Monitor all student internships', 'Review work logs and attendance', 'Track application lifecycle', 'View analytics and reports', 'Export data for academic records'].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" /> {f}</li>
                ))}
              </ul>
              <button onClick={() => loginAsDemo('faculty')} className="btn-primary mt-6 w-full">Try Faculty Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Featured Internships</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Handpicked opportunities from top companies.</p>
            </div>
            <Link to="/login" className="btn-secondary hidden sm:flex">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredInternships.map(internship => (
              <div key={internship.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{internship.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{internship.companyName}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {internship.location}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {internship.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {internship.requiredSkills.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">{skill}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-900 dark:text-white">₹{internship.stipend.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500">/mo</span></span>
                  <span className="text-xs text-gray-500">{internship.applicants} applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">Student Success Stories</h2>
            <p className="mt-3 text-brand-100">Real journeys from internship to career.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${story.color} rounded-full flex items-center justify-center font-bold text-white`}>
                    {story.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm text-brand-100">{story.role} at {story.company}</p>
                  </div>
                </div>
                <p className="text-sm text-brand-50 italic">"{story.text}"</p>
                <p className="text-xs text-brand-200 mt-3">{story.college}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.color} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{faq.question}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="card p-12 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
            <Target size={40} className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold">Ready to start your internship journey?</h2>
            <p className="mt-3 text-brand-100">Join InternLink today and connect with top companies and colleges.</p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50 px-6 py-3 text-base">Get Started Free</Link>
              <Link to="/login" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 px-6 py-3 text-base">Login</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
