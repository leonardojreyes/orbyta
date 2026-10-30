import { pgTable, uuid, text, date, timestamp, doublePrecision } from "drizzle-orm/pg-core";

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
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  ...timestamps,
});
