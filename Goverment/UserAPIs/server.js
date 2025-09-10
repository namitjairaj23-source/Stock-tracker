const express = require('express');
// Express framework import karte hain (server banane ke liye)

const cors = require('cors');
// CORS middleware import karte hain (cross-origin requests allow karne ke liye)

const mysql = require('mysql2/promise');
// MySQL2 library (promise support ke sath) import karte hain (DB connection ke liye)

const bcrypt = require('bcrypt');
// bcrypt password hashing aur comparison ke liye use hota hai (secure password storage)

const jwt = require('jsonwebtoken');

const app = express();


app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// \ CORS setup → browser se aane wali requests ko allow karta hai (credentials, headers included)

app.use(express.json());
const PORT = 3000;
const JWT_SECRET = "mysecretkey";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root@12345",
  database: "mysqldb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ======================
// Middleware: Auth
// ======================
const authenticate = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.headers['authorization']?.split(" ")[1];
      // Authorization header se JWT token extract karte hain ("Bearer <token>")

      if (!token) return res.status(401).json({ message: "No token provided" });
      // If Token is Missing

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        // verify Token

        if (err) return res.status(403).json({ message: "Invalid token" });
        // If YOur Token is Exprired and Invalid then show error

        req.user = decoded;
        // Decoded token (id, role) ko request me attach kar dete hain

        if (roles.length && !roles.includes(decoded.role)) {
          // Agar roles restricted hain aur current user ka role allowed nahi hai
          return res.status(403).json({ message: "Access denied" });
        }

        next();
        // Agar sab ok hai → request ko next middleware/route pe bhej do
      });
    } catch (err) {
      res.status(500).json({ message: "Auth failed" });
      //  Agar unexpected error aata hai → 500 return karo
    }
  };
};


// ======================
// API Routes
// ======================


// -------- REGISTER --------
app.post('/register', async (req, res) => {
  const { fullName, email, password, role } = req.body;


  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);


    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
      //  If Email is already exist so show error
    }

    await pool.query(
      'INSERT INTO users (fullName, email, password, role, isActive, isDeleted, created_at) VALUES (?, ?, ?, ?, 1, 0, NOW())',
      [fullName, email, hashedPassword, role]
    );
    //  Naya user DB me insert karte hain (default active, not deleted)

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error("Registration error:", err.message, err.stack);


    res.status(500).json({ message: 'Server error', error: err.message });

  }
});


// -------- LOGIN --------
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
 
  console.log('Login payload:', req.body); 

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
   
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
      
    }

    const user = users[0];
    console.log('User from DB:', user); 

    const isMatch = await bcrypt.compare(password, user.password);
    

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
     
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT:', token);

    res.json({ token, role: user.role });
  
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// -------- GET ALL USERS --------
app.get('/users', authenticate(['admin', 'user']), async (req, res) => {
  // 🔹 Ye route sirf admin aur user dono ke liye accessible hai

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE isDeleted=0");
    // 🔹 DB se saare non-deleted users fetch karte hain

    res.json(rows);
    // 🔹 Response bhejte hain
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});


// -------- ADD USER --------
app.post('/users', authenticate(['admin', 'user']), async (req, res) => {
  // 🔹 Sirf admin aur user dono add kar sakte hain

  try {
    const { fullName, email, state, district, date, shareName, qty, rate, amount, authorizedPerson } = req.body;
    // 🔹 Request body se details lete hain

    await pool.query(
      `INSERT INTO users (fullName, email, state, district, date, shareName, qty, rate, amount, authorizedPerson, isActive, isDeleted, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())`,
      [fullName, email, state, district, date, shareName, qty, rate, amount, authorizedPerson]
    );
    // 🔹 User ko DB me insert karte hain

    res.json({ message: "User added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add user" });
  }
});


// -------- EDIT USER --------
app.put('/users/:id', authenticate(['admin']), async (req, res) => {
  // 🔹 Sirf admin user update kar sakta hai

  const { id } = req.params;
  // 🔹 URL params se user id

  const { fullName, email, state, district, date, shareName, qty, rate, amount, authorizedPerson } = req.body;
  // 🔹 Request body se update fields

  await pool.query(
    `UPDATE users SET fullName=?, email=?, state=?, district=?, date=?, shareName=?, qty=?, rate=?, amount=?, authorizedPerson=? WHERE id=?`,
    [fullName, email, state, district, date, shareName, qty, rate, amount, authorizedPerson, id]
  );
  // 🔹 User record update karte hain

  res.json({ message: "User updated successfully" });
});


// -------- DELETE USER --------
app.delete('/users/:id', authenticate(['admin']), async (req, res) => {
  // 🔹 Sirf admin delete kar sakta hai

  const { id } = req.params;
  // 🔹 URL params se user id

  try {
    await pool.query(`DELETE FROM users WHERE id=?`, [id]);
    // 🔹 User ko DB se permanently delete karte hain

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


// ======================
// Start Server
// ======================
app.listen(PORT, (err) => {
  if (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // 🔹 Server start hone ke baad console me message print hota hai
});
