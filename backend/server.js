// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const db = require('./src/config/db');
// const userRoutes = require('./src/routes/userRoutes');
// const leadRoutes = require('./src/routes/leadRoutes');
// const campaignRoutes = require('./src/routes/campaignRoutes');
// const sequenceRoutes = require('./src/routes/sequenceRoutes');
// const sendingAccRoutes = require('./src/routes/sendingAccRoutes');
// const emailRoutes = require('./src/routes/emailRoutes');


// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Test route
// app.get('/', (req, res) => {
//     res.send('API Running...');
// });

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/leads', leadRoutes);
// app.use('/api/campaigns', campaignRoutes);
// app.use('/api/sequences', sequenceRoutes);
// app.use('/api/sending-accounts', sendingAccRoutes);
// app.use('/api/email', emailRoutes);


// // Connect to Database
// db.authenticate()
//     .then(() => console.log('PostgreSQL connected...'))
//     .catch(err => console.log('Error: ' + err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Add this line
const db = require('./src/config/db'); // Ensure this is correct
const userRoutes = require('./src/routes/userRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const campaignRoutes = require('./src/routes/campaignRoutes');
const sequenceRoutes = require('./src/routes/sequenceRoutes');
const sendingAccRoutes = require('./src/routes/sendingAccRoutes');
const emailRoutes = require('./src/routes/emailRoutes');
const instagramRoutes = require('./src/routes/instagramRoutes'); // Added Instagram API
const authRoutes = require('./src/routes/authRoutes'); // Added Instagram API
const { processCampaigns } = require('./src/services/campaignProcessor');

// ✅ Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
    res.send('✅ API Running...');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/sending-accounts', sendingAccRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/instagram', instagramRoutes); // New Instagram Routes
app.use("/api/auth", authRoutes);

// Database Connection
db.authenticate()
    .then(() => {
        console.log('✅ PostgreSQL connected successfully...');
        return db.sync(); // Ensures models are in sync
    })
    .then(() => console.log('✅ Database synchronized.'))
    .catch(err => console.error('❌ Database Connection Error:', err));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Run every 5 minutes
// setInterval(async () => {
//     console.log("🔄 Running scheduled campaign processing...");
//     await processCampaigns();
// }, 300000); // 5 minutes in milliseconds

// Debugging: List all registered routes
console.log("🔍 Checking Loaded Routes:");
app._router.stack.forEach((layer) => {
    if (layer.route) {
        console.log(`✅ Route registered: ${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`);
    } else if (layer.name === 'router') {
        console.log(`🔍 Middleware: Router loaded with ${layer.handle.stack.length} routes`);
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
