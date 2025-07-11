import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import {
  insertCustomerSchema,
  insertWeeklyScheduleSchema,
  insertTargetSchema,
  insertTaskSchema,
} from '@shared/schema';
import { z } from 'zod';

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get('/api/customers', async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customers' });
    }
  });

  app.get('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customer' });
    }
  });

  app.post('/api/customers', async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid customer data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create customer' });
    }
  });

  app.put('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid customer data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update customer' });
    }
  });

  app.delete('/api/customers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete customer' });
    }
  });

  // Weekly schedule routes
  app.get('/api/weekly-schedules', async (req, res) => {
    try {
      const schedules = await storage.getWeeklySchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weekly schedules' });
    }
  });

  app.get('/api/weekly-schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.getWeeklySchedule(id);
      if (!schedule) {
        return res.status(404).json({ message: 'Weekly schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch weekly schedule' });
    }
  });

  app.get('/api/weekly-schedules/by-week/:year/:week', async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const week = parseInt(req.params.week);
      const schedule = await storage.getWeeklyScheduleByYearWeek(year, week);
      if (!schedule) {
        return res.status(404).json({ message: 'Weekly schedule not found' });
      }
      res.json(schedule);
    } catch (error) {
      console.error('Error fetching weekly schedule:', error);
      res.status(500).json({ message: 'Failed to fetch weekly schedule' });
    }
  });

  app.post('/api/weekly-schedules', async (req, res) => {
    try {
      const scheduleData = insertWeeklyScheduleSchema.parse(req.body);
      const schedule = await storage.createWeeklySchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: 'Invalid weekly schedule data',
            errors: error.errors,
          });
      }
      res.status(500).json({ message: 'Failed to create weekly schedule' });
    }
  });

  app.put('/api/weekly-schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduleData = insertWeeklyScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updateWeeklySchedule(id, scheduleData);
      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({
            message: 'Invalid weekly schedule data',
            errors: error.errors,
          });
      }
      res.status(500).json({ message: 'Failed to update weekly schedule' });
    }
  });

  app.delete('/api/weekly-schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWeeklySchedule(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete weekly schedule' });
    }
  });

  // Target routes
  app.get('/api/targets', async (req, res) => {
    try {
      const targets = await storage.getTargets();
      res.json(targets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch targets' });
    }
  });

  app.get('/api/targets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const target = await storage.getTarget(id);
      if (!target) {
        return res.status(404).json({ message: 'Target not found' });
      }
      res.json(target);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch target' });
    }
  });

  app.get('/api/targets/by-schedule/:weeklyScheduleId', async (req, res) => {
    try {
      const weeklyScheduleId = parseInt(req.params.weeklyScheduleId);
      const targets = await storage.getTargetsByWeeklySchedule(
        weeklyScheduleId
      );
      res.json(targets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch targets' });
    }
  });

  app.post('/api/targets', async (req, res) => {
    try {
      const targetData = insertTargetSchema.parse(req.body);
      const target = await storage.createTarget(targetData);
      res.status(201).json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid target data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create target' });
    }
  });

  app.put('/api/targets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const targetData = insertTargetSchema.partial().parse(req.body);
      const target = await storage.updateTarget(id, targetData);
      res.json(target);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid target data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update target' });
    }
  });

  app.delete('/api/targets/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTarget(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete target' });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.get('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  });

  app.get('/api/tasks/by-schedule/:weeklyScheduleId', async (req, res) => {
    try {
      const weeklyScheduleId = parseInt(req.params.weeklyScheduleId);
      const tasks = await storage.getTasksByWeeklySchedule(weeklyScheduleId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, taskData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTask(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
