<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api';
  
  onMount(async () => {
    // Create a new conversation and redirect
    const response = await apiClient.createConversation({ region: 'USA' });
    
    if (response.success && response.data) {
      goto(`/chat/${response.data.conversationId}`);
    }
  });
</script>

<div class="loading">
  <div class="spinner"></div>
  <p>Starting new chat...</p>
</div>

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
  }
  
  .spinner {
    width: 3rem;
    height: 3rem;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>
