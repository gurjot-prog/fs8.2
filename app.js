const express = require('express');
const bodyParser = require('body-parser');
const path = require("path");
const jwt = require('jsonwebtoken'); 
const cors = require('cors'); 

const app = express();

// --- 1. Middleware ---
app.use(bodyParser.json());
app.use(cors()); // Allow browser requests

// --- 2. Configuration & Mock Data ---
const JWT_SECRET = 'your-very-secret-key-12345';
const mockUser = {
  id: 1,
  username: 'testuser',
  password: 'password123'
};

// --- 3. JWT Verification Middleware ---
function verifyToken(req, res, next) {
  // Get the 'Authorization' header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  // Check if token exists
  if (token == null) {
    return res.status(401).json({ message: 'Token missing' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }
    // Token is valid, save user payload to request and continue
    req.user = user;
    next();
  });
}

// --- 4. Original Routes (from your code) ---

app.get('/ping', (req, res) => {
    res.send('pong');
});

// --- 5. New API & Auth Routes ---
// We add the routes directly here (no /api prefix)

/**
 * API LOGIN ROUTE
 * Path: POST /login
 */
app.post('/login', (req, res) => { 
  const { username, password } = req.body;

  if (username === mockUser.username && password === mockUser.password) {
    const userPayload = { id: mockUser.id, username: mockUser.username };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: token }); // This matches your image output
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

/**
 * API PROTECTED ROUTE
 * Path: GET /protected
 */
app.get('/protected', verifyToken, (req, res) => { 
  // This code only runs if verifyToken() calls next()
  res.json({
    message: 'You have accessed a protected route!',
    user: req.user
  });
});

// --- 6. Frontend HTML Route ---
/**
 * ROOT ROUTE
 * Path: GET /
 * Serves the index.html file from the same 'src' folder
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// --- 7. Start Server ---

const port = 3000;
// We add '0.0.0.0' to accept connections from any IP
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Use the ByteXL 'Preview' button for port 3000.`);
});
