<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { apiClient } from '$lib/api';
  import type { Message } from '$lib/types';
  
  export let currentConversationId: string | null = null;
  export let onNewChat: () => void;
  
  let conversations: Array<{
    id: string;
    created_at: string;
    updated_at: string;
    lastMessage?: {
      text: string;
      sender: string;
      created_at: string;
    };
  }> = [];
  
  let isLoading = false;
  let isSidebarOpen = true;
  
  onMount(() => {
    loadConversations();
  });
  
  async function loadConversations() {
    isLoading = true;
    try {
      const response = await apiClient.getConversations(50);
      if (response.success && response.data) {
        conversations = response.data.conversations;
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      isLoading = false;
    }
  }
  
  function getPreviewText(conv: typeof conversations[0]): string {
    if (!conv.lastMessage) {
      return 'New conversation';
    }
    const text = conv.lastMessage.text;
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }
  
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
  
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<div class="sidebar-container" class:open={isSidebarOpen}>
  <button class="sidebar-toggle" on:click={toggleSidebar}>
    {#if isSidebarOpen}
      &#9664;
    {:else}
      &#9654;
    {/if}
  </button>
  
  <aside class="sidebar" class:hidden={!isSidebarOpen}>
    <div class="sidebar-header">
      <h2 class="sidebar-title">Chats</h2>
      <button class="new-chat-btn" on:click={onNewChat}>
        <span class="icon">+</span>
        New Chat
      </button>
    </div>
    
    <div class="conversations-list">
      {#if isLoading}
        <div class="loading">Loading conversations...</div>
      {:else if conversations.length === 0}
        <div class="empty">No conversations yet</div>
      {:else}
        {#each conversations as conversation (conversation.id)}
          <button
            class="conversation-item"
            class:active={currentConversationId === conversation.id}
            on:click={() => goto(`/chat/${conversation.id}`)}
          >
            <div class="conversation-icon">💬</div>
            <div class="conversation-content">
              <div class="conversation-preview">{getPreviewText(conversation)}</div>
              <div class="conversation-time">{formatTime(conversation.updated_at)}</div>
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </aside>
</div>

<style>
  .sidebar-container {
    position: relative;
    height: 100%;
  }
  
  .sidebar-toggle {
    position: absolute;
    top: 1rem;
    right: -2.5rem;
    width: 2rem;
    height: 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 0 0.5rem 0.5rem 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.3s;
  }
  
  .sidebar-toggle:hover {
    background: #764ba2;
  }
  
  .sidebar {
    width: 260px;
    height: 100%;
    background: #f9fafb;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
  }
  
  .sidebar.hidden {
    transform: translateX(-100%);
  }
  
  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .sidebar-title {
    margin: 0 0 0.75rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: #1f2937;
  }
  
  .new-chat-btn {
    width: 100%;
    padding: 0.625rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .new-chat-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  }
  
  .new-chat-btn:active {
    transform: translateY(0);
  }
  
  .icon {
    font-size: 1.25rem;
    font-weight: 300;
  }
  
  .conversations-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
  }
  
  .loading, .empty {
    padding: 2rem 1rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .conversation-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  
  .conversation-item:hover {
    background: #f3f4f6;
    border-color: #667eea;
  }
  
  .conversation-item.active {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-color: #667eea;
  }
  
  .conversation-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  .conversation-content {
    flex: 1;
    min-width: 0;
  }
  
  .conversation-preview {
    font-size: 0.875rem;
    color: #1f2937;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0.25rem;
  }
  
  .conversation-time {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 20;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar-toggle {
      display: flex;
    }
  }
</style>
