import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function registerRoutes(app: Express): Promise<Server> {
  // Sync user data when they sign in (creates user in local storage)
  app.post("/api/users/sync", async (req, res) => {
    try {
      const { id, email, fullName, avatarUrl } = req.body;
      
      if (!id || !email || !fullName) {
        return res.status(400).json({ message: "User ID, email, and fullName are required" });
      }
      
      // Check if user already exists
      let user = await storage.getUserById(id);
      
      if (!user) {
        // Create new user in local storage
        user = await storage.createUserWithId({
          id,
          email,
          fullName,
          avatarUrl: avatarUrl || null
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("User sync error:", error);
      res.status(500).json({ message: "Failed to sync user" });
    }
  });

  // User search endpoint - Query Supabase directly
  app.get("/api/users/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const searchTerm = q.toLowerCase().trim();
      
      // Query Supabase users table directly
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, is_online, created_at, last_seen')
        .or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error("Supabase search error:", error);
        return res.status(500).json({ message: "Search failed" });
      }

      // Transform to match our User interface
      const transformedUsers = users?.map(user => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isOnline: user.is_online || false,
        createdAt: new Date(user.created_at),
        lastSeen: new Date(user.last_seen || user.created_at)
      })) || [];

      res.json(transformedUsers);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Friend request endpoints
  app.post("/api/friend-requests", async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
      
      if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Sender and receiver IDs are required" });
      }
      
      const friendRequest = await storage.createFriendRequest({
        senderId,
        receiverId,
        status: "pending"
      });
      
      res.json(friendRequest);
    } catch (error) {
      console.error("Friend request error:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.get("/api/friend-requests/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const friendRequests = await storage.getFriendRequests(userId);
      res.json(friendRequests);
    } catch (error) {
      console.error("Get friend requests error:", error);
      res.status(500).json({ message: "Failed to get friend requests" });
    }
  });

  // Get pending friend requests for notifications
  app.get("/api/friend-requests/pending/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const friendRequests = await storage.getPendingFriendRequests(userId);
      res.json(friendRequests);
    } catch (error) {
      console.error("Get pending friend requests error:", error);
      res.status(500).json({ message: "Failed to get pending friend requests" });
    }
  });

  // Update friend request status
  app.patch("/api/friend-requests/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;
      
      if (!status || !['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Valid status is required" });
      }
      
      const updatedRequest = await storage.updateFriendRequestStatus(requestId, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Friend request not found" });
      }
      
      // If the request was accepted, automatically create a chat between the users
      if (status === 'accepted' && updatedRequest.senderId && updatedRequest.receiverId) {
        try {
          // Create new chat directly - simpler approach
          const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .insert({
              is_group: false,
              created_by: updatedRequest.senderId,
            })
            .select()
            .single();

          if (chatError) {
            console.error("Error creating chat:", chatError);
          } else {
            // Add both users as members
            const members = [
              { chat_id: chatData.id, user_id: updatedRequest.senderId },
              { chat_id: chatData.id, user_id: updatedRequest.receiverId },
            ];

            const { error: membersError } = await supabase
              .from('chat_members')
              .insert(members);

            if (membersError) {
              console.error("Error adding chat members:", membersError);
            } else {
              console.log(`Created new chat ${chatData.id} for accepted friend request`);
            }
          }
        } catch (chatError) {
          console.error("Error creating chat for accepted friend request:", chatError);
          // Don't fail the friend request acceptance if chat creation fails
        }
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Update friend request error:", error);
      res.status(500).json({ message: "Failed to update friend request" });
    }
  });

  // Get user by ID for invite links
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
