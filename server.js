const express = require('express');
const cors = require('cors'); // Import CORS
const pool = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // For parsing JSON

// Import Routes
const indexRoutes = require('./routes/index');
const quotesRoutes = require('./routes/quote');
const authRoutes = require('./routes/auth')
// Use Routes
app.use('/', indexRoutes);
app.use('/quotes', quotesRoutes);
app.use('/auth',authRoutes);

//test connection to db

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error('Database test error:', err);
        res.status(500).json({ error: err.message });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
