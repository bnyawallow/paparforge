import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { authRoutes } from "./src/server/authRoutes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Ensure papar directory exists
  const isProd = process.env.NODE_ENV === "production";
  const publicDir = isProd ? path.join(process.cwd(), "dist") : path.join(process.cwd(), "public");
  const paparDir = isProd
    ? path.join(process.cwd(), "papar_data", "papar")
    : path.join(publicDir, "papar");
  
  try {
    await fs.mkdir(paparDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create papar directory:", err);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  
  // Mount auth routes
  app.use("/api/auth", authRoutes);

  // Publish endpoint to write the HTML file directly to the papar directory
  app.post("/api/publish", async (req, res) => {
    try {
      const { id, html } = req.body;
      if (!id || !html) {
        return res.status(400).json({ error: "Missing id or html content" });
      }

      const filePath = path.join(paparDir, `${id}.html`);
      const disabledPath = path.join(paparDir, `${id}.html.disabled`);
      
      // If there was a disabled file, clean it up
      try {
        await fs.unlink(disabledPath);
      } catch {}

      await fs.writeFile(filePath, html, "utf-8");

      res.json({ success: true, url: `/s/${id}` });
    } catch (err) {
      console.error("Publish error:", err);
      res.status(500).json({ error: "Failed to publish file" });
    }
  });

  // Toggle publish status on disk
  app.post("/api/publish/toggle", async (req, res) => {
    try {
      const { id, enabled } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing id" });
      }

      const activePath = path.join(paparDir, `${id}.html`);
      const disabledPath = path.join(paparDir, `${id}.html.disabled`);

      if (enabled) {
        // Toggle ON: Rename from .disabled to .html if .disabled exists
        try {
          await fs.rename(disabledPath, activePath);
        } catch (renameErr) {
          // If .disabled wasn't found, check if active already exists
          try {
            await fs.access(activePath);
          } catch (accessErr) {
            return res.status(404).json({ error: "Published file not found on disk" });
          }
        }
      } else {
        // Toggle OFF: Rename from .html to .disabled if .html exists
        try {
          await fs.rename(activePath, disabledPath);
        } catch (renameErr) {
          // If active file was not found, check if disabled already exists
          try {
            await fs.access(disabledPath);
          } catch (accessErr) {
            return res.status(404).json({ error: "Published file not found on disk" });
          }
        }
      }

      res.json({ success: true, enabled });
    } catch (err) {
      console.error("Toggle publish error:", err);
      res.status(500).json({ error: "Failed to toggle publish status" });
    }
  });

  // Serve papar directory statically BEFORE vite middleware or prod fallback
  app.use("/papar", express.static(paparDir));

  // Support shortlink route /s/:id
  app.get("/s/:id", async (req, res, next) => {
    const id = req.params.id;
    // Skip if it contains a file extension or is a folder
    if (id.includes('.')) {
      return next();
    }
    const filePath = path.join(paparDir, `${id}.html`);
    const disabledPath = path.join(paparDir, `${id}.html.disabled`);
    try {
      await fs.access(filePath);
      res.setHeader("Content-Type", "text/html");
      return res.sendFile(filePath);
    } catch {
      try {
        await fs.access(disabledPath);
        res.setHeader("Content-Type", "text/html");
        return res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Experience Paused - AR Forge</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #0A0A0B;
                  color: #FFFFFF;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  text-align: center;
                }
                .container {
                  max-width: 400px;
                  width: 85%;
                  padding: 40px 24px;
                  background: rgba(255, 255, 255, 0.03);
                  border: 1px solid rgba(255, 255, 255, 0.08);
                  border-radius: 24px;
                  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                }
                .icon {
                  font-size: 48px;
                  margin-bottom: 20px;
                  animation: pulse 2s infinite ease-in-out;
                }
                h1 {
                  font-size: 20px;
                  font-weight: 800;
                  margin: 0 0 10px 0;
                  letter-spacing: -0.02em;
                  color: #fbbf24;
                }
                p {
                  font-size: 13px;
                  line-height: 1.6;
                  color: #A1A1AA;
                  margin: 0 0 24px 0;
                }
                .badge {
                  display: inline-block;
                  padding: 6px 14px;
                  background: rgba(251, 191, 36, 0.1);
                  border: 1px solid rgba(251, 191, 36, 0.2);
                  border-radius: 50px;
                  font-size: 10px;
                  font-weight: bold;
                  color: #fbbf24;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                }
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 0.8; }
                  50% { transform: scale(1.08); opacity: 1; }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="icon">🔒</div>
                <div class="badge" style="margin-bottom: 16px;">Publish Status: Offline</div>
                <h1>Experience Paused</h1>
                <p>The creator has temporarily disabled or paused this WebAR experience. Please check back later or contact the owner.</p>
              </div>
            </body>
          </html>
        `);
      } catch {
        next();
      }
    }
  });

  // Serve raw published html files at /papar/:id (without extension) if they exist
  app.get("/papar/:id", async (req, res, next) => {
    const id = req.params.id;
    // Skip if it contains a file extension or is a folder
    if (id.includes('.')) {
      return next();
    }
    const filePath = path.join(paparDir, `${id}.html`);
    try {
      await fs.access(filePath);
      res.setHeader("Content-Type", "text/html");
      return res.sendFile(filePath);
    } catch {
      next();
    }
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
