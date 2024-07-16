const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const { readUsers, writeUsers } = require('./userStorage');

const regd_users = express.Router();
let users = readUsers();

// Function to check if username is valid
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to authenticate user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};



// Endpoint to handle user login and issue JWT token
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, "your_secret_key", { expiresIn: '1h' });
  res.status(200).json({ token });
});

// Endpoint to add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.user; 

  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  // Add or modify review
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    res.status(200).json({ message: "Review modified successfully" });
  } else {
    books[isbn].reviews[username] = review;
    res.status(201).json({ message: "Review added successfully" });
  }
});

// Endpoint to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.user; 

  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if user has a review and delete it
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.status(200).json({ message: "Review deleted successfully" });
  } else {
    res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;