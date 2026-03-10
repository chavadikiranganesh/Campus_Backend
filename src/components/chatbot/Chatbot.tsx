import { useState, useRef, useEffect } from 'react'
import { API_BASE } from '../../api'

type MessageAuthor = 'user' | 'bot'

interface Message {
  id: number
  author: MessageAuthor
  text: string
  timestamp: string
}

interface ChatbotProps {
  compact?: boolean
}

const initialBotMessage: Message = {
  id: 1,
  author: 'bot',
  text: "Hi, I'm the Campus Utility assistant. Ask me about study materials, accommodation, lost & found, events, study groups, or how this platform works.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

function getLocalBotReply(inputRaw: string): string {
  const input = inputRaw.toLowerCase()
  if (!input.trim()) {
    return "Please type a question about study materials, accommodation, or how to use Campus Utility."
  }
  if (input.includes('book') || input.includes('material') || input.includes('notes')) {
    return (
      'To find study materials, go to Resources or Marketplace. ' +
      'You can filter by course, semester, and category (books, instruments, calculators). ' +
      'Listings show whether items are for sale or donation, along with condition and contact details.'
    )
  }
  if (input.includes('accommodation') || input.includes('hostel') || input.includes('pg') || input.includes('room')) {
    return (
      'Open the Accommodation page to explore verified PGs and hostels near campus with rent, facilities, ' +
      'distance, and owner contact information.'
    )
  }
  if (input.includes('lost') || input.includes('found')) {
    return (
      'Use the Lost & Found page to report lost items or list what you found. ' +
      'You can filter by type (lost/found) and search by title or location.'
    )
  }
  if (input.includes('event') || input.includes('calendar')) {
    return 'Check the Event Calendar page for campus events, workshops, and important dates.'
  }
  if (input.includes('study group')) {
    return 'Go to Study Groups to find or create study groups by subject and course. You can search and filter by course.'
  }
  if (input.includes('what is campus utility') || input.includes('about project') || input.includes('about campus')) {
    return (
      'Campus Utility is a student platform for resource reuse, accommodation, lost & found, events, and study groups. ' +
      'It connects seniors and juniors and offers an AI assistant for guidance.'
    )
  }
  if (input.includes('how to use') || input.includes('help')) {
    return (
      'Use the top menu: Resources and Marketplace for study materials, Accommodation for PGs/hostels, ' +
      'Lost & Found, Events, and Study Groups. You can also use the search bar to find content across the site.'
    )
  }
  if (input.includes('technology') || input.includes('tech stack') || input.includes('built with')) {
    return (
      'Campus Utility is built with React, TypeScript, Vite, and Tailwind CSS. ' +
      'The backend uses Express with in-memory storage (replaceable with a database).'
    )
  }
  return (
    "I can help with study materials, accommodation, lost & found, events, and study groups. " +
    'Try: "How do I find books?" or "Tell me about accommodation."'
  )
}

export function Chatbot({ compact }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const getReply = async (trimmed: string): Promise<string> => {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        return data.reply ?? getLocalBotReply(trimmed)
      }
    } catch {
      // fallback to local
    }
    return getLocalBotReply(trimmed)
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: Message = {
      id: Date.now(),
      author: 'user',
      text: trimmed,
      timestamp: time,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const replyText = await getReply(trimmed)
    setLoading(false)
    const botMessage: Message = {
      id: Date.now() + 1,
      author: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, botMessage])
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const containerClasses = compact ? 'h-72' : 'h-[28rem]'

  return (
    <div
      className={`flex flex-col ${containerClasses} rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800`}
    >
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-semibold text-white dark:bg-blue-500">
            AI
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900 dark:text-slate-50">Campus Utility Assistant</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Online · platform &amp; FAQs</p>
          </div>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-xs"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                message.author === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm dark:bg-blue-500'
                  : 'bg-slate-100 text-slate-900 rounded-bl-sm dark:bg-slate-700 dark:text-slate-100'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              <p className={`mt-1 text-[9px] ${message.author === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                {message.author === 'user' ? 'You' : 'Assistant'} · {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-3 py-2 dark:bg-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-700">
        <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 dark:bg-slate-900">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask e.g. "How do I find books?"'
            className="flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="inline-flex h-7 rounded-full bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
