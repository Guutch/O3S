const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const { google } = require("googleapis");
const SendingAccount = require("./src/models/SendingAccs"); // Direct import
// require("dotenv").config();
require('dotenv').config({ path: __dirname + '/../.env' });

// console.log("🔍 All Loaded ENV Variables:", process.env);

console.log('SendingAccount model loaded:', !!SendingAccount);
console.log('SendingAccount model details:', JSON.stringify(SendingAccount, null, 2));
console.log("Does SendingAccount have findOne?", typeof SendingAccount.findOne);


console.log("🔍 Loading Google OAuth Strategy...");
console.log("📌 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Loaded" : "❌ Missing");
console.log("📌 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Loaded" : "❌ Missing");
console.log("📌 GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI ? "✅ Loaded" : "❌ Missing");



const app = express();
const cors = require('cors');
app.use(express.json()); // <-- This will parse JSON bodies

app.use(cors({ origin: 'http://localhost:5173' }));
// Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

const instagramRoutes = require('./src/routes/instagramRoutes');
app.use('/api/instagram', instagramRoutes);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URI,
            scope: [
                'profile',
                'email',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.readonly'
            ],
            accessType: "offline",
            prompt: "consent"
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("\n✅ Google OAuth Callback Triggered");
            console.log("🔹 Access Token:", accessToken);
            console.log("🔹 Refresh Token:", refreshToken || "No refresh token received");
            console.log("🔹 User Profile:", profile);

            if (!accessToken) {
                console.error("\n❌ OAuth failed: No access token received");
                return done(new Error("OAuth failed: No access token received"));
            }

            try {
                console.log("SendingAccount:", SendingAccount);
console.log("SendingAccount Type:", typeof SendingAccount);

                const existingAccount = await SendingAccount.findOne({
                    where: { account_identifier: profile.emails[0].value }
                });

                if (existingAccount) {
                    await existingAccount.update({
                        access_token: accessToken,
                        refresh_token: refreshToken || existingAccount.refresh_token,
                        token_expires_at: new Date(Date.now() + 3600 * 1000),
                        is_active: true
                    });

                    console.log("\n✅ Updated existing account:", existingAccount.dataValues);
                } else {
                    const newAccount = await SendingAccount.create({
                        user_id: 1, // Replace with actual user ID logic
                        platform: "email",
                        account_identifier: profile.emails[0].value,
                        access_token: accessToken,
                        refresh_token: refreshToken || null,
                        token_expires_at: new Date(Date.now() + 3600 * 1000),
                        is_active: true
                    });

                    console.log("\n✅ Created new account:", newAccount.dataValues);
                }

                if (!refreshToken) {
                    console.warn("\n⚠️ No refresh token received. Consider revoking permissions and re-authenticating.");
                }

                return done(null, profile.emails[0].value); // Store only the email (or use `existingAccount.id` if using DB ID)
            } catch (err) {
                console.error("\n❌ Database Error:", err);
                return done(err);
            }
        }
    )
);

// Function to refresh the access token when expired
async function refreshAccessToken(userEmail) {
    try {
        const account = await SendingAccount.findOne({ where: { account_identifier: userEmail } });

        if (!account || !account.refresh_token) {
            console.error("❌ No refresh token available. User needs to re-authenticate.");
            return null;
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({ refresh_token: account.refresh_token });

        const { credentials } = await oauth2Client.refreshAccessToken();
        const newAccessToken = credentials.access_token;
        const expiresIn = credentials.expiry_date;

        await account.update({
            access_token: newAccessToken,
            token_expires_at: new Date(expiresIn)
        });

        console.log("✅ Access token refreshed successfully:", newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("❌ Failed to refresh access token:", error.message);
        return null;
    }
}

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

// OAuth Login Route
app.get("/auth/google", passport.authenticate("google"));

// OAuth Callback Route
app.get(
    "/auth/google/callback",
    (req, res, next) => {
        passport.authenticate("google", (err, user, info) => {
            console.log("Authentication Error:", err);
            console.log("User:", user);
            console.log("Info:", info);

            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/');
            }

            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.send("✅ Successfully authenticated! You can now send emails.");
            });
        })(req, res, next);
    }
);

// Logout Route
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

// Start Server
const PORT = 5001;
app.listen(PORT, () => console.log(`\n🚀 Auth server running on port ${PORT}`));

module.exports = { refreshAccessToken }; // Export the function for other modules
