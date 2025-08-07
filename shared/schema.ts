import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  isGroup: boolean("is_group").default(false),
  avatarUrl: text("avatar_url"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMembers = pgTable("chat_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: uuid("chat_id").references(() => chats.id),
  userId: uuid("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: uuid("chat_id").references(() => chats.id),
  senderId: uuid("sender_id").references(() => users.id),
  content: text("content"),
  messageType: text("message_type").default("text"), // text, image, file, voice
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  replyToId: uuid("reply_to_id"),
  isRead: boolean("is_read").default(false),
  isDelivered: boolean("is_delivered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageReactions = pgTable("message_reactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: uuid("message_id").references(() => messages.id),
  userId: uuid("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const friendRequests = pgTable("friend_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: uuid("sender_id").references(() => users.id),
  receiverId: uuid("receiver_id").references(() => users.id),
  status: text("status").default("pending"), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  contactId: uuid("contact_id").references(() => users.id),
  nickname: text("nickname"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertMessageReactionSchema = createInsertSchema(messageReactions).omit({
  id: true,
  createdAt: true,
});

export const insertFriendRequestSchema = createInsertSchema(friendRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = z.infer<typeof insertMessageReactionSchema>;
export type ChatMember = typeof chatMembers.$inferSelect;
export type FriendRequest = typeof friendRequests.$inferSelect;
export type InsertFriendRequest = z.infer<typeof insertFriendRequestSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
