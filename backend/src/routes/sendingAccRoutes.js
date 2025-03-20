const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const SendingAccount = require('../models/SendingAccs');
const User = require('../models/User');

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ error: 'Invalid token' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/sending-accounts
// @desc    Get all sending accounts for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const accounts = await SendingAccount.findAll({ where: { user_id: req.user.id } });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sending accounts' });
    }
});

// @route   POST /api/sending-accounts
// @desc    Create a new sending account
router.post('/', authenticate, async (req, res) => {
    const { platform, account_identifier, access_token, is_active } = req.body;

    try {
        console.log("Creating sending account with data:", req.body);
        console.log("Authenticated User ID:", req.user.id);

        const newAccount = await SendingAccount.create({
            user_id: req.user.id,
            platform,
            account_identifier,
            access_token,
            is_active
        });

        console.log("New sending account created:", newAccount);
        res.status(201).json(newAccount);
    } catch (err) {
        console.error("Error creating sending account:", err);
        res.status(500).json({ error: 'Failed to create sending account', details: err.message });
    }
});

// @route   GET /api/sending-accounts/:id
// @desc    Get a single sending account by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const account = await SendingAccount.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!account) return res.status(404).json({ error: 'Sending account not found' });
        res.json(account);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sending account' });
    }
});

// @route   PUT /api/sending-accounts/:id
// @desc    Update a sending account by ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const account = await SendingAccount.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!account) return res.status(404).json({ error: 'Sending account not found' });

        await account.update(req.body);
        res.json(account);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update sending account' });
    }
});

// @route   DELETE /api/sending-accounts/:id
// @desc    Delete a sending account by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const account = await SendingAccount.findOne({ where: { id: req.params.id, user_id: req.user.id } });
        if (!account) return res.status(404).json({ error: 'Sending account not found' });

        await account.destroy();
        res.json({ message: 'Sending account deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete sending account' });
    }
});

module.exports = router;
