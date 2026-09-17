import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isProd = process.env.NODE_ENV === "production";
const dbDir = isProd ? path.join(process.cwd(), 'papar_data') : process.cwd();

// Ensure db directory exists before initializing database
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'users.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
`);

// Create default admin if not exists
const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?');
const adminExists = checkAdmin.get('jatelo');

if (!adminExists) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, email, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const adminId = '7b5e7048-706f-43d7-a05e-054b52815b36';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('TRIDent2017!@#', salt);
  
  insertUser.run(adminId, 'jatelo', hash, 'admin@example.com', 'admin', 1);
  console.log('Default admin account created (jatelo).');
}

export { db };
