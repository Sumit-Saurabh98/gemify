import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { ConversationList } from './ConversationList'
import { ChatArea } from './ChatArea'
import { NewConversationModal } from './NewConversationModal'
import toast from 'react-hot-toast'

export function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { fetchConversations, fetchMessages, currentConversation } = useAppStore()
  useEffect(() => {
    // Initialize the app by fetching conversations
    fetchConversations().catch((error) => {
      console.error('Failed to fetch conversations:', error)
      toast.error('Failed to load conversations. Please refresh the page.')
    })
  }, [fetchConversations])

  useEffect(() => {
    // Fetch messages when a conversation is selected
    if (currentConversation) {
      fetchMessages(currentConversation.id).catch((error) => {
        console.error('Failed to fetch messages:', error)
        toast.error('Failed to load messages for this conversation.')
      })
    }
  }, [currentConversation, fetchMessages])

  const handleCreateNewConversation = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div className="w-80 border-r bg-card">
        <ConversationList onCreateNew={handleCreateNewConversation} />
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatArea />
      </div>

      {/* Modals */}
      <NewConversationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}