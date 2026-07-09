import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  const HOST = process.env.HOST || "0.0.0.0";

  app.use(express.json({ limit: "50mb" }));

  // Ensure papar directory exists
  const isProd = process.env.NODE_ENV === "production";
  // Decouple user-published files from built assets for easy volume mounting & persistence in Docker
  const paparDir = process.env.PAPAR_DIR || path.join(process.cwd(), "papar_data");
  
  try {
    await fs.mkdir(paparDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create papar directory:", err);
  }

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Publish endpoint to write the HTML file directly to the papar directory
  app.post("/api/publish", async (req, res) => {
    try {
      const { id, html } = req.body;
      if (!id || !html) {
        return res.status(400).json({ error: "Missing id or html content" });
      }

      const filePath = path.join(paparDir, `${id}.html`);
      await fs.writeFile(filePath, html, "utf-8");

      res.json({ success: true, url: `/papar/${id}.html` });
    } catch (err) {
      console.error("Publish error:", err);
      res.status(500).json({ error: "Failed to publish file" });
    }
  });

  // Serve papar directory statically BEFORE vite middleware or prod fallback
  app.use("/papar", express.static(paparDir));

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

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
