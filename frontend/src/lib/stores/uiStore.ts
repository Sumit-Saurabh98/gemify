import { writable } from 'svelte/store';

interface UIState {
  showSuggestions: boolean;
  isScrolledToBottom: boolean;
  unreadCount: number;
}

function createUIStore() {
  const { subscribe, set, update } = writable<UIState>({
    showSuggestions: true,
    isScrolledToBottom: true,
    unreadCount: 0,
  });

  return {
    subscribe,
    
    /**
     * Toggle suggestions visibility
     */
    setShowSuggestions: (show: boolean) => {
      update(state => ({ ...state, showSuggestions: show }));
    },
    
    /**
     * Set scroll position status
     */
    setScrolledToBottom: (isAtBottom: boolean) => {
      update(state => ({ ...state, isScrolledToBottom: isAtBottom }));
    },
    
    /**
     * Increment unread count
     */
    incrementUnread: () => {
      update(state => ({ ...state, unreadCount: state.unreadCount + 1 }));
    },
    
    /**
     * Reset unread count
     */
    resetUnread: () => {
      update(state => ({ ...state, unreadCount: 0 }));
    },
    
    /**
     * Reset entire UI state
     */
    reset: () => {
      set({
        showSuggestions: true,
        isScrolledToBottom: true,
        unreadCount: 0,
      });
    },
  };
}

export const uiStore = createUIStore();
