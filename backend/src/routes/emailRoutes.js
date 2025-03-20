// const express = require('express');
// const { sendEmail } = require('../services/googleService');
// const router = express.Router();
// // const { authenticate } = require('../middleware/authMiddleware'); // Ensure this exists

// // @route   POST /api/email/send
// // @desc    Send an email using the Gmail API
// // router.post('/send', authenticate, async (req, res) => {
// router.post('/send', async (req, res) => {
//     const { userEmail, recipientEmail, subject, body } = req.body;

//     if (!userEmail || !recipientEmail || !subject || !body) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }

//     try {
//         const response = await sendEmail(userEmail, recipientEmail, subject, body);
//         if (response.success) {
//             return res.status(200).json(response);
//         } else {
//             return res.status(500).json(response);
//         }
//     } catch (error) {
//         return res.status(500).json({ error: 'Failed to send email', details: error.message });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/googleService'); 

// POST /api/email/send
router.post('/send', async (req, res) => {
    const { userEmail, recipientEmail, subject, body } = req.body;

    if (!userEmail || !recipientEmail || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await sendEmail(userEmail, recipientEmail, subject, body);
        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(500).json(response);
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
});

module.exports = router;
