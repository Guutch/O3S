// Handles saving/loading user cookies
const fs = require('fs');
const InstagramAccount = require('../models/InstagramAccount');

async function loadCookies(userId) {
    const account = await InstagramAccount.findOne({ where: { user_id: userId } });
    if (!account) throw new Error("Instagram account not found for user.");
    return JSON.parse(account.cookies);
}

async function saveCookies(userId, cookies) {
    await InstagramAccount.upsert({
        user_id: userId,
        username: cookies.find(c => c.name === "ds_user_id")?.value || "unknown",
        cookies: JSON.stringify(cookies),
    });
}

module.exports = { loadCookies, saveCookies };
