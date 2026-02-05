// Components
export { default as ChatMessage } from './components/ChatMessage.svelte';
export { default as ChatInput } from './components/ChatInput.svelte';
export { default as SuggestedQuestions } from './components/SuggestedQuestions.svelte';
export { default as ConversationSidebar } from './components/ConversationSidebar.svelte';

// Stores
export { chatStore, messageCount, hasConversation, userMessages, aiMessages } from './stores/chatStore';
export { uiStore } from './stores/uiStore';

// Types and API
export type { Message, Conversation, ChatState, APIResponse } from './types';
export { chatService, apiClient } from './api';
