import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Mail, Phone, MapPin, MessageSquare, Send, ChevronDown } from 'lucide-react'
import { faqs } from '@/data/mockData'
import { Link } from 'react-router-dom'

export default function Contact() {
  const { showToast } = useApp()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.subject.trim()) newErrors.subject = 'Subject is required'
    if (!form.message.trim()) newErrors.message = 'Message is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    showToast('success', 'Message sent successfully! We will get back to you soon.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setErrors({})
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'support@internlink.in' },
    { icon: Phone, label: 'Phone', value: '+91 80 1234 5678' },
    { icon: MapPin, label: 'Address', value: 'Bengaluru, Karnataka, India' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-4">
          <MessageSquare size={14} /> Get in Touch
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">Contact Us</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions about InternLink? We are here to help. Reach out and we will respond within 24 hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {contactInfo.map((info, i) => (
          <div key={i} className="card p-6 text-center">
            <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <info.icon size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{info.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{info.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="card p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="input-field"
                  placeholder="What is this about?"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Tell us more..."
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
              </div>
              <button type="submit" className="btn-primary w-full">
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick FAQ</h3>
            <div className="space-y-2">
              {faqs.slice(0, 4).map((faq, i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-3 text-left">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-3 pb-3 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-secondary w-full mt-4 text-sm">View all FAQs</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
