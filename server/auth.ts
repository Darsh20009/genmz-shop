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
      secure: false, // Set to false to prevent cookie issues on non-https local/dev environments
      path: '/' 
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
        let cleanInput = (username || "").trim().replace(/\s/g, "").replace(/\+/g, "");
        
        // Handle 966 prefix
        if (cleanInput.startsWith("966")) {
          cleanInput = cleanInput.substring(3);
        }
        // Handle leading zero
        if (cleanInput.startsWith("0")) {
          cleanInput = cleanInput.substring(1);
        }
        
        console.log(`[AUTH] Login attempt for cleaned input: "${cleanInput}"`);
        
        // Find user by phone, username, or name (case-insensitive)
        const searchRegex = new RegExp(`^${cleanInput}$`, "i");
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
          console.log(`[AUTH] User details: ID=${user.id}, Username=${user.username}, Role=${user.role}, HasPassword=${!!user.password}, IsActive=${(user as any).isActive}`);
        }

        if (user && (user as any).isActive === false) {
          return done(null, false, { message: "هذا الحساب معطل حالياً" });
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

        // 2. For regular customers
        if (!user) {
          console.log(`[AUTH] User not found: ${cleanInput}`);
          return done(null, false, { message: "الحساب غير موجود، يرجى إنشاء حساب جديد" });
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
        permissions: [],
        loginType: "dashboard",
        isActive: true
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

      let cleanInput = (username || "").trim().replace(/\s/g, "").replace(/\+/g, "");
      
      // Handle 966 prefix
      if (cleanInput.startsWith("966")) {
        cleanInput = cleanInput.substring(3);
      }
      // Handle leading zero
      if (cleanInput.startsWith("0")) {
        cleanInput = cleanInput.substring(1);
      }
      
      console.log(`[AUTH] Final clean input for login: "${cleanInput}"`);

      // Try to find user first
      let user = await UserModel.findOne({ 
        $or: [
          { phone: cleanInput },
          { username: new RegExp(`^${cleanInput}$`, "i") }
        ]
      }).lean();

      console.log(`[AUTH] User found: ${user ? 'Yes' : 'No'} (${user?.role})`);

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
        return res.status(401).send("الحساب غير موجود، يرجى إنشاء حساب جديد");
      }

      // Login the user (user is guaranteed to exist at this point)
      if (!user) {
        return res.status(500).send("خطأ في النظام");
      }

      const userToLogin = { 
        ...user, 
        id: (user as any)._id?.toString() || (user as any).id,
        __v: (user as any).__v
      };

      req.login(userToLogin as any, (err) => {
        if (err) return next(err);
        const userObj = userToLogin as any;
        
        // Check login type access and role
        const isDashboardAccess = ["dashboard", "both"].includes(userObj.loginType);
        const isPosAccess = ["pos", "both"].includes(userObj.loginType);
        
        let redirectTo = "/";
        if (["admin", "employee", "support"].includes(userObj.role)) {
          if (isDashboardAccess) {
            redirectTo = "/admin";
          } else if (isPosAccess) {
            redirectTo = "/pos";
          } else {
            // No valid login type for this role
            req.logout(() => {});
            return res.status(403).json({ message: "هذا الحساب لا يملك صلاحية الدخول للوحة التحكم أو نظام البيع" });
          }
        }

        res.status(200).json({
          ...userObj,
          redirectTo
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
