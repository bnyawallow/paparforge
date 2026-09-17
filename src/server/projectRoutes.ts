import express from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

// Authentication middleware
const requireAuth = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || (!decoded.id && !decoded.username)) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // Verify user in SQLite database
    let user = decoded.id ? db.prepare('SELECT id, username, role, is_active FROM users WHERE id = ?').get(decoded.id) as any : null;

    // Self-healing fallback: if ID not found, but username exists in token, match by username
    if (!user && decoded.username) {
      user = db.prepare('SELECT id, username, role, is_active FROM users WHERE username = ?').get(decoded.username) as any;
    }

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account does not exist' });
    }

    if (user.is_active === 0) {
      return res.status(403).json({ error: 'Account is pending admin approval' });
    }

    req.user = {
      ...decoded,
      id: user.id,
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// 1. GET ALL PROJECTS for the authenticated user
router.get('/', requireAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const stmt = db.prepare('SELECT id, name, created_at, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC');
    const projects = stmt.all(userId);
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET SINGLE PROJECT BY ID (Authenticated)
router.get('/:id', requireAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
    const project = stmt.get(projectId) as any;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id && project.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    // Parse the JSON data
    let parsedData = project.data;
    try {
      parsedData = JSON.parse(project.data);
    } catch {}

    res.json({
      id: project.id,
      name: project.name,
      data: parsedData,
      created_at: project.created_at,
      updated_at: project.updated_at
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2b. GET PUBLIC / VIEW PROJECT BY ID (Public endpoint for mobile QR scan AR testing)
router.get('/view/:id', (req: any, res) => {
  try {
    const projectId = req.params.id;

    const stmt = db.prepare('SELECT id, name, data, created_at, updated_at FROM projects WHERE id = ?');
    const project = stmt.get(projectId) as any;

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    let parsedData = project.data;
    try {
      parsedData = JSON.parse(project.data);
    } catch {}

    res.json({
      id: project.id,
      name: project.name,
      data: parsedData,
      created_at: project.created_at,
      updated_at: project.updated_at
    });
  } catch (error) {
    console.error('Error fetching public project for view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/projects - UPSERT PROJECT
router.post('/', requireAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id, name, data } = req.body;

    if (!id || !name || !data) {
      return res.status(400).json({ error: 'id, name, and data are required' });
    }

    // Explicit check to confirm user exists in SQLite before running foreign key statement
    const userExists = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
    if (!userExists) {
      return res.status(401).json({ error: 'Unauthorized: User does not exist in database' });
    }

    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    const now = new Date().toISOString();

    // Check if project already exists
    const checkStmt = db.prepare('SELECT user_id FROM projects WHERE id = ?');
    const existing = checkStmt.get(id) as any;

    if (existing) {
      // Ensure the project belongs to the logged-in user or allow claiming if unassigned
      if (existing.user_id && existing.user_id !== userId) {
        return res.status(403).json({ error: 'Forbidden: You do not own this project' });
      }

      // Update project
      const updateStmt = db.prepare(`
        UPDATE projects 
        SET name = ?, data = ?, user_id = ?, updated_at = ? 
        WHERE id = ?
      `);
      updateStmt.run(name, dataStr, userId, now, id);
    } else {
      // Insert new project
      const insertStmt = db.prepare(`
        INSERT INTO projects (id, user_id, name, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(id, userId, name, dataStr, now, now);
    }

    res.json({ success: true, message: 'Project saved successfully' });
  } catch (error: any) {
    console.error('Error saving project:', error);
    if (error?.message?.includes('FOREIGN KEY constraint failed') || error?.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(401).json({ error: 'Unauthorized: User account does not exist in database' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. DELETE PROJECT
router.delete('/:id', requireAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const checkStmt = db.prepare('SELECT user_id FROM projects WHERE id = ?');
    const existing = checkStmt.get(projectId) as any;

    if (!existing) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this project' });
    }

    const deleteStmt = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?');
    deleteStmt.run(projectId, userId);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as projectRoutes };
