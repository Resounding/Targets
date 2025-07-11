import {
  customers,
  weeklySchedules,
  targets,
  tasks,
  type Customer,
  type WeeklySchedule,
  type Target,
  type Task,
  type InsertCustomer,
  type InsertWeeklySchedule,
  type InsertTarget,
  type InsertTask,
  type WeeklyScheduleWithRelations,
  type TargetWithRelations,
  type TaskWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // Customer methods
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: number): Promise<void>;

  // Weekly schedule methods
  getWeeklySchedules(): Promise<WeeklySchedule[]>;
  getWeeklySchedule(id: number): Promise<WeeklyScheduleWithRelations | undefined>;
  getWeeklyScheduleByYearWeek(year: number, week: number): Promise<WeeklyScheduleWithRelations | undefined>;
  createWeeklySchedule(schedule: InsertWeeklySchedule): Promise<WeeklySchedule>;
  updateWeeklySchedule(id: number, schedule: Partial<InsertWeeklySchedule>): Promise<WeeklySchedule>;
  deleteWeeklySchedule(id: number): Promise<void>;

  // Target methods
  getTargets(): Promise<Target[]>;
  getTarget(id: number): Promise<TargetWithRelations | undefined>;
  getTargetsByWeeklySchedule(weeklyScheduleId: number): Promise<TargetWithRelations[]>;
  createTarget(target: InsertTarget): Promise<Target>;
  updateTarget(id: number, target: Partial<InsertTarget>): Promise<Target>;
  deleteTarget(id: number): Promise<void>;

  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<TaskWithRelations | undefined>;
  getTasksByWeeklySchedule(weeklyScheduleId: number): Promise<TaskWithRelations[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Customer methods
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(customers.name);
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updatedCustomer] = await db
      .update(customers)
      .set(customer)
      .where(eq(customers.id, id))
      .returning();
    return updatedCustomer;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Weekly schedule methods
  async getWeeklySchedules(): Promise<WeeklySchedule[]> {
    return await db
      .select()
      .from(weeklySchedules)
      .orderBy(desc(weeklySchedules.year), desc(weeklySchedules.week));
  }

  async getWeeklySchedule(id: number): Promise<WeeklyScheduleWithRelations | undefined> {
    const [schedule] = await db
      .select()
      .from(weeklySchedules)
      .where(eq(weeklySchedules.id, id));

    if (!schedule) return undefined;

    const scheduleTargets = await db
      .select({
        id: targets.id,
        weeklyScheduleId: targets.weeklyScheduleId,
        customerId: targets.customerId,
        targetHours: targets.targetHours,
        goal: targets.goal,
        createdAt: targets.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(targets)
      .innerJoin(customers, eq(targets.customerId, customers.id))
      .where(eq(targets.weeklyScheduleId, id));

    const scheduleTasks = await db
      .select({
        id: tasks.id,
        weeklyScheduleId: tasks.weeklyScheduleId,
        customerId: tasks.customerId,
        targetId: tasks.targetId,
        date: tasks.date,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        notes: tasks.notes,
        billable: tasks.billable,
        createdAt: tasks.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(tasks)
      .innerJoin(customers, eq(tasks.customerId, customers.id))
      .where(eq(tasks.weeklyScheduleId, id));

    return {
      ...schedule,
      targets: scheduleTargets,
      tasks: scheduleTasks,
    };
  }

  async getWeeklyScheduleByYearWeek(year: number, week: number): Promise<WeeklyScheduleWithRelations | undefined> {
    const [schedule] = await db
      .select()
      .from(weeklySchedules)
      .where(and(eq(weeklySchedules.year, year), eq(weeklySchedules.week, week)));

    if (!schedule) return undefined;

    return this.getWeeklySchedule(schedule.id);
  }

  async createWeeklySchedule(schedule: InsertWeeklySchedule): Promise<WeeklySchedule> {
    const [newSchedule] = await db.insert(weeklySchedules).values(schedule).returning();
    return newSchedule;
  }

  async updateWeeklySchedule(id: number, schedule: Partial<InsertWeeklySchedule>): Promise<WeeklySchedule> {
    const [updatedSchedule] = await db
      .update(weeklySchedules)
      .set(schedule)
      .where(eq(weeklySchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  async deleteWeeklySchedule(id: number): Promise<void> {
    await db.delete(weeklySchedules).where(eq(weeklySchedules.id, id));
  }

  // Target methods
  async getTargets(): Promise<Target[]> {
    return await db.select().from(targets);
  }

  async getTarget(id: number): Promise<TargetWithRelations | undefined> {
    const [target] = await db
      .select({
        id: targets.id,
        weeklyScheduleId: targets.weeklyScheduleId,
        customerId: targets.customerId,
        targetHours: targets.targetHours,
        goal: targets.goal,
        createdAt: targets.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(targets)
      .innerJoin(customers, eq(targets.customerId, customers.id))
      .where(eq(targets.id, id));

    if (!target) return undefined;

    const targetTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.targetId, id));

    return {
      ...target,
      tasks: targetTasks,
    };
  }

  async getTargetsByWeeklySchedule(weeklyScheduleId: number): Promise<TargetWithRelations[]> {
    const scheduleTargets = await db
      .select({
        id: targets.id,
        weeklyScheduleId: targets.weeklyScheduleId,
        customerId: targets.customerId,
        targetHours: targets.targetHours,
        goal: targets.goal,
        createdAt: targets.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(targets)
      .innerJoin(customers, eq(targets.customerId, customers.id))
      .where(eq(targets.weeklyScheduleId, weeklyScheduleId));

    const result = [];
    for (const target of scheduleTargets) {
      const targetTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.targetId, target.id));

      result.push({
        ...target,
        tasks: targetTasks,
      });
    }

    return result;
  }

  async createTarget(target: InsertTarget): Promise<Target> {
    const [newTarget] = await db.insert(targets).values(target).returning();
    return newTarget;
  }

  async updateTarget(id: number, target: Partial<InsertTarget>): Promise<Target> {
    const [updatedTarget] = await db
      .update(targets)
      .set(target)
      .where(eq(targets.id, id))
      .returning();
    return updatedTarget;
  }

  async deleteTarget(id: number): Promise<void> {
    await db.delete(targets).where(eq(targets.id, id));
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<TaskWithRelations | undefined> {
    const [task] = await db
      .select({
        id: tasks.id,
        weeklyScheduleId: tasks.weeklyScheduleId,
        customerId: tasks.customerId,
        targetId: tasks.targetId,
        date: tasks.date,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        notes: tasks.notes,
        billable: tasks.billable,
        createdAt: tasks.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(tasks)
      .innerJoin(customers, eq(tasks.customerId, customers.id))
      .where(eq(tasks.id, id));

    if (!task) return undefined;

    if (task.targetId) {
      const [target] = await db
        .select()
        .from(targets)
        .where(eq(targets.id, task.targetId));

      return {
        ...task,
        target,
      };
    }

    return task;
  }

  async getTasksByWeeklySchedule(weeklyScheduleId: number): Promise<TaskWithRelations[]> {
    const scheduleTasks = await db
      .select({
        id: tasks.id,
        weeklyScheduleId: tasks.weeklyScheduleId,
        customerId: tasks.customerId,
        targetId: tasks.targetId,
        date: tasks.date,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        notes: tasks.notes,
        billable: tasks.billable,
        createdAt: tasks.createdAt,
        customer: {
          id: customers.id,
          name: customers.name,
          billingRate: customers.billingRate,
          email: customers.email,
          createdAt: customers.createdAt,
        },
      })
      .from(tasks)
      .innerJoin(customers, eq(tasks.customerId, customers.id))
      .where(eq(tasks.weeklyScheduleId, weeklyScheduleId));

    const result = [];
    for (const task of scheduleTasks) {
      if (task.targetId) {
        const [target] = await db
          .select()
          .from(targets)
          .where(eq(targets.id, task.targetId));

        result.push({
          ...task,
          target,
        });
      } else {
        result.push(task);
      }
    }

    return result;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}

export const storage = new DatabaseStorage();
