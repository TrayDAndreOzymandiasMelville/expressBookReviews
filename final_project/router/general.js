const express = require('express');
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();
const axios = require('axios');
const { readUsers, writeUsers } = require('./userStorage');

// Route to register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  // Add new user 
  users.push({ username, password });
  writeUsers(users);
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  try {
    res.status(200).json(books); 
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  try {
    res.status(200).json(books[isbn]);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;
  const booksByAuthor = [];
  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    }
  }
  try {
    if (booksByAuthor.length === 0) {
      res.status(404).json({ message: "No books found for this author" });
    } else {
      res.status(200).json(booksByAuthor);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;
  const booksByTitle = [];
  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
        booksByTitle.push(books[isbn]);
      }
    }
  }
  try {
    if (booksByTitle.length === 0) {
      res.status(404).json({ message: "No books found for this title" });
    } else {
      res.status(200).json(booksByTitle);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  if (!isbn || !books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  try {
    const reviews = books[isbn].reviews || {};
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports.general = public_users;