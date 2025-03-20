const express = require("express");
const router = express.Router();
// const db = require("../models"); // Assuming Sequelize models
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Validate Secret Key
router.post("/validate-key", async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(400).json({ valid: false, error: "No key provided" });
  }

  try {
    const user = await User.findOne({ where: { secret_key: key } });
    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      return res.json({ valid: true, userId: user.id, token });
    } else {
      return res.json({ valid: false });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({ valid: false, error: "Internal server error" });
  }
});

module.exports = router;
