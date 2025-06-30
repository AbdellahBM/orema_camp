'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Custom hook for mobile menu
function useToggle(initial = false): [boolean, () => void] {
  const [open, setOpen] = useState(initial);
  const toggle = () => setOpen((v) => !v);
  return [open, toggle];
}

export default function HomePage() {
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Set your event date here (adjust as needed)
  const eventDate = new Date('2024-07-15T08:00:00')

  const [menuOpen, toggleMenu] = useToggle(false);
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = eventDate.getTime() - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timelineEvents = [
    {
      time: "08:00 AM",
      title: "Lorem Ipsum Dolor",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor"
    },
    {
      time: "10:00 AM", 
      title: "Consectetur Adipiscing",
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi"
    },
    {
      time: "12:30 PM",
      title: "Sed Do Eiusmod",
      description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum"
    },
    {
      time: "02:00 PM",
      title: "Tempor Incididunt",
      description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui"
    },
    {
      time: "04:30 PM",
      title: "Ut Labore Dolore",
      description: "Magna aliqua enim ad minim veniam, quis nostrud exercitation ullamco"
    },
    {
      time: "06:00 PM",
      title: "Magna Aliqua",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod"
    },
    {
      time: "08:00 PM",
      title: "Consectetur Elit",
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris"
    }
  ]

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=300&fit=crop",
      alt: "Lorem ipsum dolor sit"
    },
    {
      src: "https://images.unsplash.com/photo-1533873984035-25970ab07461?w=400&h=300&fit=crop",
      alt: "Consectetur adipiscing elit"
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", 
      alt: "Sed do eiusmod tempor"
    },
    {
      src: "https://images.unsplash.com/photo-1564577160324-112d603f750f?w=400&h=300&fit=crop",
      alt: "Incididunt ut labore"
    },
    {
      src: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=300&fit=crop",
      alt: "Dolore magna aliqua"
    },
    {
      src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=400&h=300&fit=crop",
      alt: "Ut enim ad minim"
    }
  ]

  // Smooth scroll handler
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Close mobile menu if open
    if (menuOpen) toggleMenu();
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl" lang="ar">
      {/* Poster Modal */}
      {posterOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] transition-all duration-500 animate-fadeIn"
          onClick={() => setPosterOpen(false)}
        >
          <div
            className="absolute inset-0 bg-secondary-200/60 blur-2xl animate-blurIn"
            aria-hidden="true"
          ></div>
          <div
            className="relative z-10 max-w-full max-h-full p-4 flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 left-2 bg-secondary-600 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-lg hover:bg-secondary-700 transition"
              onClick={() => setPosterOpen(false)}
              aria-label="إغلاق الملصق"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <img
              src="/poster.jpg"
              alt="ملصق الملتقى الصيفي"
              className="rounded-2xl shadow-2xl max-w-[90vw] max-h-[80vh] border-4 border-secondary-400 animate-scaleIn"
              style={{ background: 'white' }}
            />
          </div>
        </div>
      )}
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-white/70 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image src="/logo.png" alt="شعار الملتقى الصيفي" width={48} height={48} className="mr-2 animate-spin-slow hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline gap-2">
                <a href="#about" className="nav-link" onClick={e => handleNavClick(e, 'about')}>حول الملتقى</a>
                <a href="#countdown" className="nav-link" onClick={e => handleNavClick(e, 'countdown')}>العد التنازلي</a>
                <a href="#timeline" className="nav-link" onClick={e => handleNavClick(e, 'timeline')}>البرنامج</a>
                <a href="#gallery" className="nav-link" onClick={e => handleNavClick(e, 'gallery')}>المعرض</a>
                <button
                  className="ml-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 bg-secondary-600 text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                  onClick={() => setPosterOpen(true)}
                  type="button"
                >
                  الملصق
                </button>
                <Link
                  href="/admin"
                  className="ml-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200 hover:text-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-400"
                >
                  🏕️ إدارة
                </Link>
              </div>
            </div>
            <Link 
              href="/register"
              className="register-btn"
            >
              سجل الآن
            </Link>
            {/* Mobile menu button */}
            <button className="md:hidden flex items-center p-2 rounded transition hover:bg-brand-100 focus:outline-none" onClick={toggleMenu} aria-label="فتح القائمة">
              <svg className="w-7 h-7 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        <div className={`md:hidden transition-all duration-500 overflow-hidden bg-white/95 shadow-lg ${menuOpen ? 'max-h-96 py-4' : 'max-h-0 py-0'}`} style={{direction: 'rtl'}}>
          <div className="flex flex-col items-end gap-2 px-6">
            <a href="#about" className="nav-link py-2" onClick={e => handleNavClick(e, 'about')}>حول الملتقى</a>
            <a href="#countdown" className="nav-link py-2" onClick={e => handleNavClick(e, 'countdown')}>العد التنازلي</a>
            <a href="#timeline" className="nav-link py-2" onClick={e => handleNavClick(e, 'timeline')}>البرنامج</a>
            <a href="#gallery" className="nav-link py-2" onClick={e => handleNavClick(e, 'gallery')}>المعرض</a>
            <button
              className="w-full text-center mt-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 bg-secondary-600 text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-400"
              onClick={() => setPosterOpen(true)}
              type="button"
            >
              الملصق
            </button>
            <Link 
              href="/admin"
              className="w-full text-center mt-2 px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 bg-secondary-100 text-secondary-700 border border-secondary-300 hover:bg-secondary-200 hover:text-secondary-800 focus:outline-none focus:ring-2 focus:ring-secondary-400"
              onClick={() => toggleMenu()}
            >
              🏕️ إدارة
            </Link>
            <Link href="/register" className="register-btn w-full text-center mt-2">سجل الآن</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="relative overflow-hidden pt-20 sm:pt-24 pb-8 sm:pb-12" style={{ 
        background: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 25%, #F0F8FF 50%, #FFF8DC 75%, #F4A460 100%)',
        backgroundSize: '200% 200%',
        animation: 'beachWave 8s ease-in-out infinite'
      }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Main Title */}
          <div className="text-center mb-1 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-brand-600 mb-4 sm:mb-6 tracking-tight leading-tight px-2">الملتقى الصيفي</h1>
            <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-3 sm:gap-4 text-base sm:text-lg text-gray-700 font-semibold mb-4 sm:mb-6 px-4">
              <span className="inline-flex items-center justify-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="sm:w-[22px] sm:h-[22px]"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="#E19827"/></svg>طنجة</span>
              <span className="inline-flex items-center justify-center gap-2"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="sm:w-[22px] sm:h-[22px]"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="#589CA9"/></svg>من 5 إلى 11 غشت 2025</span>
            </div>
          </div>
          {/* Speaker image */}
          <div className="flex justify-center">
            <div className="relative inline-block rounded-2xl overflow-hidden max-w-full">
              <Image 
                src="/speaker.png" 
                alt="صورة الضيف الرئيسي" 
                width={600} 
                height={600} 
                className="object-cover w-full h-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl" 
              />
              {/* Speaker Description */}
              <div className="absolute bottom-20 left-0 right-0 text-center font-bold mb-4 drop-shadow-lg" style={{ fontFamily: 'Tasees, Tasees Bold, sans-serif', background: 'linear-gradient(90deg, #FFD700 0%, #FFC300 40%, #FFB300 70%, #FF8F00 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: '0 2px 8px rgba(0,0,0,0.18), 0 1px 0 #fff' }}>
                <p className="inline-block px-4 py-1 rounded-lg bg-white/10 backdrop-blur-sm">علم الدورة : الأستاذ عبد الله شبابو</p>
              </div>
            </div>
          </div>
          {/* Slogan */}
          <div className="text-center  sm:mt-6">
            <div className="relative group max-w-4xl mx-auto px-4">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-secondary-500/20 rounded-2xl blur-xl transform rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative text-lg sm:text-xl md:text-2xl text-secondary-900 font-bold bg-white/90 backdrop-blur-sm rounded-2xl inline-block px-6 sm:px-8 py-3 sm:py-4 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 max-w-full">
                <div className="absolute top-0 left-4 w-4 h-4 sm:w-6 sm:h-6 bg-brand-500 rounded-full opacity-20"></div>
                <div className="absolute bottom-0 right-8 w-3 h-3 sm:w-4 sm:h-4 bg-secondary-500 rounded-full opacity-20"></div>
                <span className="relative z-10 leading-relaxed">على ضوء التحرير نحو طالب غايته الإصلاح و التغيير</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Beach-themed decorative elements with 3D icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* 3D Sun with rays - Positioned closer to speaker and bigger */}
          <div className="hidden md:block absolute top-48 lg:top-56 right-[20%] lg:right-[25%] opacity-85" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>
            <svg width="160" height="160" viewBox="0 0 100 100" className="drop-shadow-2xl lg:w-[200px] lg:h-[200px] xl:w-[240px] xl:h-[240px]">
              <defs>
                <radialGradient id="sunGradient" cx="0.3" cy="0.3">
                  <stop offset="0%" stopColor="#fff176"/>
                  <stop offset="70%" stopColor="#ffb300"/>
                  <stop offset="100%" stopColor="#ff8f00"/>
                </radialGradient>
              </defs>
              {/* Sun rays */}
              <g stroke="#ffc107" strokeWidth="3" opacity="0.8">
                <line x1="50" y1="10" x2="50" y2="20"/>
                <line x1="72" y1="16" x2="67" y2="24"/>
                <line x1="84" y1="28" x2="76" y2="33"/>
                <line x1="90" y1="50" x2="80" y2="50"/>
                <line x1="84" y1="72" x2="76" y2="67"/>
                <line x1="72" y1="84" x2="67" y2="76"/>
                <line x1="50" y1="90" x2="50" y2="80"/>
                <line x1="28" y1="84" x2="33" y2="76"/>
                <line x1="16" y1="72" x2="24" y2="67"/>
                <line x1="10" y1="50" x2="20" y2="50"/>
                <line x1="16" y1="28" x2="24" y2="33"/>
                <line x1="28" y1="16" x2="33" y2="24"/>
              </g>
              <circle cx="50" cy="50" r="25" fill="url(#sunGradient)"/>
              <circle cx="50" cy="50" r="22" fill="#fff176" opacity="0.3"/>
              <ellipse cx="42" cy="42" rx="6" ry="8" fill="#ffffff" opacity="0.5"/>
            </svg>
          </div>

          {/* 3D Cloud - Positioned closer to center */}
          <div className="hidden md:block absolute bottom-32 lg:bottom-40 left-[20%] lg:left-[25%] opacity-80" style={{ animation: 'float 6s ease-in-out infinite 2s' }}>
            <svg width="140" height="100" viewBox="0 0 140 100" className="drop-shadow-2xl lg:w-[170px] lg:h-[120px] xl:w-[200px] xl:h-[140px]">
              <defs>
                <radialGradient id="cloudGradient" cx="0.3" cy="0.2">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="50%" stopColor="#f0f8ff"/>
                  <stop offset="100%" stopColor="#e6f3ff"/>
                </radialGradient>
                <radialGradient id="cloudShadow" cx="0.5" cy="0.8">
                  <stop offset="0%" stopColor="#d0e7ff" opacity="0.3"/>
                  <stop offset="100%" stopColor="#87ceeb" opacity="0.6"/>
                </radialGradient>
              </defs>
              {/* Cloud shadow/base */}
              <ellipse cx="70" cy="85" rx="60" ry="12" fill="url(#cloudShadow)"/>
              {/* Main cloud body */}
              <circle cx="30" cy="60" r="22" fill="url(#cloudGradient)"/>
              <circle cx="55" cy="50" r="28" fill="url(#cloudGradient)"/>
              <circle cx="85" cy="55" r="25" fill="url(#cloudGradient)"/>
              <circle cx="110" cy="65" r="20" fill="url(#cloudGradient)"/>
              <circle cx="70" cy="70" r="30" fill="url(#cloudGradient)"/>
              {/* Cloud highlights */}
              <ellipse cx="45" cy="45" rx="8" ry="12" fill="#ffffff" opacity="0.7"/>
              <ellipse cx="75" cy="50" rx="12" ry="8" fill="#ffffff" opacity="0.5"/>
              <ellipse cx="95" cy="58" rx="6" ry="10" fill="#ffffff" opacity="0.6"/>
              {/* Soft inner glow */}
              <circle cx="70" cy="58" r="35" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.3"/>
            </svg>
          </div>
        </div>
        
        {/* Decorative background number with beach theme - Responsive positioning */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-[30%] sm:top-1/2 sm:-translate-y-1/2 text-[10rem] sm:text-[12rem] md:text-[14rem] lg:text-[18rem] xl:text-[22rem] font-extrabold select-none pointer-events-none z-0"
          style={{ 
            background: 'linear-gradient(90deg, #FFD700 0%, #FFC300 40%, #FFB300 70%, #FF8F00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.2
          }}
        >15</div>
      </section>

      {/* Countdown Section */}
      <section id="countdown" className="relative text-white min-h-[800px] flex items-center" style={{ backgroundImage: 'url(/poster.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">انطلاق الملتقى بعد...</h2>
            <p className="text-xl mb-12 opacity-90">سارع بالتسجيل، المقاعد محدودة!</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.days}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">يوم</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.hours}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">ساعة</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.minutes}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">دقيقة</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl md:text-4xl font-bold">{timeLeft.seconds}</div>
                <div className="text-sm uppercase tracking-wide opacity-80">ثانية</div>
              </div>
            </div>

            <Link 
              href="/register"
              className="bg-white text-brand-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg inline-flex items-center"
            >
              <span className="mr-2">⚡</span>
              سجل الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">برنامج الملتقى</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              اكتشف تفاصيل الأنشطة والفعاليات اليومية للملتقى الصيفي.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-1 h-full bg-secondary-300"></div>
              
              {timelineEvents.map((event, index) => (
                <div key={index} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-secondary-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`bg-white rounded-lg shadow-lg p-6 ml-12 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:text-right' : 'md:ml-auto'}`}>
                    <div className="text-secondary-600 font-semibold text-lg mb-2">{event.time}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">هل لديك أسئلة؟ تواصل معنا!</p>
            <Link 
              href="/register"
              className="bg-brand-600 text-white px-8 py-4 rounded-lg hover:bg-brand-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              سجل الآن - المقاعد محدودة!
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">معرض الصور</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              تصفح أجمل لحظات الملتقى الصيفي في صور.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-medium">{image.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-lg text-gray-600 mb-6">هل ترغب في الانضمام إلينا؟ سجل الآن!</p>
            <Link 
              href="/register"
              className="bg-brand-600 text-white px-8 py-4 rounded-lg hover:bg-brand-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              سجل الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br-brand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            لا تفوت فرصة المشاركة في الملتقى الصيفي!
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            سجل الآن وكن جزءًا من تجربة فريدة تجمع بين المتعة والفائدة.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register"
              className="bg-brand-600 text-white px-10 py-5 rounded-lg hover:bg-brand-700 transition-colors font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏕️ سجل الآن - المقاعد محدودة!
            </Link>
            <div className="text-center">
              <p className="text-sm text-gray-500">✓ أنشطة تربوية وترفيهية</p>
              <p className="text-sm text-gray-500">✓ أطر مؤهلة ومرافقة</p>
              <p className="text-sm text-gray-500">✓ أجواء أسرية وآمنة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">🏕️ الملتقى الصيفي</h3>
              <p className="text-gray-300">
                جميع الحقوق محفوظة لمنظمة التجديد الطلابي فرع طنجة.
              </p>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors">حول الملتقى</a></li>
                <li><a href="#timeline" className="text-gray-300 hover:text-white transition-colors">البرنامج</a></li>
                <li><a href="#gallery" className="text-gray-300 hover:text-white transition-colors">المعرض</a></li>
                <li><Link href="/register" className="text-secondary-400 hover:text-secondary-300 transition-colors font-medium">سجل الآن</Link></li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4">معلومات التواصل</h4>
              <div className="space-y-2 text-gray-300">
                <p>📧 info@orema.ma</p>
                <p>📞 0600 000 000</p>
                <p>📍 طنجة، المغرب</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 الملتقى الصيفي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Stylish nav-link and button styles
// Add these to your globals.css:
/*
.nav-link {
  @apply relative px-3 py-2 text-gray-700 font-medium transition-colors duration-300 hover:text-brand-600;
}
.nav-link::after {
  content: '';
  @apply absolute left-0 right-0 bottom-0 h-0.5 bg-brand-600 scale-x-0 transition-transform duration-300 origin-right;
}
.nav-link:hover::after {
  @apply scale-x-100 origin-left;
}
.register-btn {
  @apply bg-brand-600 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-300 hover:bg-brand-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-400;
}
.animate-spin-slow {
  animation: spin 4s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
*/
