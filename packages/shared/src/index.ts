import { z } from "zod";

// ---- Catálogos de estado (fuente única para API, web y móvil) ----
export const PROJECT_STATUS = ["planned", "active", "on_hold", "done"] as const;
export const TASK_STATUS = ["todo", "in_progress", "done"] as const;
export const ORDER_STATUS = ["open", "assigned", "in_progress", "done", "cancelled"] as const;
// El técnico solo avanza sus órdenes entre estos estados y no toca las ya cerradas (no reabre ni cancela).
export const TECHNICIAN_ORDER_TARGETS = ["assigned", "in_progress", "done"] as const;
export const CLOSED_ORDER_STATUS = ["done", "cancelled"] as const;
export const TECHNICIAN_STATUS = ["active", "inactive"] as const;
export const USER_ROLES = ["admin", "supervisor", "technician"] as const;
export const USER_STATUS = ["active", "inactive"] as const;
export const ORDER_PRIORITY = ["low", "medium", "high", "urgent"] as const;

export const LABELS: Record<string, string> = {
  planned: "Planificado", active: "Activo", on_hold: "En pausa", done: "Terminado",
  todo: "Por hacer", in_progress: "En curso",
  open: "Abierta", assigned: "Asignada", cancelled: "Cancelada",
  inactive: "Inactivo",
  admin: "Administrador", supervisor: "Supervisor", technician: "Técnico",
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

// ---- Autenticación y usuarios ----
export const PASSWORD_MIN = 10;
const password = z.string().min(PASSWORD_MIN, `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`).max(200);
const email = z.string().trim().toLowerCase().email().max(200);

export const LoginInput = z.object({
  tenant: z.string().trim().toLowerCase().min(1).max(80), // código (slug) de la empresa
  email,
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof LoginInput>;

export const ChangePassword = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: password,
}).refine((v) => v.currentPassword !== v.newPassword, { message: "La contraseña nueva debe ser distinta", path: ["newPassword"] });
export type ChangePassword = z.infer<typeof ChangePassword>;

export const UserCreate = z.object({
  id: id.optional(),
  email,
  name: z.string().trim().min(2).max(120),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUS).default("active"),
  password,
  technicianId: id.nullish(),
});
export type UserCreate = z.infer<typeof UserCreate>;
export const UserUpdate = UserCreate.partial().omit({ id: true, email: true });
export type UserUpdate = z.infer<typeof UserUpdate>;

// Logo de la empresa: imagen pequeña embebida (data URL), sin servicio de archivos aparte.
export const LOGO_MAX_CHARS = 280_000; // ≈ 200 KB de imagen en base64
export const CompanyUpdate = z.object({
  name: z.string().min(2).max(200),
  taxId: z.string().max(40).nullable(),
  address: z.string().max(500).nullable(),
  phone: z.string().max(40).nullable(),
  email: z.string().email().max(200).nullable(),
  logoUrl: z.string().max(LOGO_MAX_CHARS)
    .regex(/^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/, "El logo debe ser png, jpeg, webp o svg")
    .nullable(),
}).partial();
export type CompanyUpdate = z.infer<typeof CompanyUpdate>;

// ---- Listados: filtros, búsqueda, orden y paginación (en el servidor) ----
const pageParams = {
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
};
const searchText = z.string().trim().max(100).optional();

export const ORDER_SORT = ["created", "code", "priority", "status", "customer"] as const;
export const OrderListQuery = z.object({
  q: searchText, // busca en código, cliente, dirección, falla y técnico
  status: z.enum(ORDER_STATUS).optional(),
  priority: z.enum(ORDER_PRIORITY).optional(),
  technicianId: id.optional(),
  projectId: z.union([id, z.literal("none")]).optional(), // "none" = órdenes sin proyecto
  customerId: id.optional(),
  sort: z.enum(ORDER_SORT).default("created"),
  dir: z.enum(["asc", "desc"]).default("desc"),
  ...pageParams,
});
export type OrderListQuery = z.infer<typeof OrderListQuery>;
export const CustomerListQuery = z.object({ q: searchText, ...pageParams });
export const TechnicianListQuery = z.object({ q: searchText, status: z.enum(TECHNICIAN_STATUS).optional(), ...pageParams });

