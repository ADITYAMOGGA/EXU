import { type User, type InsertUser, type FriendRequest, type InsertFriendRequest, type Chat, type InsertChat, type ChatMember, type InsertChatMember } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithId(user: { id: string; email: string; fullName: string; avatarUrl: string | null }): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  createFriendRequest(friendRequest: InsertFriendRequest): Promise<FriendRequest>;
  getFriendRequests(userId: string): Promise<FriendRequest[]>;
  getPendingFriendRequests(userId: string): Promise<FriendRequest[]>;
  updateFriendRequestStatus(requestId: string, status: string): Promise<FriendRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private friendRequests: Map<string, FriendRequest>;

  constructor() {
    this.users = new Map();
    this.friendRequests = new Map();
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = query.toLowerCase().trim();
    return Array.from(this.users.values()).filter(user => {
      const email = user.email.toLowerCase();
      const fullName = user.fullName.toLowerCase();
      const firstName = fullName.split(' ')[0];
      const lastName = fullName.split(' ').slice(1).join(' ');
      
      return email.includes(searchTerm) || 
             fullName.includes(searchTerm) ||
             firstName.includes(searchTerm) ||
             lastName.includes(searchTerm) ||
             email.startsWith(searchTerm) ||
             fullName.startsWith(searchTerm) ||
             firstName.startsWith(searchTerm);
    });
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

  async createUserWithId(userData: { id: string; email: string; fullName: string; avatarUrl: string | null }): Promise<User> {
    const user: User = { 
      ...userData,
      isOnline: false,
      createdAt: new Date(),
      lastSeen: new Date()
    };
    this.users.set(userData.id, user);
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

  async getPendingFriendRequests(userId: string): Promise<FriendRequest[]> {
    return Array.from(this.friendRequests.values()).filter(
      (request) => request.receiverId === userId && request.status === 'pending',
    );
  }

  async updateFriendRequestStatus(requestId: string, status: string): Promise<FriendRequest | undefined> {
    const request = this.friendRequests.get(requestId);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, status, updatedAt: new Date() };
    this.friendRequests.set(requestId, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
