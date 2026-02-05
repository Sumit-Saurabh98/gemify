<script lang="ts">
  import { onMount } from 'svelte';
  
  export let sender: 'user' | 'ai' = 'user';
  export let text: string = '';
  export let timestamp: string = '';
  export let sources: string[] = [];
  export let isTyping: boolean = false;
  
  let formattedTime = '';
  
  onMount(() => {
    if (timestamp) {
      const date = new Date(timestamp);
      formattedTime = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  });
</script>

<div class="message" class:user={sender === 'user'} class:ai={sender === 'ai'}>
  <div class="message-content">
    {#if isTyping}
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    {:else}
      <p class="text">{text}</p>
      
      {#if sources && sources.length > 0}
        <div class="sources">
          <p class="sources-label">Sources:</p>
          <ul>
            {#each sources as source}
              <li>{source}</li>
            {/each}
          </ul>
        </div>
      {/if}
      
      {#if formattedTime}
        <span class="timestamp">{formattedTime}</span>
      {/if}
    {/if}
  </div>
</div>

<style>
  .message {
    display: flex;
    margin-bottom: 1rem;
    animation: slideIn 0.3s ease-out;
  }
  
  .message.user {
    justify-content: flex-end;
  }
  
  .message.ai {
    justify-content: flex-start;
  }
  
  .message-content {
    max-width: 70%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    position: relative;
  }
  
  .user .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 0.25rem;
  }
  
  .ai .message-content {
    background: #f3f4f6;
    color: #1f2937;
    border-bottom-left-radius: 0.25rem;
  }
  
  .text {
    margin: 0;
    line-height: 1.5;
    word-wrap: break-word;
  }
  
  .timestamp {
    display: block;
    font-size: 0.75rem;
    opacity: 0.7;
    margin-top: 0.25rem;
  }
  
  .sources {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .sources-label {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }
  
  .sources ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sources li {
    font-size: 0.875rem;
    padding: 0.25rem 0;
    opacity: 0.8;
  }
  
  .typing-indicator {
    display: flex;
    gap: 0.25rem;
    padding: 0.5rem 0;
  }
  
  .typing-indicator span {
    width: 0.5rem;
    height: 0.5rem;
    background: #9ca3af;
    border-radius: 50%;
    animation: typing 1.4s infinite;
  }
  
  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
</style>
