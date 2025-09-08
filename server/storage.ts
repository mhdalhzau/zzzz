import {
  stores,
  products,
  customers,
  transactions,
  debts,
  stockMovements,
  cashFlowEntries,
  auditLogs,
  type Store,
  type InsertStore,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Transaction,
  type InsertTransaction,
  type Debt,
  type InsertDebt,
  type StockMovement,
  type InsertStockMovement,
  type CashFlowEntry,
  type InsertCashFlowEntry,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, sum, count, isNull } from "drizzle-orm";

export interface IStorage {
  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store>;

  // Products
  getProducts(storeId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getLowStockProducts(storeId: string, threshold?: number): Promise<Product[]>;

  // Customers
  getCustomers(storeId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<void>;

  // Transactions
  getTransactions(storeId: string, filters?: { from?: Date; to?: Date; status?: string }): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;

  // Debts
  getDebts(storeId: string): Promise<Debt[]>;
  getDebt(id: string): Promise<Debt | undefined>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: string, debt: Partial<InsertDebt>): Promise<Debt>;
  getCustomerDebts(customerId: string): Promise<Debt[]>;

  // Stock movements
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;
  getStockMovements(productId: string): Promise<StockMovement[]>;

  // Cash flow entries
  getCashFlowEntries(storeId: string, filters?: { from?: Date; to?: Date; type?: string }): Promise<CashFlowEntry[]>;
  createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry>;
  updateCashFlowEntry(id: string, entry: Partial<InsertCashFlowEntry>): Promise<CashFlowEntry>;
  deleteCashFlowEntry(id: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(storeId: string): Promise<{
    dailySales: number;
    transactionCount: number;
    totalDebt: number;
    lowStockCount: number;
    recentTransactions: Transaction[];
  }>;

  // Reports
  getSalesReport(storeId: string, from: Date, to: Date): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    grossProfit: number;
    averageTransaction: number;
    topProducts: Array<{
      productName: string;
      quantity: number;
      revenue: number;
    }>;
    paymentMethods: Array<{
      method: string;
      amount: number;
      count: number;
    }>;
  }>;

  // Audit logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).orderBy(stores.name);
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [created] = await db.insert(stores).values(store).returning();
    return created;
  }

