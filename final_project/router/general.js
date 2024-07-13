const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const bodyParser = require('body-parser');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'your_default_jwt_secret_key';

let reviews = {};

// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());

// Session middleware setup
app.use(session({
    secret: 'fingerprint_customer', // Session secret for /customer routes
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));

// JWT token verification middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization || req.session.token; // Check header or session

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: "Invalid token." });
        } else {
            req.user = decoded;
            next();
        }
    });
};

// Route for adding/modifying a review
app.post('/auth/review/:isbn', verifyToken, (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username; // Extract username from decoded token

    {

        if (!reviews[isbn]) {
            reviews[isbn] = {};
        }

    }

    

    if (reviews[isbn][username]) {
        reviews[isbn][username].review = review;
        res.json({ message: `Review modified for ISBN ${isbn}` });
    } else {
        const reviewId = uuidv4();
        reviews[isbn][username] = { reviewId, review };
        res.json({ message: `Review added for ISBN ${isbn}` });
    }
});

// Route to retrieve all reviews for a given ISBN
app.get('/reviews/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (!reviews[isbn]) {
        return res.status(404).json({ error: 'No reviews found for this ISBN' });
    }

    const reviewsList = Object.values(reviews[isbn]); // Get array of reviews
    res.json({ reviews: reviewsList });
});

// Routes
app.use("/customer", customer_routes); // Mounted under /customer
app.use("/", genl_routes); // General routes
A
// Default route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Start server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
