import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'users.db');
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
`);

// Create default admin if not exists
const checkAdmin = db.prepare('SELECT id FROM users WHERE username = ?');
const adminExists = checkAdmin.get('jatelo');

if (!adminExists) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, email, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const adminId = crypto.randomUUID();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync('TRIDent2017!@#', salt);
  
  insertUser.run(adminId, 'jatelo', hash, 'admin@example.com', 'admin', 1);
  console.log('Default admin account created (jatelo).');
}

export { db };
