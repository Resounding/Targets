import { pgTable, text, serial, integer, boolean, decimal, date, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  billingRate: decimal("billing_rate", { precision: 10, scale: 2 }).notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const weeklySchedules = pgTable("weekly_schedules", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  week: integer("week").notNull(),
  overallGoal: text("overall_goal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const targets = pgTable("targets", {
  id: serial("id").primaryKey(),
  weeklyScheduleId: integer("weekly_schedule_id").references(() => weeklySchedules.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  targetHours: decimal("target_hours", { precision: 5, scale: 2 }).notNull(),
  goal: text("goal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  weeklyScheduleId: integer("weekly_schedule_id").references(() => weeklySchedules.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  targetId: integer("target_id").references(() => targets.id),
  date: date("date").notNull(),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }).notNull(),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }).default("0").notNull(),
  notes: text("notes").notNull(),
  billable: boolean("billable").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  targets: many(targets),
  tasks: many(tasks),
}));

export const weeklySchedulesRelations = relations(weeklySchedules, ({ many }) => ({
  targets: many(targets),
  tasks: many(tasks),
}));

export const targetsRelations = relations(targets, ({ one, many }) => ({
  weeklySchedule: one(weeklySchedules, {
    fields: [targets.weeklyScheduleId],
    references: [weeklySchedules.id],
  }),
  customer: one(customers, {
    fields: [targets.customerId],
    references: [customers.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  weeklySchedule: one(weeklySchedules, {
    fields: [tasks.weeklyScheduleId],
    references: [weeklySchedules.id],
  }),
  customer: one(customers, {
    fields: [tasks.customerId],
    references: [customers.id],
  }),
  target: one(targets, {
    fields: [tasks.targetId],
    references: [targets.id],
  }),
}));

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyScheduleSchema = createInsertSchema(weeklySchedules).omit({
  id: true,
  createdAt: true,
});

export const insertTargetSchema = createInsertSchema(targets).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type WeeklySchedule = typeof weeklySchedules.$inferSelect;
export type InsertWeeklySchedule = z.infer<typeof insertWeeklyScheduleSchema>;

export type Target = typeof targets.$inferSelect;
export type InsertTarget = z.infer<typeof insertTargetSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Extended types with relations
export type CustomerWithRelations = Customer & {
  targets: Target[];
  tasks: Task[];
};

export type WeeklyScheduleWithRelations = WeeklySchedule & {
  targets: (Target & { customer: Customer })[];
  tasks: (Task & { customer: Customer })[];
};

export type TargetWithRelations = Target & {
  customer: Customer;
  tasks: Task[];
};

export type TaskWithRelations = Task & {
  customer: Customer;
  target?: Target;
};
