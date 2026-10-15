import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Badge, CompanyLogo, ProgressBar, EmptyState } from '@/components/ui'
import { internshipTasks } from '@/data/mockData'
import { CheckCircle2, Circle, Building2, Calendar, Clock, User, FileText, Target, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyInternship() {
  const { currentStudent, applications, showToast } = useApp()
  const [tasks, setTasks] = useState(internshipTasks)

  if (!currentStudent) return null

  const selectedApp = applications.find(a => a.studentId === currentStudent.id && a.status === 'Selected')
  const interviewApp = applications.find(a => a.studentId === currentStudent.id && a.status === 'Interview Scheduled')

  const internship = selectedApp || interviewApp

  if (!internship) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Internship</h1>
        <Card>
          <EmptyState
            icon={Building2}
            title="No active internship"
            description="Once you are selected for an internship, you can track your progress, tasks, and goals here."
            action={<Link to="/student/internships" className="btn-primary text-sm">Browse Internships</Link>}
          />
        </Card>
      </div>
    )
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    const task = tasks.find(t => t.id === id)
    if (task && !task.completed) showToast('success', `Task completed: ${task.title}`)
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const progress = Math.round((completedTasks / tasks.length) * 100)

  const goals = [
    { title: 'Complete onboarding process', target: 'Week 1', done: true },
    { title: 'Build first feature component', target: 'Week 2', done: true },
    { title: 'Submit weekly report #1', target: 'Week 2', done: true },
    { title: 'Implement authentication module', target: 'Week 4', done: false },
    { title: 'Present mid-internship review', target: 'Week 6', done: false },
    { title: 'Complete final project', target: 'Week 12', done: false },
  ]

  const documents = [
    { name: 'Offer Letter', date: '2026-01-10', type: 'PDF' },
    { name: 'Internship Agreement', date: '2026-01-12', type: 'PDF' },
    { name: 'Onboarding Guide', date: '2026-01-15', type: 'PDF' },
    { name: 'Project Specification', date: '2026-01-20', type: 'DOCX' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Internship</h1>
        <p className="text-sm text-gray-500 mt-1">Track your internship progress and tasks</p>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-5">
          <CompanyLogo name={internship.companyName} color={internship.companyLogoColor} size="lg" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{internship.internshipTitle}</h2>
            <p className="text-gray-600 dark:text-gray-400">{internship.companyName}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> Jan 15 - Jul 15, 2026</span>
              <span className="flex items-center gap-1"><Clock size={14} /> 6 months</span>
              <span className="flex items-center gap-1"><User size={14} /> Mentor: Rajesh Kumar</span>
            </div>
          </div>
          <Badge variant={selectedApp ? 'success' : 'info'}>{selectedApp ? 'In Progress' : 'Interview Stage'}</Badge>
        </div>

        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Internship Progress</span>
          <span className="font-bold text-brand-600">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tasks</h3>
          <div className="space-y-2">
            {tasks.map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left"
              >
                {task.completed ? <CheckCircle2 size={20} className="text-green-500 shrink-0" /> : <Circle size={20} className="text-gray-300 shrink-0" />}
                <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Goals & Milestones</h3>
          <div className="space-y-3">
            {goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${goal.done ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                  {goal.done ? <CheckCircle2 size={16} /> : <Target size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${goal.done ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{goal.title}</p>
                  <p className="text-xs text-gray-500">{goal.target}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mentor Information</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold">RK</div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Rajesh Kumar</p>
              <p className="text-sm text-gray-500">Senior Engineer, {internship.companyName}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><User size={15} /> rajesh.k@technova.in</div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><FileText size={15} /> Weekly 1:1 on Mondays at 10:00 AM</div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition">
                <div className="w-9 h-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type} • {new Date(doc.date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {selectedApp && (
        <Card className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-600 rounded-xl flex items-center justify-center text-white">
              <Award size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">Completion Certificate</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your certificate will be available once your internship is marked as completed by the company.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
