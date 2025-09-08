import type { Express } from "express";
import { authStorage } from "./auth";

export function setupAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          message: "Email dan password harus diisi" 
        });
      }

      const user = await authStorage.validateCredentials(email, password);
      
      if (!user) {
        return res.status(401).json({ 
          message: "Email atau password tidak valid" 
        });
      }

      res.json({ 
        user,
        message: "Login berhasil" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Terjadi kesalahan pada server" 
      });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/me", async (req, res) => {
    try {
      // Simple check - in real app, verify JWT token
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ 
          message: "Token tidak ditemukan" 
        });
      }

      // For demo, return user info
      const mockUser = {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "owner"
      };

      res.json(mockUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ 
        message: "Terjadi kesalahan pada server" 
      });
    }
  });

  // Create demo user endpoint (for development only)
  app.post("/api/auth/setup-demo", async (req, res) => {
    try {
      const existingUser = await authStorage.getUserByEmail("admin@example.com");
      
      if (existingUser) {
        return res.json({ 
          message: "Demo user sudah ada" 
        });
      }

      const demoUser = await authStorage.createUser({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "owner",
        storeIds: ["550e8400-e29b-41d4-a716-446655440001"]
      });

      const { passwordHash, ...userWithoutPassword } = demoUser;
      
      res.json({ 
        user: userWithoutPassword,
        message: "Demo user berhasil dibuat" 
      });
    } catch (error) {
      console.error("Setup demo user error:", error);
      res.status(500).json({ 
        message: "Terjadi kesalahan pada server" 
      });
    }
  });
}