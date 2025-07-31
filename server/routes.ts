import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, insertContactSchema, insertIncomeSchema, insertGoalSchema, insertActivitySchema, insertFollowUpSchema, type InsertDailyPerformance, type DailyPerformance } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding routes
  app.post('/api/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = req.body;
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        hasCompletedOnboarding: true,
        region: onboardingData.region,
        location: onboardingData.location,
        timeZone: onboardingData.timeZone,
        language: onboardingData.language,
        fiveYearVision: onboardingData.fiveYearVision,
        oneYearVision: onboardingData.oneYearVision,
        mission: onboardingData.mission,
        values: onboardingData.values,
        motivation: onboardingData.motivation,
        swotAnalysis: onboardingData.swotAnalysis,
        desiredAnnualIncome: onboardingData.desiredAnnualIncome,
        averageCommission: onboardingData.averageCommission,
      });

      // Create initial quarterly goals
      const currentYear = new Date().getFullYear();
      const quarterlyIncomeGoal = parseFloat(onboardingData.desiredAnnualIncome) / 4;
      
      for (let quarter = 1; quarter <= 4; quarter++) {
        await storage.createGoal({
          userId,
          type: "quarterly_income",
          title: `Q${quarter} Income Target`,
          description: `Quarterly income goal for Q${quarter} ${currentYear}`,
          targetValue: quarterlyIncomeGoal.toString(),
          period: "quarterly",
          quarter,
          year: currentYear,
        });
      }

      // Create default monthly goals for key activities
      const defaultGoals = [
        {
          type: "calls",
          title: "Monthly Phone Calls",
          description: "Connect with prospects and clients through phone calls",
          targetValue: "300",
          period: "monthly"
        },
        {
          type: "contacts",
          title: "New Contacts This Month",
          description: "Add new prospects and leads to CRM",
          targetValue: "50",
          period: "monthly"
        },
        {
          type: "appointments",
          title: "Listing Appointments",
          description: "Schedule appointments with potential sellers",
          targetValue: "10",
          period: "monthly"
        },
        {
          type: "listings",
          title: "New Listings",
          description: "Secure new listing agreements",
          targetValue: "3",
          period: "monthly"
        },
        {
          type: "sales",
          title: "Closed Sales",
          description: "Complete successful transactions",
          targetValue: "2",
          period: "monthly"
        },
        {
          type: "rentals",
          title: "Weekly Closed Rentals",
          description: "Complete rental agreements and close rental deals",
          targetValue: "1",
          period: "weekly"
        },
        {
          type: "buyers",
          title: "Monthly Buyers",
          description: "Connect with and assist potential home buyers",
          targetValue: "4",
          period: "monthly"
        }
      ];

      for (const goal of defaultGoals) {
        await storage.createGoal({
          userId,
          ...goal,
          year: currentYear,
        });
      }

      // Create default daily tasks
      const defaultTasks = [
        { title: "50 FSBO Cold Calls", description: "Call 50 For Sale By Owner listings to generate leads", category: "lead_generation", scheduledTime: "9:00 AM", targetCount: 50 },
        { title: "50 Expired Listing Calls", description: "Contact expired listings to offer listing services", category: "lead_generation", scheduledTime: "11:00 AM", targetCount: 50 },
        { title: "Morning Social Media Posts", description: "Post 1-2 engaging real estate content pieces", category: "marketing", scheduledTime: "8:30 AM", targetCount: 2 },
        { title: "Social Media Engagement", description: "Like and comment on 25 posts to build relationships", category: "marketing", scheduledTime: "3:00 PM", targetCount: 25 },
        { title: "Client Follow-up Calls", description: "Follow up with recent clients for referrals", category: "relationship_building", scheduledTime: "2:00 PM", targetCount: 5 },
      ];

      const today = new Date().toISOString().split('T')[0];
      for (const task of defaultTasks) {
        await storage.createTask({
          userId,
          ...task,
          date: today,
        });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/affirmation/random', async (req, res) => {
    try {
      const affirmation = await storage.getRandomAffirmation();
      res.json(affirmation || { text: "My potential is limitless.", author: "Daily Affirmation" });
    } catch (error) {
      console.error("Error fetching affirmation:", error);
      res.json({ text: "My potential is limitless.", author: "Daily Affirmation" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string | undefined;
      const tasks = await storage.getUserTasks(userId, date);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      
      // If a custom task has scheduled time, check for existing predetermined tasks at that time
      if (taskData.scheduledTime && taskData.date) {
        // Delete any existing predetermined tasks at the same time slot for this date
        await storage.deleteTasksByTimeSlot(userId, taskData.date, taskData.scheduledTime);
      }
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.isCompleted) {
        updates.completedAt = new Date();
        
        // Log activity
        await storage.createActivity({
          userId: req.user.claims.sub,
          type: "task_completed",
          description: `Completed task: ${updates.title || 'Task'}`,
        });
      }
      
      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Schedule routes
  app.get('/api/schedule', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string | undefined;
      const tasks = await storage.getUserTasks(userId, date);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post('/api/schedule/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, schedule } = req.body;
      
      // Create tasks from the daily schedule
      const tasks = [];
      for (const taskTemplate of schedule) {
        const task = await storage.createTask({
          userId,
          title: taskTemplate.title,
          description: taskTemplate.description,
          category: taskTemplate.category,
          scheduledTime: taskTemplate.time,
          targetCount: taskTemplate.targetCount || null,
          priority: taskTemplate.priority,
          date,
          isRecurring: true,
        });
        tasks.push(task);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error initializing schedule:", error);
      res.status(500).json({ message: "Failed to initialize schedule" });
    }
  });

  // Contact routes
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const category = req.query.category as string | undefined;
      const contacts = await storage.getUserContacts(userId, category);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = insertContactSchema.parse({ ...req.body, userId });
      const contact = await storage.createContact(contactData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: "contact_added",
        description: `Added new contact: ${contact.firstName} ${contact.lastName}`,
      });
      
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.patch('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const updates = req.body;
      const contact = await storage.updateContact(contactId, updates);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.get('/api/contacts/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContactsRequiringFollowUp(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  // Follow-up tracking routes
  app.post('/api/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const followUpData = insertFollowUpSchema.parse({ ...req.body, userId });
      const followUp = await storage.createFollowUp(followUpData);
      
      // Update contact's nextFollowUpDate to null or next scheduled date
      if (req.body.nextFollowUpDate) {
        await storage.updateContact(req.body.contactId, {
          nextFollowUpDate: req.body.nextFollowUpDate,
          lastContactDate: new Date().toISOString().split('T')[0]
        });
      } else {
        await storage.updateContact(req.body.contactId, {
          nextFollowUpDate: null,
          lastContactDate: new Date().toISOString().split('T')[0]
        });
      }
      
      // Log activity
      await storage.createActivity({
        userId,
        type: "follow_up_completed",
        description: `Followed up with contact via ${followUp.method}`,
      });
      
      res.json(followUp);
    } catch (error) {
      console.error("Error creating follow-up:", error);
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  app.get('/api/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const followUps = await storage.getUserFollowUps(userId);
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  app.get('/api/contacts/:id/follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const contactId = parseInt(req.params.id);
      const followUps = await storage.getContactFollowUps(contactId);
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching contact follow-ups:", error);
      res.status(500).json({ message: "Failed to fetch contact follow-ups" });
    }
  });

  // Income routes
  app.get('/api/income', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quarter = req.query.quarter ? parseInt(req.query.quarter as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const income = await storage.getUserIncome(userId, quarter, year);
      res.json(income);
    } catch (error) {
      console.error("Error fetching income:", error);
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  app.post('/api/income', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Transform amount to string before validation
      const requestData = { 
        ...req.body, 
        userId,
        amount: req.body.amount?.toString() || '0'
      };
      const incomeData = insertIncomeSchema.parse(requestData);
      const income = await storage.createIncome(incomeData);
      
      // Log activity
      await storage.createActivity({
        userId,
        type: "income_recorded",
        description: `Recorded ${income.type} income: $${income.amount}`,
      });
      
      res.json(income);
    } catch (error) {
      console.error("Error creating income:", error);
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  // Goal routes
  app.get('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const goals = await storage.getUserGoals(userId, year);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post('/api/goals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goalData = insertGoalSchema.parse({ ...req.body, userId });
      const goal = await storage.createGoal(goalData);
      res.json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  });

  app.patch('/api/goals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const updates = req.body;
      const goal = await storage.updateGoal(goalId, updates);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.post('/api/goals/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.initializeIncomeGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error initializing income goals:", error);
      res.status(500).json({ message: "Failed to initialize income goals" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Training routes
  app.get('/api/training/categories', isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getTrainingCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching training categories:", error);
      res.status(500).json({ message: "Failed to fetch training categories" });
    }
  });

  app.get('/api/training/content/:categoryId', isAuthenticated, async (req: any, res) => {
    try {
      const categoryId = req.params.categoryId;
      const content = await storage.getTrainingContent(categoryId);
      res.json(content);
    } catch (error) {
      console.error("Error fetching training content:", error);
      res.status(500).json({ message: "Failed to fetch training content" });
    }
  });

  app.post('/api/training/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contentId, notes } = req.body;
      const progress = await storage.markContentCompleted(userId, contentId, notes);
      res.json(progress);
    } catch (error) {
      console.error("Error marking content completed:", error);
      res.status(500).json({ message: "Failed to mark content completed" });
    }
  });

  // Mortgage calculator route
  app.post('/api/mortgage/calculate', async (req, res) => {
    try {
      const { loanAmount, interestRate, loanTerm, downPayment } = req.body;
      
      const principal = loanAmount - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const numberOfPayments = loanTerm * 12;
      
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      
      const totalInterest = (monthlyPayment * numberOfPayments) - principal;
      const totalAmount = principal + totalInterest;
      
      res.json({
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        principal,
      });
    } catch (error) {
      console.error("Error calculating mortgage:", error);
      res.status(500).json({ message: "Failed to calculate mortgage" });
    }
  });

  // Daily Performance Tracking routes
  app.get('/api/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = req.query.date as string;
      const performance = await storage.getDailyPerformance(userId, date);
      res.json(performance || { callsMade: 0, conversations: 0, followUps: 0, appointments: 0 });
    } catch (error) {
      console.error("Error fetching performance:", error);
      res.status(500).json({ message: "Failed to fetch performance" });
    }
  });

  app.post('/api/performance', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, callsMade, conversations, followUps, appointments, notes } = req.body;
      
      // Check if performance record exists for this date
      const existing = await storage.getDailyPerformance(userId, date);
      
      if (existing) {
        // Update existing record
        const performance = await storage.updateDailyPerformance(existing.id, {
          callsMade,
          conversations,
          followUps,
          appointments,
          notes
        });
        res.json(performance);
      } else {
        // Create new record
        const performance = await storage.createDailyPerformance({
          id: `${userId}_${date}`,
          userId,
          date,
          callsMade,
          conversations,
          followUps,
          appointments,
          notes
        });
        res.json(performance);
      }
    } catch (error) {
      console.error("Error saving performance:", error);
      res.status(500).json({ message: "Failed to save performance" });
    }
  });

  app.get('/api/performance/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const performance = await storage.getWeeklyPerformance(userId, startDate as string, endDate as string);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching weekly performance:", error);
      res.status(500).json({ message: "Failed to fetch weekly performance" });
    }
  });

  app.get('/api/performance/quarterly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quarter, year } = req.query;
      const performance = await storage.getQuarterlyPerformance(userId, parseInt(quarter as string), parseInt(year as string));
      res.json(performance);
    } catch (error) {
      console.error("Error fetching quarterly performance:", error);
      res.status(500).json({ message: "Failed to fetch quarterly performance" });
    }
  });

  // ZIP Code rates endpoint removed - users manually enter local rates

  // CMA API endpoint
  app.post("/api/cma/generate", isAuthenticated, async (req, res) => {
    try {
      const { address, bedrooms, bathrooms, sqft } = req.body;
      
      if (!address) {
        return res.status(400).json({ message: "Address is required" });
      }

      const { realEstateService } = await import('./realEstateAPI');
      const cmaData = await realEstateService.generateCMA(
        address, 
        bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms ? parseFloat(bathrooms) : undefined,
        sqft ? parseInt(sqft) : undefined
      );

      res.json(cmaData);
    } catch (error) {
      console.error("CMA Generation Error:", error);
      res.status(500).json({ 
        message: "Failed to generate CMA", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
