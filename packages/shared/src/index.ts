import { z } from "zod";

// ---- Catálogos de estado (fuente única para API, web y móvil) ----
export const PROJECT_STATUS = ["planned", "active", "on_hold", "done"] as const;
export const TASK_STATUS = ["todo", "in_progress", "done"] as const;
export const ORDER_STATUS = ["open", "assigned", "in_progress", "done", "cancelled"] as const;
export const TECHNICIAN_STATUS = ["active", "inactive"] as const;
export const ORDER_PRIORITY = ["low", "medium", "high", "urgent"] as const;

export const LABELS: Record<string, string> = {
  planned: "Planificado", active: "Activo", on_hold: "En pausa", done: "Terminado",
  todo: "Por hacer", in_progress: "En curso",
  open: "Abierta", assigned: "Asignada", cancelled: "Cancelada",
  inactive: "Inactivo",
  low: "Baja", medium: "Media", high: "Alta", urgent: "Urgente",
};

// IDs UUID generables en el cliente -> permite crear registros sin conexión (móvil offline).
const id = z.string().uuid();

export const ProjectCreate = z.object({
  id: id.optional(),
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(PROJECT_STATUS).default("planned"),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});
export type ProjectCreate = z.infer<typeof ProjectCreate>;

export const TaskCreate = z.object({
  id: id.optional(),
  title: z.string().min(2).max(300),
  status: z.enum(TASK_STATUS).default("todo"),
  assignee: z.string().max(120).optional(),
  dueDate: z.string().date().optional(),
});
export type TaskCreate = z.infer<typeof TaskCreate>;
export const TaskUpdate = TaskCreate.partial().omit({ id: true });

export const OrderCreate = z.object({
  id: id.optional(),
  customerName: z.string().min(2).max(200),
  address: z.string().min(3).max(500),
  description: z.string().min(3).max(5000),
  priority: z.enum(ORDER_PRIORITY).default("medium"),
  status: z.enum(ORDER_STATUS).default("open"),
  assignedTo: z.string().max(120).optional(),
  projectId: id.optional(),
  customerId: id.optional(),
  technicianId: id.optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});
export type OrderCreate = z.infer<typeof OrderCreate>;
// assignedTo acepta null para poder quitar al técnico asignado.
export const OrderUpdate = OrderCreate.partial().omit({ id: true }).extend({
  assignedTo: z.string().max(120).nullable().optional(),
  projectId: id.nullable().optional(),
  customerId: id.nullable().optional(),
  technicianId: id.nullable().optional(),
});

export const CustomerCreate = z.object({
  id: id.optional(),
  name: z.string().min(2).max(200),
  taxId: z.string().max(40).nullish(),
  phone: z.string().max(40).nullish(),
  email: z.string().email().max(200).nullish(),
  address: z.string().max(500).nullish(),
});
export type CustomerCreate = z.infer<typeof CustomerCreate>;
export const CustomerUpdate = CustomerCreate.partial().omit({ id: true });

export const TechnicianCreate = z.object({
  id: id.optional(),
  name: z.string().min(2).max(120),
  phone: z.string().max(40).nullish(),
  email: z.string().email().max(200).nullish(),
  status: z.enum(TECHNICIAN_STATUS).default("active"),
});
export type TechnicianCreate = z.infer<typeof TechnicianCreate>;
export const TechnicianUpdate = TechnicianCreate.partial().omit({ id: true });

// ---- Tipos de respuesta ----
export interface Tenant { id: string; name: string; slug: string; logoUrl: string | null }
export interface Project {
  id: string; code: string; name: string; description: string | null;
  status: (typeof PROJECT_STATUS)[number]; startDate: string | null; endDate: string | null;
  taskCount?: number; doneCount?: number; orderCount?: number;
}
export interface Task {
  id: string; projectId: string; title: string; status: (typeof TASK_STATUS)[number];
  assignee: string | null; dueDate: string | null;
}
export interface ServiceOrder {
  id: string; code: string; customerName: string; address: string; description: string;
  priority: (typeof ORDER_PRIORITY)[number]; status: (typeof ORDER_STATUS)[number];
  assignedTo: string | null; projectId: string | null; customerId: string | null; technicianId: string | null; createdAt: string; updatedAt: string;
}
export interface ServiceOrderEvent {
  id: string; orderId: string; fromStatus: (typeof ORDER_STATUS)[number] | null;
  toStatus: (typeof ORDER_STATUS)[number]; createdAt: string;
}
export interface Customer {
  id: string; name: string; taxId: string | null; phone: string | null; email: string | null; address: string | null;
}
export interface Technician {
  id: string; name: string; phone: string | null; email: string | null; status: (typeof TECHNICIAN_STATUS)[number];
}
