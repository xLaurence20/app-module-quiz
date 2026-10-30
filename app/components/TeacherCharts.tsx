'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function TeacherCharts({ attempts }: { attempts: any[] }) {
  // 1. Prepare data for the Bar Chart (Submissions per Quiz)
  const quizCounts: Record<string, number> = {}
  attempts.forEach(a => {
    const title = a.quizzes?.title || 'Unknown Quiz'
    quizCounts[title] = (quizCounts[title] || 0) + 1
  })
  const barData = Object.keys(quizCounts).map(key => ({
    name: key,
    submissions: quizCounts[key]
  }))

  // 2. Prepare data for the Pie Chart (Pass vs Fail)
  let pass = 0
  let fail = 0
  attempts.forEach(a => {
    if (a.score / a.total >= 0.5) pass++
    else fail++
  })
  const pieData = [
    { name: 'Passed', value: pass },
    { name: 'Failed', value: fail }
  ]
  const COLORS = ['#39733d', '#dc2626'] // Green and Red

  if (attempts.length === 0) {
    return <p className="text-gray-500 text-sm italic">Not enough data to generate charts yet.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Bar Chart */}
      <div className="bg-white p-4 rounded-[15px] shadow-sm border border-[#ddd]">
        <h3 className="text-sm font-bold text-[#7a3e00] mb-4 text-center">Submissions per Quiz</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="submissions" fill="#d98b3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded-[15px] shadow-sm border border-[#ddd]">
        <h3 className="text-sm font-bold text-[#7a3e00] mb-4 text-center">Overall Pass/Fail Rate</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}