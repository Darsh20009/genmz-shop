import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { CategoryModel, UserModel } from "./models";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buffer.toString("hex")}.${salt}`;
}

export async function seed() {
  // Remove old phone number if exists
  await UserModel.deleteMany({ phone: "0532441566" });
  await UserModel.deleteMany({ phone: "0552469643" });
  
  // Create new admin user with new phone
  console.log("Seeding admin user...");
  const password = await hashPassword("20262030");
  await storage.createUser({
    phone: "0552469643",
    password,
    role: "admin",
    name: "محمد",
    username: "0552469643",
    email: "admin@genmz.com",
    walletBalance: "0",
    addresses: [],
    permissions: ["support", "orders", "products", "accounting", "customers"]
  });
  console.log("Admin user created with phone 0552469643 and password 20262030");

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
