import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="bg-[#faf8f6] min-h-screen">
      
      {/* HERO SECTION */}
      <section className="max-w-[1100px] mx-auto px-4 py-20 text-center">
        <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-4 py-1.5 text-sm font-bold mb-6">
          Welcome to the Future of Learning
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-[#7a3e00] mb-6 leading-tight">
          Master Food Services with <br className="hidden md:block" />
          <span className="text-[#d98b3a]">AI-Powered Learning</span>
        </h1>
        <p className="text-lg md:text-xl text-[#6d625c] max-w-2xl mx-auto mb-10">
          An interactive, AI-integrated digital module designed for Grade 9 learners. Read lessons, ask our AI tutor, and test your knowledge with auto-generated quizzes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="bg-[#7a3e00] text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity shadow-lg">
            Get Started (Login / Sign Up)
          </Link>
          <Link href="/dashboard" className="bg-white border-2 border-[#7a3e00] text-[#7a3e00] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#f6eadf] transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="bg-white py-20 border-t border-b border-[#ddd]">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#7a3e00] mb-4">Everything You Need to Succeed</h2>
            <p className="text-[#6d625c]">Built on the Revised K–10 Curriculum for Food Services.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#f6eadf] p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-[#663716] mb-2">Learn</h3>
              <p className="text-sm text-[#2d241f]">Read structured Food Services lessons uploaded by your teacher.</p>
            </div>
            <div className="bg-[#f6eadf] p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="text-xl font-bold text-[#663716] mb-2">Practice</h3>
              <p className="text-sm text-[#2d241f]">Complete activities and apply what you learned in real-world scenarios.</p>
            </div>
            <div className="bg-[#f6eadf] p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-[#663716] mb-2">AI Support</h3>
              <p className="text-sm text-[#2d241f]">Ask our AI Tutor for simpler explanations and guided hints restricted to the lesson.</p>
            </div>
            <div className="bg-[#f6eadf] p-8 rounded-2xl text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-[#663716] mb-2">Assess</h3>
              <p className="text-sm text-[#2d241f]">Check your understanding through auto-generated and manual quizzes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING FLOW SECTION */}
      <section className="py-20 bg-[#faf8f6]">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#7a3e00] mb-12">The Learning Flow</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Learn</div>
            <div className="text-[#d98b3a] text-2xl hidden md:block">→</div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Practice</div>
            <div className="text-[#d98b3a] text-2xl hidden md:block">→</div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Ask AI</div>
            <div className="text-[#d98b3a] text-2xl hidden md:block">→</div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Apply</div>
            <div className="text-[#d98b3a] text-2xl hidden md:block">→</div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Assess</div>
            <div className="text-[#d98b3a] text-2xl hidden md:block">→</div>
            <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-[#ddd] font-bold text-[#315f8a] w-full md:w-auto">Reflect</div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-gradient-to-br from-[#6d3500] to-[#b96b2d] py-20 text-center px-4">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to start your learning journey?</h2>
          <p className="text-[#f6eadf] mb-8 text-lg">Join your classmates and explore the Food Services module today.</p>
          <Link href="/login" className="bg-white text-[#7a3e00] px-10 py-4 rounded-xl font-bold text-xl hover:bg-[#f6eadf] transition-colors shadow-lg inline-block">
            Login to Portal
          </Link>
        </div>
      </section>

    </main>
  )
}