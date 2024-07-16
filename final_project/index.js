const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const axios = require('axios');

const app = express();

app.use(express.json());

// Session middleware setup
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    const authHeader = req.headers.authorization;
  
    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    const token = authHeader.split(' ')[1]; // Extract the token from the header
  
    // Verify token
    try {
      const decoded = jwt.verify(token, 'your_secret_key'); // Replace 'your_secret_key' with your actual JWT secret
      req.user = decoded.username; // Add username to request object for further use
      next();
    } catch (error) {
      return res.status(403).json({ message: "Token expired or invalid" });
    }
  });

// Route setup
const PORT = 5000;
app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Start server
app.listen(PORT, () => console.log("Server is running"));

