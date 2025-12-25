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
        const cleanPhone = phone.trim().replace(/\s/g, "");
        // Root fix: Search by both phone and username simultaneously for all users
        const user = await UserModel.findOne({ 
          $or: [
            { phone: cleanPhone },
            { username: cleanPhone }
          ]
        }).lean().then(u => u ? { ...u, id: (u as any)._id.toString() } : undefined);
        
        if (!user) {
          return done(null, false, { message: "رقم الهاتف غير مسجل" });
        }

        // Staff/Admin/Support MUST have a password
        const isStaffOrAdmin = ["admin", "employee", "support"].includes(user.role);
        
        if (isStaffOrAdmin || (password && password !== "" && password !== "undefined")) {
          if (!password || password === "undefined" || password === "") {
             return done(null, false, { message: "كلمة المرور مطلوبة لهذا الحساب" });
          }
          
          const parts = user.password.split(".");
          if (parts.length === 2) {
            const [hashedPassword, salt] = parts;
            const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
            if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
              return done(null, user);
            }
          } else if (user.password === password) {
            // Support legacy plain-text passwords
            return done(null, user);
          }
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        // For customer who registered with a password, but trying to login without one
        if (user.password && user.password.includes(".") && (!password || password === "")) {
           return done(null, false, { message: "كلمة المرور مطلوبة" });
        }
        
        // Final fallback for customer phone-only login
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
