// routes/api.js
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const nodemailer = require('nodemailer');
const rateLimit  = require('express-rate-limit');

// ─── Rate limiter for contact form ────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

// ─── GET /api/projects ────────────────────────────────────
router.get('/projects', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM projects ORDER BY display_order ASC'
    );
    // parse tags string -> array
    const projects = rows.map(p => ({
      ...p,
      tags: p.tags.split(',').map(t => t.trim()),
    }));
    res.json({ success: true, data: projects });
  } catch (err) {
    console.error('GET /projects:', err.message);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ─── GET /api/skills ──────────────────────────────────────
router.get('/skills', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM skills ORDER BY category, id');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /skills:', err.message);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ─── GET /api/stats ───────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM stats');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('GET /stats:', err.message);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// ─── POST /api/contact ────────────────────────────────────
router.post('/contact', contactLimiter, async (req, res) => {
  const { name, email, mood, message } = req.body;

  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (message.length > 2000) {
    return res.status(400).json({ success: false, error: 'Message too long (max 2000 chars).' });
  }

  try {
    // Save to DB
    await db.query(
      'INSERT INTO messages (name, email, mood, message) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), mood || 'chat', message.trim()]
    );

    // Send email notification (optional — only if env vars are set)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `[Portfolio] New message from ${name} — ${mood}`,
        html: `
          <h2>New portfolio message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Vibe:</strong> ${mood}</p>
          <hr/>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      });
    }

    res.json({ success: true, message: 'Message received!' });
  } catch (err) {
    console.error('POST /contact:', err.message);
    res.status(500).json({ success: false, error: 'Could not save message. Please try again.' });
  }
});

// ─── GET /api/messages (admin peek) ─────────────────────
router.get('/messages', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

module.exports = router;