// ---- Panel de indicadores ----
export const DASHBOARD_PERIODS = [7, 30, 90] as const;
export const DashboardQuery = z.object({
  days: z.coerce.number().int().refine((v) => (DASHBOARD_PERIODS as readonly number[]).includes(v), "Periodo inválido").default(30),
});

// ---- Adjuntos (fotos de la falla) ----
export const ATTACHMENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ATTACHMENT_MAX_PER_ORDER = 20;
export const ATTACHMENT_DEFAULT_MAX_MB = 5; // tope por foto; la API lo puede cambiar con MAX_UPLOAD_MB

// ---- Bitácora de auditoría ----
export const AUDIT_TABLES = ["service_orders", "projects", "tasks", "customers", "technicians", "users", "tenants", "attachments"] as const;
export const AUDIT_ACTIONS = ["insert", "update", "delete"] as const;
export const AuditQuery = z.object({
  table: z.enum(AUDIT_TABLES).optional(),
  action: z.enum(AUDIT_ACTIONS).optional(),
  userId: id.optional(),
  recordId: id.optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  // Cursor opaco "<created_at>_<id>" devuelto como nextCursor en la página anterior.
  cursor: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?[+-]\d{2}(:\d{2})?_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i).optional(),
});
export type AuditQuery = z.infer<typeof AuditQuery>;

// ---- Tipos de respuesta ----
export interface SessionUser {
  id: string; name: string; email: string; role: (typeof USER_ROLES)[number]; technicianId: string | null;
}
export interface User extends SessionUser { status: (typeof USER_STATUS)[number] }
export interface Tenant { id: string; name: string; slug: string }
export interface Company extends Tenant {
  logoUrl: string | null; taxId: string | null; address: string | null; phone: string | null; email: string | null;
}
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
export interface AuditEntry {
  id: string; tableName: (typeof AUDIT_TABLES)[number]; recordId: string; recordLabel: string | null;
  action: (typeof AUDIT_ACTIONS)[number];
  changes: Record<string, unknown>; // insert: fila completa; update/delete: { campo: { old, new } }
  userId: string | null; userName: string | null; createdAt: string;
}
export interface AuditPage { items: AuditEntry[]; nextCursor: string | null }
export interface Page<T> { items: T[]; total: number }
/** Órdenes de una página; `counts` por estado respeta los demás filtros pero ignora el de estado (para las tarjetas). */
export interface OrderPage extends Page<ServiceOrder> { counts: Record<(typeof ORDER_STATUS)[number], number> }
// Listas completas y ligeras para los selectores (ver /lookups/*).
export interface CustomerOption { id: string; name: string; address: string | null }
export interface TechnicianOption { id: string; name: string; status: (typeof TECHNICIAN_STATUS)[number] }
export interface Attachment {
  id: string; orderId: string; fileName: string; contentType: (typeof ATTACHMENT_TYPES)[number]; sizeBytes: number;
  uploadedBy: string | null; uploadedByName: string | null; createdAt: string;
}
/**
 * Indicadores de la empresa. `resolution` y `byTechnician.avgHours` miden calendario corrido (no horas hábiles) desde que se
 * crea la orden hasta la primera vez que pasa a "terminada" según su historial; las órdenes anteriores al historial (migración 002)
 * no tienen ese paso y no entran en la muestra.
 */
export interface DashboardData {
  days: number;
  byStatus: Record<(typeof ORDER_STATUS)[number], number>;
  openByPriority: Record<(typeof ORDER_PRIORITY)[number], number>;
  /** Órdenes sin cerrar por tiempo desde su creación. */
  aging: { lt1d: number; d1to3: number; d3to7: number; gt7: number };
  /** Una fila por día del periodo (hoy incluido), en orden. */
  daily: { date: string; created: number; closed: number }[];
  resolution: { sample: number; avgHours: number | null; medianHours: number | null; p90Hours: number | null };
  byTechnician: { id: string; name: string; openCount: number; doneInPeriod: number; avgHours: number | null }[];
}
