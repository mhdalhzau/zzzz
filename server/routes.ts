import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuthRoutes } from "./auth-routes";
import {
  insertStoreSchema,
  insertProductSchema,
  insertCustomerSchema,
  insertTransactionSchema,
  insertDebtSchema,
  insertCashFlowEntrySchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ message: "Gagal mengambil data toko" });
    }
  });

  app.post("/api/stores", async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(400).json({ message: "Data toko tidak valid" });
    }
  });

  app.get("/api/stores/:id", async (req, res) => {
    try {
      const store = await storage.getStore(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Toko tidak ditemukan" });
      }
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ message: "Gagal mengambil data toko" });
    }
  });

  // Dashboard
  app.get("/api/stores/:id/dashboard", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Gagal mengambil statistik dashboard" });
    }
  });

  // Products
  app.get("/api/stores/:storeId/products", async (req, res) => {
    try {
      const products = await storage.getProducts(req.params.storeId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Gagal mengambil data produk" });
    }
  });

  app.post("/api/stores/:storeId/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse({
        ...req.body,
        storeId: req.params.storeId,
      });
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Data produk tidak valid" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Gagal memperbarui produk" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Gagal menghapus produk" });
    }
  });

  // Customers
  app.get("/api/stores/:storeId/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers(req.params.storeId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Gagal mengambil data pelanggan" });
    }
  });

  app.post("/api/stores/:storeId/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse({
        ...req.body,
        storeId: req.params.storeId,
      });
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Data pelanggan tidak valid" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ message: "Gagal memperbarui pelanggan" });
    }
  });

  // Transactions
  app.get("/api/stores/:storeId/transactions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.from && req.query.to) {
        filters.from = new Date(req.query.from as string);
        filters.to = new Date(req.query.to as string);
      }
      
      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const transactions = await storage.getTransactions(req.params.storeId, filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Gagal mengambil data transaksi" });
    }
  });

  app.post("/api/stores/:storeId/transactions", async (req, res) => {
    try {
      // Generate invoice number
      const invoiceNumber = `TRX-${Date.now()}`;
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        storeId: req.params.storeId,
        invoiceNumber,
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Data transaksi tidak valid" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: "Gagal memperbarui transaksi" });
    }
  });

  // Debts
  app.get("/api/stores/:storeId/debts", async (req, res) => {
    try {
      const debts = await storage.getDebts(req.params.storeId);
      res.json(debts);
    } catch (error) {
      console.error("Error fetching debts:", error);
      res.status(500).json({ message: "Gagal mengambil data piutang" });
    }
  });

  app.put("/api/debts/:id", async (req, res) => {
    try {
      const debtData = insertDebtSchema.partial().parse(req.body);
      const debt = await storage.updateDebt(req.params.id, debtData);
      res.json(debt);
    } catch (error) {
      console.error("Error updating debt:", error);
      res.status(400).json({ message: "Gagal memperbarui piutang" });
    }
  });

  // Mock WhatsApp reminder
  app.post("/api/debts/:id/reminder", async (req, res) => {
    try {
      const debt = await storage.getDebt(req.params.id);
      if (!debt) {
        return res.status(404).json({ message: "Piutang tidak ditemukan" });
      }

      // Mock WhatsApp sending - in production this would call WhatsApp Business API
      console.log(`Mock WhatsApp reminder sent for debt ${debt.id}`);
      
      await storage.updateDebt(req.params.id, {
        reminderSent: true,
        lastReminderDate: new Date(),
      });

      res.json({ message: "Reminder berhasil dikirim", success: true });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Gagal mengirim reminder" });
    }
  });

  // Cash flow entries
  app.get("/api/stores/:storeId/cashflow", async (req, res) => {
    try {
      const { from, to, type } = req.query;
      const filters: any = {};
      
      if (from) filters.from = new Date(from as string);
      if (to) filters.to = new Date(to as string);
      if (type) filters.type = type as string;
      
      const entries = await storage.getCashFlowEntries(req.params.storeId, filters);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching cash flow entries:", error);
      res.status(500).json({ message: "Gagal mengambil data arus kas" });
    }
  });

  app.post("/api/stores/:storeId/cashflow", async (req, res) => {
    try {
      const entryData = insertCashFlowEntrySchema.parse({
        ...req.body,
        storeId: req.params.storeId,
      });
      const entry = await storage.createCashFlowEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating cash flow entry:", error);
      res.status(400).json({ message: "Data arus kas tidak valid" });
    }
  });

  app.put("/api/cashflow/:id", async (req, res) => {
    try {
      const entryData = insertCashFlowEntrySchema.partial().parse(req.body);
      const entry = await storage.updateCashFlowEntry(req.params.id, entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error updating cash flow entry:", error);
      res.status(400).json({ message: "Data arus kas tidak valid" });
    }
  });

  app.delete("/api/cashflow/:id", async (req, res) => {
    try {
      await storage.deleteCashFlowEntry(req.params.id);
      res.json({ message: "Entry arus kas berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting cash flow entry:", error);
      res.status(500).json({ message: "Gagal menghapus entry arus kas" });
    }
  });

  // Reports
  app.get("/api/stores/:storeId/reports/sales", async (req, res) => {
    try {
      const from = new Date(req.query.from as string);
      const to = new Date(req.query.to as string);
      
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ message: "Tanggal tidak valid" });
      }

      const report = await storage.getSalesReport(req.params.storeId, from, to);
      res.json(report);
    } catch (error) {
      console.error("Error generating sales report:", error);
      res.status(500).json({ message: "Gagal membuat laporan penjualan" });
    }
  });

  // Mock payment callback
  app.post("/api/payment/callback", async (req, res) => {
    try {
      const { transactionId, status } = req.body;
      
      if (status === "paid") {
        await storage.updateTransaction(transactionId, {
          paymentStatus: "paid",
        });
        
        console.log(`Mock payment callback: Transaction ${transactionId} marked as paid`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error processing payment callback:", error);
      res.status(500).json({ message: "Gagal memproses callback pembayaran" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
