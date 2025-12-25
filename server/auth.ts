import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

const MemoryStore = MemoryStoreFactory(session);

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r3pl1t_s3cr3t_k3y",
    resave: false,
    saveUninitialized: false,
    cookie: {},
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
    sessionSettings.cookie = {
      secure: true,
    };
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: 'phone' }, async (phone, password, done) => {
      try {
        const user = await storage.getUserByUsername(phone);
        if (!user) {
          return done(null, false, { message: "رقم الهاتف غير مسجل" });
        }

        // Special case for Manager/Staff or Checkout verification
        // For regular customers logging in, we might allow phone-only if requested, 
        // but the prompt says: "when registering asks for name, phone, password"
        // "when logging in asks for phone only"
        // "when completing purchase asks for password"
        
        // If it's a customer and no password provided in login, but we are in login flow:
        // Passport LocalStrategy usually expects a password. 
        // We'll adapt it to allow empty password for customers during initial login if needed,
        // but it's safer to check if password matches if it's provided.
        
        if (user.role === "admin" || user.role === "employee" || (password && password !== "")) {
          const parts = user.password.split(".");
          if (parts.length !== 2) {
            return done(null, false, { message: "خطأ في تنسيق كلمة المرور" });
          }
          const [hashedPassword, salt] = parts;
          const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
          if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
            return done(null, user);
          } else {
            return done(null, false, { message: "كلمة المرور غير صحيحة" });
          }
        }
        
        // For customer phone-only login
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as SelectUser).id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.phone);
      if (existingUser) {
        return res.status(400).send("رقم الهاتف مسجل مسبقاً");
      }

      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(req.body.password, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;

      const user = await storage.createUser({
        ...req.body,
        email: req.body.email || `${req.body.phone}@example.com`,
        username: req.body.phone, // Use phone as username internally
        password: hashedPassword,
        role: req.body.role || "customer"
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send(info?.message || "فشل تسجيل الدخول");
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
