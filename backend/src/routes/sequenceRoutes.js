const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Sequence = require('../models/Sequence');
const Campaign = require('../models/Campaign'); // ✅ FIX: Import Campaign model

const SECRET = 'your_static_secret_key';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// @route   GET /api/sequences
// @desc    Get all sequences for campaigns owned by the user
router.get('/', authenticate, async (req, res) => {
    try {
        console.log("GET /api/sequences - Request received");
        console.log("Fetching sequences for user:", req.user.id);

        // ✅ FIX: Ensure we filter sequences based on the campaigns owned by the user
        const campaigns = await Campaign.findAll({ where: { user_id: req.user.id } });
        const campaignIds = campaigns.map(c => c.id); // Extract IDs of campaigns the user owns

        const sequences = await Sequence.findAll({ where: { campaign_id: campaignIds } });

        res.json(sequences);
    } catch (err) {
        console.error("Error fetching sequences:", err);
        res.status(500).json({ error: 'Failed to fetch sequences', details: err.message });
    }
});

// @route   POST /api/sequences
// @desc    Create a new sequence for a campaign owned by the user
router.post('/', authenticate, async (req, res) => {
    const { campaign_id, step_order, subject, body, delay_days, variation_label, like_before_dm, comment_before_dm, follow_before_dm, comment_text } = req.body;

    try {
        console.log("Creating sequence with data:", req.body);
        console.log("Authenticated User ID:", req.user.id);

        // Ensure user owns the campaign before adding a sequence
        const campaign = await Campaign.findOne({ where: { id: campaign_id, user_id: req.user.id } });
        if (!campaign) {
            return res.status(403).json({ error: 'You do not own this campaign' });
        }

        const newSequence = await Sequence.create({
            campaign_id,
            step_order,
            subject,
            body,
            delay_days,
            variation_label,
            like_before_dm,
            comment_before_dm,
            follow_before_dm,
            comment_text,
        });

        res.status(201).json(newSequence);
    } catch (err) {
        console.error("Error creating sequence:", err);
        res.status(500).json({ error: 'Failed to create sequence', details: err.message });
    }
});

// @route   GET /api/sequences/:id
// @desc    Get a single sequence by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const sequence = await Sequence.findByPk(req.params.id);
        if (!sequence) return res.status(404).json({ error: 'Sequence not found' });

        res.json(sequence);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sequence' });
    }
});

// @route   PUT /api/sequences/:id
// @desc    Update a sequence by ID
router.put('/:id', authenticate, async (req, res) => {
    try {
        const sequence = await Sequence.findByPk(req.params.id);
        if (!sequence) return res.status(404).json({ error: 'Sequence not found' });

        await sequence.update(req.body);
        res.json(sequence);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update sequence' });
    }
});

// @route   DELETE /api/sequences/:id
// @desc    Delete a sequence by ID
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const sequence = await Sequence.findByPk(req.params.id);
        if (!sequence) return res.status(404).json({ error: 'Sequence not found' });

        await sequence.destroy();
        res.json({ message: 'Sequence deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete sequence' });
    }
});

module.exports = router;
