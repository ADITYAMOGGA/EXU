import { type User, type InsertUser, type FriendRequest, type InsertFriendRequest } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  createFriendRequest(friendRequest: InsertFriendRequest): Promise<FriendRequest>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private friendRequests: Map<string, FriendRequest>;

  constructor() {
    this.users = new Map();
    this.friendRequests = new Map();
    
    // Add some demo users for testing
    this.seedDemoUsers();
  }

  private async seedDemoUsers() {
    const demoUsers: InsertUser[] = [
      { email: "john@example.com", fullName: "John Smith", avatarUrl: null },
      { email: "sarah@example.com", fullName: "Sarah Johnson", avatarUrl: null },
      { email: "mike@example.com", fullName: "Mike Wilson", avatarUrl: null },
      { email: "emma@example.com", fullName: "Emma Davis", avatarUrl: null },
      { email: "navaspy1234@gmail.com", fullName: "Bravo", avatarUrl: null },
      { email: "test@example.com", fullName: "Test User", avatarUrl: null },
      { email: "alice@example.com", fullName: "Alice Cooper", avatarUrl: null },
      { email: "bob@example.com", fullName: "Bob Johnson", avatarUrl: null },
    ];

    for (const user of demoUsers) {
      await this.createUser(user);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.fullName === username,
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => 
      user.email.toLowerCase().includes(query) || 
      user.fullName.toLowerCase().includes(query)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      avatarUrl: insertUser.avatarUrl ?? null,
      id,
      isOnline: false,
      createdAt: new Date(),
      lastSeen: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createFriendRequest(insertFriendRequest: InsertFriendRequest): Promise<FriendRequest> {
    const id = randomUUID();
    const friendRequest: FriendRequest = {
      ...insertFriendRequest,
      senderId: insertFriendRequest.senderId ?? null,
      receiverId: insertFriendRequest.receiverId ?? null,
      id,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.friendRequests.set(id, friendRequest);
    return friendRequest;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values()).filter(request => 
      request.senderId === userId || request.receiverId === userId
    );
  }
}

export const storage = new MemStorage();
