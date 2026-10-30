'use client'
import { useState, useRef, useEffect } from 'react'
import { askTutor } from './chat-actions'

export default function AIChat({ moduleId }: { moduleId: string }) {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const aiResponse = await askTutor(moduleId, input, messages)
      setMessages([...newMessages, { role: 'assistant', content: aiResponse }])
    } catch (err: any) {
      setError(err.message || 'Failed to get answer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border-2 border-blue-100 rounded-lg p-4 bg-gray-50 flex flex-col h-[400px] shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-lg text-blue-900">🤖 AI Module Tutor</h2>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Restricted to this module</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white p-3 rounded border">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-10">
            Ask a question! The AI will only answer using the text from this specific module.
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 p-3 rounded-lg text-sm animate-pulse">
              AI is reading the module...
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about the lesson..."
          className="flex-1 border p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50 font-medium"
        >
          Send
        </button>
      </form>
    </section>
  )
}