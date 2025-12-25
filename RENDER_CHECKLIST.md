# Checklist for Deployment on Render

## 1. Project Configuration
- [x] **Build Script Update**: Added `mongoose` to the `allowlist` in `script/build.ts` to ensure it's bundled correctly for production.
- [x] **Build Command**: Set to `npm run build`.
- [x] **Start Command**: Set to `npm run start`.

## 2. Environment Variables (on Render Dashboard)
- [ ] **MONGODB_URI**: Your MongoDB connection string (e.g., `mongodb+srv://...`).
- [ ] **SESSION_SECRET**: A random string for session encryption.
- [ ] **NODE_ENV**: Set to `production`.
- [ ] **PORT**: Default is `5000` (Render will usually provide this).

## 3. Database
- [ ] Ensure your MongoDB cluster allows connections from Render's IP addresses (or use `0.0.0.0/0` temporarily for testing).

## 4. Troubleshooting
- If you see `sh: tsx: not found`, ensure `devDependencies` are installed during the build phase (Render does this by default if `NODE_ENV` is not set to `production` *during* the build).
- The `dist/index.cjs` file is the entry point for production.
