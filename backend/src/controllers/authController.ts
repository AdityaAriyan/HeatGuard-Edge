import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryRow, queryRows, runQuery } from '../database/db';
import { JWT_SECRET, AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, full_name, role = 'WORKER', phone } = req.body;
    if (!email || !password || !full_name) {
      res.status(400).json({ error: 'Email, password, and full name are required' });
      return;
    }

    const existing = await queryRow('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const userId = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await runQuery(
      `INSERT INTO users (id, email, password_hash, full_name, role, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, full_name, role, phone || null]
    );

    await runQuery(
      `INSERT INTO user_profiles (id, user_id, age, gender, occupation, work_environment, emergency_contact_name, emergency_contact_phone, blood_group)
       VALUES (?, ?, 30, 'Unspecified', 'Worker', 'Outdoor', 'Emergency Contact', '112', 'O+')`,
      [uuidv4(), userId]
    );

    await runQuery(
      `INSERT INTO baselines (id, user_id, baseline_heart_rate, baseline_spo2, baseline_skin_temp, baseline_systolic, baseline_diastolic, typical_sleep_minutes)
       VALUES (?, ?, 72, 98.0, 36.4, 120, 80, 450)`,
      [uuidv4(), userId]
    );

    await runQuery(
      `INSERT INTO privacy_settings (id, user_id, local_edge_ai_only, cloud_health_sync, location_sharing, caregiver_access, emergency_location_broadcast)
       VALUES (?, ?, 0, 1, 1, 1, 1)`,
      [uuidv4(), userId]
    );

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), full_name, role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email: email.toLowerCase(), full_name, role, phone },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await queryRow<{
      id: string;
      email: string;
      password_hash: string;
      full_name: string;
      role: 'WORKER' | 'USER' | 'CAREGIVER' | 'ADMIN';
      phone: string;
    }>('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await queryRow('SELECT id, email, full_name, role, phone, created_at FROM users WHERE id = ?', [
      req.user.id,
    ]);
    const profile = await queryRow('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.id]);
    const baseline = await queryRow('SELECT * FROM baselines WHERE user_id = ?', [req.user.id]);
    const privacy = await queryRow('SELECT * FROM privacy_settings WHERE user_id = ?', [req.user.id]);
    const device = await queryRow('SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [
      req.user.id,
    ]);

    res.json({
      user,
      profile,
      baseline,
      privacy,
      device,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
}

export async function listDemoUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await queryRows(
      `SELECT u.id, u.email, u.full_name, u.role, u.phone,
              p.occupation, p.age, p.work_environment,
              (SELECT overall_score FROM risk_assessments WHERE user_id = u.id ORDER BY timestamp DESC LIMIT 1) as latest_risk_score,
              (SELECT overall_level FROM risk_assessments WHERE user_id = u.id ORDER BY timestamp DESC LIMIT 1) as latest_risk_level
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       ORDER BY u.role DESC, latest_risk_score DESC`
    );
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list demo accounts', details: err.message });
  }
}
