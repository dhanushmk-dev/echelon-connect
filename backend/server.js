import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import db from "./db.js";
import crypto from "crypto";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const qrCodesDir = path.join(__dirname, "qr_codes");
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir);
}
app.use("/qr_codes", express.static(qrCodesDir));

// List of predefined departments
const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];

// Helper: Ensure tables exist automatically on startup using shared database pool
const initDatabase = async () => {
  try {
    // Test database connection through shared pool
    const conn = await db.getConnection();
    conn.release();

    const dbHost = process.env.DB_HOST || "unspecified host";
    const dbName = process.env.DB_NAME || "default database";
    console.log(`[Database] Successfully connected to database '${dbName}' on ${dbHost}.`);

    // Create Students Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        register_number VARCHAR(30) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        accommodation_type ENUM('day_scholar', 'hosteller') NOT NULL,
        hostel_block VARCHAR(20) NULL,
        room_number VARCHAR(20) NULL
      )
    `);

    // Create Staff Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS staff (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        department VARCHAR(50) NULL,
        role ENUM('advisor', 'hod', 'warden') NOT NULL
      )
    `);

    // Create Requests Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        request_type ENUM('leave_request', 'od_request', 'leave_letter', 'leave_outpass_letter') NOT NULL,
        from_datetime DATETIME NOT NULL,
        to_datetime DATETIME NOT NULL,
        out_time TIME NULL,
        in_time TIME NULL,
        reason TEXT NOT NULL,
        department VARCHAR(50) NOT NULL,
        year INT NOT NULL,
        accommodation_type ENUM('day_scholar', 'hosteller') NOT NULL,
        hostel_block VARCHAR(20) NULL,
        room_number VARCHAR(20) NULL,
        advisor_choice VARCHAR(50) NOT NULL,
        status ENUM('pending_advisor', 'pending_hod', 'pending_warden', 'approved', 'rejected') DEFAULT 'pending_advisor',
        hidden_from_student BOOLEAN DEFAULT FALSE,
        hidden_from_advisor BOOLEAN DEFAULT FALSE,
        hidden_from_hod BOOLEAN DEFAULT FALSE,
        hidden_from_warden BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Ensure QR & scanning columns exist safely (additive migrations)
    const addColumn = async (sql) => {
      try {
        await db.query(sql);
      } catch (e) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.error("Column add notice:", e.message);
        }
      }
    };
    await addColumn(`ALTER TABLE requests ADD COLUMN qr_token VARCHAR(255) UNIQUE NULL`);
    await addColumn(`ALTER TABLE requests ADD COLUMN qr_image_path VARCHAR(255) NULL`);
    await addColumn(`ALTER TABLE requests ADD COLUMN qr_expired TINYINT DEFAULT 0`);
    await addColumn(`ALTER TABLE requests ADD COLUMN qr_expired_at DATETIME NULL`);
    await addColumn(`ALTER TABLE requests ADD COLUMN scanned_at DATETIME NULL`);

    console.log(`[Database] Tables and schema migrations verified successfully.`);
  } catch (error) {
    // Never print or leak credentials in error logging
    const safeErrorMsg = error.code ? `[${error.code}] ${error.message}` : error.message;
    console.error(`[Database Connection Error] Failed to connect to MySQL: ${safeErrorMsg}`);
    console.error(`Please verify DB_HOST, DB_PORT, DB_USER, DB_NAME in .env and ensure ca.pem is present in backend/certs/ if SSL is enabled.`);
  }
};

initDatabase();

