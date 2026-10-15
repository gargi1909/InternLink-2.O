import { Link } from 'react-router-dom'
import { GraduationCap, Building2, Users, Target, CheckCircle2, ArrowRight, Lightbulb, TrendingUp, Shield } from 'lucide-react'

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-4">
          <Lightbulb size={14} /> Our Story
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">About InternLink</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          InternLink is a comprehensive internship management platform that bridges the gap between students, companies, and colleges — making the entire internship lifecycle transparent, tracked, and seamless.
        </p>
      </div>

      <div className="card p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">What is InternLink?</h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          InternLink is a centralized platform designed to streamline the college internship process. It allows students to discover and apply for internships, companies to post opportunities and manage candidates, and faculty to monitor student progress — all in one place. From application to completion, every step is tracked with attendance, daily work logs, feedback, and analytics.
        </p>
      </div>

      <div className="card p-8 mb-8 border-l-4 border-red-400">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">The Problem We Solve</h2>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p>College internship management is fragmented and inefficient:</p>
          <ul className="space-y-2">
            {['Students apply through scattered portals with no central tracking', 'Companies struggle to manage applications from multiple colleges', 'Faculty have no visibility into student internship progress', 'Attendance and work logs are maintained manually on paper', 'No standardized feedback or completion certification', 'Colleges lack data on internship outcomes and placements'].map((p, i) => (
              <li key={i} className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> {p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-4">
            <GraduationCap size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">How Students Benefit</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {['Access 620+ internships in one place', 'Track application status in real-time', 'Digital attendance and work log system', 'Receive faculty feedback and guidance', 'Build a verified internship portfolio', 'Get completion certificates'].map((b, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /> {b}</li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">How Companies Benefit</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {['Reach 2,500+ verified students', 'Streamlined application management', 'Schedule interviews with one click', 'Monitor intern attendance and work', 'Submit structured performance feedback', 'Track internship completion'].map((b, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /> {b}</li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">How Colleges Benefit</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {['Complete visibility into student internships', 'Review and approve work logs digitally', 'Track attendance across all students', 'Generate analytics and reports', 'Monitor placement statistics', 'Export data for academic records'].map((b, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" /> {b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-8 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
        <div className="flex items-center gap-3 mb-4">
          <Target size={28} />
          <h2 className="text-xl font-bold">Our Mission</h2>
        </div>
        <p className="text-brand-50 leading-relaxed">
          To create a transparent, efficient, and data-driven internship ecosystem that benefits students, companies, and colleges equally — ensuring every internship is tracked, guided, and completed successfully.
        </p>
        <Link to="/register" className="btn bg-white text-brand-700 hover:bg-brand-50 mt-6">
          Join InternLink <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
