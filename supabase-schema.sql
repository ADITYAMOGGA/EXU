-- COMPLETE SUPABASE DATABASE RESET AND SETUP
-- Run this in your Supabase SQL editor to create a fresh database

-- =====================================
-- STEP 1: DROP ALL EXISTING TABLES
-- =====================================

-- Drop tables in correct order (children first, then parents)
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view own chat memberships" ON chat_members;
DROP POLICY IF EXISTS "Users can join chats they're invited to" ON chat_members;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON messages;
DROP POLICY IF EXISTS "Users can view reactions on messages in their chats" ON message_reactions;
DROP POLICY IF EXISTS "Users can add reactions to messages in their chats" ON message_reactions;
DROP POLICY IF EXISTS "Users can view their friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can send friend requests" ON friend_requests;
DROP POLICY IF EXISTS "Users can view their contacts" ON contacts;
DROP POLICY IF EXISTS "Users can manage their contacts" ON contacts;

-- =====================================
-- STEP 2: CREATE FRESH TABLES
-- =====================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat members table (junction table for users and chats)
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT,
  message_type TEXT DEFAULT 'text', -- text, image, file, voice
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  is_delivered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- Friend requests table
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- Contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

-- =====================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chats_created_by ON chats(created_by);
CREATE INDEX idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);

-- =====================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =====================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- =====================================
-- STEP 5: CREATE RLS POLICIES (NO INFINITE RECURSION)
-- =====================================

-- Users policies
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Chats policies
CREATE POLICY "Users can view chats they're members of" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = chats.id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update chats they created" ON chats
  FOR UPDATE USING (auth.uid() = created_by);

-- Chat members policies
CREATE POLICY "Users can view chat memberships for their chats" ON chat_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM chat_members cm 
      WHERE cm.chat_id = chat_members.chat_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats" ON chat_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = chat_id 
      AND chats.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave chats" ON chat_members
  FOR DELETE USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their chats" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_members 
      WHERE chat_members.chat_id = messages.chat_id 
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Message reactions policies
CREATE POLICY "Users can view reactions on messages in their chats" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON m.chat_id = cm.chat_id
      WHERE m.id = message_reactions.message_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add their own reactions" ON message_reactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON m.chat_id = cm.chat_id
      WHERE m.id = message_reactions.message_id 
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reactions" ON message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Friend requests policies
CREATE POLICY "Users can view their friend requests" ON friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update friend requests they received" ON friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Contacts policies
CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================
-- STEP 6: CREATE HELPFUL FUNCTIONS
-- =====================================

-- Function to get user's chats with last message
CREATE OR REPLACE FUNCTION get_user_chats(user_uuid UUID)
RETURNS TABLE (
  chat_id UUID,
  chat_name TEXT,
  is_group BOOLEAN,
  avatar_url TEXT,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as chat_id,
    c.name as chat_name,
    c.is_group,
    c.avatar_url,
    m.content as last_message,
    m.created_at as last_message_time,
    c.created_at
  FROM chats c
  JOIN chat_members cm ON c.id = cm.chat_id
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages
    WHERE chat_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
  WHERE cm.user_id = user_uuid
  ORDER BY COALESCE(m.created_at, c.created_at) DESC;
END;
$$;

-- Function to create a direct message chat
CREATE OR REPLACE FUNCTION create_dm_chat(user1_uuid UUID, user2_uuid UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chat_uuid UUID;
  existing_chat_uuid UUID;
BEGIN
  -- Check if DM chat already exists between these users
  SELECT c.id INTO existing_chat_uuid
  FROM chats c
  WHERE c.is_group = false
  AND EXISTS (
    SELECT 1 FROM chat_members cm1 
    WHERE cm1.chat_id = c.id AND cm1.user_id = user1_uuid
  )
  AND EXISTS (
    SELECT 1 FROM chat_members cm2 
    WHERE cm2.chat_id = c.id AND cm2.user_id = user2_uuid
  )
  AND (
    SELECT COUNT(*) FROM chat_members cm3 WHERE cm3.chat_id = c.id
  ) = 2;

  IF existing_chat_uuid IS NOT NULL THEN
    RETURN existing_chat_uuid;
  END IF;

  -- Create new DM chat
  INSERT INTO chats (is_group, created_by)
  VALUES (false, user1_uuid)
  RETURNING id INTO chat_uuid;

  -- Add both users to the chat
  INSERT INTO chat_members (chat_id, user_id)
  VALUES 
    (chat_uuid, user1_uuid),
    (chat_uuid, user2_uuid);

  RETURN chat_uuid;
END;
$$;

-- =====================================
-- STEP 7: INSERT SAMPLE DATA (OPTIONAL)
-- =====================================

-- You can uncomment this section to insert sample data for testing

/*
-- Sample users (you'll need to replace these UUIDs with actual auth.users UUIDs)
INSERT INTO users (id, email, full_name) VALUES
('11111111-1111-1111-1111-111111111111', 'user1@example.com', 'John Doe'),
('22222222-2222-2222-2222-222222222222', 'user2@example.com', 'Jane Smith');

-- Sample chat
INSERT INTO chats (id, name, is_group, created_by) VALUES
('33333333-3333-3333-3333-333333333333', 'General Chat', true, '11111111-1111-1111-1111-111111111111');

-- Sample chat members
INSERT INTO chat_members (chat_id, user_id) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222');

-- Sample messages
INSERT INTO messages (chat_id, sender_id, content) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Hello everyone!'),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Hi there!');
*/

-- =====================================
-- COMPLETE! YOUR DATABASE IS READY
-- =====================================

-- Run this entire script in your Supabase SQL editor
-- After running, your database will be completely reset and properly configured