-- Migration: Create initial schema for GamerHub AI Chat
-- Created: 2026-02-05

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: conversations
-- Stores chat conversation sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table: messages
-- Stores individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Table: faq_knowledge
-- Stores FAQ knowledge base for the AI agent
CREATE TABLE IF NOT EXISTS faq_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  region VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance

-- Index on conversation_id for faster message lookups
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
  ON messages(conversation_id);

-- Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON messages(created_at DESC);

-- Index on sender for filtering messages
CREATE INDEX IF NOT EXISTS idx_messages_sender 
  ON messages(sender);

-- Index on conversations updated_at for recent conversations
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
  ON conversations(updated_at DESC);

-- Index on FAQ category and region for faster lookups
CREATE INDEX IF NOT EXISTS idx_faq_category 
  ON faq_knowledge(category);

CREATE INDEX IF NOT EXISTS idx_faq_region 
  ON faq_knowledge(region);

-- GIN index on metadata for JSONB queries
CREATE INDEX IF NOT EXISTS idx_messages_metadata 
  ON messages USING GIN(metadata);

CREATE INDEX IF NOT EXISTS idx_conversations_metadata 
  ON conversations USING GIN(metadata);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on conversations
CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation's updated_at when a message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message 
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger to automatically update updated_at on faq_knowledge
CREATE TRIGGER update_faq_updated_at 
  BEFORE UPDATE ON faq_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment the tables for documentation
COMMENT ON TABLE conversations IS 'Stores chat conversation sessions';
COMMENT ON TABLE messages IS 'Stores individual messages in conversations';
COMMENT ON TABLE faq_knowledge IS 'Stores FAQ knowledge base for the AI agent';

COMMENT ON COLUMN messages.sender IS 'Message sender: user or ai';
COMMENT ON COLUMN faq_knowledge.region IS 'Region-specific FAQ: USA, India, Japan, China, or NULL for global';
