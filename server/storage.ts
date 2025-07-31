import {
  users,
  tasks,
  contacts,
  income,
  goals,
  activities,
  affirmations,
  trainingCategories,
  trainingContent,
  userProgress,
  followUps,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type Contact,
  type InsertContact,
  type Income,
  type InsertIncome,
  type Goal,
  type InsertGoal,
  type Activity,
  type InsertActivity,
  type Affirmation,
  type TrainingCategory,
  type TrainingContent,
  type UserProgress,
  insertFollowUpSchema,
  dailyPerformance,
  type DailyPerformance,
  type InsertDailyPerformance,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getUserTasks(userId: string, date?: string): Promise<Task[]>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  deleteTasksByTimeSlot(userId: string, date: string, scheduledTime: string): Promise<void>;
  
  // Contact operations
  createContact(contact: InsertContact): Promise<Contact>;
  getUserContacts(userId: string, category?: string): Promise<Contact[]>;
  updateContact(id: number, updates: Partial<Contact>): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  getContactsRequiringFollowUp(userId: string): Promise<Contact[]>;
  
  // Follow-up operations
  createFollowUp(followUp: any): Promise<any>;
  getContactFollowUps(contactId: number): Promise<any[]>;
  getUserFollowUps(userId: string): Promise<any[]>;
  
  // Income operations
  createIncome(incomeData: InsertIncome): Promise<Income>;
  getUserIncome(userId: string, quarter?: number, year?: number): Promise<Income[]>;
  getIncomeByQuarter(userId: string, quarter: number, year: number): Promise<Income[]>;
  
  // Goal operations
  createGoal(goal: InsertGoal): Promise<Goal>;
  getUserGoals(userId: string, year?: number): Promise<Goal[]>;
  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Training operations
  getTrainingCategories(): Promise<TrainingCategory[]>;
  getTrainingContent(categoryId: string): Promise<TrainingContent[]>;
  getUserProgress(userId: string, contentId: number): Promise<UserProgress | undefined>;
  markContentCompleted(userId: string, contentId: number, notes?: string): Promise<UserProgress>;
  
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  
  // Affirmation operations
  getRandomAffirmation(): Promise<Affirmation | undefined>;
  
  // Dashboard data
  getDashboardStats(userId: string): Promise<{
    quarterlyProgress: number;
    todayTasksCompleted: number;
    todayTasksTotal: number;
    totalContacts: number;
    newContactsToday: number;
    quarterlyIncome: number;
    quarterlyGoal: number;
  }>;

  // Daily Performance Tracking
  createDailyPerformance(performance: InsertDailyPerformance): Promise<DailyPerformance>;
  getDailyPerformance(userId: string, date: string): Promise<DailyPerformance | undefined>;
  updateDailyPerformance(id: string, updates: Partial<DailyPerformance>): Promise<DailyPerformance>;
  getWeeklyPerformance(userId: string, startDate: string, endDate: string): Promise<DailyPerformance[]>;
  getQuarterlyPerformance(userId: string, quarter: number, year: number): Promise<DailyPerformance[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getUserTasks(userId: string, date?: string): Promise<Task[]> {
    let query = db.select().from(tasks);
    
    if (date) {
      query = query.where(and(eq(tasks.userId, userId), eq(tasks.date, date)));
    } else {
      query = query.where(eq(tasks.userId, userId));
    }
    
    const tasksResult = await query;
    
    // Sort tasks by time manually since SQL can't properly sort "8:00 AM" format
    return tasksResult.sort((a, b) => {
      const timeA = this.convertTimeToSortable(a.scheduledTime);
      const timeB = this.convertTimeToSortable(b.scheduledTime);
      return timeA - timeB;
    });
  }

  private convertTimeToSortable(timeStr: string): number {
    if (!timeStr) return 0;
    
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes; // Convert to minutes for easy comparison
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async deleteTasksByTimeSlot(userId: string, date: string, scheduledTime: string): Promise<void> {
    // Convert time format from HH:MM to match database format (e.g., "9:00 AM")
    const convertToScheduleFormat = (time: string): string => {
      const [hours, minutes] = time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    const formattedTime = convertToScheduleFormat(scheduledTime);

    await db.delete(tasks).where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.date, date),
        eq(tasks.scheduledTime, formattedTime),
        eq(tasks.isRecurring, true) // Only delete predetermined schedule tasks
      )
    );
  }

  // Contact operations
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db.insert(contacts).values(contact).returning();
    return newContact;
  }

  async getUserContacts(userId: string, category?: string): Promise<Contact[]> {
    if (category) {
      return await db.select().from(contacts)
        .where(and(eq(contacts.userId, userId), eq(contacts.category, category)))
        .orderBy(desc(contacts.createdAt));
    } else {
      return await db.select().from(contacts)
        .where(eq(contacts.userId, userId))
        .orderBy(desc(contacts.createdAt));
    }
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  async getContactsRequiringFollowUp(userId: string): Promise<Contact[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          lte(contacts.nextFollowUpDate, today),
          eq(contacts.isActive, true)
        )
      )
      .orderBy(contacts.nextFollowUpDate);
  }

  // Follow-up operations
  async createFollowUp(followUp: any): Promise<any> {
    const [newFollowUp] = await db.insert(followUps).values(followUp).returning();
    return newFollowUp;
  }

  async getContactFollowUps(contactId: number): Promise<any[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.contactId, contactId))
      .orderBy(desc(followUps.followedUpAt));
  }

  async getUserFollowUps(userId: string): Promise<any[]> {
    return await db
      .select({
        id: followUps.id,
        method: followUps.method,
        notes: followUps.notes,
        followedUpAt: followUps.followedUpAt,
        contact: {
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          email: contacts.email,
          phone: contacts.phone,
          category: contacts.category,
        }
      })
      .from(followUps)
      .innerJoin(contacts, eq(followUps.contactId, contacts.id))
      .where(eq(followUps.userId, userId))
      .orderBy(desc(followUps.followedUpAt));
  }

  // Income operations
  async createIncome(incomeData: InsertIncome): Promise<Income> {
    const [newIncome] = await db.insert(income).values(incomeData).returning();
    return newIncome;
  }

  async getUserIncome(userId: string, quarter?: number, year?: number): Promise<Income[]> {
    if (quarter && year) {
      return await db.select().from(income)
        .where(
          and(
            eq(income.userId, userId),
            eq(income.quarter, quarter),
            eq(income.year, year)
          )
        )
        .orderBy(desc(income.date));
    } else if (year) {
      return await db.select().from(income)
        .where(and(eq(income.userId, userId), eq(income.year, year)))
        .orderBy(desc(income.date));
    } else {
      return await db.select().from(income)
        .where(eq(income.userId, userId))
        .orderBy(desc(income.date));
    }
  }

  async getIncomeByQuarter(userId: string, quarter: number, year: number): Promise<Income[]> {
    return await db
      .select()
      .from(income)
      .where(
        and(
          eq(income.userId, userId),
          eq(income.quarter, quarter),
          eq(income.year, year)
        )
      )
      .orderBy(desc(income.date));
  }

  // Goal operations
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async getUserGoals(userId: string, year?: number): Promise<Goal[]> {
    const currentYear = year || new Date().getFullYear();
    
    // First get goals for the year
    const userGoals = await db.select().from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.year, currentYear)))
      .orderBy(goals.quarter);

    // Update goal progress with actual income data
    const updatedGoals = await Promise.all(userGoals.map(async (goal) => {
      if (goal.type === 'sales_commission' || goal.type === 'rental_commission' || goal.type === 'other_income') {
        const incomeType = goal.type === 'sales_commission' ? 'sale' : 
                          goal.type === 'rental_commission' ? 'rental' : 'other';
        
        // Get current progress based on actual income
        const incomeData = await db
          .select({ total: sql<number>`COALESCE(sum(${income.amount}), 0)` })
          .from(income)
          .where(
            and(
              eq(income.userId, userId),
              eq(income.type, incomeType),
              eq(income.year, currentYear),
              goal.quarter ? eq(income.quarter, goal.quarter) : undefined
            )
          );

        const currentValue = incomeData[0]?.total || 0;
        
        // Update the goal with current progress
        if (currentValue !== parseFloat(goal.currentValue || '0')) {
          await this.updateGoal(goal.id, { currentValue: currentValue.toString() });
          goal.currentValue = currentValue.toString();
        }
      }
      return goal;
    }));

    return updatedGoals;
  }

  async updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goals.id, id))
      .returning();
    return updatedGoal;
  }

  async initializeIncomeGoals(userId: string): Promise<Goal[]> {
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    // Check if income goals already exist for this user and year
    const existingGoals = await db.select().from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.year, currentYear),
          or(
            eq(goals.type, 'sales_commission'),
            eq(goals.type, 'rental_commission'),
            eq(goals.type, 'other_income')
          )
        )
      );

    if (existingGoals.length > 0) {
      return existingGoals;
    }

    // Create the 3 default income goals for the current quarter
    const defaultGoals = [
      {
        userId,
        type: 'sales_commission',
        title: 'Sales Commission Income',
        description: 'Quarterly sales commission income target',
        targetValue: '25000.00', // Default $25,000 quarterly target
        currentValue: '0.00',
        period: 'quarterly',
        quarter: currentQuarter,
        year: currentYear,
      },
      {
        userId,
        type: 'rental_commission',
        title: 'Rental Commission Income',
        description: 'Quarterly rental commission income target',
        targetValue: '15000.00', // Default $15,000 quarterly target
        currentValue: '0.00',
        period: 'quarterly',
        quarter: currentQuarter,
        year: currentYear,
      },
      {
        userId,
        type: 'other_income',
        title: 'Other Income',
        description: 'Quarterly other income target (referrals, management, etc.)',
        targetValue: '10000.00', // Default $10,000 quarterly target
        currentValue: '0.00',
        period: 'quarterly',
        quarter: currentQuarter,
        year: currentYear,
      },
    ];

    const createdGoals = [];
    for (const goalData of defaultGoals) {
      const [goal] = await db.insert(goals).values(goalData).returning();
      createdGoals.push(goal);
    }

    return createdGoals;
  }

  // Activity operations
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async getUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  // Affirmation operations
  async getRandomAffirmation(): Promise<Affirmation | undefined> {
    const [affirmation] = await db
      .select()
      .from(affirmations)
      .where(eq(affirmations.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    return affirmation;
  }

  // Dashboard data
  async getDashboardStats(userId: string): Promise<{
    quarterlyProgress: number;
    todayTasksCompleted: number;
    todayTasksTotal: number;
    totalContacts: number;
    newContactsToday: number;
    quarterlyIncome: number;
    quarterlyGoal: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    // Get today's tasks
    const todayTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, today)));

    const todayTasksCompleted = todayTasks.filter(task => task.isCompleted).length;
    const todayTasksTotal = todayTasks.length;

    // Get total contacts
    const [contactCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(eq(contacts.userId, userId));

    // Get new contacts today
    const [newContactsToday] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, userId),
          gte(contacts.createdAt, new Date(today))
        )
      );

    // Get quarterly income
    const quarterlyIncomeData = await db
      .select({ total: sql<number>`sum(${income.amount})` })
      .from(income)
      .where(
        and(
          eq(income.userId, userId),
          eq(income.quarter, currentQuarter),
          eq(income.year, currentYear)
        )
      );

    // Get quarterly goal
    const [quarterlyGoalData] = await db
      .select()
      .from(goals)
      .where(
        and(
          eq(goals.userId, userId),
          eq(goals.type, "quarterly_income"),
          eq(goals.quarter, currentQuarter),
          eq(goals.year, currentYear)
        )
      );

    const quarterlyIncome = quarterlyIncomeData[0]?.total || 0;
    const quarterlyGoal = quarterlyGoalData?.targetValue ? parseFloat(quarterlyGoalData.targetValue) : 0;
    const quarterlyProgress = quarterlyGoal > 0 ? (quarterlyIncome / quarterlyGoal) * 100 : 0;

    return {
      quarterlyProgress: Math.round(quarterlyProgress * 10) / 10,
      todayTasksCompleted,
      todayTasksTotal,
      totalContacts: contactCount.count,
      newContactsToday: newContactsToday.count,
      quarterlyIncome,
      quarterlyGoal,
    };
  }

  // Training operations
  async getTrainingCategories(): Promise<TrainingCategory[]> {
    return await db.select().from(trainingCategories).orderBy(trainingCategories.order);
  }

  async getTrainingContent(categoryId: string): Promise<TrainingContent[]> {
    return await db.select().from(trainingContent)
      .where(and(eq(trainingContent.categoryId, categoryId), eq(trainingContent.isActive, true)))
      .orderBy(trainingContent.order);
  }

  async getUserProgress(userId: string, contentId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.contentId, contentId)));
    return progress;
  }

  async markContentCompleted(userId: string, contentId: number, notes?: string): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values({
        userId,
        contentId,
        completed: true,
        completedAt: new Date(),
        notes,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.contentId],
        set: {
          completed: true,
          completedAt: new Date(),
          notes,
        },
      })
      .returning();
    return progress;
  }

  // Daily Performance Tracking operations
  async createDailyPerformance(performance: InsertDailyPerformance): Promise<DailyPerformance> {
    const [newPerformance] = await db.insert(dailyPerformance).values(performance).returning();
    return newPerformance;
  }

  async getDailyPerformance(userId: string, date: string): Promise<DailyPerformance | undefined> {
    const [performance] = await db.select().from(dailyPerformance)
      .where(and(eq(dailyPerformance.userId, userId), eq(dailyPerformance.date, date)));
    return performance;
  }

  async updateDailyPerformance(id: string, updates: Partial<DailyPerformance>): Promise<DailyPerformance> {
    const [updatedPerformance] = await db
      .update(dailyPerformance)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(dailyPerformance.id, id))
      .returning();
    return updatedPerformance;
  }

  async getWeeklyPerformance(userId: string, startDate: string, endDate: string): Promise<DailyPerformance[]> {
    return await db.select().from(dailyPerformance)
      .where(
        and(
          eq(dailyPerformance.userId, userId),
          gte(dailyPerformance.date, startDate),
          lte(dailyPerformance.date, endDate)
        )
      )
      .orderBy(dailyPerformance.date);
  }

  async getQuarterlyPerformance(userId: string, quarter: number, year: number): Promise<DailyPerformance[]> {
    const quarterStart = `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01`;
    const quarterEnd = `${year}-${String(quarter * 3).padStart(2, '0')}-31`;
    
    return await db.select().from(dailyPerformance)
      .where(
        and(
          eq(dailyPerformance.userId, userId),
          gte(dailyPerformance.date, quarterStart),
          lte(dailyPerformance.date, quarterEnd)
        )
      )
      .orderBy(dailyPerformance.date);
  }
}

export const storage = new DatabaseStorage();
