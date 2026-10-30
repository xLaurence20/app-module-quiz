import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'
import MockActionButton from '../components/MockActionButton'
import TeacherCharts from '../components/TeacherCharts'

export const instant = false

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const resolvedParams = await searchParams
  const activeTab = resolvedParams.tab || 'home'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', user.id).single()
  const isTeacher = profile?.role === 'teacher'

  // Fetch all modules
  const { data: modules } = await supabase
    .from('modules').select('id, title, teacher_id').order('created_at', { ascending: false })

  let attempts: any[] = []
  let stats = { totalModules: 0, totalQuizzes: 0, totalAttempts: 0 }
  let myModules: any[] = []

  if (isTeacher) {
    myModules = modules?.filter(m => m.teacher_id === user.id) || []
    const myModuleIds = myModules.map(m => m.id)

    const { data: quizzes } = await supabase.from('quizzes').select('id').in('module_id', myModuleIds)
    const myQuizIds = quizzes?.map(q => q.id) || []

    // Removed the .limit(10) so the charts have ALL data to calculate accurate statistics
    const { data: teacherAttempts } = await supabase
      .from('attempts')
      .select('*, quizzes(title), profiles!student_id(email)')
      .in('quiz_id', myQuizIds)
      .order('created_at', { ascending: false })

    attempts = teacherAttempts || []
    stats = {
      totalModules: myModules.length,
      totalQuizzes: myQuizIds.length,
      totalAttempts: attempts.length,
    }
  } else {
    // STUDENT DATA
    const { data: studentAttempts } = await supabase
      .from('attempts')
      .select('*, quizzes(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
    attempts = studentAttempts || []
  }

  return (
    <main className="max-w-[1100px] mx-auto p-4 md:p-6 min-h-[70vh]">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center bg-white border-b border-[#ddd] p-4 mb-6 rounded-[15px] shadow-sm">
        <div className="font-bold text-[#7a3e00]">
          {isTeacher ? 'Teacher Dashboard' : 'Student Dashboard'}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden md:inline">Signed in as {profile?.email}</span>
          {isTeacher && (
            <Link href="/modules/new" className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
              + New Module
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      {/* =========================================
          TEACHER VIEW (TABS) 
      ========================================= */}
      {isTeacher && (
        <>
          {/* TEACHER HOME TAB (Stats & Graphs) */}
          {activeTab === 'home' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#f6eadf] border border-[#ddd] p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-[#7a3e00]">My Modules</h3>
                  <p className="text-4xl font-bold text-[#2d241f] mt-2">{stats.totalModules}</p>
                </div>
                <div className="bg-[#f6eadf] border border-[#ddd] p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-[#7a3e00]">Quizzes Created</h3>
                  <p className="text-4xl font-bold text-[#2d241f] mt-2">{stats.totalQuizzes}</p>
                </div>
                <div className="bg-[#f6eadf] border border-[#ddd] p-6 rounded-xl">
                  <h3 className="text-sm font-bold text-[#7a3e00]">Total Attempts</h3>
                  <p className="text-4xl font-bold text-[#2d241f] mt-2">{stats.totalAttempts}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd] my-6">
                <h2 className="text-xl text-[#7a3e00] font-bold mb-2">Data Visualization</h2>
                <p className="text-sm text-gray-500 mb-4">Overview of student performance across your quizzes.</p>
                <TeacherCharts attempts={attempts} />
              </div>
            </>
          )}

          {/* TEACHER LESSONS TAB (Modules) */}
          {activeTab === 'lessons' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-[#7a3e00] font-bold">My Modules</h2>
                <Link href="/modules/new" className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
                  + Add Module
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myModules.map(m => (
                  <div key={m.id} className="bg-[#f6eadf] p-6 rounded-xl flex flex-col justify-between border border-[#ddd]">
                    <h3 className="text-[#663716] font-bold text-lg mb-2">{m.title}</h3>
                    <Link href={`/modules/${m.id}`} className="mt-4 bg-[#7a3e00] text-white text-center px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
                      Open Module
                    </Link>
                  </div>
                ))}
                {myModules.length === 0 && <p className="text-gray-500 italic">You haven't created any modules yet.</p>}
              </div>
            </>
          )}

          {/* TEACHER QUIZZES TAB (Submissions Table) */}
          {activeTab === 'quiz' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd] my-4">
              <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Quiz Submissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f6eadf]">
                      <th className="border border-[#ddd] p-3 text-left text-[#7a3e00]">Student</th>
                      <th className="border border-[#ddd] p-3 text-left text-[#7a3e00]">Quiz</th>
                      <th className="border border-[#ddd] p-3 text-left text-[#7a3e00]">Score</th>
                      <th className="border border-[#ddd] p-3 text-left text-[#7a3e00]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.length > 0 ? attempts.map((a: any) => (
                      <tr key={a.id} className="hover:bg-[#faf8f6]">
                        <td className="border border-[#ddd] p-3 font-medium text-[#315f8a] hover:underline">
                          <Link href={`/teacher/students/${a.student_id}`}>
                            {a.profiles?.email || 'Unknown Student'}
                          </Link>
                        </td>
                        <td className="border border-[#ddd] p-3">{a.quizzes?.title}</td>
                        <td className="border border-[#ddd] p-3 font-bold text-[#39733d]">{a.score} / {a.total}</td>
                        <td className="border border-[#ddd] p-3 text-gray-500">{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-4 text-center text-gray-500">No quiz submissions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TEACHER ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd] my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">ACTIVITIES</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Submitted Activities</h2>
              <p className="text-sm text-gray-500 mb-6">Here you can view student reflections and activity submissions.</p>
              
              {/* Mocked Activity Submission for UI Design */}
              <div className="border border-[#ddd] rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-[#315f8a]">student1@test.com</span>
                  <span className="text-xs text-gray-400">Today</span>
                </div>
                <p className="text-sm bg-[#faf8f6] p-3 rounded italic">"I want to improve my table napkin folding skills because I want the table to look professional for customers."</p>
              </div>
            </div>
          )}

          {/* TEACHER ASSESSMENT TAB */}
          {activeTab === 'assessment' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd] my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">ASSESSMENT</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Assessment Overview</h2>
              <p className="text-sm text-gray-500 mb-6">This area is reserved for formal pre-tests, post-tests, and performance tasks.</p>
              
              <div className="bg-[#fff7e8] border-l-4 border-[#d98b3a] p-4 rounded text-sm">
                <strong>Note:</strong> In the final research product, this tab will display aggregated scores for standardized tests and rubrics for performance tasks.
              </div>
            </div>
          )}

          {/* TEACHER FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm border border-[#ddd] my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">FEEDBACK</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Student Feedback</h2>
              
              <div className="space-y-4">
                {/* Mocked Feedback for UI Design */}
                <div className="border border-[#ddd] p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm text-[#2d241f]">Ease of Use:</span>
                    <span className="text-sm text-[#39733d] font-bold">Very Easy</span>
                  </div>
                  <p className="text-sm"><strong>Most helpful:</strong> "The AI tutor helps me understand the hard words."</p>
                  <p className="text-sm mt-1"><strong>Improvement:</strong> "More quizzes please!"</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================
          STUDENT VIEW (TABS)
      ========================================= */}
      {!isTeacher && (
        <>
          {/* HOME TAB */}
          {activeTab === 'home' && (
            <>
              <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
                <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">WELCOME</span>
                <h2 className="text-2xl text-[#7a3e00] font-bold mb-2">Welcome, Grade 9 Learner!</h2>
                <p className="mb-4">This prototype provides organized Food Services lessons, guided activities, AI-supported explanations, quizzes, and reflection tasks.</p>
                <div className="bg-[#fff7e8] border-l-4 border-[#d98b3a] p-4 rounded text-sm mb-4">
                  <strong>Important:</strong> AI is a learning support. It does not replace your teacher. Always verify information with your teacher and use the validated module content as your main learning guide.
                </div>
              </div>
              <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
                <h2 className="text-xl text-[#7a3e00] font-bold mb-2">Learning Flow</h2>
                <p className="font-bold">Learn → Practice → Ask → Apply → Assess → Reflect</p>
              </div>
            </>
          )}

          {/* LESSONS TAB */}
          {activeTab === 'lessons' && (
            <>
              <h2 className="text-xl text-[#7a3e00] font-bold mt-4 mb-4">Food Services Lessons</h2>
              <p className="text-sm text-[#6d625c] mb-4">Open a module to read the lesson, ask the AI tutor, and take quizzes.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules?.map(m => (
                  <div key={m.id} className="bg-[#f6eadf] p-6 rounded-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-[#663716] font-bold text-lg mb-2">{m.title}</h3>
                      <p className="text-sm text-[#2d241f]">Click to open this lesson.</p>
                    </div>
                    <Link href={`/modules/${m.id}`} className="mt-4 bg-[#7a3e00] text-white text-center px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
                      Open Lesson
                    </Link>
                  </div>
                ))}
                {!modules?.length && <p className="text-gray-500 italic">No modules available yet.</p>}
              </div>
            </>
          )}

          {/* ACTIVITIES TAB */}
          {activeTab === 'activities' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">ACTIVITY</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-2">Reflection</h2>
              <p className="text-sm mb-4">Write one Food Services skill you want to improve and explain why.</p>
              <textarea className="w-full p-3 border border-[#ccc] rounded-lg mb-4" rows={4} placeholder="Type your answer..."></textarea>
              <MockActionButton 
                label="Save Reflection" 
                message="Reflection saved!" 
                className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90" 
              />
            </div>
          )}

          {/* AI SUPPORT TAB */}
          {activeTab === 'ai' && (
            <div className="bg-[#f0f6fc] border-l-4 border-[#315f8a] p-6 rounded-[15px] my-4 shadow-sm">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">AI LEARNING SUPPORT</span>
              <h2 className="text-xl text-[#315f8a] font-bold mb-2">Ask for an Explanation</h2>
              <p className="text-sm mb-4">To ask the AI questions about a specific lesson, open a module and use the AI Module Tutor!</p>
              <div className="bg-white p-4 rounded-lg text-sm border border-[#ddd] text-gray-600">
                (The AI Chat is available inside each module to ensure answers are restricted to that specific lesson's content.)
              </div>
              <Link href="/dashboard?tab=lessons" className="inline-block mt-4 bg-[#315f8a] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90">
                Go to Lessons
              </Link>
            </div>
          )}

          {/* QUIZ TAB */}
          {activeTab === 'quiz' && (
            <>
              <h2 className="text-xl text-[#7a3e00] font-bold mt-4 mb-4">Your Past Quiz Attempts</h2>
              <div className="bg-white rounded-[15px] p-6 shadow-sm">
                {attempts && attempts.length > 0 ? (
                  <div className="space-y-3">
                    {attempts.map((a: any) => (
                      <Link key={a.id} href={`/quiz/attempt/${a.id}`} className="flex justify-between items-center bg-[#faf8f6] border border-[#ddd] p-4 rounded-xl hover:border-[#d98b3a] transition-colors">
                        <span className="font-bold text-[#2d241f]">{a.quizzes.title}</span>
                        <span className="font-bold text-[#39733d] bg-[#e8f5e9] px-3 py-1 rounded-full text-sm">{a.score} / {a.total}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#6d625c]">You haven't taken any quizzes yet.</p>
                )}
              </div>
            </>
          )}

          {/* ASSESSMENT TAB */}
          {activeTab === 'assessment' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">ASSESSMENT</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-4">Learning Assessment Area</h2>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#f6eadf]">
                    <th className="border border-[#ddd] p-3 text-left">Assessment</th>
                    <th className="border border-[#ddd] p-3 text-left">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-[#ddd] p-3">Pretest</td><td className="border border-[#ddd] p-3">Determine baseline performance.</td></tr>
                  <tr><td className="border border-[#ddd] p-3">Formative activities</td><td className="border border-[#ddd] p-3">Provide practice and feedback.</td></tr>
                  <tr><td className="border border-[#ddd] p-3">Posttest</td><td className="border border-[#ddd] p-3">Determine performance after module.</td></tr>
                  <tr><td className="border border-[#ddd] p-3">Performance task</td><td className="border border-[#ddd] p-3">Assess practical application.</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-[15px] p-6 shadow-sm my-4">
              <span className="inline-block bg-[#efd0ae] text-[#67330d] rounded-full px-3 py-1 text-xs font-bold mb-3">LEARNER FEEDBACK</span>
              <h2 className="text-xl text-[#7a3e00] font-bold mb-2">Tell Us About Your Experience</h2>
              <p className="text-sm mb-4">Your feedback can help improve the module.</p>
              <label className="block text-sm font-bold mb-1 mt-4">How easy was the module to use?</label>
              <select className="w-full p-3 border border-[#ccc] rounded-lg mb-4">
                <option>Very Easy</option><option>Easy</option><option>Moderately Easy</option><option>Difficult</option>
              </select>
              <label className="block text-sm font-bold mb-1">What part helped you most?</label>
              <textarea className="w-full p-3 border border-[#ccc] rounded-lg mb-4" rows={3} placeholder="Type your answer..."></textarea>
              
              <MockActionButton 
                label="Submit Feedback" 
                message="Feedback submitted!" 
                className="bg-[#7a3e00] text-white px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90" 
              />
            </div>
          )}
        </>
      )}

    </main>
  )
}