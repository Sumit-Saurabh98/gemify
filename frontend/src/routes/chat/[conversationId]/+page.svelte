<script lang="ts" context="module">
  export const load = async ({ params }: { params: { conversationId: string } }) => {
    return {
      conversationId: params.conversationId,
    };
  };
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ChatMessage from '$lib/components/ChatMessage.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import SuggestedQuestions from '$lib/components/SuggestedQuestions.svelte';
  import { chatStore, uiStore, chatService, apiClient } from '$lib';
  
  export let data: { conversationId: string };
  
  let messagesContainer: HTMLElement;
  
  // Subscribe to stores
  $: messages = $chatStore.messages;
  $: isTyping = $chatStore.isTyping;
  $: error = $chatStore.error;
  $: showSuggestions = $uiStore.showSuggestions && messages.length === 1;
  
  onMount(async () => {
    // Set conversation ID from URL
    chatStore.setConversationId(data.conversationId);
    
    // Load messages for this conversation
    const response = await apiClient.getMessages(data.conversationId, 50);
    
    if (response.success && response.data) {
      chatStore.clearMessages();
      response.data.messages.forEach(msg => chatStore.addMessage(msg));
    } else {
      // Conversation doesn't exist or is empty, add welcome message
      chatStore.initialize();
    }
  });
  
  async function handleSendMessage(event: CustomEvent<{ message: string }>) {
    uiStore.setShowSuggestions(false);
    const success = await chatService.sendMessage(event.detail.message);
    
    if (success) {
      setTimeout(scrollToBottom, 100);
    }
  }
  
  function handleSuggestionSelect(event: CustomEvent<{ suggestion: string }>) {
    handleSendMessage(new CustomEvent('send', { detail: { message: event.detail.suggestion } }));
  }
  
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      uiStore.setScrolledToBottom(true);
    }
  }
  
  function handleScroll() {
    if (messagesContainer) {
      const isAtBottom = 
        messagesContainer.scrollHeight - messagesContainer.scrollTop === messagesContainer.clientHeight;
      uiStore.setScrolledToBottom(isAtBottom);
    }
  }
  
  function dismissError() {
    chatStore.setError(null);
  }
</script>

<svelte:head>
  <title>GamerHub AI Chat</title>
</svelte:head>

<div class="chat-container">
  <div class="chat-header">
    <div class="header-content">
      <div class="logo">
        <div class="logo-icon">🎮</div>
        <div>
          <h1 class="title">GamerHub Support</h1>
          <p class="subtitle">AI-Powered Live Chat</p>
        </div>
      </div>
      <div class="status">
        <span class="status-dot"></span>
        <span class="status-text">Online</span>
      </div>
    </div>
  </div>
  
  {#if error}
    <div class="error-banner">
      <span class="error-text">⚠️ {error}</span>
      <button class="error-dismiss" on:click={dismissError}>✕</button>
    </div>
  {/if}
  
  <div 
    class="messages-container" 
    bind:this={messagesContainer}
    on:scroll={handleScroll}
  >
    <div class="messages-inner">
      {#if showSuggestions}
        <SuggestedQuestions on:select={handleSuggestionSelect} />
      {/if}
      
      {#each messages as message (message.id)}
        <ChatMessage
          sender={message.sender}
          text={message.text}
          timestamp={message.timestamp}
          sources={message.sources || []}
        />
      {/each}
      
      {#if isTyping}
        <ChatMessage sender="ai" text="" isTyping={true} timestamp="" />
      {/if}
    </div>
  </div>
  
  <ChatInput 
    on:send={handleSendMessage}
    disabled={isTyping}
    placeholder="Ask me anything about products, shipping, returns..."
  />
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: white;
  }
  
  .chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo-icon {
    font-size: 2rem;
    background: rgba(255, 255, 255, 0.2);
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
  }
  
  .title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .subtitle {
    margin: 0;
    font-size: 0.875rem;
    opacity: 0.9;
  }
  
  .status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 1rem;
  }
  
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 8px #10b981;
    animation: pulse 2s ease-in-out infinite;
  }
  
  .status-text {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .error-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #fee2e2;
    border-bottom: 1px solid #ef4444;
  }
  
  .error-text {
    color: #991b1b;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .error-dismiss {
    background: none;
    border: none;
    color: #991b1b;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: background 0.2s;
  }
  
  .error-dismiss:hover {
    background: rgba(153, 27, 27, 0.1);
  }
  
  .messages-container {
    flex: 1;
    overflow-y: auto;
    background: #ffffff;
  }
  
  .messages-inner {
    padding: 1.5rem;
    min-height: 100%;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @media (max-width: 768px) {
    .chat-header {
      padding: 1rem;
    }
    
    .title {
      font-size: 1.125rem;
    }
    
    .messages-inner {
      padding: 1rem;
    }
  }
</style>
