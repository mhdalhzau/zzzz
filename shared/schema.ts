import { sql, relations } from "drizzle-orm";
import { 
  pgTable, 
  varchar, 
  text, 
  integer, 
  decimal, 
  timestamp, 
  boolean,
  json,
  uuid,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stores table
export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Jakarta"),
  currency: varchar("currency", { length: 10 }).default("IDR"),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table (simple auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 50 }).notNull().default("cashier"), // owner, admin, cashier
  passwordHash: text("password_hash").notNull(),
  storeIds: json("store_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  priceBuy: decimal("price_buy", { precision: 12, scale: 2 }).notNull(),
  priceSell: decimal("price_sell", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  unit: varchar("unit", { length: 50 }).default("pcs"),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customers.id),
  invoiceNumber: varchar("invoice_number", { length: 100 }).notNull(),
  items: json("items").$type<Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount: number;
  }>>().notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 12, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"), // paid, unpaid, partial
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, transfer, qris, ewallet
  notes: text("notes"),
  offlineId: varchar("offline_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Debts table (piutang)
export const debts = pgTable("debts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, paid, overdue
  reminderSent: boolean("reminder_sent").default(false),
  lastReminderDate: timestamp("last_reminder_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stock movements table
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // in, out, adjustment
  quantity: integer("quantity").notNull(),
  reference: varchar("reference", { length: 255 }), // transaction_id, adjustment reason, etc
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cash flow entries table (for expense and income tracking)
export const cashFlowEntries = pgTable("cash_flow_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  storeId: uuid("store_id").notNull().references(() => stores.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }), // for debt payments
  type: varchar("type", { length: 20 }).notNull(), // income, expense
  category: varchar("category", { length: 100 }).notNull(), // sales, purchase, operational, debt, etc
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, transfer, qris, ewallet
  reference: varchar("reference", { length: 255 }), // transaction_id, invoice number, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id),
  storeId: uuid("store_id").references(() => stores.id),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id"),
  payload: json("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const storesRelations = relations(stores, ({ many }) => ({
  products: many(products),
  customers: many(customers),
  transactions: many(transactions),
  debts: many(debts),
  stockMovements: many(stockMovements),
  cashFlowEntries: many(cashFlowEntries),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.id],
  }),
  stockMovements: many(stockMovements),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  store: one(stores, {
    fields: [customers.storeId],
    references: [stores.id],
  }),
  transactions: many(transactions),
  debts: many(debts),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  store: one(stores, {
    fields: [transactions.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  debts: many(debts),
}));

export const debtsRelations = relations(debts, ({ one }) => ({
  transaction: one(transactions, {
    fields: [debts.transactionId],
    references: [transactions.id],
  }),
  store: one(stores, {
    fields: [debts.storeId],
    references: [stores.id],
  }),
  customer: one(customers, {
    fields: [debts.customerId],
    references: [customers.id],
  }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  store: one(stores, {
    fields: [stockMovements.storeId],
    references: [stores.id],
  }),
}));

export const cashFlowEntriesRelations = relations(cashFlowEntries, ({ one }) => ({
  store: one(stores, {
    fields: [cashFlowEntries.storeId],
    references: [stores.id],
  }),
}));

// Insert schemas
export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export const insertCashFlowEntrySchema = createInsertSchema(cashFlowEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;
export type CashFlowEntry = typeof cashFlowEntries.$inferSelect;
export type InsertCashFlowEntry = z.infer<typeof insertCashFlowEntrySchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Dashboard stats type
export type DashboardStats = {
  dailySales: number;
  transactionCount: number;
  totalDebt: number;
  lowStockCount: number;
  recentTransactions: Transaction[];
};
