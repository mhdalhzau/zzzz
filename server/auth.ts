import bcrypt from "bcryptjs";
import { users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUserByEmail(email: string): Promise<any | undefined>;
  createUser(userData: any): Promise<any>;
  validateCredentials(email: string, password: string): Promise<any | null>;
}

export class AuthStorage implements IAuthStorage {
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        passwordHash: hashedPassword,
      })
      .returning();
    return user;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authStorage = new AuthStorage();