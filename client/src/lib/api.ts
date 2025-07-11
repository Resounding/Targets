import { apiRequest } from "./queryClient";
import type { 
  Customer, 
  WeeklySchedule, 
  Target, 
  Task, 
  InsertCustomer, 
  InsertWeeklySchedule, 
  InsertTarget, 
  InsertTask,
  WeeklyScheduleWithRelations,
  TargetWithRelations,
  TaskWithRelations
} from "@shared/schema";

// Customer API
export const customerApi = {
  getAll: (): Promise<Customer[]> => 
    apiRequest("GET", "/api/customers").then(res => res.json()),
  
  getById: (id: number): Promise<Customer> =>
    apiRequest("GET", `/api/customers/${id}`).then(res => res.json()),
  
  create: (data: InsertCustomer): Promise<Customer> =>
    apiRequest("POST", "/api/customers", data).then(res => res.json()),
  
  update: (id: number, data: Partial<InsertCustomer>): Promise<Customer> =>
    apiRequest("PUT", `/api/customers/${id}`, data).then(res => res.json()),
  
  delete: (id: number): Promise<void> =>
    apiRequest("DELETE", `/api/customers/${id}`).then(() => undefined),
};

// Weekly Schedule API
export const weeklyScheduleApi = {
  getAll: (): Promise<WeeklySchedule[]> =>
    apiRequest("GET", "/api/weekly-schedules").then(res => res.json()),
  
  getById: (id: number): Promise<WeeklyScheduleWithRelations> =>
    apiRequest("GET", `/api/weekly-schedules/${id}`).then(res => res.json()),
  
  getByWeek: (year: number, week: number): Promise<WeeklyScheduleWithRelations> =>
    apiRequest("GET", `/api/weekly-schedules/by-week/${year}/${week}`).then(res => res.json()),
  
  create: (data: InsertWeeklySchedule): Promise<WeeklySchedule> =>
    apiRequest("POST", "/api/weekly-schedules", data).then(res => res.json()),
  
  update: (id: number, data: Partial<InsertWeeklySchedule>): Promise<WeeklySchedule> =>
    apiRequest("PUT", `/api/weekly-schedules/${id}`, data).then(res => res.json()),
  
  delete: (id: number): Promise<void> =>
    apiRequest("DELETE", `/api/weekly-schedules/${id}`).then(() => undefined),
};

// Target API
export const targetApi = {
  getAll: (): Promise<Target[]> =>
    apiRequest("GET", "/api/targets").then(res => res.json()),
  
  getById: (id: number): Promise<TargetWithRelations> =>
    apiRequest("GET", `/api/targets/${id}`).then(res => res.json()),
  
  getBySchedule: (weeklyScheduleId: number): Promise<TargetWithRelations[]> =>
    apiRequest("GET", `/api/targets/by-schedule/${weeklyScheduleId}`).then(res => res.json()),
  
  create: (data: InsertTarget): Promise<Target> =>
    apiRequest("POST", "/api/targets", data).then(res => res.json()),
  
  update: (id: number, data: Partial<InsertTarget>): Promise<Target> =>
    apiRequest("PUT", `/api/targets/${id}`, data).then(res => res.json()),
  
  delete: (id: number): Promise<void> =>
    apiRequest("DELETE", `/api/targets/${id}`).then(() => undefined),
};

// Task API
export const taskApi = {
  getAll: (): Promise<Task[]> =>
    apiRequest("GET", "/api/tasks").then(res => res.json()),
  
  getById: (id: number): Promise<TaskWithRelations> =>
    apiRequest("GET", `/api/tasks/${id}`).then(res => res.json()),
  
  getBySchedule: (weeklyScheduleId: number): Promise<TaskWithRelations[]> =>
    apiRequest("GET", `/api/tasks/by-schedule/${weeklyScheduleId}`).then(res => res.json()),
  
  create: (data: InsertTask): Promise<Task> =>
    apiRequest("POST", "/api/tasks", data).then(res => res.json()),
  
  update: (id: number, data: Partial<InsertTask>): Promise<Task> =>
    apiRequest("PUT", `/api/tasks/${id}`, data).then(res => res.json()),
  
  delete: (id: number): Promise<void> =>
    apiRequest("DELETE", `/api/tasks/${id}`).then(() => undefined),
};
