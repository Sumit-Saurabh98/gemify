import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MessageSquare } from 'lucide-react'

interface ConversationListProps {
  onCreateNew: () => void
}

export function ConversationList({ onCreateNew }: ConversationListProps) {
  const { conversations, currentConversation, setCurrentConversation, isLoading } = useAppStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleSelectConversation = (conversation: any) => {
    setCurrentConversation(conversation)
  }

  const handleCreateNew = () => {
    setIsCreating(true)
    onCreateNew()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        <Button 
          onClick={handleCreateNew}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-4 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a new conversation to begin chatting</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversation?.id === conversation.id
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/avatars/${conversation.id}.png`} />
                <AvatarFallback>
                  {conversation.title.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conversation.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  )
}