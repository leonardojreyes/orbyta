import { pgTable, uuid, text, date, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
};

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  taxId: text("tax_id"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["planned", "active", "on_hold", "done"] }).notNull().default("planned"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  ...timestamps,
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  projectId: uuid("project_id").notNull(),
  title: text("title").notNull(),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  assignee: text("assignee"),
  dueDate: date("due_date"),
  ...timestamps,
});

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  code: text("code").notNull(),
  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
  status: text("status", { enum: ["open", "assigned", "in_progress", "done", "cancelled"] }).notNull().default("open"),
  assignedTo: text("assigned_to"),
  projectId: uuid("project_id"),
  customerId: uuid("customer_id"),
  technicianId: uuid("technician_id"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  ...timestamps,
});

const orderStatus = ["open", "assigned", "in_progress", "done", "cancelled"] as const;

export const serviceOrderEvents = pgTable("service_order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  orderId: uuid("order_id").notNull(),
  fromStatus: text("from_status", { enum: orderStatus }),
  toStatus: text("to_status", { enum: orderStatus }).notNull(),
  ...timestamps,
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  ...timestamps,
});

export const technicians = pgTable("technicians", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  ...timestamps,
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "supervisor", "technician"] }).notNull(),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  passwordHash: text("password_hash").notNull(),
  technicianId: uuid("technician_id"),
  ...timestamps,
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  userId: uuid("user_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  ...timestamps,
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  recordLabel: text("record_label"),
  action: text("action", { enum: ["insert", "update", "delete"] }).notNull(),
  changes: jsonb("changes").$type<Record<string, unknown>>().notNull(),
  userId: uuid("user_id"),
  ...timestamps,
});
