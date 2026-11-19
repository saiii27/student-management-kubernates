const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

let isDbReady = false;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health endpoint for Liveness Probe
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Readiness endpoint for Kubernetes Readiness Probe
app.get('/api/ready', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return res.status(200).json({
      status: 'READY',
      database: 'CONNECTED'
    });
  } catch (error) {
    return res.status(503).json({
      status: 'NOT_READY',
      database: 'DISCONNECTED',
      error: error.message
    });
  }
});

// GET all students (with optional search query)
app.get('/api/students', async (req, res) => {
  const { search } = req.query;
  try {
    let sql = 'SELECT * FROM students';
    const params = [];

    if (search && search.trim() !== '') {
      sql += ' WHERE name LIKE ? OR usn LIKE ?';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY id DESC';

    const [rows] = await pool.query(sql, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('[Error] GET /api/students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve students from database',
      error: error.message
    });
  }
});

// GET student by ID
app.get('/api/students/:id', async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID parameter' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [studentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error(`[Error] GET /api/students/${studentId}:`, error);
    res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
});

// POST create new student
app.post('/api/students', async (req, res) => {
  const { name, usn, branch, semester, email } = req.body;

  // Validation
  if (!name || !usn || !branch || !semester || !email) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: name, usn, branch, semester, email'
    });
  }

  const semInt = parseInt(semester, 10);
  if (isNaN(semInt) || semInt < 1 || semInt > 8) {
    return res.status(400).json({
      success: false,
      message: 'Semester must be an integer between 1 and 8'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address format'
    });
  }

  try {
    const sql = 'INSERT INTO students (name, usn, branch, semester, email) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(sql, [name.trim(), usn.trim().toUpperCase(), branch.trim(), semInt, email.trim().toLowerCase()]);

    const newStudent = {
      id: result.insertId,
      name: name.trim(),
      usn: usn.trim().toUpperCase(),
      branch: branch.trim(),
      semester: semInt,
      email: email.trim().toLowerCase()
    };

    console.log(`[Student Created] ID: ${newStudent.id}, USN: ${newStudent.usn}`);
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: newStudent
    });
  } catch (error) {
    // Handle duplicate USN error (MySQL ER_DUP_ENTRY: 1062)
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: `Student with USN '${usn.trim().toUpperCase()}' already exists. USN must be unique.`
      });
    }

    console.error('[Error] POST /api/students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create student record in database',
      error: error.message
    });
  }
});

// PUT update existing student
app.put('/api/students/:id', async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID parameter' });
  }

  const { name, usn, branch, semester, email } = req.body;
  if (!name || !usn || !branch || !semester || !email) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required: name, usn, branch, semester, email'
    });
  }

  const semInt = parseInt(semester, 10);
  if (isNaN(semInt) || semInt < 1 || semInt > 8) {
    return res.status(400).json({
      success: false,
      message: 'Semester must be an integer between 1 and 8'
    });
  }

  try {
    // Check if student exists
    const [existing] = await pool.query('SELECT id FROM students WHERE id = ?', [studentId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }

    const sql = 'UPDATE students SET name = ?, usn = ?, branch = ?, semester = ?, email = ? WHERE id = ?';
    await pool.query(sql, [name.trim(), usn.trim().toUpperCase(), branch.trim(), semInt, email.trim().toLowerCase(), studentId]);

    console.log(`[Student Updated] ID: ${studentId}`);
    res.json({
      success: true,
      message: 'Student record updated successfully',
      data: {
        id: studentId,
        name: name.trim(),
        usn: usn.trim().toUpperCase(),
        branch: branch.trim(),
        semester: semInt,
        email: email.trim().toLowerCase()
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
      return res.status(409).json({
        success: false,
        message: `Another student is already using USN '${usn.trim().toUpperCase()}'.`
      });
    }

    console.error(`[Error] PUT /api/students/${studentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student record',
      error: error.message
    });
  }
});

// DELETE student record
app.delete('/api/students/:id', async (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  if (isNaN(studentId)) {
    return res.status(400).json({ success: false, message: 'Invalid student ID parameter' });
  }

  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [studentId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `Student with ID ${studentId} not found` });
    }

    console.log(`[Student Deleted] ID: ${studentId}`);
    res.json({
      success: true,
      message: `Student with ID ${studentId} deleted successfully`
    });
  } catch (error) {
    console.error(`[Error] DELETE /api/students/${studentId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete student record',
      error: error.message
    });
  }
});

// Start Express server
const server = app.listen(PORT, async () => {
  console.log(`[Backend Server] Student API running on port ${PORT}`);
  console.log(`[Backend Server] Hostname: ${process.env.HOSTNAME || 'localhost'}`);
  // Test and initialize DB connection
  isDbReady = await testConnection();
});

// Graceful shutdown handling
const handleShutdown = async (signal) => {
  console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[Shutdown] Closed active HTTP listeners.');
    try {
      await pool.end();
      console.log('[Shutdown] Closed MySQL connection pool.');
      process.exit(0);
    } catch (err) {
      console.error('[Shutdown Error] Error closing MySQL pool:', err);
      process.exit(1);
    }
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('[Shutdown] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
