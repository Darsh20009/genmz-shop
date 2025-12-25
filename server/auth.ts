import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { UserModel } from "./models";

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
        console.log(`[AUTH] Login attempt for input: "${phone}"`);
        const cleanInput = phone.trim().replace(/\s/g, "");
        
        // Root fix: Universal search across phone, username, and name
        // This ensures compatibility with ALL previous registration methods
        const user = await UserModel.findOne({ 
          $or: [
            { phone: cleanInput },
            { username: cleanInput },
            { name: cleanInput }
          ]
        }).lean().then(u => u ? { ...u, id: (u as any)._id.toString() } : undefined);
        
        if (!user) {
          console.log(`[AUTH] User not found for input: ${cleanInput}`);
          return done(null, false, { message: "البيانات المدخلة غير صحيحة" });
        }
        
        console.log(`[AUTH] User found: ${user.phone || user.username}, role: ${user.role}`);

        const isStaffOrAdmin = ["admin", "employee", "support"].includes(user.role);
        
        // If password is NOT provided in the request
        if (!password || password === "undefined" || password === "") {
          // Admin/Staff MUST provide a password
          if (isStaffOrAdmin) {
            console.log(`[AUTH] Admin/Staff login blocked: Password required`);
            return done(null, false, { message: "كلمة المرور مطلوبة لهذا الحساب" });
          }
          // Regular customers can login with phone only (if that's the current flow)
          console.log(`[AUTH] Customer phone-only login allowed`);
          return done(null, user);
        }

        // If password IS provided, we MUST verify it if a password exists in DB
        if (user.password && user.password !== "") {
          const parts = user.password.split(".");
          if (parts.length === 2) {
            // New hashing system (scrypt)
            const [hashedPassword, salt] = parts;
            const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
            if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
              console.log(`[AUTH] Password match (scrypt)`);
              return done(null, user);
            }
          } else if (user.password === password) {
            // Legacy plain-text password support
            console.log(`[AUTH] Password match (plain)`);
            return done(null, user);
          }
          console.log(`[AUTH] Password mismatch`);
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        // User exists but has no password set? Allow login.
        console.log(`[AUTH] Login successful: No password required`);
        return done(null, user);
      } catch (err) {
        console.error(`[AUTH] Strategy error:`, err);
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
      const { phone, password, name } = req.body;
      if (!phone || !password || !name) {
        return res.status(400).send("جميع الحقول مطلوبة");
      }

      const cleanPhone = phone.trim().replace(/\s/g, "");
      const existingUser = await UserModel.findOne({ 
        $or: [
          { phone: cleanPhone },
          { username: cleanPhone }
        ]
      }).lean();
      if (existingUser) {
        return res.status(400).send("رقم الهاتف مسجل مسبقاً");
      }

      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;

      const user = await storage.createUser({
        name,
        phone: cleanPhone,
        password: hashedPassword,
        username: cleanPhone, // Set username to phone for internal logic consistency
        email: req.body.email || `${cleanPhone}@genmz.com`,
        role: "customer",
        walletBalance: "0",
        addresses: []
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
