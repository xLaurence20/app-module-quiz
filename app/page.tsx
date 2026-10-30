import Link from 'next/link'
export default function Home() {
  return (
    <main className="max-w-xl mx-auto p-6 mt-20 space-y-4">
      <h1 className="text-3xl font-bold">Module → Quiz</h1>
      <p className="text-gray-600">
        Teachers upload modules and build quizzes. Students take them and get graded.
      </p>
      <Link href="/dashboard" className="inline-block bg-black text-white px-4 py-2 rounded">
        Go to dashboard
      </Link>
    </main>
  )
}