import { useState, useRef, useCallback } from 'react'
import { API_BASE } from '../../api'
import '../styles/chatbot-animations.css'

type MessageAuthor = 'user' | 'bot'

interface Message {
  id: number
  author: MessageAuthor
  text: string
  timestamp: string
  typing?: boolean
}

interface ChatbotProps {
  compact?: boolean
}

// Optimized local responses for instant replies
const quickResponses: Record<string, string> = {
  'hi': '👋 Hello! How can I help you with Campus Utility today?',
  'hello': '👋 Hi there! What can I assist you with?',
  'help': '🚀 I can help with:\n• 📚 Study materials\n• 🏠 Accommodation\n• 📋 Lost & Found\n• 📅 Events\n• 👥 Study groups\n• 🛒 Medical help\n\nWhat do you need?',
  'book': '📚 Find study materials in Resources → Filter by course/semester → Buy or donate!',
  'accommodation': '🏠 Check Accommodation → Find PGs/hostels with filters!',
  'lost': '📋 Use Lost & Found → Report or find items!',
  'event': '📅 View Events → Check campus calendar!',
  'order': '🛒 Track orders → View in Profile → Order history!',
  'login': '👤 Click top-right → Login/Register → Access all features!',
  'payment': '💳 Checkout → Cart → Pay with Razorpay or COD!',
  'profile': '👤 Profile → Your listings, orders, and settings!'
}

const initialBotMessage: Message = {
  id: 1,
  author: 'bot',
  text: "⚡ Hi! I'm your Campus Utility assistant! Ask me anything about study materials, accommodation, events, or how to use the platform! 🚀",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
}

// Ultra-fast local reply function
const getInstantReply = (inputRaw: string): string => {
  const input = inputRaw.toLowerCase().trim()
  
  // Return instant response if available
  if (quickResponses[input]) {
    return quickResponses[input]
  }
  
  // Fallback for other queries
  const fallbackReply = "💬 I'm here to help! Try asking about study materials, accommodation, events, or orders! 🎓"
  return fallbackReply
}

export function Chatbot({ compact }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([initialBotMessage])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Optimized auto-scroll with requestAnimationFrame
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [messages])

  // Optimized getReply with instant local responses
  const getReply = useCallback(async (trimmed: string): Promise<string> => {
    // Instant local response
    const instantReply = getInstantReply(trimmed)
    if (instantReply) {
      return instantReply
    }

    // API call with timeout
    try {
      setLoading(true)
      setIsTyping(true)
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000)
      })

      const res = await Promise.race([
        fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        }),
        timeoutPromise
      ])

      if (res.ok) {
        const data = await res.json()
        return data.reply || getInstantReply(trimmed)
      }
    } catch {
      // Return fallback instantly
      return getInstantReply(trimmed)
    } finally {
      setLoading(false)
      setIsTyping(false)
    }
  }, [getInstantReply])

  // Optimized send with instant feedback
  const handleSend = useCallback(async () => {
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
    
    // Get reply and update messages
    const replyText = await getReply(trimmed)
    const botMessage: Message = {
      id: Date.now() + 1,
      author: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    
    setMessages((prev) => [...prev, botMessage])
    scrollToBottom()
  }, [getReply, scrollToBottom])

  // Optimized keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend, loading])

  // Optimized container classes
  const containerClasses = compact 
    ? 'h-80 w-80 max-w-md' 
    : 'h-96 w-96 max-w-lg'

  return (
    <div className={`fixed ${compact ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50 ${containerClasses} rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-2xl backdrop-blur-sm`}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
            <span className="text-lg font-bold">⚡</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-50">Campus Utility</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lightning Fast AI</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([initialBotMessage])}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 text-xs"
        >
          Clear
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm max-h-[60vh]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.author === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                message.author === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-sm shadow-md'
                  : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-900 rounded-bl-sm shadow-md border border-slate-200 dark:from-slate-700 dark:to-slate-600 dark:border-slate-600'
              }`}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
              <p className={`mt-1 text-[10px] ${
                message.author === 'user' 
                  ? 'text-blue-100' 
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {message.author === 'user' ? 'You' : '⚡ Assistant'} · {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-900 rounded-bl-sm shadow-md border border-slate-200 dark:from-slate-700 dark:to-slate-600 dark:border-slate-600 px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-xs">Assistant is typing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-2 max-w-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything! Type 'help' for quick menu 🚀"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="inline-flex h-10 w-20 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 text-[11px] font-medium text-white hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:from-blue-500 dark:to-indigo-400 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 border-2 border-white/30 border-t-transparent animate-spin rounded-full"></div>
                <span>Sending</span>
              </div>
            ) : (
              <span className="flex items-center gap-1">
                Send
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9 18-5l-9-18 9z"/>
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
