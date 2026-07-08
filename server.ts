import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Ensure papar directory exists
  const isProd = process.env.NODE_ENV === "production";
  const publicDir = isProd ? path.join(process.cwd(), "dist") : path.join(process.cwd(), "public");
  const paparDir = path.join(publicDir, "papar");
  
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