async function generateQRForRequest(requestId) {
  try {
    const token = crypto.randomBytes(24).toString("hex");
    const baseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const verificationUrl = `${baseUrl}/verify/${token}`;
    
    const qrFileName = `qr_${requestId}_${Date.now()}.png`;
    const qrFilePath = path.join(qrCodesDir, qrFileName);
    
    const pythonCmd = process.env.PYTHON_CMD || "python";
    const scriptPath = path.join(__dirname, "qr", "generate_qr.py");
    
    await new Promise((resolve, reject) => {
      execFile(pythonCmd, [scriptPath, verificationUrl, qrFilePath], (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
    
    const relativeImagePath = `/qr_codes/${qrFileName}`;
    
    await db.query(
      "UPDATE requests SET qr_token = ?, qr_image_path = ? WHERE id = ?",
      [token, relativeImagePath, requestId]
    );
    console.log(`Generated QR for request ${requestId}`);
  } catch (err) {
    console.error("Failed to generate QR code:", err);
  }
}

// -------------------------------------------------------------
// 1. AUTH ENDPOINTS
// -------------------------------------------------------------

// Student Sign Up
app.post("/api/student/signup", async (req, res) => {
  try {
    const { name, register_number, password, department, year, accommodation_type, hostel_block, room_number } = req.body;

    if (!name || !register_number || !password || !department || !year || !accommodation_type) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (accommodation_type === "hosteller" && (!hostel_block || !room_number)) {
      return res.status(400).json({ message: "Hostel block and room number are required for hostellers." });
    }

    const [existing] = await db.query("SELECT id FROM students WHERE register_number = ?", [register_number]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Register number is already registered." });
    }

    const [result] = await db.query(
      `INSERT INTO students (name, register_number, password, department, year, accommodation_type, hostel_block, room_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        register_number,
        password,
        department,
        parseInt(year),
        accommodation_type,
        accommodation_type === "hosteller" ? hostel_block : null,
        accommodation_type === "hosteller" ? room_number : null,
      ]
    );

    const newStudent = {
      id: result.insertId,
      name,
      register_number,
      department,
      year: parseInt(year),
      accommodation_type,
      hostel_block: accommodation_type === "hosteller" ? hostel_block : null,
      room_number: accommodation_type === "hosteller" ? room_number : null,
      user_type: "student",
    };

    res.status(201).json({ message: "Student account created successfully.", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Error registering student: " + error.message });
  }
});

// Student Login
app.post("/api/student/login", async (req, res) => {
  try {
    const { register_number, password } = req.body;

    if (!register_number || !password) {
      return res.status(400).json({ message: "Register number and password are required." });
    }

    const [rows] = await db.query("SELECT * FROM students WHERE register_number = ?", [register_number]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Account not found. Please Create Account / Sign Up." });
    }

    const student = rows[0];

    if (student.password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    delete student.password;
    student.user_type = "student";

    res.json({ message: "Login successful.", user: student });
  } catch (error) {
    res.status(500).json({ message: "Error during login: " + error.message });
  }
});

// Staff Sign Up
app.post("/api/staff/signup", async (req, res) => {
  try {
    const { name, role, department, password } = req.body;

    if (!name || !role || !password) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if ((role === "advisor" || role === "hod") && !department) {
      return res.status(400).json({ message: "Department is required for Advisor and HOD roles." });
    }

    const [result] = await db.query(
      `INSERT INTO staff (name, password, department, role) VALUES (?, ?, ?, ?)`,
      [name, password, role === "warden" ? null : department, role]
    );

    const newStaff = {
      id: result.insertId,
      name,
      role,
      department: role === "warden" ? null : department,
      user_type: "staff",
    };

    res.status(201).json({ message: "Staff account created successfully.", staff: newStaff });
  } catch (error) {
    res.status(500).json({ message: "Error registering staff: " + error.message });
  }
});

// Staff Login
app.post("/api/staff/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required." });
    }

    const [rows] = await db.query("SELECT * FROM staff WHERE name = ?", [name]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Account not found. Please Create Account / Sign Up." });
    }

    const staffMember = rows[0];

    if (staffMember.password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    delete staffMember.password;
    staffMember.user_type = "staff";

    res.json({ message: "Login successful.", user: staffMember });
  } catch (error) {
    res.status(500).json({ message: "Error during staff login: " + error.message });
  }
});

// -------------------------------------------------------------
// 2. DROPDOWN DATA ENDPOINTS
// -------------------------------------------------------------

// Get list of departments
app.get("/api/departments", (req, res) => {
  res.json(DEPARTMENTS);
});

// Get advisors by department & year
app.get("/api/advisors", async (req, res) => {
  try {
    const { department } = req.query;

    let query = "SELECT id, name FROM staff WHERE role = 'advisor'";
    const params = [];

    if (department) {
      query += " AND department = ?";
      params.push(department);
    }

    const [advisors] = await db.query(query, params);
    res.json(advisors);
  } catch (error) {
    res.status(500).json({ message: "Error fetching advisors: " + error.message });
  }
});

// -------------------------------------------------------------
// 3. REQUEST ENDPOINTS
// -------------------------------------------------------------

// Student submits a new request
app.post("/api/requests", async (req, res) => {
  try {
    const {
      student_id,
      request_type,
      from_datetime,
      to_datetime,
      out_time,
      in_time,
      reason,
      department,
      year,
      accommodation_type,
      hostel_block,
      room_number,
      advisor_choice,
    } = req.body;

    if (!student_id || !request_type || !from_datetime || !to_datetime || !reason || !department || !year || !advisor_choice) {
      return res.status(400).json({ message: "Please fill in all required request fields." });
    }

    const [result] = await db.query(
      `INSERT INTO requests 
       (student_id, request_type, from_datetime, to_datetime, out_time, in_time, reason, department, year, accommodation_type, hostel_block, room_number, advisor_choice, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_advisor')`,
      [
        student_id,
        request_type,
        from_datetime,
        to_datetime,
        out_time || null,
        in_time || null,
        reason,
        department,
        year,
        accommodation_type,
        hostel_block || null,
        room_number || null,
        advisor_choice,
      ]
    );

    res.status(201).json({ message: "Request submitted successfully.", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Error submitting request: " + error.message });
  }
});

// Student gets their own requests (excluding hidden_from_student)
app.get("/api/requests/student/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const [requests] = await db.query(
      `SELECT r.*, s.name as student_name, s.register_number
       FROM requests r
       JOIN students s ON r.student_id = s.id
       WHERE r.student_id = ? AND r.hidden_from_student = FALSE
       ORDER BY r.created_at DESC`,
      [studentId]
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student requests: " + error.message });
  }
});

// Advisor gets pending requests in their department
app.get("/api/requests/advisor/:id", async (req, res) => {
  try {
    const advisorId = req.params.id;
    const [staff] = await db.query("SELECT * FROM staff WHERE id = ?", [advisorId]);

    if (staff.length === 0) {
      return res.status(404).json({ message: "Advisor not found." });
    }

    const advisor = staff[0];

    const [requests] = await db.query(
      `SELECT r.*, s.name as student_name, s.register_number
       FROM requests r
       JOIN students s ON r.student_id = s.id
       WHERE r.status = 'pending_advisor'
         AND r.department = ?
         AND (r.advisor_choice = 'all' OR r.advisor_choice = ? OR r.advisor_choice = ?)
         AND r.hidden_from_advisor = FALSE
       ORDER BY r.created_at DESC`,
      [advisor.department, advisor.name, advisorId.toString()]
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching advisor requests: " + error.message });
  }
});

// HOD gets pending requests in their department
app.get("/api/requests/hod/:id", async (req, res) => {
  try {
    const hodId = req.params.id;
    const [staff] = await db.query("SELECT * FROM staff WHERE id = ?", [hodId]);

    if (staff.length === 0) {
      return res.status(404).json({ message: "HOD not found." });
    }

    const hod = staff[0];

    const [requests] = await db.query(
      `SELECT r.*, s.name as student_name, s.register_number
       FROM requests r
       JOIN students s ON r.student_id = s.id
       WHERE r.status = 'pending_hod'
         AND r.department = ?
         AND r.hidden_from_hod = FALSE
       ORDER BY r.created_at DESC`,
      [hod.department]
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching HOD requests: " + error.message });
  }
});

// Warden gets pending requests (all departments, hostellers only)
app.get("/api/requests/warden", async (req, res) => {
  try {
    const [requests] = await db.query(
      `SELECT r.*, s.name as student_name, s.register_number
       FROM requests r
       JOIN students s ON r.student_id = s.id
       WHERE r.status = 'pending_warden'
         AND r.hidden_from_warden = FALSE
       ORDER BY r.created_at DESC`
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching Warden requests: " + error.message });
  }
});

// Advisor decision (Approve -> pending_hod, Reject -> rejected)
app.put("/api/requests/:id/advisor-decision", async (req, res) => {
  try {
    const { decision } = req.body; // 'approve' or 'reject'
    const requestId = req.params.id;

    if (decision === "reject") {
      await db.query("UPDATE requests SET status = 'rejected' WHERE id = ?", [requestId]);
    } else if (decision === "approve") {
      await db.query("UPDATE requests SET status = 'pending_hod' WHERE id = ?", [requestId]);
    } else {
      return res.status(400).json({ message: "Invalid decision value." });
    }

    res.json({ message: `Request ${decision}d by Advisor.` });
  } catch (error) {
    res.status(500).json({ message: "Error updating request: " + error.message });
  }
});

// HOD decision
// If Day Scholar -> approved
// If Hosteller -> pending_warden
app.put("/api/requests/:id/hod-decision", async (req, res) => {
  try {
    const { decision } = req.body;
    const requestId = req.params.id;

    if (decision === "reject") {
      await db.query("UPDATE requests SET status = 'rejected' WHERE id = ?", [requestId]);
    } else if (decision === "approve") {
      // Check if student is Day Scholar or Hosteller
      const [rows] = await db.query("SELECT accommodation_type FROM requests WHERE id = ?", [requestId]);
      if (rows.length === 0) return res.status(404).json({ message: "Request not found." });

      const request = rows[0];
      const nextStatus = request.accommodation_type === "day_scholar" ? "approved" : "pending_warden";

      await db.query("UPDATE requests SET status = ? WHERE id = ?", [nextStatus, requestId]);

      if (nextStatus === "approved") {
        generateQRForRequest(requestId);
      }
    } else {
      return res.status(400).json({ message: "Invalid decision value." });
    }

    res.json({ message: `Request processed by HOD.` });
  } catch (error) {
    res.status(500).json({ message: "Error updating request: " + error.message });
  }
});

// Warden decision (Approve -> approved, Reject -> rejected)
app.put("/api/requests/:id/warden-decision", async (req, res) => {
  try {
    const { decision } = req.body;
    const requestId = req.params.id;

    if (decision === "reject") {
      await db.query("UPDATE requests SET status = 'rejected' WHERE id = ?", [requestId]);
    } else if (decision === "approve") {
      await db.query("UPDATE requests SET status = 'approved' WHERE id = ?", [requestId]);
      generateQRForRequest(requestId);
    } else {
      return res.status(400).json({ message: "Invalid decision value." });
    }

    res.json({ message: `Request processed by Warden.` });
  } catch (error) {
    res.status(500).json({ message: "Error updating request: " + error.message });
  }
});

// Clear button for Student (hides from student only)
app.put("/api/requests/student/:id/clear", async (req, res) => {
  try {
    const studentId = req.params.id;
    await db.query("UPDATE requests SET hidden_from_student = TRUE WHERE student_id = ?", [studentId]);
    res.json({ message: "Student requests cleared from view." });
  } catch (error) {
    res.status(500).json({ message: "Error clearing student requests: " + error.message });
  }
});

// Clear button for Staff (hides from staff member's view only)
app.put("/api/requests/staff/:id/clear", async (req, res) => {
  try {
    const { role, department } = req.body;

    if (role === "advisor") {
      await db.query(
        "UPDATE requests SET hidden_from_advisor = TRUE WHERE status = 'pending_advisor' AND department = ?",
        [department]
      );
    } else if (role === "hod") {
      await db.query(
        "UPDATE requests SET hidden_from_hod = TRUE WHERE status = 'pending_hod' AND department = ?",
        [department]
      );
    } else if (role === "warden") {
      await db.query(
        "UPDATE requests SET hidden_from_warden = TRUE WHERE status = 'pending_warden'"
      );
    }

    res.json({ message: "Requests cleared from dashboard view." });
  } catch (error) {
    res.status(500).json({ message: "Error clearing staff requests: " + error.message });
  }
});

// Clear All button for Staff (Permanently deletes request rows)
app.delete("/api/requests/staff/:id/clear-all", async (req, res) => {
  try {
    const { role, department } = req.body;

    if (role === "advisor") {
      await db.query(
        "DELETE FROM requests WHERE status = 'pending_advisor' AND department = ?",
        [department]
      );
    } else if (role === "hod") {
      await db.query(
        "DELETE FROM requests WHERE status = 'pending_hod' AND department = ?",
        [department]
      );
    } else if (role === "warden") {
      await db.query("DELETE FROM requests WHERE status = 'pending_warden'");
    }

    res.json({ message: "Requests permanently deleted for everyone." });
  } catch (error) {
    res.status(500).json({ message: "Error permanently deleting requests: " + error.message });
  }
});

// -------------------------------------------------------------
// 4. VERIFY ENDPOINTS
// -------------------------------------------------------------

// GET /api/verify/:token
app.get("/api/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const [rows] = await db.query(`
      SELECT r.id, r.qr_expired, r.qr_expired_at, r.to_datetime,
             r.request_type, r.from_datetime, r.out_time, r.in_time,
             s.name, s.register_number, s.year, s.department, s.accommodation_type
      FROM requests r
      JOIN students s ON r.student_id = s.id
      WHERE r.qr_token = ?
    `, [token]);

    if (rows.length === 0) {
      return res.json({ expired: true });
    }

    const request = rows[0];
    const now = new Date();
    // End of the "TO" date (23:59:59)
    const toDate = new Date(request.to_datetime);
    toDate.setHours(23, 59, 59, 999);

    if (request.qr_expired === 1 || now > toDate) {
      return res.json({ expired: true });
    }

    res.json({
      expired: false,
      name: request.name,
      register_number: request.register_number,
      year: request.year,
      department: request.department,
      accommodation_type: request.accommodation_type,
      request_type: request.request_type,
      from_datetime: request.from_datetime,
      to_datetime: request.to_datetime,
      out_time: request.out_time,
      in_time: request.in_time,
    });
  } catch (error) {
    console.error("Verify GET error:", error);
    res.status(500).json({ expired: true });
  }
});

// POST /api/verify/:token/expire
app.post("/api/verify/:token/expire", async (req, res) => {
  try {
    const token = req.params.token;
    // Check if it's currently valid
    const [rows] = await db.query(`
      SELECT id, qr_expired, to_datetime
      FROM requests
      WHERE qr_token = ?
    `, [token]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Not found or already expired" });
    }

    const request = rows[0];
    const now = new Date();
    const toDate = new Date(request.to_datetime);
    toDate.setHours(23, 59, 59, 999);

    if (request.qr_expired === 1 || now > toDate) {
      return res.status(400).json({ message: "Already expired" });
    }

    await db.query(`
      UPDATE requests SET qr_expired = 1, qr_expired_at = NOW(), scanned_at = NOW() WHERE qr_token = ?
    `, [token]);

    const [updated] = await db.query(`SELECT scanned_at FROM requests WHERE qr_token = ?`, [token]);

    res.json({ message: "QR marked as used successfully.", scanned_at: updated[0]?.scanned_at || new Date() });
  } catch (error) {
    console.error("Verify POST error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Echelon Connect Backend running on port ${PORT}`);
});