  async updateStore(id: string, store: Partial<InsertStore>): Promise<Store> {
    const [updated] = await db
      .update(stores)
      .set({ ...store, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return updated;
  }

  async getProducts(storeId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.storeId, storeId), eq(products.isActive, true)))
      .orderBy(products.name);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.update(products).set({ isActive: false }).where(eq(products.id, id));
  }

  async getLowStockProducts(storeId: string, threshold = 5): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.storeId, storeId),
          eq(products.isActive, true),
          sql`${products.stock} <= ${threshold}`
        )
      )
      .orderBy(products.stock);
  }

  async getCustomers(storeId: string): Promise<Customer[]> {
    return await db
      .select()
      .from(customers)
      .where(eq(customers.storeId, storeId))
      .orderBy(customers.name);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async getTransactions(
    storeId: string,
    filters?: { from?: Date; to?: Date; status?: string }
  ): Promise<Transaction[]> {
    let query = db.select().from(transactions).where(eq(transactions.storeId, storeId));

    if (filters?.from && filters?.to) {
      query = query.where(
        and(
          eq(transactions.storeId, storeId),
          gte(transactions.createdAt, filters.from),
          lte(transactions.createdAt, filters.to)
        )
      );
    }

    if (filters?.status) {
      query = query.where(
        and(eq(transactions.storeId, storeId), eq(transactions.paymentStatus, filters.status))
      );
    }

    return await query.orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    return await db.transaction(async (tx) => {
      // Create transaction
      const [created] = await tx.insert(transactions).values(transaction).returning();

      // Update product stock
      for (const item of transaction.items) {
        await tx
          .update(products)
          .set({
            stock: sql`${products.stock} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));

        // Create stock movement
        await tx.insert(stockMovements).values({
          productId: item.productId,
          storeId: transaction.storeId,
          type: "out",
          quantity: -item.quantity,
          reference: created.id,
          notes: "Sale transaction",
        });
      }

      // Create debt if unpaid
      if (
        created.paymentStatus === "unpaid" &&
        created.customerId &&
        parseFloat(created.total) > 0
      ) {
        await tx.insert(debts).values({
          transactionId: created.id,
          storeId: created.storeId,
          customerId: created.customerId,
          amount: created.total,
          status: "pending",
        });
      }

      return created;
    });
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [updated] = await db
      .update(transactions)
      .set({ ...transaction, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  async getDebts(storeId: string): Promise<Debt[]> {
    return await db
      .select()
      .from(debts)
      .where(eq(debts.storeId, storeId))
      .orderBy(desc(debts.createdAt));
  }

  async getDebt(id: string): Promise<Debt | undefined> {
    const [debt] = await db.select().from(debts).where(eq(debts.id, id));
    return debt;
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const [created] = await db.insert(debts).values(debt).returning();
    return created;
  }

  async updateDebt(id: string, debt: Partial<InsertDebt>): Promise<Debt> {
    const [updated] = await db
      .update(debts)
      .set({ ...debt, updatedAt: new Date() })
      .where(eq(debts.id, id))
      .returning();
    return updated;
  }

  async getCustomerDebts(customerId: string): Promise<Debt[]> {
    return await db
      .select()
      .from(debts)
      .where(eq(debts.customerId, customerId))
      .orderBy(desc(debts.createdAt));
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const [created] = await db.insert(stockMovements).values(movement).returning();
    return created;
  }

  async getStockMovements(productId: string): Promise<StockMovement[]> {
    return await db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, productId))
      .orderBy(desc(stockMovements.createdAt));
  }

  async getCashFlowEntries(storeId: string, filters?: { from?: Date; to?: Date; type?: string }): Promise<CashFlowEntry[]> {
    let query = db
      .select()
      .from(cashFlowEntries)
      .where(eq(cashFlowEntries.storeId, storeId));

    if (filters?.from && filters?.to) {
      query = query.where(
        and(
          eq(cashFlowEntries.storeId, storeId),
          gte(cashFlowEntries.createdAt, filters.from),
          lte(cashFlowEntries.createdAt, filters.to)
        )
      );
    }

    if (filters?.type) {
      query = query.where(
        and(
          eq(cashFlowEntries.storeId, storeId),
          eq(cashFlowEntries.type, filters.type)
        )
      );
    }

    return await query.orderBy(desc(cashFlowEntries.createdAt));
  }

  async createCashFlowEntry(entry: InsertCashFlowEntry): Promise<CashFlowEntry> {
    const [created] = await db.insert(cashFlowEntries).values(entry).returning();
    return created;
  }

  async updateCashFlowEntry(id: string, entry: Partial<InsertCashFlowEntry>): Promise<CashFlowEntry> {
    const [updated] = await db
      .update(cashFlowEntries)
      .set({ ...entry, updatedAt: new Date() })
      .where(eq(cashFlowEntries.id, id))
      .returning();
    return updated;
  }

  async deleteCashFlowEntry(id: string): Promise<void> {
    await db.delete(cashFlowEntries).where(eq(cashFlowEntries.id, id));
  }

  async getDashboardStats(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Daily sales
    const [dailySalesResult] = await db
      .select({ total: sum(transactions.total) })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.paymentStatus, "paid"),
          gte(transactions.createdAt, today),
          lte(transactions.createdAt, tomorrow)
        )
      );

    // Transaction count
    const [transactionCountResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          gte(transactions.createdAt, today),
          lte(transactions.createdAt, tomorrow)
        )
      );

    // Total debt
    const [totalDebtResult] = await db
      .select({ total: sum(sql`${debts.amount} - ${debts.paidAmount}`) })
      .from(debts)
      .where(and(eq(debts.storeId, storeId), eq(debts.status, "pending")));

    // Low stock count
    const lowStockProducts = await this.getLowStockProducts(storeId);

    // Recent transactions
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.storeId, storeId))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    return {
      dailySales: parseFloat(dailySalesResult?.total || "0"),
      transactionCount: transactionCountResult?.count || 0,
      totalDebt: parseFloat(totalDebtResult?.total || "0"),
      lowStockCount: lowStockProducts.length,
      recentTransactions,
    };
  }

  async getSalesReport(storeId: string, from: Date, to: Date) {
    // Total revenue
    const [revenueResult] = await db
      .select({ total: sum(transactions.total) })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          eq(transactions.paymentStatus, "paid"),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to)
        )
      );

    // Total transactions
    const [transactionCountResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.storeId, storeId),
          gte(transactions.createdAt, from),
          lte(transactions.createdAt, to)
        )
      );

    const totalRevenue = parseFloat(revenueResult?.total || "0");
    const totalTransactions = transactionCountResult?.count || 0;

    return {
      totalRevenue,
      totalTransactions,
      grossProfit: totalRevenue * 0.27, // Estimated margin
      averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
      topProducts: [], // Would need complex aggregation
      paymentMethods: [], // Would need complex aggregation
    };
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
