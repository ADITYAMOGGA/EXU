import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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

  // User search endpoint
  app.get("/api/users/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const users = await storage.searchUsers(q.toLowerCase().trim());
      res.json(users);
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
