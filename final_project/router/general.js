const express = require('express');
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();
const axios = require('axios');
const { readUsers, writeUsers } = require('./userStorage');

// Helper function to fetch data from the external server
const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching data from');
  }
};

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

// Get the book list available in the shop using async await
public_users.get('/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error'});
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

// Get book reviews based on ISBN using async-await
public_users.get('/async/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await fetch('http://localhost:5000/books');
    const data = await response.json();
    const book = data.find(book => book.isbn === isbn);
    if(book){
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
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

// Get book details based on author using Async
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const data = await fetchData('http://localhost:5000/');
    const booksByAuthor = Object.values(data).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
    } else {
      res.status(404).json({ message: 'No books found by this author' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Get all books based on title using promises
public_users.get('/promises/title/:title', function (req, res) {
  const title = req.params.title;
  fetchData('http://localhost:5000/')
    .then(data => {
      const booksByTitle = Object.values(data).filter(book => book.title === title);
      if (booksByTitle.length > 0) {
        res.json(booksByTitle);
      } else {
        res.status(404).json({ message: 'No books found with this title' });
      }
    })
    .catch(error => res.status(500).json({ message: error.message }));
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