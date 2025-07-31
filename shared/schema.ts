import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  region: varchar("region"), // North America, Europe, Asia Pacific, etc.
  location: varchar("location"), // City, State/Province, Country
  timeZone: varchar("time_zone"), // America/New_York, Europe/London, etc.
  language: varchar("language").default("en"), // en, es, fr, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Onboarding data
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  fiveYearVision: text("five_year_vision"),
  oneYearVision: text("one_year_vision"),
  mission: text("mission"),
  values: text("values"),
  motivation: text("motivation"),
  swotAnalysis: jsonb("swot_analysis").$type<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }>(),
  
  // Goals
  desiredAnnualIncome: decimal("desired_annual_income", { precision: 12, scale: 2 }),
  averageCommission: decimal("average_commission", { precision: 12, scale: 2 }),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // "lead_generation", "relationship_building", "marketing", etc.
  scheduledTime: text("scheduled_time"), // e.g., "9:00 AM"
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  date: date("date").notNull(),
  targetCount: integer("target_count"), // e.g., 50 for "50 FSBO calls"
  currentProgress: integer("current_progress").default(0),
  isRecurring: boolean("is_recurring").default(true),
  priority: varchar("priority").default("medium"), // "high", "medium", "low"
  createdAt: timestamp("created_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  category: varchar("category").notNull(), // "Agent", "Renter", "Buyer", "Seller", "Landlord", "FSBO", "FRBO", "Expired", "Investor"
  source: varchar("source"), // "Cold Call", "Social Media", "Referral", "Open House", etc.
  notes: text("notes"),
  lastContactDate: date("last_contact_date"),
  nextFollowUpDate: date("next_follow_up_date"),
  tags: text("tags").array(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  leadScore: integer("lead_score").default(0), // 0-100
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "sale", "rental", "management", "referral", "other"
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  quarter: integer("quarter").notNull(), // 1, 2, 3, 4
  year: integer("year").notNull(),
  contactId: integer("contact_id").references(() => contacts.id),
  propertyAddress: text("property_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "income", "calls", "contacts", "appointments", "listings", "sales", "quarterly_income", "annual_income", "transactions"
  title: varchar("title").default("Goal"),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).default("0"),
  period: varchar("period").default("monthly"), // "daily", "weekly", "monthly", "quarterly", "yearly"
  deadline: date("deadline"), // optional deadline
  quarter: integer("quarter"), // null for non-quarterly goals
  year: integer("year").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // "contact_added", "task_completed", "income_recorded", "call_made"
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const followUps = pgTable("follow_ups", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactId: integer("contact_id").notNull().references(() => contacts.id),
  method: varchar("method").notNull(), // "phone", "text", "email"
  notes: text("notes"),
  followedUpAt: timestamp("followed_up_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const affirmations = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: varchar("author"),
  category: varchar("category").default("motivation"),
  isActive: boolean("is_active").default(true),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  contacts: many(contacts),
  income: many(income),
  goals: many(goals),
  activities: many(activities),
  followUps: many(followUps),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
  income: many(income),
  followUps: many(followUps),
}));

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(users, {
    fields: [income.userId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [income.contactId],
    references: [contacts.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  user: one(users, {
    fields: [followUps.userId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [followUps.contactId],
    references: [contacts.id],
  }),
}));

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => val.toString()),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  targetValue: z.union([z.string(), z.number()]).transform(val => val.toString()),
  currentValue: z.union([z.string(), z.number()]).transform(val => val.toString()).optional(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  createdAt: true,
  followedUpAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Daily Performance Tracking table
export const dailyPerformance = pgTable("daily_performance", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  callsMade: integer("calls_made").default(0),
  conversations: integer("conversations").default(0),
  followUps: integer("follow_ups").default(0),
  appointments: integer("appointments").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type DailyPerformance = typeof dailyPerformance.$inferSelect;
export type InsertDailyPerformance = typeof dailyPerformance.$inferInsert;

// Training content tables
export const trainingCategories = pgTable("training_categories", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trainingContent = pgTable("training_content", {
  id: serial("id").primaryKey(),
  categoryId: varchar("category_id").references(() => trainingCategories.id).notNull(),
  type: varchar("type").notNull(), // 'video', 'script', 'objection'
  title: varchar("title").notNull(),
  content: text("content").notNull(), // URL for videos, text for scripts/objections
  description: text("description"),
  tags: text("tags").array(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  contentId: integer("content_id").references(() => trainingContent.id).notNull(),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TrainingCategory = typeof trainingCategories.$inferSelect;
export type TrainingContent = typeof trainingContent.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;

export const insertTrainingCategorySchema = createInsertSchema(trainingCategories);
export const insertTrainingContentSchema = createInsertSchema(trainingContent);
export const insertUserProgressSchema = createInsertSchema(userProgress);
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Income = typeof income.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Affirmation = typeof affirmations.$inferSelect;
