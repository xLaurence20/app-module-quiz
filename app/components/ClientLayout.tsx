'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { Suspense } from 'react' // <-- Import Suspense

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if we are on the login page
  const isLogin = pathname === '/login' || pathname === '/'

  return (
    <>
      {/* Only show Header and Navbar if NOT on login page */}
      {!isLogin && (
        <>
          <header className="bg-gradient-to-br from-[#6d3500] to-[#b96b2d] text-white p-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              AI-Integrated Digital Learning Module
            </h1>
            <p className="font-bold">Food Services • Grade 9</p>
            <p className="text-sm opacity-90">Revised K–10 Curriculum | Thesis Prototype</p>
          </header>
          
          {/* WRAP NAVBAR IN SUSPENSE HERE */}
          <Suspense fallback={<div className="h-12 bg-white border-b border-[#ddd] w-full"></div>}>
            <Navbar />
          </Suspense>
        </>
      )}

      {/* The actual page content */}
      {children}

      {/* Only show Footer if NOT on login page */}
      {!isLogin && (
        <footer className="bg-[#2d241f] text-white text-center p-6 mt-10">
          <p className="font-bold">AI-Integrated Digital Learning Module for Food Services</p>
          <p className="text-sm opacity-80 mt-1">Grade 9 • Revised K–10 Curriculum • Research Prototype</p>
          <p className="text-xs opacity-60 mt-2">AI is intended as a learning support and should be teacher-guided and validated.</p>
        </footer>
      )}
    </>
  )
}