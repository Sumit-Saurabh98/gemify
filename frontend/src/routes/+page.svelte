<script lang="ts">
  import ChatMessage from '$lib/components/ChatMessage.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import SuggestedQuestions from '$lib/components/SuggestedQuestions.svelte';
  
  interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    sources?: string[];
  }
  
  let messages: Message[] = [
    {
      id: '1',
sender: 'ai',
      text: "Hi! I'm the GamerHub AI assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    }
  ];
  
  let isTyping = false;
  let messagesContainer: HTMLElement;
  
  function handleSendMessage(event: CustomEvent<{ message: string }>) {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: event.detail.message,
      timestamp: new Date().toISOString(),
    };
    
    messages = [...messages, userMessage];
    
    // Simulate AI response
    isTyping = true;
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Thank you for your message! This is a demo response. Once we integrate with the backend API, I'll provide real AI-powered answers to your questions.",
        timestamp: new Date().toISOString(),
        sources: ['FAQ: Shipping', 'Product Catalog'],
      };
      
      messages = [...messages, aiMessage];
      isTyping = false;
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    }, 1500);
    
    // Scroll to bottom
    setTimeout(scrollToBottom, 100);
  }
  
  function handleSuggestionSelect(event: CustomEvent<{ suggestion: string }>) {
    handleSendMessage(new CustomEvent('send', { detail: { message: event.detail.suggestion } }));
  }
  
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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
  
  <div class="messages-container" bind:this={messagesContainer}>
    <div class="messages-inner">
      {#if messages.length === 1}
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
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
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
    .chat-container {
      max-width: 100%;
      box-shadow: none;
    }
    
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
