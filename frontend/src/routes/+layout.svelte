<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ConversationSidebar from '$lib/components/ConversationSidebar.svelte';
  import { apiClient } from '$lib/api';
  
  $: currentPath = $page.url.pathname;
  $: conversationId = currentPath.includes('/chat/') ? currentPath.split('/chat/')[1] : null;
  
  async function handleNewChat() {
    // Create new conversation
    const response = await apiClient.createConversation({ region: 'USA' });
    
    if (response.success && response.data) {
      // Navigate to new conversation
      goto(`/chat/${response.data.conversationId}`);
      // Reload page to refresh sidebar
      window.location.reload();
    }
  }
</script>

<div class="app-layout">
  <ConversationSidebar 
    currentConversationId={conversationId}
    onNewChat={handleNewChat}
  />
  
  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  
  .main-content {
    flex: 1;
    overflow: hidden;
  }
</style>
