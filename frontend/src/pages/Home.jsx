import { Link } from 'react-router-dom'
import { Shield, Camera, Users, Bell, MapPin, Phone,
         Mail, ChevronRight, Eye, Lock, Zap } from 'lucide-react'

export default function Home() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">FaceGuard</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'About',    id: 'about'    },
              { label: 'Services', id: 'services' },
              { label: 'Contact',  id: 'contact'  },
            ].map(({ label, id }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
                {label}
              </button>
            ))}
          </div>

          {/* Login button */}
          <Link to="/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            <Lock size={14} />
            Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-700 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
            <Zap size={12} />
            AI-Powered Public Safety Platform
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Protecting Communities<br />
            <span className="text-blue-400">With Intelligent Surveillance</span>
          </h1>

          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            FaceGuard empowers police departments with real-time face recognition,
            missing person tracking, and seamless communication — all in one platform.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-semibold transition-colors text-sm shadow-lg">
              Get Started
              <ChevronRight size={16} />
            </Link>
            <button onClick={() => scrollTo('services')}
              className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-7 py-3 rounded-xl font-semibold transition-colors text-sm">
              Learn More
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-6 relative z-10">
          {[
            { value: 'Real-Time', label: 'Face Detection'      },
            { value: '24/7',      label: 'Surveillance Active' },
            { value: '3 Roles',   label: 'Access Control'      },
          ].map(({ value, label }) => (
            <div key={label}
              className="bg-white/5 border border-white/10 rounded-xl px-6 py-5 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────── */}
      <section id="about" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">About Us</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What is FaceGuard?</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              A comprehensive surveillance platform built for modern police departments
              to handle missing persons, lost items, and crowd monitoring efficiently.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              {[
                {
                  icon: Eye,
                  title: 'AI Face Recognition',
                  desc: 'Real-time identification of missing persons using DeepFace AI with high accuracy matching across camera feeds.'
                },
                {
                  icon: Users,
                  title: 'Multi-Role System',
                  desc: 'Separate dashboards for Admins, Police Officers, and Citizens — each with appropriate access and features.'
                },
                {
                  icon: Bell,
                  title: 'Instant Alerts',
                  desc: 'WebSocket-powered live alerts notify officers the moment a face match is detected by any camera in the network.'
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl flex-shrink-0 h-fit">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              <Shield size={40} className="mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-3">Built for Jaipur Police</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-5">
                Developed as a final year engineering project at Jaipur Engineering
                College and Research Centre, FaceGuard addresses real public safety
                challenges faced during large gatherings like fairs, festivals, and events.
              </p>
              <div className="border-t border-blue-500 pt-5 space-y-2">
                {[
                  'Missing persons identification',
                  'Lost item management',
                  'Crowd monitoring',
                  'Citizen-police communication',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-blue-100">
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <section id="services" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Services</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What We Offer</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Everything a modern police department needs to manage public safety efficiently.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                icon: Camera,
                title: 'Live Surveillance',
                desc: 'Connect cameras and scan faces in real-time. Matches trigger instant alerts to the officer dashboard.',
                color: 'bg-blue-50 text-blue-600',
                border: 'border-blue-100'
              },
              {
                icon: Users,
                title: 'Missing Persons',
                desc: 'Report missing persons with photos. AI encodes their face and actively searches all camera feeds.',
                color: 'bg-red-50 text-red-600',
                border: 'border-red-100'
              },
              {
                icon: Bell,
                title: 'Real-Time Alerts',
                desc: 'Live WebSocket alerts appear on dashboards instantly. No refresh needed — alerts stream automatically.',
                color: 'bg-yellow-50 text-yellow-600',
                border: 'border-yellow-100'
              },
              {
                icon: MapPin,
                title: 'Lost Item Tracking',
                desc: 'Citizens can report lost belongings. Officers track and manage found items through a central system.',
                color: 'bg-green-50 text-green-600',
                border: 'border-green-100'
              },
              {
                icon: Lock,
                title: 'Role-Based Access',
                desc: 'Admin, Officer, and Citizen roles with different permissions. One admin controls the entire system.',
                color: 'bg-purple-50 text-purple-600',
                border: 'border-purple-100'
              },
              {
                icon: Shield,
                title: 'Secure Platform',
                desc: 'JWT authentication, encrypted passwords, and protected API routes ensure your data stays safe.',
                color: 'bg-gray-50 text-gray-600',
                border: 'border-gray-100'
              },
            ].map(({ icon: Icon, title, desc, color, border }) => (
              <div key={title}
                className={`border ${border} rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                <div className={`${color} p-3 rounded-xl w-fit mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl font-bold mt-2 mb-14">From Camera to Alert in Seconds</h2>

          <div className="grid grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Camera captures face',       desc: 'Webcam or CCTV feed captures a face in the crowd'          },
              { step: '02', title: 'AI encodes the face',        desc: 'DeepFace converts face into a unique 128-dimension vector'  },
              { step: '03', title: 'Database match search',      desc: 'System compares against all missing persons in database'    },
              { step: '04', title: 'Alert sent to officer',      desc: 'If match found, live alert appears on officer dashboard'    },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="bg-blue-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────── */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider">Contact</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Get In Touch</h2>
            <p className="text-gray-400 mt-3">
              For support or queries regarding the FaceGuard system.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: MapPin,
                title: 'Location',
                info: 'Jaipur Engineering College & Research Centre, Jaipur, Rajasthan',
                color: 'bg-blue-50 text-blue-600'
              },
              {
                icon: Mail,
                title: 'Email',
                info: 'faceguard@jecrc.ac.in',
                color: 'bg-green-50 text-green-600'
              },
              {
                icon: Phone,
                title: 'Emergency',
                info: 'Police: 100  |  Emergency: 112',
                color: 'bg-red-50 text-red-600'
              },
            ].map(({ icon: Icon, title, info, color }) => (
              <div key={title}
                className="border border-gray-100 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className={`${color} p-3 rounded-xl w-fit mx-auto mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{info}</p>
              </div>
            ))}
          </div>

          {/* Team */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="font-bold text-gray-900 text-center mb-6">Development Team</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'Manav Mudgal',     id: '22EJCCS125' },
                { name: 'Deepak Choudhary', id: '22EJCCS069' },
                { name: 'Indresh Mehta',    id: '22EJCCS099' },
                { name: 'Kanika',           id: '22EJCCS104' },
              ].map(({ name, id }) => (
                <div key={id} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-2">
                    {name[0]}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{id}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-sm mt-4">
              Guide: <span className="font-medium text-gray-600">Ms. Kanika Bhutani</span> — Assistant Professor, CSE
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-white font-semibold text-sm">FaceGuard</span>
          </div>
          <p className="text-xs">
            © 2025 FaceGuard — Jaipur Engineering College & Research Centre
          </p>
          <Link to="/login"
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Officer / Admin Login →
          </Link>
        </div>
      </footer>

    </div>
  )
}