import 'zone.js/node';
import { APP_BASE_HREF } from "@angular/common";
import { CommonEngine } from "@angular/ssr";
import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import mysql from "mysql2/promise";
import bootstrap from "./src/main.server";

// ======================
// MySQL Connection Setup
// ======================
let db: any;
(async () => {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root@12345",
      database: "mysqldb",
    });
    console.log("✅ MySQL Connected");
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error);
  }
})();

// ======================
// Express + Angular SSR
// ======================
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, "../browser");
  const indexHtml = join(serverDistFolder, "index.server.html");

  server.use(express.json()); // for JSON body

  const commonEngine = new CommonEngine();
  server.set("view engine", "html");
  server.set("views", browserDistFolder);

  // ================
  // MySQL CRUD APIs
  // ================

  // Create table if not exists
  server.get("/api/init", async (req, res) => {
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE
        )
      `);
      res.json({ message: "✅ Table ready" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Read all users
  server.get("/api/users", async (req, res) => {
    try {
      const [rows] = await db.execute("SELECT * FROM users");
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create new user
  server.post("/api/users", async (req, res) => {
    const { username, email } = req.body;
    try {
      await db.execute("INSERT INTO users (username, email) VALUES (?, ?)", [
        username,
        email,
      ]);
      res.json({ message: "✅ User added" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update user
  server.put("/api/users/:id", async (req, res) => {
    const { username, email } = req.body;
    const { id } = req.params;
    try {
      await db.execute(
        "UPDATE users SET username = ?, email = ? WHERE id = ?",
        [username, email, id]
      );
      res.json({ message: "✅ User updated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete user
  server.delete("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await db.execute("DELETE FROM users WHERE id = ?", [id]);
      res.json({ message: "✅ User deleted" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static files
  server.get("*.*", express.static(browserDistFolder, {
    maxAge: "1y",
  }));

  // Angular SSR handler
  server.get("*", (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

// Start server
function run(): void {
  const port = process.env["PORT"] || 4000;
  const server = app();
  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

run();
