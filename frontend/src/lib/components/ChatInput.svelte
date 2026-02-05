<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let disabled: boolean = false;
  export let placeholder: string = 'Type your message...';
  
  const dispatch = createEventDispatcher();
  let message = '';
  let textarea: HTMLTextAreaElement;
  
  function handleSubmit() {
    if (message.trim() && !disabled) {
      dispatch('send', { message: message.trim() });
      message = '';
      
      // Reset textarea height
      if (textarea) {
        textarea.style.height = 'auto';
      }
    }
  }
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }
  
  function autoResize() {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }
</script>

<div class="input-container">
  <textarea
    bind:this={textarea}
    bind:value={message}
    on:input={autoResize}
    on:keydown={handleKeyDown}
    {placeholder}
    {disabled}
    rows="1"
    class="message-input"
  ></textarea>
  <button
    type="button"
    on:click={handleSubmit}
    disabled={!message.trim() || disabled}
    class="send-button"
    aria-label="Send message"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="icon"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  </button>
</div>

<style>
  .input-container {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    padding: 1rem;
    background: white;
    border-top: 1px solid #e5e7eb;
  }
  
  .message-input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 1.5rem;
    font-size: 0.9375rem;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    max-height: 120px;
    overflow-y: auto;
    color: #1f2937;
    background: white;
  }
  
  .message-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  .message-input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
  
  .send-button {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
    flex-shrink: 0;
  }
  
  .send-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  
  .send-button:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .icon {
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
