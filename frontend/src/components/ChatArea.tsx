import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, Bot, User } from 'lucide-react'

export function ChatArea() {
  const { messages, currentConversation, sendMessage, isLoading, fetchSuggestions } = useAppStore()
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentConversation) {
      // Fetch suggestions when a conversation is selected
      fetchSuggestions()
    }
  }, [currentConversation, fetchSuggestions])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = inputValue.trim()
    
    if (!text || !currentConversation) return

    setInputValue('')
    setIsTyping(true)

    try {
      await sendMessage(currentConversation.id, text)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = async (suggestion: string) => {
    setInputValue(suggestion)
    const form = document.createElement('form')
    form.onsubmit = handleSendMessage
    form.submit()
  }

  const canSend = inputValue.trim().length > 0 && !isLoading && !isTyping

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback>
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {currentConversation?.title || 'Select a conversation'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentConversation ? 'Active conversation' : 'Select a conversation to start'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 && currentConversation ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-6 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {message.sender === 'user' ? (
                    <>
                      <User className="h-3 w-3" />
                      <span className="text-xs opacity-75">You</span>
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3" />
                      <span className="text-xs opacity-75">GamerHub</span>
                    </>
                  )}
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex gap-3 mb-6 justify-start">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage src="/bot-avatar.png" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-3 w-3" />
                <span className="text-xs opacity-75">GamerHub</span>
              </div>
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Suggestions */}
      {messages.length === 0 && currentConversation && (
        <div className="p-4 border-t">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {/* Static suggestions for now */}
            {[
              "What are your shipping options?",
              "How do I return a product?",
              "What payment methods do you accept?"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={currentConversation ? "Type your message..." : "Select a conversation to start chatting"}
            disabled={!currentConversation || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!canSend}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}