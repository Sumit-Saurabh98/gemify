<script lang="ts">
  export let suggestions: string[] = [
    "What are your shipping options?",
    "Tell me about your return policy",
    "Do you have gaming mice in stock?",
    "What's your warranty coverage?",
  ];
  
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  function selectSuggestion(suggestion: string) {
    dispatch('select', { suggestion });
  }
</script>

<div class="suggestions-container">
  <p class="suggestions-title">Suggested questions:</p>
  <div class="suggestions-grid">
    {#each suggestions as suggestion}
      <button 
        type="button"
        class="suggestion-button"
        on:click={() => selectSuggestion(suggestion)}
      >
        {suggestion}
      </button>
    {/each}
  </div>
</div>

<style>
  .suggestions-container {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .suggestions-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0 0 0.75rem 0;
  }
  
  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
  }
  
  .suggestion-button {
    padding: 0.625rem 0.875rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  .suggestion-button:hover {
    border-color: #667eea;
    background: #f3f4f6;
    color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
  
  .suggestion-button:active {
    transform: translateY(0);
  }
</style>
