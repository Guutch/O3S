const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');

const SECRET = 'your_static_secret_key'; // Placeholder for proof of concept

// @route   POST /api/users/register
// @desc    Register a new user with an email and secret key
router.post('/register', async (req, res) => {
    const { email, name, role, secret_key } = req.body;

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = await User.create({ email, name, role, secret_key });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        console.error('Registration Error:', err);  // Add this line
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// @route   GET /api/users
// @desc    Test route to confirm users API is working
router.get('/', (req, res) => {
    res.json({ message: "✅ Users API is working" });
});



// @route   POST /api/users/login
// @desc    Authenticate user with secret key
router.post('/login', async (req, res) => {
    const { email, secret_key } = req.body;

    try {
        const user = await User.findOne({ where: { email, secret_key } });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', token });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log in' });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate user with secret key
router.post('/validate-key', async (req, res) => {
    const { key } = req.body;

    if (!key) {
        return res.status(400).json({ valid: false, error: "Missing secret key" });
    }

    try {
        const user = await User.findOne({ where: { secret_key: key } });

        if (user) {
            return res.status(200).json({ valid: true, user });
        } else {
            return res.status(401).json({ valid: false, error: "Invalid secret key" });
        }
    } catch (err) {
        console.error("Error validating key:", err);
        return res.status(500).json({ valid: false, error: "Server error" });
    }
});

// @route   GET /api/users/me
// @desc    Get user data from token (protected route)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
