import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { CategoryModel } from "./models";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buffer.toString("hex")}.${salt}`;
}

export async function seed() {
  const users = await storage.getUserByUsername("admin");
  if (!users) {
    const password = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password,
      role: "admin",
      name: "Admin User",
      email: "admin@genmz.com",
      phone: "0500000000",
    });
    console.log("Admin user created");
  }

  const categories = await storage.getCategories();
  if (categories.length === 0) {
    await CategoryModel.insertMany([
      { name: "Men", slug: "men" },
      { name: "Women", slug: "women" },
      { name: "Kids", slug: "kids" },
      { name: "Accessories", slug: "accessories" },
      { name: "Perfumes", slug: "perfumes" },
    ]);
    console.log("Categories seeded");
  }
}
