-- Migration: Create simplified schema for GamerHub AI Chat
-- Created: 2026-02-06

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: conversations
-- Stores chat conversation sessions
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: messages
-- Stores individual messages in conversations
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on conversations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at') THEN
    CREATE TRIGGER update_conversations_updated_at 
      BEFORE UPDATE ON conversations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_on_message') THEN
    CREATE TRIGGER update_conversation_on_message 
      AFTER INSERT ON messages
      FOR EACH ROW
      EXECUTE FUNCTION update_conversation_timestamp();
  END IF;
END $$;

-- Comment the tables for documentation
COMMENT ON TABLE conversations IS 'Stores chat conversation sessions';
COMMENT ON TABLE messages IS 'Stores individual messages in conversations';