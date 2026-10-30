'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'home'

  const links = [
    { name: 'Home', href: '/dashboard?tab=home', id: 'home' },
    { name: 'Lessons', href: '/dashboard?tab=lessons', id: 'lessons' },
    { name: 'Activities', href: '/dashboard?tab=activities', id: 'activities' },
    { name: 'AI Support', href: '/dashboard?tab=ai', id: 'ai' },
    { name: 'Quiz', href: '/dashboard?tab=quiz', id: 'quiz' },
    { name: 'Assessment', href: '/dashboard?tab=assessment', id: 'assessment' },
    { name: 'Feedback', href: '/dashboard?tab=feedback', id: 'feedback' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#ddd] flex flex-wrap justify-center">
      {links.map((link) => {
        // Determine if this tab is currently active
        const isActive = 
          (pathname === '/dashboard' && currentTab === link.id) || 
          (pathname.startsWith('/modules') && link.id === 'lessons')

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`border-0 px-3 py-3 cursor-pointer font-bold transition-colors text-sm md:text-base ${
              isActive 
                ? 'bg-[#f6eadf] text-[#6d3500] border-b-2 border-[#6d3500]' 
                : 'bg-white text-[#7a3e00] hover:bg-[#f6eadf]'
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}