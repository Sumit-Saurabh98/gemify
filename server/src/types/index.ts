


export interface Conversation {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  created_at: Date;
}

export interface Faqs {
  id: string;
  category: string;
  question: string;
  answer: string;
  created_at: Date;
}
