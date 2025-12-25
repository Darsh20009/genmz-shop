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
  const users = await storage.getUserByUsername("0532441566");
  if (!users) {
    const password = await hashPassword("182009");
    await storage.createUser({
      phone: "0532441566",
      password,
      role: "admin",
      name: "Manager",
      username: "0532441566",
      email: "manager@genmz.com",
      walletBalance: "0",
      addresses: [],
    });
    console.log("Manager user created");
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
