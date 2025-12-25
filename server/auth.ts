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
    rolling: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: app.get("env") === "production"
    },
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

  // Restore secure but reliable login
  passport.use(
    new LocalStrategy({ usernameField: 'username', passwordField: 'password', passReqToCallback: false }, async (username, password, done) => {
      try {
        console.log(`[AUTH] Login attempt for: "${username}"`);
        const cleanInput = (username || "").trim().replace(/\s/g, "");
        
        // Find user by phone, username, or name (case-insensitive)
        const searchRegex = new RegExp(`^${cleanInput}$`, "i");
        console.log(`[AUTH] Login attempt for user: "${cleanInput}"`);
        let user = await UserModel.findOne({ 
          $or: [
            { phone: cleanInput },
            { username: searchRegex },
            { name: searchRegex }
          ]
        }).lean();
        
        if (user) {
          user = { ...user, id: (user as any)._id.toString() };
        }
        
        console.log(`[AUTH] User search result: ${user ? 'Found' : 'Not Found'}`);
        if (user) {
          console.log(`[AUTH] User details: ID=${user.id}, Username=${user.username}, Role=${user.role}, HasPassword=${!!user.password}`);
        }
        
        // Check if user is staff/admin
        const isStaffOrAdmin = user ? ["admin", "employee", "support"].includes(user.role) : false;
        console.log(`[AUTH] Is staff/admin: ${isStaffOrAdmin}`);
        
        // 1. If it's staff/admin, we require strict password check
        if (isStaffOrAdmin) {
          if (!user) {
            console.log(`[AUTH] Admin user not found: ${cleanInput}`);
            return done(null, false, { message: "البيانات المدخلة غير صحيحة" });
          }

          if (!password || password === "undefined" || password === "") {
            return done(null, false, { message: "كلمة المرور مطلوبة لهذا الحساب" });
          }

          if (user.password && user.password !== "") {
            const parts = user.password.split(".");
            if (parts.length === 2) {
              const [hashedPassword, salt] = parts;
              const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
              if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
                return done(null, user);
              }
            } else if (user.password === password) {
              return done(null, user);
            }
            return done(null, false, { message: "كلمة المرور غير صحيحة" });
          }
        }

        // 2. For regular customers - auto-create if doesn't exist
        if (!user) {
          console.log(`[AUTH] Creating auto customer account for: ${cleanInput}`);
          try {
            const newUser = await storage.createUser({
              phone: cleanInput,
              name: cleanInput,
              password: "",
              username: cleanInput,
              email: `${cleanInput}@genmz.com`,
              role: "customer",
              walletBalance: "0",
              addresses: [],
              permissions: []
            });
            console.log(`[AUTH] Success: New customer created and logged in ${cleanInput}`);
            return done(null, newUser);
          } catch (err) {
            console.error(`[AUTH] Failed to create customer:`, err);
            return done(null, false, { message: "فشل إنشاء الحساب" });
          }
        }

        // 3. Existing customer login
        console.log(`[AUTH] Success: Customer login for ${user.phone}`);
        return done(null, user);
      } catch (err) {
        console.error(`[AUTH] Error:`, err);
        return done(err);
      }
    }),
  );

  // Remove the emergency intercept route that was forcing admin login
  // The standard passport.authenticate route in routes.ts will now use the strategy above

  passport.serializeUser((user, done) => {
    const userId = (user as any)._id?.toString() || (user as SelectUser).id;
    done(null, userId);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(null, false);
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
        addresses: [],
        permissions: []
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username) {
        return res.status(400).send("رقم الهاتف مطلوب");
      }

      const cleanInput = (username || "").trim().replace(/\s/g, "");
      
      // Try to find user first
      let user = await UserModel.findOne({ 
        $or: [
          { phone: cleanInput },
          { username: new RegExp(`^${cleanInput}$`, "i") }
        ]
      }).lean();

      // If staff/admin, validate password
      if (user && ["admin", "employee", "support"].includes(user.role)) {
        if (!password) {
          return res.status(401).send("كلمة المرور مطلوبة");
        }
        
        if (user.password && user.password !== "") {
          const parts = user.password.split(".");
          if (parts.length === 2) {
            const [hashedPassword, salt] = parts;
            const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
            if (!timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) {
              return res.status(401).send("كلمة المرور غير صحيحة");
            }
          } else if (user.password !== password) {
            return res.status(401).send("كلمة المرور غير صحيحة");
          }
        }
      } else if (!user) {
        // Auto-create customer account
        // Use phone number as password for customers
        const salt = randomBytes(16).toString("hex");
        const buffer = (await scryptAsync(cleanInput, salt, 64)) as Buffer;
        const hashedPassword = `${buffer.toString("hex")}.${salt}`;
        
        user = await storage.createUser({
          phone: cleanInput,
          name: cleanInput,
          password: hashedPassword,
          username: cleanInput,
          email: `${cleanInput}@genmz.com`,
          role: "customer",
          walletBalance: "0",
          addresses: [],
          permissions: []
        });
      }

      // Login the user (user is guaranteed to exist at this point)
      if (!user) {
        return res.status(500).send("خطأ في النظام");
      }

      const userToLogin = { ...user, id: (user as any)._id?.toString() || (user as any).id };

      req.login(userToLogin as any, (err) => {
        if (err) return next(err);
        const userObj = userToLogin as any;
        res.status(200).json({
          ...userObj,
          redirectTo: ["admin", "employee", "support"].includes(userObj.role) ? "/admin" : "/"
        });
      });
    } catch (err) {
      next(err);
    }
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
