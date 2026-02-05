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
  <div class="message-wrapper">
    <div class="message-icon">
      {#if sender === 'user'}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon">
          <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-.57c0-.81.48-1.53 1.22-1.85.85-.37 1.79-.58 2.78-.58.99 0 1.93.21 2.78.58.74.32 1.22 1.04 1.22 1.85V17zm-.5-4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
      {/if}
    </div>
    
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
  
  .message-wrapper {
    display: flex;
    gap: 0.5rem;
    max-width: 70%;
    align-items: flex-start;
  }
  
  .user .message-wrapper {
    flex-direction: row-reverse;
  }
  
  .message-icon {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.25rem;
  }
  
  .user .message-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
  
  .ai .message-icon {
    background: #f3f4f6;
    color: #6b7280;
  }
  
  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .message-content {
    flex: 1;
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
