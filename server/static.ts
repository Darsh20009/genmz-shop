import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

export function serveStatic(app: Express) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Enable Gzip compression
  app.use(compression());

  // ✅ Fix white screen after deploy:
  // - Never cache HTML (index.html)
  // - Cache hashed assets for long time (Vite /assets/*)
  const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");

        if (normalized.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return;
        }

        if (normalized.includes("/assets/")) {
          res.setHeader(
            "Cache-Control",
            `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          );
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      },
    }),
  );

  app.use("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
